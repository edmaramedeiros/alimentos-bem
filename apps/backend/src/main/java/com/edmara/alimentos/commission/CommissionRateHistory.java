package com.edmara.alimentos.commission;

import com.edmara.alimentos.common.BaseEntity;
import com.edmara.alimentos.user.AppUser;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "commission_rate_history")
public class CommissionRateHistory extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vendedor_id", nullable = false)
    private AppUser vendedor;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal rate;

    @Column(name = "effective_from", nullable = false)
    private Instant effectiveFrom;

    @Column(name = "effective_to")
    private Instant effectiveTo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable = false)
    private AppUser createdBy;

    protected CommissionRateHistory() {
        // JPA
    }

    public CommissionRateHistory(AppUser vendedor, BigDecimal rate, Instant effectiveFrom, AppUser createdBy) {
        this.vendedor = vendedor;
        this.rate = rate;
        this.effectiveFrom = effectiveFrom;
        this.createdBy = createdBy;
    }

    public AppUser getVendedor() {
        return vendedor;
    }

    public BigDecimal getRate() {
        return rate;
    }

    public Instant getEffectiveFrom() {
        return effectiveFrom;
    }

    public Instant getEffectiveTo() {
        return effectiveTo;
    }

    public void setEffectiveTo(Instant effectiveTo) {
        this.effectiveTo = effectiveTo;
    }

    public AppUser getCreatedBy() {
        return createdBy;
    }
}
