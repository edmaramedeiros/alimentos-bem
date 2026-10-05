package com.edmara.alimentos.dashboard;

import com.edmara.alimentos.dashboard.dto.DashboardResponse;
import com.edmara.alimentos.dashboard.dto.DashboardResponse.CategoryShare;
import com.edmara.alimentos.dashboard.dto.DashboardResponse.CustomerRanking;
import com.edmara.alimentos.dashboard.dto.DashboardResponse.MonthPoint;
import com.edmara.alimentos.dashboard.dto.DashboardResponse.ProductRanking;
import com.edmara.alimentos.expense.Expense;
import com.edmara.alimentos.expense.ExpenseRepository;
import com.edmara.alimentos.sale.Sale;
import com.edmara.alimentos.sale.SaleItem;
import com.edmara.alimentos.sale.SaleRepository;
import com.edmara.alimentos.sale.SaleStatus;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {

    private static final ZoneId ZONE = ZoneId.of("America/Cuiaba");
    private static final int HISTORY_MONTHS = 12;
    private static final int TOP_LIMIT = 5;
    private static final String SEM_CATEGORIA = "Sem categoria";

    private final ExpenseRepository expenseRepository;
    private final SaleRepository saleRepository;

    public DashboardService(ExpenseRepository expenseRepository, SaleRepository saleRepository) {
        this.expenseRepository = expenseRepository;
        this.saleRepository = saleRepository;
    }

    @Transactional(readOnly = true)
    public DashboardResponse indicators(YearMonth month) {
        YearMonth startMonth = month.minusMonths(HISTORY_MONTHS - 1);
        Instant windowStart = startMonth.atDay(1).atStartOfDay(ZONE).toInstant();
        Instant windowEnd = month.plusMonths(1).atDay(1).atStartOfDay(ZONE).toInstant();
        List<Sale> sales = saleRepository.findBySaleDateGreaterThanEqualAndSaleDateLessThanAndStatusNot(
            windowStart, windowEnd, SaleStatus.CANCELLED
        );

        Map<YearMonth, BigDecimal> revenueByMonth = new HashMap<>();
        Map<YearMonth, List<Sale>> salesByMonth = new HashMap<>();
        for (Sale sale : sales) {
            YearMonth saleMonth = YearMonth.from(sale.getSaleDate().atZone(ZONE).toLocalDate());
            revenueByMonth.merge(saleMonth, sale.getTotalAmount(), BigDecimal::add);
            salesByMonth.computeIfAbsent(saleMonth, k -> new ArrayList<>()).add(sale);
        }

        List<MonthPoint> history = profitHistory(startMonth, revenueByMonth);
        MonthPoint selected = history.get(history.size() - 1);

        List<Sale> selectedSales = salesByMonth.getOrDefault(month, List.of());
        Map<String, BigDecimal> quantityByProduct = new HashMap<>();
        Map<String, BigDecimal> revenueByProduct = new HashMap<>();
        Map<String, String> productNames = new HashMap<>();
        Map<String, BigDecimal> revenueByCategory = new HashMap<>();
        Map<UUID, BigDecimal> revenueByCustomer = new HashMap<>();
        Map<UUID, Integer> salesByCustomer = new HashMap<>();
        Map<UUID, String> customerNames = new HashMap<>();

        for (Sale sale : selectedSales) {
            if (sale.getCustomer() != null) {
                UUID customerId = sale.getCustomer().getId();
                customerNames.put(customerId, sale.getCustomer().getName());
                revenueByCustomer.merge(customerId, sale.getTotalAmount(), BigDecimal::add);
                salesByCustomer.merge(customerId, 1, Integer::sum);
            }
            for (SaleItem item : sale.getItems()) {
                String productId = item.getProduct().getId().toString();
                productNames.put(productId, item.getProduct().getName());
                quantityByProduct.merge(productId, item.getQuantity(), BigDecimal::add);
                revenueByProduct.merge(productId, item.getSubtotal(), BigDecimal::add);

                String category = item.getProduct().getCategory() != null ? item.getProduct().getCategory() : SEM_CATEGORIA;
                revenueByCategory.merge(category, item.getSubtotal(), BigDecimal::add);
            }
        }

        List<ProductRanking> topProducts = revenueByProduct.entrySet().stream()
            .sorted(Map.Entry.<String, BigDecimal>comparingByValue().reversed())
            .limit(TOP_LIMIT)
            .map(entry -> new ProductRanking(
                productNames.get(entry.getKey()), quantityByProduct.get(entry.getKey()), entry.getValue()
            ))
            .toList();

        BigDecimal categoryTotal = revenueByCategory.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        List<CategoryShare> categories = revenueByCategory.entrySet().stream()
            .sorted(Map.Entry.<String, BigDecimal>comparingByValue().reversed())
            .map(entry -> new CategoryShare(
                entry.getKey(), entry.getValue(), percentageOf(entry.getValue(), categoryTotal)
            ))
            .toList();

        List<CustomerRanking> topCustomers = revenueByCustomer.entrySet().stream()
            .sorted(Map.Entry.<UUID, BigDecimal>comparingByValue().reversed())
            .limit(TOP_LIMIT)
            .map(entry -> new CustomerRanking(
                customerNames.get(entry.getKey()), entry.getValue(), salesByCustomer.get(entry.getKey())
            ))
            .toList();

        return new DashboardResponse(
            month.toString(),
            selected.revenue(),
            selected.expenses(),
            selected.profit(),
            topProducts,
            categories,
            topCustomers,
            history
        );
    }

    private List<MonthPoint> profitHistory(YearMonth startMonth, Map<YearMonth, BigDecimal> revenueByMonth) {
        YearMonth endMonth = startMonth.plusMonths(HISTORY_MONTHS - 1);
        LocalDate fromDate = startMonth.atDay(1);
        LocalDate toDate = endMonth.plusMonths(1).atDay(1);

        Map<YearMonth, BigDecimal> expensesByMonth = new HashMap<>();
        for (Expense expense : expenseRepository.findByExpenseDateGreaterThanEqualAndExpenseDateLessThan(fromDate, toDate)) {
            expensesByMonth.merge(YearMonth.from(expense.getExpenseDate()), expense.getAmount(), BigDecimal::add);
        }

        List<MonthPoint> history = new ArrayList<>();
        for (int i = 0; i < HISTORY_MONTHS; i++) {
            YearMonth current = startMonth.plusMonths(i);
            BigDecimal revenue = revenueByMonth.getOrDefault(current, BigDecimal.ZERO);
            BigDecimal expenses = expensesByMonth.getOrDefault(current, BigDecimal.ZERO);
            history.add(new MonthPoint(current.toString(), revenue, expenses, revenue.subtract(expenses)));
        }
        return history;
    }

    private BigDecimal percentageOf(BigDecimal part, BigDecimal total) {
        if (total.signum() == 0) {
            return BigDecimal.ZERO;
        }
        return part.multiply(BigDecimal.valueOf(100)).divide(total, 1, RoundingMode.HALF_UP);
    }
}
