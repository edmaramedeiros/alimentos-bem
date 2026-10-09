package com.edmara.alimentos.whatsapp;

import com.edmara.alimentos.customer.dto.CustomerResponse;
import com.edmara.alimentos.user.AppUser;
import com.edmara.alimentos.whatsapp.dto.BroadcastRecipientResponse;
import com.edmara.alimentos.whatsapp.dto.BroadcastResponse;
import com.edmara.alimentos.whatsapp.dto.CreateBroadcastRequest;
import com.edmara.alimentos.whatsapp.dto.SetWhatsappDailyLimitRequest;
import com.edmara.alimentos.whatsapp.dto.WhatsappDailyLimitResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/whatsapp")
public class WhatsappController {

    private final WhatsappService whatsappService;

    public WhatsappController(WhatsappService whatsappService) {
        this.whatsappService = whatsappService;
    }

    @GetMapping("/customers/preview")
    public List<CustomerResponse> previewRecipients(
        @RequestParam(required = false) String city,
        @RequestParam(required = false) String name,
        @AuthenticationPrincipal AppUser currentUser
    ) {
        return whatsappService.previewRecipients(city, name, currentUser);
    }

    @PostMapping("/campaigns")
    public ResponseEntity<BroadcastResponse> create(
        @Valid @RequestBody CreateBroadcastRequest request,
        @AuthenticationPrincipal AppUser currentUser
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(whatsappService.create(request, currentUser));
    }

    @GetMapping("/campaigns")
    public List<BroadcastResponse> list(@AuthenticationPrincipal AppUser currentUser) {
        return whatsappService.list(currentUser);
    }

    @GetMapping("/campaigns/{id}")
    public BroadcastResponse getById(@PathVariable UUID id, @AuthenticationPrincipal AppUser currentUser) {
        return whatsappService.getById(id, currentUser);
    }

    @GetMapping("/campaigns/{id}/recipients")
    public List<BroadcastRecipientResponse> recipients(@PathVariable UUID id, @AuthenticationPrincipal AppUser currentUser) {
        return whatsappService.listRecipients(id, currentUser);
    }

    @PostMapping("/campaigns/{id}/recipients/{recipientId}/resend")
    public BroadcastRecipientResponse resendRecipient(
        @PathVariable UUID id,
        @PathVariable UUID recipientId,
        @AuthenticationPrincipal AppUser currentUser
    ) {
        return whatsappService.resendRecipient(id, recipientId, currentUser);
    }

    @GetMapping("/daily-limit")
    public WhatsappDailyLimitResponse getDailyLimit() {
        return whatsappService.getDailyLimit();
    }

    @PatchMapping("/daily-limit")
    @PreAuthorize("hasRole('ADMIN')")
    public WhatsappDailyLimitResponse setDailyLimit(
        @Valid @RequestBody SetWhatsappDailyLimitRequest request,
        @AuthenticationPrincipal AppUser currentUser
    ) {
        return whatsappService.setDailyLimit(request, currentUser);
    }

    @GetMapping("/session/status")
    public Map<String, Object> sessionStatus(@AuthenticationPrincipal AppUser currentUser) {
        return whatsappService.sessionStatus(currentUser);
    }

    @GetMapping("/session/qr")
    public Map<String, Object> sessionQr(@AuthenticationPrincipal AppUser currentUser) {
        return whatsappService.sessionQr(currentUser);
    }

    @PostMapping("/session/logout")
    public Map<String, Object> disconnectSession(@AuthenticationPrincipal AppUser currentUser) {
        return whatsappService.disconnectSession(currentUser);
    }
}
