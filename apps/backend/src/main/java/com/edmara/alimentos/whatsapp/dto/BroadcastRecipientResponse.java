package com.edmara.alimentos.whatsapp.dto;

import com.edmara.alimentos.whatsapp.WhatsappBroadcastRecipient;
import java.time.Instant;
import java.util.UUID;

public record BroadcastRecipientResponse(
    UUID id,
    String customerName,
    String phone,
    String status,
    String errorMessage,
    Instant sentAt
) {

    public static BroadcastRecipientResponse from(WhatsappBroadcastRecipient recipient) {
        return new BroadcastRecipientResponse(
            recipient.getId(),
            recipient.getCustomerName(),
            recipient.getPhone(),
            recipient.getStatus().name(),
            recipient.getErrorMessage(),
            recipient.getSentAt()
        );
    }
}
