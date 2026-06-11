package com.backend.backend.dto;

import com.backend.backend.model.User;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private User.Role role;
    private Integer batch;
    private String degree;
    private String company;
    private String designation;
    private String location;
    private String techStack;
    private String linkedinUrl;
    private String department;
}
