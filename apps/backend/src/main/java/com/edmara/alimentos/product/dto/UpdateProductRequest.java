package com.edmara.alimentos.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateProductRequest(
    @NotBlank(message = "Nome é obrigatório") String name,
    String sku,
    String description,
    @NotBlank(message = "Unidade é obrigatória") String unit,
    @NotNull(message = "Situação (ativo/inativo) é obrigatória") Boolean active
) {
}
