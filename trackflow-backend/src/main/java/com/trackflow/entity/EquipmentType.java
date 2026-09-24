package com.trackflow.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "equipment_types")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EquipmentType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EquipmentCategory category;
}
