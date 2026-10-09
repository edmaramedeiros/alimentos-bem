package com.edmara.alimentos.whatsapp.dto;

import com.edmara.alimentos.whatsapp.WhatsappDailyLimitConfig;
import java.time.Instant;

public record WhatsappDailyLimitResponse(Integer dailyContactLimit, Instant updatedAt, String updatedByName) {

    public static WhatsappDailyLimitResponse from(WhatsappDailyLimitConfig config) {
        return new WhatsappDailyLimitResponse(config.getDailyContactLimit(), config.getUpdatedAt(), config.getUpdatedBy().getName());
    }

    public static WhatsappDailyLimitResponse empty() {
        return new WhatsappDailyLimitResponse(null, null, null);
    }
}
