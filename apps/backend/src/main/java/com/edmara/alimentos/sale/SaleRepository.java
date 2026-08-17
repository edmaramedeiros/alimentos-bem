package com.edmara.alimentos.sale;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SaleRepository extends JpaRepository<Sale, UUID> {

    List<Sale> findByVendedor_IdOrderBySaleDateDesc(UUID vendedorId);

    List<Sale> findAllByOrderBySaleDateDesc();
}
