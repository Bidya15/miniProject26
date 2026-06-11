package com.backend.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "giving_initiatives")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GivingInitiative {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String tag;
    private String img;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Double raised;
    private Double goal;
    private Integer donors;
}
