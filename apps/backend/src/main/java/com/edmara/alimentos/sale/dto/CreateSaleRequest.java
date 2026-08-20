package com.edmara.alimentos.sale.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record CreateSaleRequest(
    UUID customerId,
    Instant saleDate,
    @NotEmpty(message = "A venda precisa ter ao menos um item") @Valid List<SaleItemRequest> items,
    @DecimalMin(value = "0", message = "Desconto não pode ser negativo") BigDecimal discountAmount
) {
}
