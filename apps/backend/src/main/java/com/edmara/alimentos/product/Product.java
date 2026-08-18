package com.edmara.alimentos.product;

import com.edmara.alimentos.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "product")
public class Product extends BaseEntity {

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 60)
    private String sku;

    @Column(length = 60)
    private String category;

    @Column(columnDefinition = "text")
    private String description;

    @Column(nullable = false, length = 30)
    private String unit;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "current_price", precision = 10, scale = 2)
    private BigDecimal currentPrice;

    protected Product() {
        // JPA
    }

    public Product(String name, String sku, String category, String description, String unit) {
        this.name = name;
        this.sku = sku;
        this.category = category;
        this.description = description;
        this.unit = unit;
        this.active = true;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public BigDecimal getCurrentPrice() {
        return currentPrice;
    }

    public void setCurrentPrice(BigDecimal currentPrice) {
        this.currentPrice = currentPrice;
    }
}
