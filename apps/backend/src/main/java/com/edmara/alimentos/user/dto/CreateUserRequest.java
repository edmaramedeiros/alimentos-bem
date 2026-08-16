package com.edmara.alimentos.user.dto;

import com.edmara.alimentos.user.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateUserRequest(
    @NotBlank(message = "Nome é obrigatório") String name,
    @NotBlank(message = "E-mail é obrigatório") @Email(message = "E-mail inválido") String email,
    @NotBlank(message = "Senha é obrigatória") @Size(min = 8, message = "Senha deve ter ao menos 8 caracteres") String password,
    @NotNull(message = "Papel é obrigatório") Role role,
    String phone
) {
}
