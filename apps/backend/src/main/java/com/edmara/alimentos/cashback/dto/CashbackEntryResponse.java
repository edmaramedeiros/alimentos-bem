package com.edmara.alimentos.cashback.dto;

import com.edmara.alimentos.sale.Sale;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record CashbackEntryResponse(
    UUID saleId,
    Instant saleDate,
    BigDecimal amount,
    LocalDate expiresAt,
    boolean expired
) {

    public static CashbackEntryResponse from(Sale sale, LocalDate today) {
        boolean expired = sale.getCashbackExpiresAt() != null && sale.getCashbackExpiresAt().isBefore(today);
        return new CashbackEntryResponse(sale.getId(), sale.getSaleDate(), sale.getCashbackAmount(), sale.getCashbackExpiresAt(), expired);
    }
}
