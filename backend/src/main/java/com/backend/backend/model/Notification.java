package com.backend.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String message;

    @Enumerated(EnumType.STRING)
    private Type type;

    @Enumerated(EnumType.STRING)
    private User.Role targetRole;

    private Long targetUserId;

    private Long relatedEntityId;
    private String department;

    @Builder.Default
    private boolean read = false;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum Type {
        REGISTRATION_APPROVAL,
        CONNECTION_REQUEST,
        CONNECTION_ACCEPTED,
        CONNECTION_REJECTED
    }
}
