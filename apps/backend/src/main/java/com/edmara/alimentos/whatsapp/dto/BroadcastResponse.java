package com.edmara.alimentos.whatsapp.dto;

import com.edmara.alimentos.whatsapp.RecipientStatus;
import com.edmara.alimentos.whatsapp.WhatsappBroadcast;
import java.time.Instant;
import java.util.UUID;

public record BroadcastResponse(
    UUID id,
    String message,
    boolean hasAttachment,
    String attachmentFileName,
    String cityFilter,
    String nameFilter,
    int delaySeconds,
    String status,
    int recipientCount,
    int sentCount,
    int failedCount,
    String createdByName,
    Instant createdAt
) {

    public static BroadcastResponse from(WhatsappBroadcast broadcast) {
        int total = broadcast.getRecipients().size();
        int sent = (int) broadcast.getRecipients().stream()
            .filter(r -> r.getStatus() == RecipientStatus.SENT)
            .count();
        int failed = (int) broadcast.getRecipients().stream()
            .filter(r -> r.getStatus() == RecipientStatus.FAILED)
            .count();

        return new BroadcastResponse(
            broadcast.getId(),
            broadcast.getMessage(),
            broadcast.getAttachmentData() != null,
            broadcast.getAttachmentFileName(),
            broadcast.getCityFilter(),
            broadcast.getNameFilter(),
            broadcast.getDelaySeconds(),
            broadcast.getStatus().name(),
            total,
            sent,
            failed,
            broadcast.getCreatedBy().getName(),
            broadcast.getCreatedAt()
        );
    }
}
