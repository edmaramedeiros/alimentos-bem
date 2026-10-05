package com.edmara.alimentos.dashboard.dto;

import java.math.BigDecimal;
import java.util.List;

public record DashboardResponse(
    String month,
    BigDecimal revenue,
    BigDecimal toReceive,
    BigDecimal expenses,
    BigDecimal profit,
    List<ProductRanking> topProducts,
    List<CategoryShare> categories,
    List<CustomerRanking> topCustomers,
    List<MonthPoint> profitHistory
) {

    public record ProductRanking(String name, BigDecimal quantity, BigDecimal revenue) {
    }

    public record CategoryShare(String name, BigDecimal revenue, BigDecimal percentage) {
    }

    public record CustomerRanking(String name, BigDecimal revenue, int saleCount) {
    }

    public record MonthPoint(String month, BigDecimal revenue, BigDecimal expenses, BigDecimal profit) {
    }
}
