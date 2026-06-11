package com.backend.backend.dto;

import lombok.Data;

@Data
public class EventRegistrationRequest {
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String comments;
}
