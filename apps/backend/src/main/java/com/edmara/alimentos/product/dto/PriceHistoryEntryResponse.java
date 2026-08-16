package com.edmara.alimentos.product.dto;

import com.edmara.alimentos.product.ProductPriceHistory;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PriceHistoryEntryResponse(
    UUID id,
    BigDecimal price,
    Instant effectiveFrom,
    Instant effectiveTo,
    String createdByName
) {

    public static PriceHistoryEntryResponse from(ProductPriceHistory entry) {
        return new PriceHistoryEntryResponse(
            entry.getId(),
            entry.getPrice(),
            entry.getEffectiveFrom(),
            entry.getEffectiveTo(),
            entry.getCreatedBy().getName()
        );
    }
}
