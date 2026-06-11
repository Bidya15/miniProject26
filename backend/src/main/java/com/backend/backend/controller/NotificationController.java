package com.backend.backend.controller;

import com.backend.backend.model.Notification;
import com.backend.backend.model.User;
import com.backend.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final com.backend.backend.repository.UserRepository userRepository;

    @GetMapping("/my-notifications")
    public ResponseEntity<List<Notification>> getMyNotifications(Authentication auth) {
        String email = auth.getName();
        User currentUser = userRepository.findByEmail(email).orElseThrow();
        return ResponseEntity.ok(notificationService.getNotificationsForUser(currentUser));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }
}
