package com.edmara.alimentos.sale;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SaleRepository extends JpaRepository<Sale, UUID> {

    // JOIN FETCH em vendedor/customer (ManyToOne, sem risco de multiplicar linhas) pra
    // listagem não disparar uma query lazy por venda só pra pegar esses dois nomes.
    @Query("SELECT s FROM Sale s LEFT JOIN FETCH s.vendedor LEFT JOIN FETCH s.customer WHERE s.vendedor.id = :vendedorId ORDER BY s.saleDate DESC")
    List<Sale> findByVendedor_IdOrderBySaleDateDesc(@Param("vendedorId") UUID vendedorId);

    @Query("SELECT s FROM Sale s LEFT JOIN FETCH s.vendedor LEFT JOIN FETCH s.customer ORDER BY s.saleDate DESC")
    List<Sale> findAllByOrderBySaleDateDesc();

    List<Sale> findByCommissionStatusAndVendedor_IdOrderBySaleDateDesc(CommissionStatus status, UUID vendedorId);

    List<Sale> findByCommissionStatusOrderBySaleDateDesc(CommissionStatus status);

    List<Sale> findByVendedor_IdAndStatusNotOrderBySaleDateDesc(UUID vendedorId, SaleStatus status);

    List<Sale> findByStatusNotOrderBySaleDateDesc(SaleStatus status);

    List<Sale> findByCustomer_IdAndGeneratesCashbackTrueAndCashbackAmountIsNotNullOrderBySaleDateDesc(UUID customerId);

    List<Sale> findBySaleDateGreaterThanEqualAndSaleDateLessThanAndStatusNot(Instant from, Instant to, SaleStatus status);

    interface SaleItemCountProjection {
        UUID getSaleId();

        long getCount();
    }

    // Conta os itens de várias vendas numa única query, em vez de deixar o getItems()
    // de cada Sale disparar uma query lazy por venda (N+1) ao montar a listagem.
    @Query(
        "SELECT i.sale.id AS saleId, COUNT(i) AS count FROM SaleItem i WHERE i.sale.id IN :saleIds GROUP BY i.sale.id"
    )
    List<SaleItemCountProjection> countItemsBySaleIds(@Param("saleIds") List<UUID> saleIds);
}
