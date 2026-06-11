package com.backend.backend.controller;

import com.backend.backend.model.MentorshipRequest;
import com.backend.backend.model.Post;
import com.backend.backend.model.User;
import com.backend.backend.repository.MentorshipRequestRepository;
import com.backend.backend.repository.PostRepository;
import com.backend.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mentorship")
@RequiredArgsConstructor
@Transactional
public class MentorshipController {

    private final MentorshipRequestRepository mentorshipRepo;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    private static final String NODE_SERVER_URL = "http://localhost:5000/api/internal/mentorship-update";

    @PostMapping("/request")
    public ResponseEntity<?> sendRequest(@RequestBody Map<String, Object> payload, Principal principal) {
        String menteeEmail = principal.getName();
        User mentee = userRepository.findByEmail(menteeEmail).orElse(null);
        if (mentee == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Long mentorId = Long.valueOf(payload.get("mentorId").toString());
        Long postId = Long.valueOf(payload.get("postId").toString());
        String message = payload.get("message") != null ? payload.get("message").toString() : "";

        User mentor = userRepository.findById(mentorId).orElse(null);
        Post post = postRepository.findById(postId).orElse(null);

        if (mentor == null || post == null)
            return ResponseEntity.badRequest().body("Mentor or Post not found");

        if (mentorshipRepo.existsByMenteeIdAndPostId(mentee.getId(), postId)) {
            return ResponseEntity.badRequest().body("Request already exists for this post");
        }

        MentorshipRequest req = MentorshipRequest.builder()
                .mentee(mentee)
                .mentor(mentor)
                .post(post)
                .message(message)
                .status(MentorshipRequest.MentorshipStatus.PENDING)
                .build();

        MentorshipRequest saved = mentorshipRepo.save(req);

        // Notify via Node.js Socket
        notifyNodeServer("NEW_REQUEST", saved, mentor.getId());

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/requests")
    public ResponseEntity<List<MentorshipRequest>> getIncomingRequests(Principal principal) {
        User user = getCurrentUser(principal);
        if (user == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(mentorshipRepo.findByMentorId(user.getId()));
    }

    @GetMapping("/sent")
    public ResponseEntity<List<MentorshipRequest>> getSentRequests(Principal principal) {
        User user = getCurrentUser(principal);
        if (user == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(mentorshipRepo.findByMenteeId(user.getId()));
    }

    @PutMapping("/respond/{id}")
    public ResponseEntity<?> respondRequest(@PathVariable Long id, @RequestBody Map<String, String> payload,
            Principal principal) {
        User user = getCurrentUser(principal);
        if (user == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        MentorshipRequest req = mentorshipRepo.findById(id).orElse(null);
        if (req == null)
            return ResponseEntity.notFound().build();

        if (!req.getMentor().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only the mentor can respond");
        }

        String status = payload.get("status");
        if ("ACCEPTED".equals(status)) {
            req.setStatus(MentorshipRequest.MentorshipStatus.ACCEPTED);
        } else if ("REJECTED".equals(status)) {
            req.setStatus(MentorshipRequest.MentorshipStatus.REJECTED);
        } else {
            return ResponseEntity.badRequest().body("Invalid status");
        }

        MentorshipRequest updated = mentorshipRepo.save(req);

        // Notify via Node.js Socket
        notifyNodeServer("STATUS_CHANGE", updated, updated.getMentee().getId());

        return ResponseEntity.ok(updated);
    }

    private User getCurrentUser(Principal principal) {
        return userRepository.findByEmail(principal.getName()).orElse(null);
    }

    private void notifyNodeServer(String type, MentorshipRequest req, Long targetId) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("type", type);
            body.put("request", req);
            body.put("targetId", targetId);
            restTemplate.postForEntity(NODE_SERVER_URL, body, String.class);
        } catch (Exception e) {
            System.err.println("Failed to notify Node server: " + e.getMessage());
        }
    }
}
