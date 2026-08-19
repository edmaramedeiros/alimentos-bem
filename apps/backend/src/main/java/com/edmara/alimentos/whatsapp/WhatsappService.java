package com.edmara.alimentos.whatsapp;

import com.edmara.alimentos.common.ResourceNotFoundException;
import com.edmara.alimentos.customer.Customer;
import com.edmara.alimentos.customer.CustomerRepository;
import com.edmara.alimentos.customer.dto.CustomerResponse;
import com.edmara.alimentos.user.AppUser;
import com.edmara.alimentos.whatsapp.dto.BroadcastResponse;
import com.edmara.alimentos.whatsapp.dto.CreateBroadcastRequest;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
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
    public List<CustomerResponse> previewRecipients(String cityFilter, String nameFilter) {
        return matchingCustomers(cityFilter, nameFilter).stream().map(CustomerResponse::from).toList();
    }

    @Transactional
    public BroadcastResponse create(CreateBroadcastRequest request, AppUser currentUser) {
        List<Customer> customers = matchingCustomers(request.cityFilter(), request.nameFilter());
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
    public List<BroadcastResponse> list() {
        return broadcastRepository.findAllByOrderByCreatedAtDesc().stream().map(BroadcastResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public BroadcastResponse getById(UUID id) {
        return BroadcastResponse.from(findBroadcast(id));
    }

    @Transactional(readOnly = true)
    public List<com.edmara.alimentos.whatsapp.dto.BroadcastRecipientResponse> listRecipients(UUID id) {
        findBroadcast(id);
        return recipientRepository.findByBroadcast_IdOrderByCreatedAtAsc(id).stream()
            .map(com.edmara.alimentos.whatsapp.dto.BroadcastRecipientResponse::from)
            .toList();
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> sessionStatus() {
        return internalRestClient.get()
            .uri("/internal/session/status")
            .header("X-Internal-Api-Key", internalApiKey)
            .retrieve()
            .body(Map.class);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> sessionQr() {
        return internalRestClient.get()
            .uri("/internal/session/qr")
            .header("X-Internal-Api-Key", internalApiKey)
            .retrieve()
            .body(Map.class);
    }

    private List<Customer> matchingCustomers(String cityFilter, String nameFilter) {
        String normalizedCity = StringUtils.hasText(cityFilter) ? cityFilter.trim().toLowerCase() : null;
        String normalizedName = StringUtils.hasText(nameFilter) ? nameFilter.trim().toLowerCase() : null;

        return customerRepository.findByWhatsappOptInTrueAndActiveTrue().stream()
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

    private WhatsappBroadcast findBroadcast(UUID id) {
        return broadcastRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Campanha não encontrada: " + id));
    }
}
