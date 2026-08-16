package com.edmara.alimentos.user.dto;

import com.edmara.alimentos.user.AppUser;
import com.edmara.alimentos.user.Role;
import java.util.UUID;

public record UserResponse(UUID id, String name, String email, Role role, boolean active, String phone) {

    public static UserResponse from(AppUser user) {
        return new UserResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getRole(),
            user.isActive(),
            user.getPhone()
        );
    }
}
