package com.edmara.alimentos.whatsapp;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WhatsappDailyLimitConfigRepository extends JpaRepository<WhatsappDailyLimitConfig, UUID> {

    Optional<WhatsappDailyLimitConfig> findFirstByOrderByCreatedAtAsc();
}
