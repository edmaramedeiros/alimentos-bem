package com.edmara.alimentos.whatsapp;

import com.edmara.alimentos.common.BaseEntity;
import com.edmara.alimentos.user.AppUser;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "whatsapp_daily_limit_config")
public class WhatsappDailyLimitConfig extends BaseEntity {

    @Column(name = "daily_contact_limit", nullable = false)
    private Integer dailyContactLimit;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "updated_by", nullable = false)
    private AppUser updatedBy;

    protected WhatsappDailyLimitConfig() {
        // JPA
    }

    public WhatsappDailyLimitConfig(Integer dailyContactLimit, AppUser updatedBy) {
        this.dailyContactLimit = dailyContactLimit;
        this.updatedBy = updatedBy;
    }

    public Integer getDailyContactLimit() {
        return dailyContactLimit;
    }

    public void setDailyContactLimit(Integer dailyContactLimit) {
        this.dailyContactLimit = dailyContactLimit;
    }

    public AppUser getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(AppUser updatedBy) {
        this.updatedBy = updatedBy;
    }
}
