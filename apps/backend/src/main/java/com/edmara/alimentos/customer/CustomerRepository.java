package com.edmara.alimentos.customer;

import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CustomerRepository extends JpaRepository<Customer, UUID> {

    List<Customer> findByOwnerVendedor_Id(UUID ownerId);

    List<Customer> findByOwnerVendedor_IdAndNameContainingIgnoreCase(UUID ownerId, String query);

    List<Customer> findByNameContainingIgnoreCase(String query);

    List<Customer> findByWhatsappOptInTrueAndActiveTrue();

    List<Customer> findByOwnerVendedor_IdAndWhatsappOptInTrueAndActiveTrue(UUID ownerId);

    interface CityStateProjection {
        String getCity();

        String getState();
    }

    // Município/UF mais usado pelo vendedor nos próprios cadastros, para sugerir
    // como padrão em um novo cliente (não conta cidade vazia).
    @Query(
        "SELECT c.city AS city, c.state AS state FROM Customer c "
            + "WHERE c.ownerVendedor.id = :ownerId AND c.city IS NOT NULL AND c.city <> '' "
            + "GROUP BY c.city, c.state ORDER BY COUNT(c) DESC"
    )
    List<CityStateProjection> findMostCommonCityAndState(@Param("ownerId") UUID ownerId, Pageable pageable);
}
