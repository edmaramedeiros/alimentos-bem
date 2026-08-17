package com.edmara.alimentos.sale;

import com.edmara.alimentos.common.ResourceNotFoundException;
import com.edmara.alimentos.customer.Customer;
import com.edmara.alimentos.customer.CustomerRepository;
import com.edmara.alimentos.product.Product;
import com.edmara.alimentos.product.ProductPriceHistory;
import com.edmara.alimentos.product.ProductPriceHistoryRepository;
import com.edmara.alimentos.product.ProductRepository;
import com.edmara.alimentos.sale.dto.CreateSaleRequest;
import com.edmara.alimentos.sale.dto.SaleItemRequest;
import com.edmara.alimentos.sale.dto.SaleResponse;
import com.edmara.alimentos.sale.dto.SaleSummaryResponse;
import com.edmara.alimentos.user.AppUser;
import com.edmara.alimentos.user.Role;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SaleService {

    private final SaleRepository saleRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final ProductPriceHistoryRepository priceHistoryRepository;

    public SaleService(
        SaleRepository saleRepository,
        CustomerRepository customerRepository,
        ProductRepository productRepository,
        ProductPriceHistoryRepository priceHistoryRepository
    ) {
        this.saleRepository = saleRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.priceHistoryRepository = priceHistoryRepository;
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
        Customer customer = customerRepository.findById(request.customerId())
            .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado: " + request.customerId()));

        boolean isOwnCustomer = customer.getOwnerVendedor().getId().equals(currentUser.getId());
        if (currentUser.getRole() != Role.ADMIN && !isOwnCustomer) {
            throw new AccessDeniedException("Você só pode lançar vendas para os seus próprios clientes");
        }

        Instant saleDate = request.saleDate() != null ? request.saleDate() : Instant.now();
        Sale sale = new Sale(currentUser, customer, saleDate);

        BigDecimal total = BigDecimal.ZERO;
        for (SaleItemRequest itemRequest : request.items()) {
            total = total.add(addItem(sale, itemRequest));
        }
        sale.setTotalAmount(total);

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
        sale.setStatus(SaleStatus.CANCELLED);
        return SaleResponse.from(sale);
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
}
