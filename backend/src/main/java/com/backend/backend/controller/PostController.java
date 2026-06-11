package com.backend.backend.controller;

import com.backend.backend.model.Post;
import com.backend.backend.model.User;
import com.backend.backend.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;
    private final com.backend.backend.repository.UserRepository userRepository;

    @PostMapping
    public ResponseEntity<Post> createPost(@RequestBody Post post) {
        return ResponseEntity.ok(postService.createPost(post));
    }

    @GetMapping
    public ResponseEntity<List<Post>> getAllPosts(org.springframework.security.core.Authentication auth) {
        if (auth != null) {
            User currentUser = userRepository.findByEmail(auth.getName()).orElse(null);
            if (currentUser != null && currentUser.getRole() == User.Role.ROLE_ADMIN) {
                return ResponseEntity.ok(postService.getAllPostsByDepartment(currentUser.getDepartment()));
            }
        }
        return ResponseEntity.ok(postService.getAllPosts());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id, java.security.Principal principal) {
        postService.deletePost(id, principal.getName());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Post> updatePost(@PathVariable Long id, @RequestBody Post post,
            java.security.Principal principal) {
        return ResponseEntity.ok(postService.updatePost(id, post, principal.getName()));
    }
}
