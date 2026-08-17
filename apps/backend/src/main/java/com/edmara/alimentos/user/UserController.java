package com.edmara.alimentos.user;

import com.edmara.alimentos.commission.CommissionService;
import com.edmara.alimentos.commission.dto.CommissionRateEntryResponse;
import com.edmara.alimentos.commission.dto.SetCommissionRateRequest;
import com.edmara.alimentos.user.dto.CreateUserRequest;
import com.edmara.alimentos.user.dto.ResetPasswordRequest;
import com.edmara.alimentos.user.dto.UpdateUserRequest;
import com.edmara.alimentos.user.dto.UserResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final CommissionService commissionService;

    public UserController(UserService userService, CommissionService commissionService) {
        this.userService = userService;
        this.commissionService = commissionService;
    }

    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal AppUser currentUser) {
        return UserResponse.from(currentUser);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> listAll() {
        return userService.listAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse getById(@PathVariable UUID id) {
        return userService.getById(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> create(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.create(request));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse update(@PathVariable UUID id, @Valid @RequestBody UpdateUserRequest request) {
        return userService.update(id, request);
    }

    @PostMapping("/{id}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> resetPassword(@PathVariable UUID id, @Valid @RequestBody ResetPasswordRequest request) {
        userService.resetPassword(id, request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/commission-rate-history")
    @PreAuthorize("hasRole('ADMIN')")
    public List<CommissionRateEntryResponse> commissionRateHistory(@PathVariable UUID id) {
        return commissionService.rateHistory(id);
    }

    @PostMapping("/{id}/commission-rate-history")
    @PreAuthorize("hasRole('ADMIN')")
    public CommissionRateEntryResponse setCommissionRate(
        @PathVariable UUID id,
        @Valid @RequestBody SetCommissionRateRequest request,
        @AuthenticationPrincipal AppUser currentUser
    ) {
        return commissionService.setRate(id, request, currentUser);
    }
}
