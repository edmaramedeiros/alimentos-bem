package com.edmara.alimentos.cashback.dto;

import java.math.BigDecimal;
import java.util.List;

public record CashbackBalanceResponse(BigDecimal availableAmount, List<CashbackEntryResponse> entries) {
}
