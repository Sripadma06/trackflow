package com.trackflow.controller;

import com.trackflow.entity.EquipmentType;
import com.trackflow.repository.EquipmentTypeRepository;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipment-types")
public class EquipmentTypeController {

    private final EquipmentTypeRepository equipmentTypeRepository;

    public EquipmentTypeController(EquipmentTypeRepository equipmentTypeRepository) {
        this.equipmentTypeRepository = equipmentTypeRepository;
    }

    @GetMapping
    public List<EquipmentType> all() {
        return equipmentTypeRepository.findAll();
    }

    @PostMapping
    public EquipmentType create(@Valid @RequestBody EquipmentType type) {
        type.setId(null);
        return equipmentTypeRepository.save(type);
    }
}
