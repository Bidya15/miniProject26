package com.backend.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "footer_config")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FooterConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;
    private String phone;
    @Column(columnDefinition = "TEXT")
    private String address;
    private String officeHours;
    @Column(columnDefinition = "TEXT")
    private String mapUrl;

    private String appName;
    @Column(columnDefinition = "TEXT")
    private String appLogo;
}
