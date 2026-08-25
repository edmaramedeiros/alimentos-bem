package com.edmara.alimentos.whatsapp;

import com.edmara.alimentos.common.ResourceNotFoundException;
import com.edmara.alimentos.customer.Customer;
import com.edmara.alimentos.customer.CustomerRepository;
import com.edmara.alimentos.customer.dto.CustomerResponse;
import com.edmara.alimentos.user.AppUser;
import com.edmara.alimentos.user.Role;
import com.edmara.alimentos.whatsapp.dto.BroadcastRecipientResponse;
import com.edmara.alimentos.whatsapp.dto.BroadcastResponse;
import com.edmara.alimentos.whatsapp.dto.CreateBroadcastRequest;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

@Service
public class WhatsappService {

    // WhatsApp aceita anexos de imagem/documento com folga acima disso; usamos um teto
    // conservador para nao deixar o corpo da requisicao (base64 infla ~33%) crescer demais.
    private static final int MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;

    private final WhatsappBroadcastRepository broadcastRepository;
    private final WhatsappBroadcastRecipientRepository recipientRepository;
    private final CustomerRepository customerRepository;
    private final RestClient internalRestClient;
    private final String internalApiKey;

    public WhatsappService(
        WhatsappBroadcastRepository broadcastRepository,
        WhatsappBroadcastRecipientRepository recipientRepository,
        CustomerRepository customerRepository,
        @Value("${app.whatsapp.service-url}") String whatsappServiceUrl,
        @Value("${app.whatsapp.api-key}") String internalApiKey
    ) {
        this.broadcastRepository = broadcastRepository;
        this.recipientRepository = recipientRepository;
        this.customerRepository = customerRepository;
        this.internalApiKey = internalApiKey;
        this.internalRestClient = RestClient.builder().baseUrl(whatsappServiceUrl).build();
    }

    @Transactional(readOnly = true)
    public List<CustomerResponse> previewRecipients(String cityFilter, String nameFilter, AppUser currentUser) {
        return matchingCustomers(cityFilter, nameFilter, currentUser).stream().map(CustomerResponse::from).toList();
    }

    @Transactional
    public BroadcastResponse create(CreateBroadcastRequest request, AppUser currentUser) {
        List<Customer> customers = matchingCustomers(request.cityFilter(), request.nameFilter(), currentUser);
        if (customers.isEmpty()) {
            throw new IllegalArgumentException(
                "Nenhum cliente encontrado com esses filtros que tenha telefone e aceite receber mensagens no WhatsApp"
            );
        }

        WhatsappBroadcast broadcast = new WhatsappBroadcast(request.message(), currentUser);
        broadcast.setCityFilter(blankToNull(request.cityFilter()));
        broadcast.setNameFilter(blankToNull(request.nameFilter()));
        broadcast.setDelaySeconds(request.delaySeconds());

        if (StringUtils.hasText(request.attachmentBase64())) {
            byte[] data = decodeAttachment(request.attachmentBase64());
            broadcast.setAttachmentData(data);
            broadcast.setAttachmentFileName(request.attachmentFileName());
            broadcast.setAttachmentMimeType(request.attachmentMimeType());
        }

        for (Customer customer : customers) {
            broadcast.addRecipient(new WhatsappBroadcastRecipient(customer, customer.getName(), customer.getPhone()));
        }

        return BroadcastResponse.from(broadcastRepository.save(broadcast));
    }

    @Transactional(readOnly = true)
    public List<BroadcastResponse> list(AppUser currentUser) {
        List<WhatsappBroadcast> broadcasts = currentUser.getRole() == Role.ADMIN
            ? broadcastRepository.findAllByOrderByCreatedAtDesc()
            : broadcastRepository.findByCreatedBy_IdOrderByCreatedAtDesc(currentUser.getId());
        return broadcasts.stream().map(BroadcastResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public BroadcastResponse getById(UUID id, AppUser currentUser) {
        WhatsappBroadcast broadcast = findBroadcast(id);
        assertOwnership(broadcast, currentUser);
        return BroadcastResponse.from(broadcast);
    }

    @Transactional(readOnly = true)
    public List<BroadcastRecipientResponse> listRecipients(UUID id, AppUser currentUser) {
        WhatsappBroadcast broadcast = findBroadcast(id);
        assertOwnership(broadcast, currentUser);
        return recipientRepository.findByBroadcast_IdOrderByCreatedAtAsc(id).stream()
            .map(BroadcastRecipientResponse::from)
            .toList();
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> sessionStatus(AppUser currentUser) {
        return internalRestClient.get()
            .uri("/internal/session/{vendedorId}/status", currentUser.getId())
            .header("X-Internal-Api-Key", internalApiKey)
            .retrieve()
            .body(Map.class);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> sessionQr(AppUser currentUser) {
        return internalRestClient.get()
            .uri("/internal/session/{vendedorId}/qr", currentUser.getId())
            .header("X-Internal-Api-Key", internalApiKey)
            .retrieve()
            .body(Map.class);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> disconnectSession(AppUser currentUser) {
        return internalRestClient.post()
            .uri("/internal/session/{vendedorId}/logout", currentUser.getId())
            .header("X-Internal-Api-Key", internalApiKey)
            .retrieve()
            .body(Map.class);
    }

    private List<Customer> matchingCustomers(String cityFilter, String nameFilter, AppUser currentUser) {
        String normalizedCity = StringUtils.hasText(cityFilter) ? cityFilter.trim().toLowerCase() : null;
        String normalizedName = StringUtils.hasText(nameFilter) ? nameFilter.trim().toLowerCase() : null;

        // Cada vendedora manda pelo proprio numero, entao so pode alcancar os proprios
        // clientes (mesma regra de posse usada em vendas e cadastro de clientes).
        return customerRepository.findByOwnerVendedor_IdAndWhatsappOptInTrueAndActiveTrue(currentUser.getId()).stream()
            .filter(c -> StringUtils.hasText(c.getPhone()))
            .filter(c -> normalizedCity == null || (c.getCity() != null && c.getCity().toLowerCase().contains(normalizedCity)))
            .filter(c -> normalizedName == null || c.getName().toLowerCase().contains(normalizedName))
            .toList();
    }

    private byte[] decodeAttachment(String base64) {
        byte[] data;
        try {
            data = Base64.getDecoder().decode(base64);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Anexo inválido");
        }
        if (data.length > MAX_ATTACHMENT_BYTES) {
            throw new IllegalArgumentException("Anexo muito grande (máximo 8 MB)");
        }
        return data;
    }

    private String blankToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private void assertOwnership(WhatsappBroadcast broadcast, AppUser currentUser) {
        boolean isOwner = broadcast.getCreatedBy().getId().equals(currentUser.getId());
        if (currentUser.getRole() != Role.ADMIN && !isOwner) {
            throw new AccessDeniedException("Você não tem permissão para acessar esta campanha");
        }
    }

    private WhatsappBroadcast findBroadcast(UUID id) {
        return broadcastRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Campanha não encontrada: " + id));
    }
}
