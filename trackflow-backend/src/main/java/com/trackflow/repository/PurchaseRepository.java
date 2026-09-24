package com.trackflow.repository;

import com.trackflow.entity.Purchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface PurchaseRepository extends JpaRepository<Purchase, Long> {

    @Query("select p from Purchase p where " +
           "(:baseId is null or p.base.id = :baseId) and " +
           "(:equipmentTypeId is null or p.equipmentType.id = :equipmentTypeId) and " +
           "(:startDate is null or p.purchaseDate >= :startDate) and " +
           "(:endDate is null or p.purchaseDate <= :endDate) " +
           "order by p.purchaseDate desc")
    List<Purchase> search(@Param("baseId") Long baseId,
                           @Param("equipmentTypeId") Long equipmentTypeId,
                           @Param("startDate") LocalDate startDate,
                           @Param("endDate") LocalDate endDate);

    @Query("select coalesce(sum(p.quantity),0) from Purchase p where " +
           "(:baseId is null or p.base.id = :baseId) and " +
           "(:equipmentTypeId is null or p.equipmentType.id = :equipmentTypeId) and " +
           "(:startDate is null or p.purchaseDate >= :startDate) and " +
           "(:endDate is null or p.purchaseDate <= :endDate)")
    Integer sumQuantity(@Param("baseId") Long baseId,
                        @Param("equipmentTypeId") Long equipmentTypeId,
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate);
}
