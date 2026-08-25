package com.edmara.alimentos.expense;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExpenseRepository extends JpaRepository<Expense, UUID> {

    List<Expense> findAllByOrderByExpenseDateDesc();
}
