package com.edmara.alimentos.sale.dto;

import com.edmara.alimentos.sale.CommissionStatus;
import com.edmara.alimentos.sale.Sale;
import com.edmara.alimentos.sale.SaleStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record SaleResponse(
    UUID id,
    UUID vendedorId,
    String vendedorName,
    UUID customerId,
    String customerName,
    Instant saleDate,
    SaleStatus status,
    BigDecimal totalAmount,
    BigDecimal discountAmount,
    BigDecimal commissionRateApplied,
    BigDecimal commissionAmount,
    CommissionStatus commissionStatus,
    List<SaleItemResponse> items
) {

    public static SaleResponse from(Sale sale) {
        return new SaleResponse(
            sale.getId(),
            sale.getVendedor().getId(),
            sale.getVendedor().getName(),
            sale.getCustomer() != null ? sale.getCustomer().getId() : null,
            sale.getCustomer() != null ? sale.getCustomer().getName() : "Consumidor",
            sale.getSaleDate(),
            sale.getStatus(),
            sale.getTotalAmount(),
            sale.getDiscountAmount(),
            sale.getCommissionRateApplied(),
            sale.getCommissionAmount(),
            sale.getCommissionStatus(),
            sale.getItems().stream().map(SaleItemResponse::from).toList()
        );
    }
}
