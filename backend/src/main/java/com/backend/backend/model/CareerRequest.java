package com.backend.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "career_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CareerRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "applicant_id", nullable = false)
    private User applicant;

    @ManyToOne
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestType requestType; // APPLICATION, REFERRAL_REQUEST

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status; // PENDING, REFERRED, APPLIED, REJECTED, WITHDRAWN

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null)
            status = Status.PENDING;
    }

    public enum RequestType {
        APPLICATION, REFERRAL_REQUEST
    }

    public enum Status {
        PENDING, REFERRED, APPLIED, REJECTED, WITHDRAWN
    }
}
