package com.edmara.alimentos.payment;

import com.edmara.alimentos.common.BaseEntity;
import com.edmara.alimentos.sale.Sale;
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
import java.time.Instant;

@Entity
@Table(name = "payment")
public class Payment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sale_id", nullable = false)
    private Sale sale;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "payment_date", nullable = false)
    private Instant paymentDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 20)
    private PaymentMethod paymentMethod;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "registered_by", nullable = false)
    private AppUser registeredBy;

    @Column(columnDefinition = "text")
    private String notes;

    protected Payment() {
        // JPA
    }

    public Payment(Sale sale, BigDecimal amount, Instant paymentDate, PaymentMethod paymentMethod, AppUser registeredBy, String notes) {
        this.sale = sale;
        this.amount = amount;
        this.paymentDate = paymentDate;
        this.paymentMethod = paymentMethod;
        this.registeredBy = registeredBy;
        this.notes = notes;
    }

    public Sale getSale() {
        return sale;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public Instant getPaymentDate() {
        return paymentDate;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public AppUser getRegisteredBy() {
        return registeredBy;
    }

    public String getNotes() {
        return notes;
    }
}
