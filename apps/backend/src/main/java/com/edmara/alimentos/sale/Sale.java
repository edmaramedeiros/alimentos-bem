package com.edmara.alimentos.sale;

import com.edmara.alimentos.common.BaseEntity;
import com.edmara.alimentos.customer.Customer;
import com.edmara.alimentos.user.AppUser;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sale")
public class Sale extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vendedor_id", nullable = false)
    private AppUser vendedor;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "customer_id", nullable = true)
    private Customer customer;

    @Column(name = "sale_date", nullable = false)
    private Instant saleDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SaleStatus status = SaleStatus.AWAITING_DELIVERY;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "discount_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "commission_rate_applied", precision = 5, scale = 2)
    private BigDecimal commissionRateApplied;

    @Column(name = "commission_amount", precision = 10, scale = 2)
    private BigDecimal commissionAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "commission_status", nullable = false, length = 20)
    private CommissionStatus commissionStatus = CommissionStatus.PENDING;

    @Column(name = "generates_cashback", nullable = false)
    private boolean generatesCashback = false;

    @Column(name = "cashback_percentage_applied", precision = 5, scale = 2)
    private BigDecimal cashbackPercentageApplied;

    @Column(name = "cashback_validity_days_applied")
    private Integer cashbackValidityDaysApplied;

    @Column(name = "cashback_amount", precision = 10, scale = 2)
    private BigDecimal cashbackAmount;

    @Column(name = "cashback_expires_at")
    private LocalDate cashbackExpiresAt;

    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("createdAt asc")
    private List<SaleItem> items = new ArrayList<>();

    protected Sale() {
        // JPA
    }

    public Sale(AppUser vendedor, Customer customer, Instant saleDate) {
        this.vendedor = vendedor;
        this.customer = customer;
        this.saleDate = saleDate;
        this.status = SaleStatus.AWAITING_DELIVERY;
        this.totalAmount = BigDecimal.ZERO;
    }

    public void addItem(SaleItem item) {
        items.add(item);
        item.setSale(this);
    }

    public AppUser getVendedor() {
        return vendedor;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public Instant getSaleDate() {
        return saleDate;
    }

    public SaleStatus getStatus() {
        return status;
    }

    public void setStatus(SaleStatus status) {
        this.status = status;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(BigDecimal discountAmount) {
        this.discountAmount = discountAmount;
    }

    public BigDecimal getCommissionRateApplied() {
        return commissionRateApplied;
    }

    public void setCommissionRateApplied(BigDecimal commissionRateApplied) {
        this.commissionRateApplied = commissionRateApplied;
    }

    public BigDecimal getCommissionAmount() {
        return commissionAmount;
    }

    public void setCommissionAmount(BigDecimal commissionAmount) {
        this.commissionAmount = commissionAmount;
    }

    public CommissionStatus getCommissionStatus() {
        return commissionStatus;
    }

    public void setCommissionStatus(CommissionStatus commissionStatus) {
        this.commissionStatus = commissionStatus;
    }

    public List<SaleItem> getItems() {
        return items;
    }

    public boolean isGeneratesCashback() {
        return generatesCashback;
    }

    public void setGeneratesCashback(boolean generatesCashback) {
        this.generatesCashback = generatesCashback;
    }

    public BigDecimal getCashbackPercentageApplied() {
        return cashbackPercentageApplied;
    }

    public void setCashbackPercentageApplied(BigDecimal cashbackPercentageApplied) {
        this.cashbackPercentageApplied = cashbackPercentageApplied;
    }

    public Integer getCashbackValidityDaysApplied() {
        return cashbackValidityDaysApplied;
    }

    public void setCashbackValidityDaysApplied(Integer cashbackValidityDaysApplied) {
        this.cashbackValidityDaysApplied = cashbackValidityDaysApplied;
    }

    public BigDecimal getCashbackAmount() {
        return cashbackAmount;
    }

    public void setCashbackAmount(BigDecimal cashbackAmount) {
        this.cashbackAmount = cashbackAmount;
    }

    public LocalDate getCashbackExpiresAt() {
        return cashbackExpiresAt;
    }

    public void setCashbackExpiresAt(LocalDate cashbackExpiresAt) {
        this.cashbackExpiresAt = cashbackExpiresAt;
    }
}
