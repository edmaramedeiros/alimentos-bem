package com.edmara.alimentos.sale.dto;

import java.math.BigDecimal;

public record DailySalesPointResponse(int day, BigDecimal total) {
}
