package com.edmara.alimentos.commission.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record SetCommissionRateRequest(
    @NotNull(message = "Taxa é obrigatória")
    @DecimalMin(value = "0", message = "Taxa não pode ser negativa")
    @DecimalMax(value = "100", message = "Taxa não pode ser maior que 100%")
    BigDecimal rate
) {
}
