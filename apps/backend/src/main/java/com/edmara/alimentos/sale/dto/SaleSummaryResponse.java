package com.edmara.alimentos.sale.dto;

import com.edmara.alimentos.sale.Sale;
import com.edmara.alimentos.sale.SaleStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record SaleSummaryResponse(
    UUID id,
    UUID vendedorId,
    String vendedorName,
    UUID customerId,
    String customerName,
    Instant saleDate,
    SaleStatus status,
    BigDecimal totalAmount,
    int itemCount
) {

    public static SaleSummaryResponse from(Sale sale) {
        return new SaleSummaryResponse(
            sale.getId(),
            sale.getVendedor().getId(),
            sale.getVendedor().getName(),
            sale.getCustomer() != null ? sale.getCustomer().getId() : null,
            sale.getCustomer() != null ? sale.getCustomer().getName() : "Consumidor",
            sale.getSaleDate(),
            sale.getStatus(),
            sale.getTotalAmount(),
            sale.getItems().size()
        );
    }
}
