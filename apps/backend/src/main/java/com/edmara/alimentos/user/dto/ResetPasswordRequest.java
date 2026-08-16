package com.edmara.alimentos.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
    @NotBlank(message = "Nova senha é obrigatória") @Size(min = 8, message = "Senha deve ter ao menos 8 caracteres") String newPassword
) {
}
