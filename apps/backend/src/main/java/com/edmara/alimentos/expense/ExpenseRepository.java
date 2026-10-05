package com.edmara.alimentos.expense;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExpenseRepository extends JpaRepository<Expense, UUID> {

    List<Expense> findAllByOrderByExpenseDateDesc();

    List<Expense> findByExpenseDateGreaterThanEqualAndExpenseDateLessThan(LocalDate from, LocalDate to);
}
