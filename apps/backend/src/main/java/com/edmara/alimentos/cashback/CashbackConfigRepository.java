package com.edmara.alimentos.cashback;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CashbackConfigRepository extends JpaRepository<CashbackConfig, UUID> {

    Optional<CashbackConfig> findFirstByOrderByCreatedAtAsc();
}
