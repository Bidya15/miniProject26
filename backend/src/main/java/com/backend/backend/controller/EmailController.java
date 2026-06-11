package com.backend.backend.controller;

import com.backend.backend.model.User;
import com.backend.backend.repository.UserRepository;
import com.backend.backend.service.EmailService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/email")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EmailController {

    private final EmailService emailService;
    private final UserRepository userRepository;

    @Data
    public static class EmailRequest {
        private String subject;
        private String message;
        private String department; // Optional filter
    }

    @PostMapping("/campaign")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> sendCampaign(@RequestBody EmailRequest request) {
        List<User> recipients;
        if (request.getDepartment() != null && !request.getDepartment().isEmpty()) {
            recipients = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == User.Role.ROLE_ALUMNI
                            && u.getStatus() == User.Status.APPROVED
                            && request.getDepartment().equals(u.getDepartment()))
                    .collect(Collectors.toList());
        } else {
            recipients = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == User.Role.ROLE_ALUMNI && u.getStatus() == User.Status.APPROVED)
                    .collect(Collectors.toList());
        }

        if (recipients.isEmpty()) {
            return ResponseEntity.badRequest().body("No approved alumni found for this campaign.");
        }

        List<String> emails = recipients.stream().map(User::getEmail).collect(Collectors.toList());

        try {
            emailService.sendBulkEmail(emails, request.getSubject(), request.getMessage());
            return ResponseEntity.ok("Email campaign sent successfully to " + emails.size() + " alumni.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to send campaign: " + e.getMessage());
        }
    }
}
