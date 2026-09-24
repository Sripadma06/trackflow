package com.trackflow.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class AssignmentRequest {
    @NotNull
    private Long baseId;
    @NotNull
    private Long equipmentTypeId;
    @NotBlank
    private String personnelName;
    @NotNull @Min(1)
    private Integer quantity;
    @NotNull
    private LocalDate assignedDate;
}
