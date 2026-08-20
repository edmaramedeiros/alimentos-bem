package com.edmara.alimentos.payment.dto;

import com.edmara.alimentos.payment.Payment;
import java.util.Base64;

public record PaymentAttachmentResponse(
    String fileName,
    String mimeType,
    String dataBase64
) {

    public static PaymentAttachmentResponse from(Payment payment) {
        return new PaymentAttachmentResponse(
            payment.getAttachmentFileName(),
            payment.getAttachmentMimeType(),
            Base64.getEncoder().encodeToString(payment.getAttachmentData())
        );
    }
}
