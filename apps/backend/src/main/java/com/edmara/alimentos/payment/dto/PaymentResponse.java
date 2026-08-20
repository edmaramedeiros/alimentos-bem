package com.edmara.alimentos.payment.dto;

import com.edmara.alimentos.payment.Payment;
import com.edmara.alimentos.payment.PaymentMethod;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PaymentResponse(
    UUID id,
    BigDecimal amount,
    Instant paymentDate,
    PaymentMethod paymentMethod,
    String registeredByName,
    String notes,
    boolean hasAttachment,
    String attachmentFileName
) {

    public static PaymentResponse from(Payment payment) {
        return new PaymentResponse(
            payment.getId(),
            payment.getAmount(),
            payment.getPaymentDate(),
            payment.getPaymentMethod(),
            payment.getRegisteredBy().getName(),
            payment.getNotes(),
            payment.getAttachmentData() != null,
            payment.getAttachmentFileName()
        );
    }
}
