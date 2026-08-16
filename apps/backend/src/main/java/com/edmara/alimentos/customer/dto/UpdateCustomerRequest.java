package com.edmara.alimentos.customer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateCustomerRequest(
    @NotBlank(message = "Nome é obrigatório") String name,
    String phone,
    String email,
    String addressLine,
    String city,
    String state,
    String zip,
    String notes,
    @NotNull(message = "Situação (ativo/inativo) é obrigatória") Boolean active,
    boolean whatsappOptIn
) {
}
