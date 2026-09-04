package com.edmara.alimentos.expense.dto;

import com.edmara.alimentos.expense.ExpenseCategory;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateExpenseRequest(
    @NotBlank(message = "Nome do credor é obrigatório") String creditorName,
    @NotNull(message = "Categoria é obrigatória") ExpenseCategory category,
    @NotNull(message = "Data é obrigatória") LocalDate expenseDate,
    @NotBlank(message = "Nome da empresa pagadora é obrigatório") String payingCompanyName,
    @NotNull(message = "Valor pago é obrigatório")
    @DecimalMin(value = "0.01", message = "Valor pago deve ser maior que zero")
    BigDecimal amount
) {
}
