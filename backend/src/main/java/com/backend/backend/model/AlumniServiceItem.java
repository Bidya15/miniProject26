package com.backend.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "alumni_service_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlumniServiceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Double cost;
    private String processingTime;
}
