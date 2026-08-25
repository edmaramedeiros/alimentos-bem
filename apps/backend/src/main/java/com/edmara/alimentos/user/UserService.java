package com.edmara.alimentos.user;

import com.edmara.alimentos.common.ConflictException;
import com.edmara.alimentos.common.ResourceNotFoundException;
import com.edmara.alimentos.user.dto.ChangePasswordRequest;
import com.edmara.alimentos.user.dto.CreateUserRequest;
import com.edmara.alimentos.user.dto.ResetPasswordRequest;
import com.edmara.alimentos.user.dto.UpdateMeRequest;
import com.edmara.alimentos.user.dto.UpdateUserRequest;
import com.edmara.alimentos.user.dto.UserResponse;
import java.util.List;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(AppUserRepository appUserRepository, PasswordEncoder passwordEncoder) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> listAll() {
        return appUserRepository.findAll().stream().map(UserResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public UserResponse getById(UUID id) {
        return UserResponse.from(findEntity(id));
    }

    @Transactional
    public UserResponse create(CreateUserRequest request) {
        if (appUserRepository.existsByEmail(request.email())) {
            throw new ConflictException("Já existe um usuário com este e-mail");
        }
        AppUser user = new AppUser(
            request.name(),
            request.email(),
            passwordEncoder.encode(request.password()),
            request.role(),
            request.phone()
        );
        return UserResponse.from(appUserRepository.save(user));
    }

    @Transactional
    public UserResponse update(UUID id, UpdateUserRequest request) {
        AppUser user = findEntity(id);
        if (!user.getEmail().equalsIgnoreCase(request.email()) && appUserRepository.existsByEmail(request.email())) {
            throw new ConflictException("Já existe um usuário com este e-mail");
        }
        user.setName(request.name());
        user.setEmail(request.email());
        user.setRole(request.role());
        user.setActive(request.active());
        user.setPhone(request.phone());
        return UserResponse.from(user);
    }

    @Transactional
    public void resetPassword(UUID id, ResetPasswordRequest request) {
        AppUser user = findEntity(id);
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
    }

    @Transactional
    public UserResponse updateMe(UUID id, UpdateMeRequest request) {
        AppUser user = findEntity(id);
        if (!user.getEmail().equalsIgnoreCase(request.email()) && appUserRepository.existsByEmail(request.email())) {
            throw new ConflictException("Já existe um usuário com este e-mail");
        }
        user.setName(request.name());
        user.setEmail(request.email());
        return UserResponse.from(user);
    }

    @Transactional
    public void changePassword(UUID id, ChangePasswordRequest request) {
        AppUser user = findEntity(id);
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Senha atual incorreta");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
    }

    private AppUser findEntity(UUID id) {
        return appUserRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: " + id));
    }
}
