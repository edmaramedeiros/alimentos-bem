package com.edmara.alimentos.expense;

import com.edmara.alimentos.common.BaseEntity;
import com.edmara.alimentos.user.AppUser;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "expense")
public class Expense extends BaseEntity {

    @Column(name = "creditor_name", nullable = false, length = 150)
    private String creditorName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ExpenseCategory category;

    @Column(name = "expense_date", nullable = false)
    private LocalDate expenseDate;

    @Column(name = "paying_company_name", nullable = false, length = 150)
    private String payingCompanyName;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable = false)
    private AppUser createdBy;

    protected Expense() {
        // JPA
    }

    public Expense(
        String creditorName,
        ExpenseCategory category,
        LocalDate expenseDate,
        String payingCompanyName,
        BigDecimal amount,
        AppUser createdBy
    ) {
        this.creditorName = creditorName;
        this.category = category;
        this.expenseDate = expenseDate;
        this.payingCompanyName = payingCompanyName;
        this.amount = amount;
        this.createdBy = createdBy;
    }

    public String getCreditorName() {
        return creditorName;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public ExpenseCategory getCategory() {
        return category;
    }

    public LocalDate getExpenseDate() {
        return expenseDate;
    }

    public String getPayingCompanyName() {
        return payingCompanyName;
    }

    public AppUser getCreatedBy() {
        return createdBy;
    }
}
