package com.trackflow.service;

import com.trackflow.dto.PurchaseRequest;
import com.trackflow.entity.*;
import com.trackflow.repository.*;
import com.trackflow.security.CurrentUser;
import com.trackflow.security.SecurityUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final BaseRepository baseRepository;
    private final EquipmentTypeRepository equipmentTypeRepository;
    private final AuditLogService auditLogService;

    public PurchaseService(PurchaseRepository purchaseRepository, BaseRepository baseRepository,
                            EquipmentTypeRepository equipmentTypeRepository, AuditLogService auditLogService) {
        this.purchaseRepository = purchaseRepository;
        this.baseRepository = baseRepository;
        this.equipmentTypeRepository = equipmentTypeRepository;
        this.auditLogService = auditLogService;
    }

    public List<Purchase> search(Long baseId, Long equipmentTypeId, LocalDate startDate, LocalDate endDate) {
        Long effectiveBaseId = SecurityUtils.resolveBaseId(baseId);
        return purchaseRepository.search(effectiveBaseId, equipmentTypeId, startDate, endDate);
    }

    public Purchase create(PurchaseRequest request) {
        CurrentUser user = SecurityUtils.currentUser();
        if (!user.isAdmin() && !request.getBaseId().equals(user.baseId())) {
            throw new SecurityException("Cannot record a purchase for another base");
        }
        Base base = baseRepository.findById(request.getBaseId())
                .orElseThrow(() -> new IllegalArgumentException("Base not found"));
        EquipmentType type = equipmentTypeRepository.findById(request.getEquipmentTypeId())
                .orElseThrow(() -> new IllegalArgumentException("Equipment type not found"));

        Purchase purchase = Purchase.builder()
                .base(base)
                .equipmentType(type)
                .quantity(request.getQuantity())
                .purchaseDate(request.getPurchaseDate())
                .createdBy(user.username())
                .build();
        purchase = purchaseRepository.save(purchase);

        auditLogService.log(user.username(), "CREATE_PURCHASE", "Purchase", purchase.getId().toString(),
                "base=" + base.getName() + " type=" + type.getName() + " qty=" + request.getQuantity());

        return purchase;
    }
}
