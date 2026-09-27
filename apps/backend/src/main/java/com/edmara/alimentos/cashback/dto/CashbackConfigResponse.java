package com.edmara.alimentos.cashback.dto;

import com.edmara.alimentos.cashback.CashbackConfig;
import java.math.BigDecimal;
import java.time.Instant;

public record CashbackConfigResponse(
    BigDecimal percentage,
    Integer validityDays,
    Instant updatedAt,
    String updatedByName
) {

    public static CashbackConfigResponse from(CashbackConfig config) {
        return new CashbackConfigResponse(
            config.getPercentage(),
            config.getValidityDays(),
            config.getUpdatedAt(),
            config.getUpdatedBy().getName()
        );
    }

    public static CashbackConfigResponse empty() {
        return new CashbackConfigResponse(null, null, null, null);
    }
}
