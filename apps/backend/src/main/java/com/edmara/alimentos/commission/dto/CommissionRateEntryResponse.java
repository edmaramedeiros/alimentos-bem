package com.edmara.alimentos.commission.dto;

import com.edmara.alimentos.commission.CommissionRateHistory;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record CommissionRateEntryResponse(
    UUID id,
    BigDecimal rate,
    Instant effectiveFrom,
    Instant effectiveTo,
    String createdByName
) {

    public static CommissionRateEntryResponse from(CommissionRateHistory entry) {
        return new CommissionRateEntryResponse(
            entry.getId(),
            entry.getRate(),
            entry.getEffectiveFrom(),
            entry.getEffectiveTo(),
            entry.getCreatedBy().getName()
        );
    }
}
