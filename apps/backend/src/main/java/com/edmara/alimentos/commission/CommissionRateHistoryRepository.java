package com.edmara.alimentos.commission;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommissionRateHistoryRepository extends JpaRepository<CommissionRateHistory, UUID> {

    Optional<CommissionRateHistory> findByVendedor_IdAndEffectiveToIsNull(UUID vendedorId);

    List<CommissionRateHistory> findByVendedor_IdOrderByEffectiveFromDesc(UUID vendedorId);
}
