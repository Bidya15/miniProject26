package com.backend.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Formula;
import java.time.LocalDateTime;

@Entity
@Table(name = "events")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(nullable = false)
    private String eventDate; // e.g. "16 Mar 2025" or ISO string, frontend can handle parsing

    @Column(nullable = false)
    private String location;

    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    @Builder.Default
    @Column(nullable = false)
    private String category = "UPCOMING"; // UPCOMING or REUNION

    private String department; // "CSE Dept", "Global", etc.

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
