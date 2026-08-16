package com.edmara.alimentos.customer.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateCustomerRequest(
    @NotBlank(message = "Nome é obrigatório") String name,
    String phone,
    String email,
    String addressLine,
    String city,
    String state,
    String zip,
    String notes,
    boolean whatsappOptIn
) {
}
