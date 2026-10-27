package com.edmara.alimentos.sale.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Lista de separação: soma, por produto, as quantidades de todas as vendas que ainda
 * aguardam entrega, com o detalhamento de quais pedidos levam cada produto.
 */
public record PickingListResponse(int orderCount, List<Product> products) {

    public record Product(
        UUID productId,
        String productName,
        String category,
        String unit,
        BigDecimal totalQuantity,
        List<Order> orders
    ) {
    }

    public record Order(
        UUID saleId,
        String customerName,
        String vendedorName,
        Instant saleDate,
        BigDecimal quantity
    ) {
    }
}
