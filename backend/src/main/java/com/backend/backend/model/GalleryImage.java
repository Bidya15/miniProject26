package com.backend.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "gallery_images")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GalleryImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String url;

    private String title;
    private String category;
    private String albumName;
    private Boolean isVideo;
}
