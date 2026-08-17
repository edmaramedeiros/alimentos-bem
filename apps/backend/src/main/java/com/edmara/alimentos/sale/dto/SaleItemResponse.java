package com.edmara.alimentos.sale.dto;

import com.edmara.alimentos.sale.SaleItem;
import java.math.BigDecimal;
import java.util.UUID;

public record SaleItemResponse(
    UUID id,
    UUID productId,
    String productName,
    String unit,
    BigDecimal quantity,
    BigDecimal unitPrice,
    BigDecimal subtotal
) {

    public static SaleItemResponse from(SaleItem item) {
        return new SaleItemResponse(
            item.getId(),
            item.getProduct().getId(),
            item.getProduct().getName(),
            item.getProduct().getUnit(),
            item.getQuantity(),
            item.getUnitPrice(),
            item.getSubtotal()
        );
    }
}
