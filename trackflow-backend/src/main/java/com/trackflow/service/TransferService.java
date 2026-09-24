package com.trackflow.service;

import com.trackflow.dto.TransferRequest;
import com.trackflow.entity.*;
import com.trackflow.repository.*;
import com.trackflow.security.CurrentUser;
import com.trackflow.security.SecurityUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class TransferService {

    private final TransferRepository transferRepository;
    private final BaseRepository baseRepository;
    private final EquipmentTypeRepository equipmentTypeRepository;
    private final AuditLogService auditLogService;

    public TransferService(TransferRepository transferRepository, BaseRepository baseRepository,
                            EquipmentTypeRepository equipmentTypeRepository, AuditLogService auditLogService) {
        this.transferRepository = transferRepository;
        this.baseRepository = baseRepository;
        this.equipmentTypeRepository = equipmentTypeRepository;
        this.auditLogService = auditLogService;
    }

    public List<Transfer> search(Long baseId, Long equipmentTypeId, LocalDate startDate, LocalDate endDate) {
        Long effectiveBaseId = SecurityUtils.resolveBaseId(baseId);
        return transferRepository.search(effectiveBaseId, equipmentTypeId, startDate, endDate);
    }

    public Transfer create(TransferRequest request) {
        CurrentUser user = SecurityUtils.currentUser();
        if (!user.isAdmin() &&
            !request.getFromBaseId().equals(user.baseId()) &&
            !request.getToBaseId().equals(user.baseId())) {
            throw new SecurityException("Transfer must involve your own base");
        }
        if (request.getFromBaseId().equals(request.getToBaseId())) {
            throw new IllegalArgumentException("From base and to base cannot be the same");
        }

        Base fromBase = baseRepository.findById(request.getFromBaseId())
                .orElseThrow(() -> new IllegalArgumentException("From base not found"));
        Base toBase = baseRepository.findById(request.getToBaseId())
                .orElseThrow(() -> new IllegalArgumentException("To base not found"));
        EquipmentType type = equipmentTypeRepository.findById(request.getEquipmentTypeId())
                .orElseThrow(() -> new IllegalArgumentException("Equipment type not found"));

        Transfer transfer = Transfer.builder()
                .fromBase(fromBase)
                .toBase(toBase)
                .equipmentType(type)
                .quantity(request.getQuantity())
                .transferDate(request.getTransferDate())
                .createdBy(user.username())
                .build();
        transfer = transferRepository.save(transfer);

        auditLogService.log(user.username(), "CREATE_TRANSFER", "Transfer", transfer.getId().toString(),
                "from=" + fromBase.getName() + " to=" + toBase.getName() + " type=" + type.getName() + " qty=" + request.getQuantity());

        return transfer;
    }
}
