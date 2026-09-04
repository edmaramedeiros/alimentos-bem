package com.edmara.alimentos.expense;

import com.edmara.alimentos.expense.dto.CreateExpenseRequest;
import com.edmara.alimentos.expense.dto.ExpenseResponse;
import com.edmara.alimentos.user.AppUser;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    public ExpenseService(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponse> list() {
        return expenseRepository.findAllByOrderByExpenseDateDesc().stream().map(ExpenseResponse::from).toList();
    }

    @Transactional
    public ExpenseResponse create(CreateExpenseRequest request, AppUser currentUser) {
        Expense expense = new Expense(
            request.creditorName(),
            request.category(),
            request.expenseDate(),
            request.payingCompanyName(),
            request.amount(),
            currentUser
        );
        return ExpenseResponse.from(expenseRepository.save(expense));
    }
}
