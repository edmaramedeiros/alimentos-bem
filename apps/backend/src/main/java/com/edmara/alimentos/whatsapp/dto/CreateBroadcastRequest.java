package com.edmara.alimentos.whatsapp.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateBroadcastRequest(
    @NotBlank(message = "Mensagem é obrigatória") String message,
    String attachmentBase64,
    String attachmentFileName,
    String attachmentMimeType,
    String cityFilter,
    String nameFilter,
    @NotNull(message = "Tempo de espera é obrigatório")
    @Min(value = 3, message = "O tempo de espera mínimo é 3 segundos")
    @Max(value = 300, message = "O tempo de espera máximo é 300 segundos")
    Integer delaySeconds
) {
}
