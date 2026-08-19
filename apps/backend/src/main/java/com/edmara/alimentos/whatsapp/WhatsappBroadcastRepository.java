package com.edmara.alimentos.whatsapp;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WhatsappBroadcastRepository extends JpaRepository<WhatsappBroadcast, UUID> {

    List<WhatsappBroadcast> findAllByOrderByCreatedAtDesc();
}
