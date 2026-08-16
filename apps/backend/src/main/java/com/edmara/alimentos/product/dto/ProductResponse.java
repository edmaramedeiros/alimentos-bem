package com.edmara.alimentos.product.dto;

import com.edmara.alimentos.product.Product;
import java.math.BigDecimal;
import java.util.UUID;

public record ProductResponse(
    UUID id,
    String name,
    String sku,
    String description,
    String unit,
    boolean active,
    BigDecimal currentPrice
) {

    public static ProductResponse from(Product product) {
        return new ProductResponse(
            product.getId(),
            product.getName(),
            product.getSku(),
            product.getDescription(),
            product.getUnit(),
            product.isActive(),
            product.getCurrentPrice()
        );
    }
}
