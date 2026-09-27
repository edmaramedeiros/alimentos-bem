package com.edmara.alimentos.cashback;

import com.edmara.alimentos.cashback.dto.CashbackBalanceResponse;
import com.edmara.alimentos.cashback.dto.CashbackConfigResponse;
import com.edmara.alimentos.cashback.dto.SetCashbackConfigRequest;
import com.edmara.alimentos.user.AppUser;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cashback")
public class CashbackController {

    private final CashbackService cashbackService;

    public CashbackController(CashbackService cashbackService) {
        this.cashbackService = cashbackService;
    }

    @GetMapping("/config")
    public CashbackConfigResponse getConfig() {
        return cashbackService.getConfig();
    }

    @PatchMapping("/config")
    @PreAuthorize("hasRole('ADMIN')")
    public CashbackConfigResponse setConfig(
        @Valid @RequestBody SetCashbackConfigRequest request,
        @AuthenticationPrincipal AppUser currentUser
    ) {
        return cashbackService.setConfig(request, currentUser);
    }

    @GetMapping("/customers/{customerId}/balance")
    public CashbackBalanceResponse balance(@PathVariable UUID customerId, @AuthenticationPrincipal AppUser currentUser) {
        return cashbackService.balance(customerId, currentUser);
    }
}
