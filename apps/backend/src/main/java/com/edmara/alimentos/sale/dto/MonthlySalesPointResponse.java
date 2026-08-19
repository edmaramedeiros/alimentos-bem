package com.edmara.alimentos.sale.dto;

import java.math.BigDecimal;

public record MonthlySalesPointResponse(String month, BigDecimal total) {
}
