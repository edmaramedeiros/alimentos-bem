package com.edmara.alimentos.cashback;

import com.edmara.alimentos.common.BaseEntity;
import com.edmara.alimentos.user.AppUser;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "cashback_config")
public class CashbackConfig extends BaseEntity {

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal percentage;

    @Column(name = "validity_days", nullable = false)
    private Integer validityDays;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "updated_by", nullable = false)
    private AppUser updatedBy;

    protected CashbackConfig() {
        // JPA
    }

    public CashbackConfig(BigDecimal percentage, Integer validityDays, AppUser updatedBy) {
        this.percentage = percentage;
        this.validityDays = validityDays;
        this.updatedBy = updatedBy;
    }

    public BigDecimal getPercentage() {
        return percentage;
    }

    public void setPercentage(BigDecimal percentage) {
        this.percentage = percentage;
    }

    public Integer getValidityDays() {
        return validityDays;
    }

    public void setValidityDays(Integer validityDays) {
        this.validityDays = validityDays;
    }

    public AppUser getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(AppUser updatedBy) {
        this.updatedBy = updatedBy;
    }
}
