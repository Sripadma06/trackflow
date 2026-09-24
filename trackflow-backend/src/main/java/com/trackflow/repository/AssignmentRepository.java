package com.trackflow.repository;

import com.trackflow.entity.Assignment;
import com.trackflow.entity.AssignmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    @Query("select a from Assignment a where " +
           "(:baseId is null or a.base.id = :baseId) and " +
           "(:equipmentTypeId is null or a.equipmentType.id = :equipmentTypeId) and " +
           "(:startDate is null or a.assignedDate >= :startDate) and " +
           "(:endDate is null or a.assignedDate <= :endDate) " +
           "order by a.assignedDate desc")
    List<Assignment> search(@Param("baseId") Long baseId,
                             @Param("equipmentTypeId") Long equipmentTypeId,
                             @Param("startDate") LocalDate startDate,
                             @Param("endDate") LocalDate endDate);

    @Query("select coalesce(sum(a.quantity),0) from Assignment a where a.status = :status and " +
           "(:baseId is null or a.base.id = :baseId) and " +
           "(:equipmentTypeId is null or a.equipmentType.id = :equipmentTypeId) and " +
           "(:startDate is null or a.assignedDate >= :startDate) and " +
           "(:endDate is null or a.assignedDate <= :endDate)")
    Integer sumQuantityByStatus(@Param("status") AssignmentStatus status,
                                @Param("baseId") Long baseId,
                                @Param("equipmentTypeId") Long equipmentTypeId,
                                @Param("startDate") LocalDate startDate,
                                @Param("endDate") LocalDate endDate);
}
