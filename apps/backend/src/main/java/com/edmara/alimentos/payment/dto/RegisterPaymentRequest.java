package com.edmara.alimentos.payment.dto;

import com.edmara.alimentos.payment.PaymentMethod;
import jakarta.validation.constraints.NotNull;

public record RegisterPaymentRequest(
    @NotNull(message = "Forma de pagamento é obrigatória") PaymentMethod paymentMethod,
    String notes,
    String attachmentBase64,
    String attachmentFileName,
    String attachmentMimeType
) {
}
