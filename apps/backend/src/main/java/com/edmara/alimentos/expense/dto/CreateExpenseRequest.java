package com.edmara.alimentos.expense.dto;

import com.edmara.alimentos.expense.ExpenseCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record CreateExpenseRequest(
    @NotBlank(message = "Nome do credor é obrigatório") String creditorName,
    @NotNull(message = "Categoria é obrigatória") ExpenseCategory category,
    @NotNull(message = "Data é obrigatória") LocalDate expenseDate,
    @NotBlank(message = "Nome da empresa pagadora é obrigatório") String payingCompanyName
) {
}
