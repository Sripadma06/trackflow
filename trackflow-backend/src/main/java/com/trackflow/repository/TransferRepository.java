package com.trackflow.repository;

import com.trackflow.entity.Transfer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface TransferRepository extends JpaRepository<Transfer, Long> {

    @Query("select t from Transfer t where " +
           "(:baseId is null or t.fromBase.id = :baseId or t.toBase.id = :baseId) and " +
           "(:equipmentTypeId is null or t.equipmentType.id = :equipmentTypeId) and " +
           "(:startDate is null or t.transferDate >= :startDate) and " +
           "(:endDate is null or t.transferDate <= :endDate) " +
           "order by t.transferDate desc")
    List<Transfer> search(@Param("baseId") Long baseId,
                           @Param("equipmentTypeId") Long equipmentTypeId,
                           @Param("startDate") LocalDate startDate,
                           @Param("endDate") LocalDate endDate);

    @Query("select coalesce(sum(t.quantity),0) from Transfer t where " +
           "(:baseId is null or t.toBase.id = :baseId) and " +
           "(:equipmentTypeId is null or t.equipmentType.id = :equipmentTypeId) and " +
           "(:startDate is null or t.transferDate >= :startDate) and " +
           "(:endDate is null or t.transferDate <= :endDate)")
    Integer sumTransfersIn(@Param("baseId") Long baseId,
                           @Param("equipmentTypeId") Long equipmentTypeId,
                           @Param("startDate") LocalDate startDate,
                           @Param("endDate") LocalDate endDate);

    @Query("select coalesce(sum(t.quantity),0) from Transfer t where " +
           "(:baseId is null or t.fromBase.id = :baseId) and " +
           "(:equipmentTypeId is null or t.equipmentType.id = :equipmentTypeId) and " +
           "(:startDate is null or t.transferDate >= :startDate) and " +
           "(:endDate is null or t.transferDate <= :endDate)")
    Integer sumTransfersOut(@Param("baseId") Long baseId,
                            @Param("equipmentTypeId") Long equipmentTypeId,
                            @Param("startDate") LocalDate startDate,
                            @Param("endDate") LocalDate endDate);
}
