package com.backend.backend.controller;

import com.backend.backend.model.ConnectionRequest;
import com.backend.backend.model.Notification;
import com.backend.backend.model.User;
import com.backend.backend.repository.ConnectionRequestRepository;
import com.backend.backend.repository.UserRepository;
import com.backend.backend.service.AuthService;
import com.backend.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/connections")
@RequiredArgsConstructor
@Transactional
public class ConnectionController {

    private final ConnectionRequestRepository reqRepo;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuthService authService;

    @PostMapping("/send")
    public ResponseEntity<?> sendRequest(@RequestBody Map<String, Object> payload, Principal principal) {
        String currentUserEmail = principal.getName();
        User sender = userRepository.findByEmail(currentUserEmail).orElse(null);
        if (sender == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Long receiverId = Long.valueOf(payload.get("receiverId").toString());
        String message = payload.get("message") != null ? payload.get("message").toString() : "";

        User receiver = userRepository.findById(receiverId).orElse(null);
        if (receiver == null)
            return ResponseEntity.badRequest().body(Map.of("message", "Receiver not found"));

        if (reqRepo.existsBySenderIdAndReceiverId(sender.getId(), receiverId)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Request already exists"));
        }

        ConnectionRequest req = ConnectionRequest.builder()
                .sender(sender)
                .receiver(receiver)
                .message(message)
                .status(ConnectionRequest.ConnectionStatus.PENDING)
                .build();

        ConnectionRequest saved = reqRepo.save(req);

        notificationService.createUserNotification(
                "Connection request sent to " + receiver.getName() + ". Waiting for response.",
                Notification.Type.CONNECTION_REQUEST,
                sender.getId(),
                saved.getId(),
                sender.getDepartment());

        notificationService.createUserNotification(
                sender.getName() + " sent you a connection request.",
                Notification.Type.CONNECTION_REQUEST,
                receiver.getId(),
                saved.getId(),
                receiver.getDepartment());

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/my-requests")
    public ResponseEntity<?> getMyRequests(Principal principal) {
        String currentUserEmail = principal.getName();
        User user = userRepository.findByEmail(currentUserEmail).orElse(null);
        if (user == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        // Get requests sent to the user
        List<ConnectionRequest> requests = reqRepo.findByReceiverId(user.getId());
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/sent")
    public ResponseEntity<?> getSentRequests(Principal principal) {
        String currentUserEmail = principal.getName();
        User user = userRepository.findByEmail(currentUserEmail).orElse(null);
        if (user == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        List<ConnectionRequest> sent = reqRepo.findBySenderId(user.getId());
        return ResponseEntity.ok(sent);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> respondRequest(@PathVariable Long id, @RequestBody Map<String, String> payload,
            Principal principal) {
        String currentUserEmail = principal.getName();
        User receiver = userRepository.findByEmail(currentUserEmail).orElse(null);
        if (receiver == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        ConnectionRequest req = reqRepo.findById(id).orElse(null);
        if (req == null)
            return ResponseEntity.notFound().build();

        // Compare receiver_id column directly — avoids lazy-load proxy issues
        Long receiverId = req.getReceiver().getId();
        if (!receiverId.equals(receiver.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only the receiver can respond to this request.");
        }

        String status = payload.get("status");
        if ("ACCEPTED".equals(status)) {
            req.setStatus(ConnectionRequest.ConnectionStatus.ACCEPTED);
        } else if ("REJECTED".equals(status)) {
            req.setStatus(ConnectionRequest.ConnectionStatus.REJECTED);
        } else {
            return ResponseEntity.badRequest().body("Invalid status value.");
        }

        ConnectionRequest saved = reqRepo.save(req);

        if ("ACCEPTED".equals(status)) {
            notificationService.createUserNotification(
                    receiver.getName() + " accepted your connection request.",
                    Notification.Type.CONNECTION_ACCEPTED,
                    req.getSender().getId(),
                    saved.getId(),
                    req.getSender().getDepartment());

            notificationService.createUserNotification(
                    "You accepted the connection request from " + req.getSender().getName() + ".",
                    Notification.Type.CONNECTION_ACCEPTED,
                    receiver.getId(),
                    saved.getId(),
                    receiver.getDepartment());
        } else if ("REJECTED".equals(status)) {
            notificationService.createUserNotification(
                    receiver.getName() + " declined your connection request.",
                    Notification.Type.CONNECTION_REJECTED,
                    req.getSender().getId(),
                    saved.getId(),
                    req.getSender().getDepartment());

            notificationService.createUserNotification(
                    "You declined the connection request from " + req.getSender().getName() + ".",
                    Notification.Type.CONNECTION_REJECTED,
                    receiver.getId(),
                    saved.getId(),
                    receiver.getDepartment());
        }

        return ResponseEntity.ok(saved);
    }
}
