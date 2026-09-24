package com.trackflow.controller;

import com.trackflow.dto.AssignmentRequest;
import com.trackflow.entity.Assignment;
import com.trackflow.service.AssignmentService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {

    private final AssignmentService assignmentService;

    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @GetMapping
    public List<Assignment> search(
            @RequestParam(required = false) Long baseId,
            @RequestParam(required = false) Long equipmentTypeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return assignmentService.search(baseId, equipmentTypeId, startDate, endDate);
    }

    @PostMapping
    public Assignment create(@Valid @RequestBody AssignmentRequest request) {
        return assignmentService.create(request);
    }

    @PatchMapping("/{id}/expend")
    public Assignment expend(@PathVariable Long id) {
        return assignmentService.markExpended(id);
    }
}
