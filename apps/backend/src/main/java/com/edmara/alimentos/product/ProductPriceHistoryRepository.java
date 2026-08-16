package com.edmara.alimentos.product;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductPriceHistoryRepository extends JpaRepository<ProductPriceHistory, UUID> {

    Optional<ProductPriceHistory> findByProduct_IdAndEffectiveToIsNull(UUID productId);

    List<ProductPriceHistory> findByProduct_IdOrderByEffectiveFromDesc(UUID productId);

    @Query("""
        select h from ProductPriceHistory h
        where h.product.id = :productId
          and h.effectiveFrom <= :at
          and (h.effectiveTo is null or h.effectiveTo > :at)
        """)
    Optional<ProductPriceHistory> findEffectiveAt(@Param("productId") UUID productId, @Param("at") Instant at);
}
