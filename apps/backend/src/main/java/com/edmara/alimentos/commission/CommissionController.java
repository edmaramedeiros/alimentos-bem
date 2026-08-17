package com.edmara.alimentos.commission;

import com.edmara.alimentos.commission.dto.CommissionReportResponse;
import com.edmara.alimentos.user.AppUser;
import java.time.Instant;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/commissions")
public class CommissionController {

    private final CommissionService commissionService;

    public CommissionController(CommissionService commissionService) {
        this.commissionService = commissionService;
    }

    @GetMapping("/me")
    public CommissionReportResponse mine(
        @AuthenticationPrincipal AppUser currentUser,
        @RequestParam(required = false) String from,
        @RequestParam(required = false) String to
    ) {
        return commissionService.myCommissions(currentUser, parseInstant(from), parseInstant(to));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public CommissionReportResponse all(
        @RequestParam(required = false) UUID vendedorId,
        @RequestParam(required = false) String from,
        @RequestParam(required = false) String to
    ) {
        return commissionService.commissionsFor(vendedorId, parseInstant(from), parseInstant(to));
    }

    private Instant parseInstant(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return Instant.parse(value);
        } catch (Exception e) {
            throw new IllegalArgumentException("Data inválida, use o formato ISO-8601 (ex: 2026-01-31T12:00:00Z)");
        }
    }
}
