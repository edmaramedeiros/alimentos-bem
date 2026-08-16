package com.edmara.alimentos.product.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record CreateProductRequest(
    @NotBlank(message = "Nome é obrigatório") String name,
    String sku,
    String description,
    @NotBlank(message = "Unidade é obrigatória") String unit,
    @NotNull(message = "Preço é obrigatório") @DecimalMin(value = "0.01", message = "Preço deve ser maior que zero") BigDecimal price
) {
}
