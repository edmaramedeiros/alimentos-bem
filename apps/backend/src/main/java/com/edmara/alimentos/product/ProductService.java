package com.edmara.alimentos.product;

import com.edmara.alimentos.common.ConflictException;
import com.edmara.alimentos.common.ResourceNotFoundException;
import com.edmara.alimentos.product.dto.CreateProductRequest;
import com.edmara.alimentos.product.dto.PriceHistoryEntryResponse;
import com.edmara.alimentos.product.dto.ProductResponse;
import com.edmara.alimentos.product.dto.SetPriceRequest;
import com.edmara.alimentos.product.dto.UpdateProductRequest;
import com.edmara.alimentos.user.AppUser;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductPriceHistoryRepository priceHistoryRepository;

    public ProductService(ProductRepository productRepository, ProductPriceHistoryRepository priceHistoryRepository) {
        this.productRepository = productRepository;
        this.priceHistoryRepository = priceHistoryRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> list(Boolean active, String category) {
        List<Product> products = active == null ? productRepository.findAll() : filterByActive(active);
        if (StringUtils.hasText(category)) {
            products = products.stream().filter(p -> category.equals(p.getCategory())).toList();
        }
        return products.stream().map(ProductResponse::from).toList();
    }

    private List<Product> filterByActive(boolean active) {
        return active
            ? productRepository.findByActiveTrue()
            : productRepository.findAll().stream().filter(p -> !p.isActive()).toList();
    }

    @Transactional(readOnly = true)
    public List<String> listCategories() {
        return productRepository.findAll().stream()
            .map(Product::getCategory)
            .filter(Objects::nonNull)
            .filter(StringUtils::hasText)
            .distinct()
            .sorted()
            .toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse getById(UUID id) {
        return ProductResponse.from(findProduct(id));
    }

    @Transactional
    public ProductResponse create(CreateProductRequest request, AppUser currentUser) {
        if (StringUtils.hasText(request.sku()) && productRepository.existsBySku(request.sku())) {
            throw new ConflictException("Já existe um produto com este SKU");
        }
        Product product = new Product(request.name(), request.sku(), request.category(), request.description(), request.unit());
        product.setCurrentPrice(request.price());
        product = productRepository.save(product);

        ProductPriceHistory firstPrice = new ProductPriceHistory(product, request.price(), Instant.now(), currentUser);
        priceHistoryRepository.save(firstPrice);

        return ProductResponse.from(product);
    }

    @Transactional
    public ProductResponse update(UUID id, UpdateProductRequest request) {
        Product product = findProduct(id);
        if (StringUtils.hasText(request.sku())
            && !request.sku().equalsIgnoreCase(product.getSku())
            && productRepository.existsBySku(request.sku())) {
            throw new ConflictException("Já existe um produto com este SKU");
        }
        product.setName(request.name());
        product.setSku(request.sku());
        product.setCategory(request.category());
        product.setDescription(request.description());
        product.setUnit(request.unit());
        product.setActive(request.active());
        return ProductResponse.from(product);
    }

    @Transactional
    public void deactivate(UUID id) {
        Product product = findProduct(id);
        product.setActive(false);
    }

    @Transactional(readOnly = true)
    public List<PriceHistoryEntryResponse> priceHistory(UUID productId) {
        ensureExists(productId);
        return priceHistoryRepository.findByProduct_IdOrderByEffectiveFromDesc(productId).stream()
            .map(PriceHistoryEntryResponse::from)
            .toList();
    }

    @Transactional(readOnly = true)
    public PriceHistoryEntryResponse priceAt(UUID productId, Instant at) {
        ensureExists(productId);
        Instant reference = at != null ? at : Instant.now();
        return priceHistoryRepository.findEffectiveAt(productId, reference)
            .map(PriceHistoryEntryResponse::from)
            .orElseThrow(() -> new ResourceNotFoundException("Nenhum preço vigente para este produto na data informada"));
    }

    @Transactional
    public PriceHistoryEntryResponse setPrice(UUID productId, SetPriceRequest request, AppUser currentUser) {
        Product product = findProduct(productId);
        Instant now = Instant.now();

        // Fecha e força o flush da linha vigente antes de inserir a nova: caso contrário o
        // Hibernate executa o INSERT antes do UPDATE na mesma transação e viola a constraint
        // uq_price_history_current (que permite no máximo uma linha com effective_to nulo).
        priceHistoryRepository.findByProduct_IdAndEffectiveToIsNull(productId)
            .ifPresent(current -> {
                current.setEffectiveTo(now);
                priceHistoryRepository.saveAndFlush(current);
            });

        ProductPriceHistory newEntry = new ProductPriceHistory(product, request.price(), now, currentUser);
        priceHistoryRepository.save(newEntry);
        product.setCurrentPrice(request.price());

        return PriceHistoryEntryResponse.from(newEntry);
    }

    private void ensureExists(UUID productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Produto não encontrado: " + productId);
        }
    }

    private Product findProduct(UUID id) {
        return productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado: " + id));
    }
}
