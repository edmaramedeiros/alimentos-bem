package com.edmara.alimentos.commission.dto;

import java.math.BigDecimal;
import java.util.List;

public record CommissionReportResponse(BigDecimal totalEarned, List<CommissionEntryResponse> entries) {
}
