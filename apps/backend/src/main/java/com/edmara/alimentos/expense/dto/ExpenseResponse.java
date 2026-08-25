package com.edmara.alimentos.expense.dto;

import com.edmara.alimentos.expense.Expense;
import com.edmara.alimentos.expense.ExpenseCategory;
import java.time.LocalDate;
import java.util.UUID;

public record ExpenseResponse(
    UUID id,
    String creditorName,
    ExpenseCategory category,
    LocalDate expenseDate,
    String payingCompanyName,
    String createdByName
) {

    public static ExpenseResponse from(Expense expense) {
        return new ExpenseResponse(
            expense.getId(),
            expense.getCreditorName(),
            expense.getCategory(),
            expense.getExpenseDate(),
            expense.getPayingCompanyName(),
            expense.getCreatedBy().getName()
        );
    }
}
