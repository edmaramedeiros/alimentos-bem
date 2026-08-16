package com.edmara.alimentos.customer;

import com.edmara.alimentos.customer.dto.CreateCustomerRequest;
import com.edmara.alimentos.customer.dto.CustomerResponse;
import com.edmara.alimentos.customer.dto.UpdateCustomerRequest;
import com.edmara.alimentos.user.AppUser;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping
    public List<CustomerResponse> list(
        @RequestParam(required = false) String query,
        @AuthenticationPrincipal AppUser currentUser
    ) {
        return customerService.list(currentUser, query);
    }

    @GetMapping("/{id}")
    public CustomerResponse get(@PathVariable UUID id, @AuthenticationPrincipal AppUser currentUser) {
        return customerService.getById(id, currentUser);
    }

    @PostMapping
    public ResponseEntity<CustomerResponse> create(
        @Valid @RequestBody CreateCustomerRequest request,
        @AuthenticationPrincipal AppUser currentUser
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(customerService.create(request, currentUser));
    }

    @PatchMapping("/{id}")
    public CustomerResponse update(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateCustomerRequest request,
        @AuthenticationPrincipal AppUser currentUser
    ) {
        return customerService.update(id, request, currentUser);
    }
}
