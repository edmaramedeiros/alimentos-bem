package com.edmara.alimentos.cashback;

import com.edmara.alimentos.cashback.dto.CashbackBalanceResponse;
import com.edmara.alimentos.cashback.dto.CashbackConfigResponse;
import com.edmara.alimentos.cashback.dto.CashbackEntryResponse;
import com.edmara.alimentos.cashback.dto.SetCashbackConfigRequest;
import com.edmara.alimentos.common.ResourceNotFoundException;
import com.edmara.alimentos.customer.Customer;
import com.edmara.alimentos.customer.CustomerRepository;
import com.edmara.alimentos.sale.Sale;
import com.edmara.alimentos.sale.SaleRepository;
import com.edmara.alimentos.user.AppUser;
import com.edmara.alimentos.user.Role;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CashbackService {

    private static final ZoneId ZONE = ZoneId.of("America/Cuiaba");

    private final CashbackConfigRepository cashbackConfigRepository;
    private final CustomerRepository customerRepository;
    private final SaleRepository saleRepository;

    public CashbackService(
        CashbackConfigRepository cashbackConfigRepository,
        CustomerRepository customerRepository,
        SaleRepository saleRepository
    ) {
        this.cashbackConfigRepository = cashbackConfigRepository;
        this.customerRepository = customerRepository;
        this.saleRepository = saleRepository;
    }

    @Transactional(readOnly = true)
    public CashbackConfigResponse getConfig() {
        return cashbackConfigRepository.findFirstByOrderByCreatedAtAsc()
            .map(CashbackConfigResponse::from)
            .orElseGet(CashbackConfigResponse::empty);
    }

    @Transactional
    public CashbackConfigResponse setConfig(SetCashbackConfigRequest request, AppUser currentUser) {
        CashbackConfig config = cashbackConfigRepository.findFirstByOrderByCreatedAtAsc().orElse(null);
        if (config == null) {
            config = new CashbackConfig(request.percentage(), request.validityDays(), currentUser);
        } else {
            config.setPercentage(request.percentage());
            config.setValidityDays(request.validityDays());
            config.setUpdatedBy(currentUser);
        }
        return CashbackConfigResponse.from(cashbackConfigRepository.save(config));
    }

    @Transactional(readOnly = true)
    public CashbackBalanceResponse balance(UUID customerId, AppUser currentUser) {
        Customer customer = customerRepository.findById(customerId)
            .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado: " + customerId));

        boolean isOwner = customer.getOwnerVendedor().getId().equals(currentUser.getId());
        if (currentUser.getRole() != Role.ADMIN && !isOwner) {
            throw new AccessDeniedException("Você não tem permissão para acessar este cliente");
        }

        List<Sale> sales = saleRepository.findByCustomer_IdAndGeneratesCashbackTrueAndCashbackAmountIsNotNullOrderBySaleDateDesc(customerId);
        LocalDate today = LocalDate.now(ZONE);

        BigDecimal available = sales.stream()
            .filter(sale -> sale.getCashbackExpiresAt() != null && !sale.getCashbackExpiresAt().isBefore(today))
            .map(Sale::getCashbackAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<CashbackEntryResponse> entries = sales.stream().map(sale -> CashbackEntryResponse.from(sale, today)).toList();

        return new CashbackBalanceResponse(available, entries);
    }
}
