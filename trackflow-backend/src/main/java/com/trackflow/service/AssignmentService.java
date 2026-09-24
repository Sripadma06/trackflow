package com.trackflow.service;

import com.trackflow.dto.AssignmentRequest;
import com.trackflow.entity.*;
import com.trackflow.repository.*;
import com.trackflow.security.CurrentUser;
import com.trackflow.security.SecurityUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final BaseRepository baseRepository;
    private final EquipmentTypeRepository equipmentTypeRepository;
    private final AuditLogService auditLogService;

    public AssignmentService(AssignmentRepository assignmentRepository, BaseRepository baseRepository,
                              EquipmentTypeRepository equipmentTypeRepository, AuditLogService auditLogService) {
        this.assignmentRepository = assignmentRepository;
        this.baseRepository = baseRepository;
        this.equipmentTypeRepository = equipmentTypeRepository;
        this.auditLogService = auditLogService;
    }

    public List<Assignment> search(Long baseId, Long equipmentTypeId, LocalDate startDate, LocalDate endDate) {
        Long effectiveBaseId = SecurityUtils.resolveBaseId(baseId);
        return assignmentRepository.search(effectiveBaseId, equipmentTypeId, startDate, endDate);
    }

    public Assignment create(AssignmentRequest request) {
        CurrentUser user = SecurityUtils.currentUser();
        if (!user.isAdmin() && !request.getBaseId().equals(user.baseId())) {
            throw new SecurityException("Cannot assign assets for another base");
        }
        Base base = baseRepository.findById(request.getBaseId())
                .orElseThrow(() -> new IllegalArgumentException("Base not found"));
        EquipmentType type = equipmentTypeRepository.findById(request.getEquipmentTypeId())
                .orElseThrow(() -> new IllegalArgumentException("Equipment type not found"));

        Assignment assignment = Assignment.builder()
                .base(base)
                .equipmentType(type)
                .personnelName(request.getPersonnelName())
                .quantity(request.getQuantity())
                .status(AssignmentStatus.ASSIGNED)
                .assignedDate(request.getAssignedDate())
                .createdBy(user.username())
                .build();
        assignment = assignmentRepository.save(assignment);

        auditLogService.log(user.username(), "CREATE_ASSIGNMENT", "Assignment", assignment.getId().toString(),
                "base=" + base.getName() + " type=" + type.getName() + " to=" + request.getPersonnelName() + " qty=" + request.getQuantity());

        return assignment;
    }

    public Assignment markExpended(Long id) {
        CurrentUser user = SecurityUtils.currentUser();
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found"));

        if (!user.isAdmin() && !assignment.getBase().getId().equals(user.baseId())) {
            throw new SecurityException("Cannot modify an assignment for another base");
        }

        assignment.setStatus(AssignmentStatus.EXPENDED);
        assignment.setExpendedDate(LocalDate.now());
        assignment = assignmentRepository.save(assignment);

        auditLogService.log(user.username(), "EXPEND_ASSIGNMENT", "Assignment", assignment.getId().toString(),
                "marked expended");

        return assignment;
    }
}
