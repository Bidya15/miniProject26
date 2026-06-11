package com.backend.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "home_config")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HomeConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String badge;
    private String titleMain;
    private String titleGradient;

    @Column(columnDefinition = "TEXT")
    private String subtext;

    @ElementCollection
    @CollectionTable(name = "home_bg_images", joinColumns = @JoinColumn(name = "home_config_id"))
    @Column(name = "image_url", columnDefinition = "TEXT")
    private List<String> bgImages;
}
