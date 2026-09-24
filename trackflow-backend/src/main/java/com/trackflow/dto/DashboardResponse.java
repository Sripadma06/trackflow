package com.trackflow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DashboardResponse {
    private int openingBalance;
    private int purchases;
    private int transfersIn;
    private int transfersOut;
    private int netMovement;
    private int assigned;
    private int expended;
    private int closingBalance;
}
