package com.edmara.alimentos.whatsapp;

import com.edmara.alimentos.customer.dto.CustomerResponse;
import com.edmara.alimentos.user.AppUser;
import com.edmara.alimentos.whatsapp.dto.BroadcastRecipientResponse;
import com.edmara.alimentos.whatsapp.dto.BroadcastResponse;
import com.edmara.alimentos.whatsapp.dto.CreateBroadcastRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/whatsapp")
@PreAuthorize("hasRole('ADMIN')")
public class WhatsappController {

    private final WhatsappService whatsappService;

    public WhatsappController(WhatsappService whatsappService) {
        this.whatsappService = whatsappService;
    }

    @GetMapping("/customers/preview")
    public List<CustomerResponse> previewRecipients(
        @RequestParam(required = false) String city,
        @RequestParam(required = false) String name
    ) {
        return whatsappService.previewRecipients(city, name);
    }

    @PostMapping("/campaigns")
    public ResponseEntity<BroadcastResponse> create(
        @Valid @RequestBody CreateBroadcastRequest request,
        @AuthenticationPrincipal AppUser currentUser
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(whatsappService.create(request, currentUser));
    }

    @GetMapping("/campaigns")
    public List<BroadcastResponse> list() {
        return whatsappService.list();
    }

    @GetMapping("/campaigns/{id}")
    public BroadcastResponse getById(@PathVariable UUID id) {
        return whatsappService.getById(id);
    }

    @GetMapping("/campaigns/{id}/recipients")
    public List<BroadcastRecipientResponse> recipients(@PathVariable UUID id) {
        return whatsappService.listRecipients(id);
    }

    @GetMapping("/session/status")
    public Map<String, Object> sessionStatus() {
        return whatsappService.sessionStatus();
    }

    @GetMapping("/session/qr")
    public Map<String, Object> sessionQr() {
        return whatsappService.sessionQr();
    }
}
