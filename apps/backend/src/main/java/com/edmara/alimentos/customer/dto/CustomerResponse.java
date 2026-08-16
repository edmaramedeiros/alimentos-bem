package com.edmara.alimentos.customer.dto;

import com.edmara.alimentos.customer.Customer;
import java.util.UUID;

public record CustomerResponse(
    UUID id,
    String name,
    String phone,
    String email,
    String addressLine,
    String city,
    String state,
    String zip,
    String notes,
    boolean active,
    boolean whatsappOptIn,
    UUID ownerVendedorId,
    String ownerVendedorName
) {

    public static CustomerResponse from(Customer customer) {
        return new CustomerResponse(
            customer.getId(),
            customer.getName(),
            customer.getPhone(),
            customer.getEmail(),
            customer.getAddressLine(),
            customer.getCity(),
            customer.getState(),
            customer.getZip(),
            customer.getNotes(),
            customer.isActive(),
            customer.isWhatsappOptIn(),
            customer.getOwnerVendedor().getId(),
            customer.getOwnerVendedor().getName()
        );
    }
}
