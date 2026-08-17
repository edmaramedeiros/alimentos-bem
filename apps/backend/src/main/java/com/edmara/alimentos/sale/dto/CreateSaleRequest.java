package com.edmara.alimentos.sale.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record CreateSaleRequest(
    @NotNull(message = "Cliente é obrigatório") UUID customerId,
    Instant saleDate,
    @NotEmpty(message = "A venda precisa ter ao menos um item") @Valid List<SaleItemRequest> items
) {
}
