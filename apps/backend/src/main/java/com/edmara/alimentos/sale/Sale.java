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
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sale")
public class Sale extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vendedor_id", nullable = false)
    private AppUser vendedor;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "sale_date", nullable = false)
    private Instant saleDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SaleStatus status = SaleStatus.PENDING;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

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
        this.status = SaleStatus.PENDING;
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

    public List<SaleItem> getItems() {
        return items;
    }
}
