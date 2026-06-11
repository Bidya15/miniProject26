package com.backend.backend.controller;

import com.backend.backend.model.Message;
import com.backend.backend.model.User;
import com.backend.backend.repository.MessageRepository;
import com.backend.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    @GetMapping("/conversation/{userId}")
    public ResponseEntity<?> getConversation(@PathVariable Long userId, Principal principal) {
        String currentUserEmail = principal.getName();
        User currentUser = userRepository.findByEmail(currentUserEmail).orElse(null);
        if (currentUser == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        List<Message> messages = messageRepository.findConversation(currentUser.getId(), userId);

        // Mark as read
        messages.forEach(m -> {
            if (m.getReceiver().getId().equals(currentUser.getId()) && !m.isRead()) {
                m.setRead(true);
                messageRepository.save(m);
            }
        });

        return ResponseEntity.ok(messages);
    }

    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, Object> payload, Principal principal) {
        String currentUserEmail = principal.getName();
        User sender = userRepository.findByEmail(currentUserEmail).orElse(null);
        if (sender == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Long receiverId = Long.valueOf(payload.get("receiverId").toString());
        String text = payload.get("text").toString();

        Optional<User> receiverOpt = userRepository.findById(receiverId);
        if (receiverOpt.isEmpty())
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Receiver not found");

        Message msg = Message.builder()
                .sender(sender)
                .receiver(receiverOpt.get())
                .text(text)
                .isRead(false)
                .build();

        return ResponseEntity.ok(messageRepository.save(msg));
    }
}
