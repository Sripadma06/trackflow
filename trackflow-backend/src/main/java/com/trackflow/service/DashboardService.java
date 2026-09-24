package com.trackflow.service;

import com.trackflow.dto.DashboardResponse;
import com.trackflow.entity.AssignmentStatus;
import com.trackflow.repository.AssignmentRepository;
import com.trackflow.repository.PurchaseRepository;
import com.trackflow.repository.TransferRepository;
import com.trackflow.security.SecurityUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class DashboardService {

    private final PurchaseRepository purchaseRepository;
    private final TransferRepository transferRepository;
    private final AssignmentRepository assignmentRepository;

    public DashboardService(PurchaseRepository purchaseRepository, TransferRepository transferRepository,
                             AssignmentRepository assignmentRepository) {
        this.purchaseRepository = purchaseRepository;
        this.transferRepository = transferRepository;
        this.assignmentRepository = assignmentRepository;
    }

    public DashboardResponse getDashboard(Long baseId, Long equipmentTypeId, LocalDate startDate, LocalDate endDate) {
        Long effectiveBaseId = SecurityUtils.resolveBaseId(baseId);

        // Opening balance = net position of everything strictly before the period start.
        LocalDate openingCutoff = startDate != null ? startDate.minusDays(1) : null;
        int openingPurchases = purchaseRepository.sumQuantity(effectiveBaseId, equipmentTypeId, null, openingCutoff);
        int openingIn = transferRepository.sumTransfersIn(effectiveBaseId, equipmentTypeId, null, openingCutoff);
        int openingOut = transferRepository.sumTransfersOut(effectiveBaseId, equipmentTypeId, null, openingCutoff);
        int openingExpended = assignmentRepository.sumQuantityByStatus(AssignmentStatus.EXPENDED, effectiveBaseId, equipmentTypeId, null, openingCutoff);
        int openingBalance = openingPurchases + openingIn - openingOut - openingExpended;

        int purchases = purchaseRepository.sumQuantity(effectiveBaseId, equipmentTypeId, startDate, endDate);
        int transfersIn = transferRepository.sumTransfersIn(effectiveBaseId, equipmentTypeId, startDate, endDate);
        int transfersOut = transferRepository.sumTransfersOut(effectiveBaseId, equipmentTypeId, startDate, endDate);
        int netMovement = purchases + transfersIn - transfersOut;

        int assigned = assignmentRepository.sumQuantityByStatus(AssignmentStatus.ASSIGNED, effectiveBaseId, equipmentTypeId, startDate, endDate);
        int expended = assignmentRepository.sumQuantityByStatus(AssignmentStatus.EXPENDED, effectiveBaseId, equipmentTypeId, startDate, endDate);

        int closingBalance = openingBalance + netMovement - expended;

        return new DashboardResponse(openingBalance, purchases, transfersIn, transfersOut, netMovement, assigned, expended, closingBalance);
    }
}
