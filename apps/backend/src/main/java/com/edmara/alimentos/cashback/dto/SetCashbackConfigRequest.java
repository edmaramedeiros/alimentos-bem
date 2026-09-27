package com.edmara.alimentos.cashback.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record SetCashbackConfigRequest(
    @NotNull(message = "Percentual é obrigatório")
    @DecimalMin(value = "0.01", message = "Percentual deve ser maior que zero")
    @DecimalMax(value = "100", message = "Percentual não pode passar de 100")
    BigDecimal percentage,
    @NotNull(message = "Validade é obrigatória")
    @Min(value = 1, message = "Validade deve ser de ao menos 1 dia")
    Integer validityDays
) {
}
