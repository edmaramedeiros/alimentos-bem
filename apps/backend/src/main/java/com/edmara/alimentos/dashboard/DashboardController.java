package com.edmara.alimentos.dashboard;

import com.edmara.alimentos.dashboard.dto.DashboardResponse;
import java.time.YearMonth;
import java.time.ZoneId;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@PreAuthorize("hasRole('ADMIN')")
public class DashboardController {

    private static final ZoneId ZONE = ZoneId.of("America/Cuiaba");

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/indicators")
    public DashboardResponse indicators(@RequestParam(required = false) String month) {
        return dashboardService.indicators(parseMonth(month));
    }

    private YearMonth parseMonth(String month) {
        if (month == null || month.isBlank()) {
            return YearMonth.now(ZONE);
        }
        try {
            return YearMonth.parse(month);
        } catch (Exception e) {
            throw new IllegalArgumentException("Mês inválido, use o formato AAAA-MM (ex: 2026-08)");
        }
    }
}
