package com.backend.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "news_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NewsItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String excerpt;

    private String tag;

    @Column(columnDefinition = "TEXT")
    private String image;

    // Stored as a plain string to avoid LocalDate parsing issues from frontend
    private String date;
}
