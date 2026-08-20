package com.edmara.alimentos.commission.dto;

import com.edmara.alimentos.sale.Sale;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record CommissionEntryResponse(
    UUID saleId,
    UUID vendedorId,
    String vendedorName,
    String customerName,
    Instant saleDate,
    BigDecimal totalAmount,
    BigDecimal commissionRateApplied,
    BigDecimal commissionAmount
) {

    public static CommissionEntryResponse from(Sale sale) {
        return new CommissionEntryResponse(
            sale.getId(),
            sale.getVendedor().getId(),
            sale.getVendedor().getName(),
            sale.getCustomer() != null ? sale.getCustomer().getName() : "Consumidor",
            sale.getSaleDate(),
            sale.getTotalAmount(),
            sale.getCommissionRateApplied(),
            sale.getCommissionAmount()
        );
    }
}
