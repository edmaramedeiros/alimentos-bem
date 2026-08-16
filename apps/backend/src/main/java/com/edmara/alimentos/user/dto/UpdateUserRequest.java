package com.edmara.alimentos.user.dto;

import com.edmara.alimentos.user.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateUserRequest(
    @NotBlank(message = "Nome é obrigatório") String name,
    @NotBlank(message = "E-mail é obrigatório") @Email(message = "E-mail inválido") String email,
    @NotNull(message = "Papel é obrigatório") Role role,
    @NotNull(message = "Situação (ativo/inativo) é obrigatória") Boolean active,
    String phone
) {
}
