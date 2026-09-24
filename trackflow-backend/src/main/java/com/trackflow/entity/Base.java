package com.trackflow.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "bases")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Base {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String location;
}
