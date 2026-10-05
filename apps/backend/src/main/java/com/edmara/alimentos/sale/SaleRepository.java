package com.edmara.alimentos.sale;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SaleRepository extends JpaRepository<Sale, UUID> {

    List<Sale> findByVendedor_IdOrderBySaleDateDesc(UUID vendedorId);

    List<Sale> findAllByOrderBySaleDateDesc();

    List<Sale> findByCommissionStatusAndVendedor_IdOrderBySaleDateDesc(CommissionStatus status, UUID vendedorId);

    List<Sale> findByCommissionStatusOrderBySaleDateDesc(CommissionStatus status);

    List<Sale> findByVendedor_IdAndStatusNotOrderBySaleDateDesc(UUID vendedorId, SaleStatus status);

    List<Sale> findByStatusNotOrderBySaleDateDesc(SaleStatus status);

    List<Sale> findByCustomer_IdAndGeneratesCashbackTrueAndCashbackAmountIsNotNullOrderBySaleDateDesc(UUID customerId);

    List<Sale> findBySaleDateGreaterThanEqualAndSaleDateLessThanAndStatusNot(Instant from, Instant to, SaleStatus status);
}
