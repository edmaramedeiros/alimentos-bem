package com.edmara.alimentos.expense;

import com.edmara.alimentos.expense.dto.CreateExpenseRequest;
import com.edmara.alimentos.expense.dto.ExpenseResponse;
import com.edmara.alimentos.user.AppUser;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/expenses")
@PreAuthorize("hasRole('ADMIN')")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @GetMapping
    public List<ExpenseResponse> list() {
        return expenseService.list();
    }

    @PostMapping
    public ResponseEntity<ExpenseResponse> create(
        @Valid @RequestBody CreateExpenseRequest request,
        @AuthenticationPrincipal AppUser currentUser
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(expenseService.create(request, currentUser));
    }
}
