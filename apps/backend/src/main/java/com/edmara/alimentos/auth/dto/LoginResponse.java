package com.edmara.alimentos.auth.dto;

import com.edmara.alimentos.user.dto.UserResponse;

public record LoginResponse(String token, UserResponse user) {
}
