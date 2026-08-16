package com.edmara.alimentos.customer;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer, UUID> {

    List<Customer> findByOwnerVendedor_Id(UUID ownerId);

    List<Customer> findByOwnerVendedor_IdAndNameContainingIgnoreCase(UUID ownerId, String query);

    List<Customer> findByNameContainingIgnoreCase(String query);
}
