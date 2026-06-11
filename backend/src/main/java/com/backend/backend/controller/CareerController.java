package com.backend.backend.controller;

import com.backend.backend.model.CareerRequest;
import com.backend.backend.model.Post;
import com.backend.backend.model.User;
import com.backend.backend.repository.CareerRequestRepository;
import com.backend.backend.repository.PostRepository;
import com.backend.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/career")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CareerController {

    private final CareerRequestRepository careerRequestRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    @PostMapping("/request")
    public ResponseEntity<?> createRequest(@RequestParam Long postId, @RequestParam Long userId,
            @RequestParam String type) {
        Optional<Post> postOpt = postRepository.findById(postId);
        Optional<User> userOpt = userRepository.findById(userId);

        if (postOpt.isEmpty() || userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Post or User not found");
        }

        if (careerRequestRepository.existsByApplicantAndPost(userOpt.get(), postOpt.get())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Request already exists");
        }

        CareerRequest.RequestType requestType = type.equals("REFERRAL_REQUEST")
                ? CareerRequest.RequestType.REFERRAL_REQUEST
                : CareerRequest.RequestType.APPLICATION;

        CareerRequest request = CareerRequest.builder()
                .applicant(userOpt.get())
                .post(postOpt.get())
                .requestType(requestType)
                .status(CareerRequest.Status.PENDING)
                .build();

        careerRequestRepository.save(request);

        // Note: Real-time notification bridge to Node.js socket server would be
        // triggered here
        // similar to MentorshipRequest logic.

        return ResponseEntity.status(HttpStatus.CREATED).body(request);
    }

    @GetMapping("/incoming-requests")
    public ResponseEntity<List<CareerRequest>> getIncomingRequests(@RequestParam Long userId) {
        return ResponseEntity.ok(careerRequestRepository.findByPostUserId(userId));
    }

    @GetMapping("/my-requests")
    public ResponseEntity<List<CareerRequest>> getMyRequests(@RequestParam Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty())
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(careerRequestRepository.findByApplicant(userOpt.get()));
    }

    @GetMapping("/post-requests/{postId}")
    public ResponseEntity<List<CareerRequest>> getPostRequests(@PathVariable Long postId) {
        Optional<Post> postOpt = postRepository.findById(postId);
        if (postOpt.isEmpty())
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(careerRequestRepository.findByPost(postOpt.get()));
    }

    @PatchMapping("/request/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam String status) {
        Optional<CareerRequest> requestOpt = careerRequestRepository.findById(id);
        if (requestOpt.isEmpty())
            return ResponseEntity.notFound().build();

        CareerRequest request = requestOpt.get();
        request.setStatus(CareerRequest.Status.valueOf(status));
        careerRequestRepository.save(request);

        return ResponseEntity.ok(request);
    }
}
