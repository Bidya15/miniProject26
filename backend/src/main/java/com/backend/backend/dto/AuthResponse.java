package com.backend.backend.dto;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private Long id;
    private String token;
    private String name;
    private String email;
    private String role;
    private String status;
    private String department;

    // Professional & Profile Info
    private Integer batch;
    private String degree;
    private String company;
    private String designation;
    private String location;
    private String techStack;
    private String linkedinUrl;
    private String bio;
    private String profileImage;
}
