package com.edmara.alimentos.whatsapp.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record SetWhatsappDailyLimitRequest(
    @NotNull(message = "Limite é obrigatório")
    @Min(value = 1, message = "Limite deve ser de ao menos 1 contato")
    Integer dailyContactLimit
) {
}
