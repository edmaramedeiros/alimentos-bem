package com.edmara.alimentos.customer;

import com.edmara.alimentos.common.BaseEntity;
import com.edmara.alimentos.user.AppUser;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "customer")
public class Customer extends BaseEntity {

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 30)
    private String phone;

    @Column(length = 180)
    private String email;

    @Column(name = "address_line", length = 200)
    private String addressLine;

    @Column(length = 100)
    private String city;

    @Column(length = 2)
    private String state;

    @Column(length = 15)
    private String zip;

    @Column(columnDefinition = "text")
    private String notes;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "whatsapp_opt_in", nullable = false)
    private boolean whatsappOptIn = false;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_vendedor_id", nullable = false)
    private AppUser ownerVendedor;

    protected Customer() {
        // JPA
    }

    public Customer(String name, AppUser ownerVendedor) {
        this.name = name;
        this.ownerVendedor = ownerVendedor;
        this.active = true;
        this.whatsappOptIn = false;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAddressLine() {
        return addressLine;
    }

    public void setAddressLine(String addressLine) {
        this.addressLine = addressLine;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getZip() {
        return zip;
    }

    public void setZip(String zip) {
        this.zip = zip;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public boolean isWhatsappOptIn() {
        return whatsappOptIn;
    }

    public void setWhatsappOptIn(boolean whatsappOptIn) {
        this.whatsappOptIn = whatsappOptIn;
    }

    public AppUser getOwnerVendedor() {
        return ownerVendedor;
    }
}
