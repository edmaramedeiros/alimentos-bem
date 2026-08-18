package com.edmara.alimentos.product;

import com.edmara.alimentos.product.dto.CreateProductRequest;
import com.edmara.alimentos.product.dto.PriceHistoryEntryResponse;
import com.edmara.alimentos.product.dto.ProductResponse;
import com.edmara.alimentos.product.dto.SetPriceRequest;
import com.edmara.alimentos.product.dto.UpdateProductRequest;
import com.edmara.alimentos.user.AppUser;
import jakarta.validation.Valid;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public List<ProductResponse> list(
        @RequestParam(required = false) Boolean active,
        @RequestParam(required = false) String category
    ) {
        return productService.list(active, category);
    }

    @GetMapping("/categories")
    public List<String> listCategories() {
        return productService.listCategories();
    }

    @GetMapping("/{id}")
    public ProductResponse get(@PathVariable UUID id) {
        return productService.getById(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductResponse> create(
        @Valid @RequestBody CreateProductRequest request,
        @AuthenticationPrincipal AppUser currentUser
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.create(request, currentUser));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ProductResponse update(@PathVariable UUID id, @Valid @RequestBody UpdateProductRequest request) {
        return productService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivate(@PathVariable UUID id) {
        productService.deactivate(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/price-history")
    public List<PriceHistoryEntryResponse> priceHistory(@PathVariable UUID id) {
        return productService.priceHistory(id);
    }

    @GetMapping("/{id}/price")
    public PriceHistoryEntryResponse currentPrice(@PathVariable UUID id, @RequestParam(required = false) String at) {
        Instant reference = parseInstant(at);
        return productService.priceAt(id, reference);
    }

    @PostMapping("/{id}/price-history")
    @PreAuthorize("hasRole('ADMIN')")
    public PriceHistoryEntryResponse setPrice(
        @PathVariable UUID id,
        @Valid @RequestBody SetPriceRequest request,
        @AuthenticationPrincipal AppUser currentUser
    ) {
        return productService.setPrice(id, request, currentUser);
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
