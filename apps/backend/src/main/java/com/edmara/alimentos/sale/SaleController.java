package com.edmara.alimentos.sale;

import com.edmara.alimentos.sale.dto.CreateSaleRequest;
import com.edmara.alimentos.sale.dto.SaleResponse;
import com.edmara.alimentos.sale.dto.SaleSummaryResponse;
import com.edmara.alimentos.user.AppUser;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sales")
public class SaleController {

    private final SaleService saleService;

    public SaleController(SaleService saleService) {
        this.saleService = saleService;
    }

    @GetMapping
    public List<SaleSummaryResponse> list(@AuthenticationPrincipal AppUser currentUser) {
        return saleService.list(currentUser);
    }

    @GetMapping("/{id}")
    public SaleResponse get(@PathVariable UUID id, @AuthenticationPrincipal AppUser currentUser) {
        return saleService.getById(id, currentUser);
    }

    @PostMapping
    public ResponseEntity<SaleResponse> create(
        @Valid @RequestBody CreateSaleRequest request,
        @AuthenticationPrincipal AppUser currentUser
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(saleService.create(request, currentUser));
    }

    @PostMapping("/{id}/cancel")
    public SaleResponse cancel(@PathVariable UUID id, @AuthenticationPrincipal AppUser currentUser) {
        return saleService.cancel(id, currentUser);
    }
}
