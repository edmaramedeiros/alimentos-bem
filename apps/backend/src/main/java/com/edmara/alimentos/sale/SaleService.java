package com.edmara.alimentos.sale;

import com.edmara.alimentos.commission.CommissionRateHistory;
import com.edmara.alimentos.commission.CommissionRateHistoryRepository;
import com.edmara.alimentos.common.ResourceNotFoundException;
import com.edmara.alimentos.customer.Customer;
import com.edmara.alimentos.customer.CustomerRepository;
import com.edmara.alimentos.payment.Payment;
import com.edmara.alimentos.payment.PaymentRepository;
import com.edmara.alimentos.payment.dto.PaymentAttachmentResponse;
import com.edmara.alimentos.payment.dto.PaymentResponse;
import com.edmara.alimentos.payment.dto.RegisterPaymentRequest;
import com.edmara.alimentos.product.Product;
import com.edmara.alimentos.product.ProductPriceHistory;
import com.edmara.alimentos.product.ProductPriceHistoryRepository;
import com.edmara.alimentos.product.ProductRepository;
import com.edmara.alimentos.sale.dto.CreateSaleRequest;
import com.edmara.alimentos.sale.dto.DailySalesPointResponse;
import com.edmara.alimentos.sale.dto.MonthlySalesPointResponse;
import com.edmara.alimentos.sale.dto.SaleItemRequest;
import com.edmara.alimentos.sale.dto.SaleResponse;
import com.edmara.alimentos.sale.dto.SaleSummaryResponse;
import com.edmara.alimentos.user.AppUser;
import com.edmara.alimentos.user.Role;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class SaleService {

    private static final ZoneId DASHBOARD_ZONE = ZoneId.of("America/Cuiaba");

    // Comprovante de pagamento (foto/PDF); base64 infla ~33% o corpo da requisicao,
    // por isso o teto e conservador em relacao ao limite do Tomcat (15MB).
    private static final int MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;

    private final SaleRepository saleRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final ProductPriceHistoryRepository priceHistoryRepository;
    private final CommissionRateHistoryRepository commissionRateHistoryRepository;
    private final PaymentRepository paymentRepository;

    public SaleService(
        SaleRepository saleRepository,
        CustomerRepository customerRepository,
        ProductRepository productRepository,
        ProductPriceHistoryRepository priceHistoryRepository,
        CommissionRateHistoryRepository commissionRateHistoryRepository,
        PaymentRepository paymentRepository
    ) {
        this.saleRepository = saleRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.priceHistoryRepository = priceHistoryRepository;
        this.commissionRateHistoryRepository = commissionRateHistoryRepository;
        this.paymentRepository = paymentRepository;
    }

    @Transactional(readOnly = true)
    public List<SaleSummaryResponse> list(AppUser currentUser) {
        List<Sale> sales = currentUser.getRole() == Role.ADMIN
            ? saleRepository.findAllByOrderBySaleDateDesc()
            : saleRepository.findByVendedor_IdOrderBySaleDateDesc(currentUser.getId());
        return sales.stream().map(SaleSummaryResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public SaleResponse getById(UUID id, AppUser currentUser) {
        Sale sale = findSale(id);
        assertOwnership(sale, currentUser);
        return SaleResponse.from(sale);
    }

    @Transactional
    public SaleResponse create(CreateSaleRequest request, AppUser currentUser) {
        Customer customer = null;
        if (request.customerId() != null) {
            customer = customerRepository.findById(request.customerId())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado: " + request.customerId()));

            boolean isOwnCustomer = customer.getOwnerVendedor().getId().equals(currentUser.getId());
            if (currentUser.getRole() != Role.ADMIN && !isOwnCustomer) {
                throw new AccessDeniedException("Você só pode lançar vendas para os seus próprios clientes");
            }
        }

        Instant saleDate = request.saleDate() != null ? request.saleDate() : Instant.now();
        Sale sale = new Sale(currentUser, customer, saleDate);

        // Trava a taxa de comissão vigente do vendedor no momento da venda (ADR 0001/0002),
        // igual ao lock de preço dos produtos. Se o vendedor ainda não tem taxa configurada,
        // assume 0% em vez de bloquear o lançamento da venda.
        BigDecimal commissionRate = commissionRateHistoryRepository.findByVendedor_IdAndEffectiveToIsNull(currentUser.getId())
            .map(CommissionRateHistory::getRate)
            .orElse(BigDecimal.ZERO);
        sale.setCommissionRateApplied(commissionRate);

        BigDecimal subtotal = BigDecimal.ZERO;
        for (SaleItemRequest itemRequest : request.items()) {
            subtotal = subtotal.add(addItem(sale, itemRequest));
        }

        BigDecimal discount = request.discountAmount() != null ? request.discountAmount() : BigDecimal.ZERO;
        if (discount.compareTo(subtotal) > 0) {
            throw new IllegalArgumentException("Desconto não pode ser maior que o total da venda");
        }
        sale.setDiscountAmount(discount);
        sale.setTotalAmount(subtotal.subtract(discount));

        return SaleResponse.from(saleRepository.save(sale));
    }

    private BigDecimal addItem(Sale sale, SaleItemRequest itemRequest) {
        Product product = productRepository.findById(itemRequest.productId())
            .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado: " + itemRequest.productId()));

        ProductPriceHistory currentPrice = priceHistoryRepository.findByProduct_IdAndEffectiveToIsNull(product.getId())
            .orElseThrow(() -> new IllegalStateException("Produto sem preço vigente: " + product.getName()));

        BigDecimal quantity = itemRequest.quantity();
        BigDecimal unitPrice = currentPrice.getPrice();
        BigDecimal subtotal = unitPrice.multiply(quantity).setScale(2, RoundingMode.HALF_UP);

        sale.addItem(new SaleItem(product, currentPrice, quantity, unitPrice, subtotal));
        return subtotal;
    }

    @Transactional
    public SaleResponse cancel(UUID id, AppUser currentUser) {
        Sale sale = findSale(id);
        assertOwnership(sale, currentUser);
        if (sale.getStatus() == SaleStatus.PAID) {
            throw new IllegalArgumentException("Não é possível cancelar uma venda já paga");
        }
        if (sale.getStatus() == SaleStatus.CANCELLED) {
            throw new IllegalArgumentException("Esta venda já está cancelada");
        }
        sale.setStatus(SaleStatus.CANCELLED);
        return SaleResponse.from(sale);
    }

    @Transactional
    public SaleResponse markAsDelivered(UUID id, AppUser currentUser) {
        Sale sale = findSale(id);
        assertOwnership(sale, currentUser);
        if (sale.getStatus() != SaleStatus.AWAITING_DELIVERY) {
            throw new IllegalArgumentException("Esta venda não está aguardando entrega");
        }
        sale.setStatus(SaleStatus.AWAITING_PAYMENT);
        return SaleResponse.from(sale);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> listPayments(UUID saleId, AppUser currentUser) {
        Sale sale = findSale(saleId);
        assertOwnership(sale, currentUser);
        return paymentRepository.findBySale_IdOrderByPaymentDateDesc(saleId).stream()
            .map(PaymentResponse::from)
            .toList();
    }

    @Transactional
    public SaleResponse registerPayment(UUID saleId, RegisterPaymentRequest request, AppUser currentUser) {
        Sale sale = findSale(saleId);
        assertOwnership(sale, currentUser);

        if (sale.getStatus() != SaleStatus.AWAITING_PAYMENT) {
            throw new IllegalArgumentException("Esta venda não está aguardando pagamento");
        }

        Payment payment = new Payment(
            sale, sale.getTotalAmount(), Instant.now(), request.paymentMethod(), currentUser, request.notes()
        );
        if (StringUtils.hasText(request.attachmentBase64())) {
            payment.setAttachment(
                decodeAttachment(request.attachmentBase64()),
                request.attachmentFileName(),
                request.attachmentMimeType()
            );
        }
        paymentRepository.save(payment);

        sale.setStatus(SaleStatus.PAID);
        BigDecimal rate = sale.getCommissionRateApplied() != null ? sale.getCommissionRateApplied() : BigDecimal.ZERO;
        BigDecimal commission = sale.getTotalAmount()
            .multiply(rate)
            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        sale.setCommissionAmount(commission);
        sale.setCommissionStatus(CommissionStatus.EARNED);

        return SaleResponse.from(sale);
    }

    @Transactional(readOnly = true)
    public List<MonthlySalesPointResponse> monthlySales(UUID vendedorId, AppUser currentUser) {
        UUID effectiveVendedorId = resolveVendedorId(vendedorId, currentUser);
        List<Sale> sales = fetchNonCancelledSales(effectiveVendedorId);

        Map<YearMonth, BigDecimal> totalsByMonth = new TreeMap<>();
        for (Sale sale : sales) {
            YearMonth month = YearMonth.from(sale.getSaleDate().atZone(DASHBOARD_ZONE).toLocalDate());
            totalsByMonth.merge(month, sale.getTotalAmount(), BigDecimal::add);
        }

        return totalsByMonth.entrySet().stream()
            .sorted(Map.Entry.<YearMonth, BigDecimal>comparingByKey().reversed())
            .map(entry -> new MonthlySalesPointResponse(entry.getKey().toString(), entry.getValue()))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<DailySalesPointResponse> dailySales(String monthParam, UUID vendedorId, AppUser currentUser) {
        YearMonth month;
        try {
            month = YearMonth.parse(monthParam);
        } catch (Exception e) {
            throw new IllegalArgumentException("Mês inválido, use o formato AAAA-MM (ex: 2026-08)");
        }

        UUID effectiveVendedorId = resolveVendedorId(vendedorId, currentUser);
        List<Sale> sales = fetchNonCancelledSales(effectiveVendedorId);

        Map<Integer, BigDecimal> totalsByDay = new TreeMap<>();
        for (int day = 1; day <= month.lengthOfMonth(); day++) {
            totalsByDay.put(day, BigDecimal.ZERO.setScale(2));
        }
        for (Sale sale : sales) {
            LocalDate saleLocalDate = sale.getSaleDate().atZone(DASHBOARD_ZONE).toLocalDate();
            if (YearMonth.from(saleLocalDate).equals(month)) {
                totalsByDay.merge(saleLocalDate.getDayOfMonth(), sale.getTotalAmount(), BigDecimal::add);
            }
        }

        return totalsByDay.entrySet().stream()
            .map(entry -> new DailySalesPointResponse(entry.getKey(), entry.getValue()))
            .toList();
    }

    private List<Sale> fetchNonCancelledSales(UUID vendedorId) {
        return vendedorId != null
            ? saleRepository.findByVendedor_IdAndStatusNotOrderBySaleDateDesc(vendedorId, SaleStatus.CANCELLED)
            : saleRepository.findByStatusNotOrderBySaleDateDesc(SaleStatus.CANCELLED);
    }

    private UUID resolveVendedorId(UUID requestedVendedorId, AppUser currentUser) {
        if (currentUser.getRole() != Role.ADMIN) {
            return currentUser.getId();
        }
        return requestedVendedorId;
    }

    private void assertOwnership(Sale sale, AppUser currentUser) {
        if (currentUser.getRole() != Role.ADMIN && !sale.getVendedor().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Você não tem permissão para acessar esta venda");
        }
    }

    private Sale findSale(UUID id) {
        return saleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Venda não encontrada: " + id));
    }

    @Transactional(readOnly = true)
    public PaymentAttachmentResponse getPaymentAttachment(UUID saleId, UUID paymentId, AppUser currentUser) {
        Sale sale = findSale(saleId);
        assertOwnership(sale, currentUser);

        Payment payment = paymentRepository.findById(paymentId)
            .filter(p -> p.getSale().getId().equals(saleId))
            .orElseThrow(() -> new ResourceNotFoundException("Pagamento não encontrado: " + paymentId));

        if (payment.getAttachmentData() == null) {
            throw new ResourceNotFoundException("Este pagamento não tem comprovante anexado");
        }

        return PaymentAttachmentResponse.from(payment);
    }

    private byte[] decodeAttachment(String base64) {
        byte[] data;
        try {
            data = Base64.getDecoder().decode(base64);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Anexo inválido");
        }
        if (data.length > MAX_ATTACHMENT_BYTES) {
            throw new IllegalArgumentException("Anexo muito grande (máximo 8 MB)");
        }
        return data;
    }
}
