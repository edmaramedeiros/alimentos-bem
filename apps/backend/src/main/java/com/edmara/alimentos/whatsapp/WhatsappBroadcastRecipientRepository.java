package com.edmara.alimentos.whatsapp;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WhatsappBroadcastRecipientRepository extends JpaRepository<WhatsappBroadcastRecipient, UUID> {

    List<WhatsappBroadcastRecipient> findByBroadcast_IdOrderByCreatedAtAsc(UUID broadcastId);

    long countByBroadcast_IdAndStatus(UUID broadcastId, RecipientStatus status);
}
