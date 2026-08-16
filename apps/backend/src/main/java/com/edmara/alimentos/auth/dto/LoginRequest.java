package com.edmara.alimentos.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(@NotBlank(message = "E-mail é obrigatório") String email,
                            @NotBlank(message = "Senha é obrigatória") String password) {
}
