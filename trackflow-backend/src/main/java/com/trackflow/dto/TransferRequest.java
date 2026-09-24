package com.trackflow.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class TransferRequest {
    @NotNull
    private Long fromBaseId;
    @NotNull
    private Long toBaseId;
    @NotNull
    private Long equipmentTypeId;
    @NotNull @Min(1)
    private Integer quantity;
    @NotNull
    private LocalDate transferDate;
}
