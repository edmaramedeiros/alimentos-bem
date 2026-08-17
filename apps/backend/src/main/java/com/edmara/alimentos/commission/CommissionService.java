package com.edmara.alimentos.commission;

import com.edmara.alimentos.commission.dto.CommissionEntryResponse;
import com.edmara.alimentos.commission.dto.CommissionRateEntryResponse;
import com.edmara.alimentos.commission.dto.CommissionReportResponse;
import com.edmara.alimentos.commission.dto.SetCommissionRateRequest;
import com.edmara.alimentos.common.ResourceNotFoundException;
import com.edmara.alimentos.sale.CommissionStatus;
import com.edmara.alimentos.sale.Sale;
import com.edmara.alimentos.sale.SaleRepository;
import com.edmara.alimentos.user.AppUser;
import com.edmara.alimentos.user.AppUserRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CommissionService {

    private final CommissionRateHistoryRepository commissionRateHistoryRepository;
    private final AppUserRepository appUserRepository;
    private final SaleRepository saleRepository;

    public CommissionService(
        CommissionRateHistoryRepository commissionRateHistoryRepository,
        AppUserRepository appUserRepository,
        SaleRepository saleRepository
    ) {
        this.commissionRateHistoryRepository = commissionRateHistoryRepository;
        this.appUserRepository = appUserRepository;
        this.saleRepository = saleRepository;
    }

    @Transactional(readOnly = true)
    public List<CommissionRateEntryResponse> rateHistory(UUID vendedorId) {
        ensureUserExists(vendedorId);
        return commissionRateHistoryRepository.findByVendedor_IdOrderByEffectiveFromDesc(vendedorId).stream()
            .map(CommissionRateEntryResponse::from)
            .toList();
    }

    @Transactional
    public CommissionRateEntryResponse setRate(UUID vendedorId, SetCommissionRateRequest request, AppUser currentUser) {
        AppUser vendedor = appUserRepository.findById(vendedorId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: " + vendedorId));

        Instant now = Instant.now();

        // Mesmo cuidado do lock de preco de produto: fecha e forca o flush da taxa
        // vigente antes de inserir a nova, para nao violar uq_commission_rate_current
        // (o Hibernate executa INSERTs antes de UPDATEs na mesma transacao).
        commissionRateHistoryRepository.findByVendedor_IdAndEffectiveToIsNull(vendedorId)
            .ifPresent(current -> {
                current.setEffectiveTo(now);
                commissionRateHistoryRepository.saveAndFlush(current);
            });

        CommissionRateHistory newEntry = new CommissionRateHistory(vendedor, request.rate(), now, currentUser);
        commissionRateHistoryRepository.save(newEntry);

        return CommissionRateEntryResponse.from(newEntry);
    }

    @Transactional(readOnly = true)
    public CommissionReportResponse myCommissions(AppUser currentUser, Instant from, Instant to) {
        List<Sale> sales = saleRepository.findByCommissionStatusAndVendedor_IdOrderBySaleDateDesc(
            CommissionStatus.EARNED, currentUser.getId()
        );
        return buildReport(filterByDateRange(sales, from, to));
    }

    @Transactional(readOnly = true)
    public CommissionReportResponse commissionsFor(UUID vendedorId, Instant from, Instant to) {
        List<Sale> sales = vendedorId != null
            ? saleRepository.findByCommissionStatusAndVendedor_IdOrderBySaleDateDesc(CommissionStatus.EARNED, vendedorId)
            : saleRepository.findByCommissionStatusOrderBySaleDateDesc(CommissionStatus.EARNED);
        return buildReport(filterByDateRange(sales, from, to));
    }

    /**
     * Filtra em memoria em vez de usar parametros opcionais (":from is null or ...") no JPQL:
     * o driver do Postgres nao consegue inferir o tipo do parametro quando ele e sempre NULL
     * na mesma preparacao de statement, o que quebrava a query com "could not determine data
     * type of parameter". O volume de vendas de um pequeno negocio nao justifica a complexidade
     * de contornar isso no SQL.
     */
    private List<Sale> filterByDateRange(List<Sale> sales, Instant from, Instant to) {
        return sales.stream()
            .filter(sale -> from == null || !sale.getSaleDate().isBefore(from))
            .filter(sale -> to == null || !sale.getSaleDate().isAfter(to))
            .toList();
    }

    private CommissionReportResponse buildReport(List<Sale> sales) {
        BigDecimal total = sales.stream()
            .map(Sale::getCommissionAmount)
            .filter(Objects::nonNull)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        List<CommissionEntryResponse> entries = sales.stream().map(CommissionEntryResponse::from).toList();
        return new CommissionReportResponse(total, entries);
    }

    private void ensureUserExists(UUID id) {
        if (!appUserRepository.existsById(id)) {
            throw new ResourceNotFoundException("Usuário não encontrado: " + id);
        }
    }
}
