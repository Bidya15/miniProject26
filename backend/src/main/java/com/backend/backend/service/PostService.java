package com.backend.backend.service;

import com.backend.backend.model.Post;
import com.backend.backend.model.User;
import com.backend.backend.repository.CareerRequestRepository;
import com.backend.backend.repository.MentorshipRequestRepository;
import com.backend.backend.repository.PostRepository;
import com.backend.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CareerRequestRepository careerRequestRepository;
    private final MentorshipRequestRepository mentorshipRequestRepository;

    public Post createPost(Post post) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        post.setUser(user);
        return postRepository.save(post);
    }

    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    public List<Post> getAllPostsByDepartment(String department) {
        if (department == null) return getAllPosts();
        return postRepository.findAll().stream()
                .filter(p -> p.getUser() != null && department.equals(p.getUser().getDepartment()))
                .toList();
    }

    @org.springframework.transaction.annotation.Transactional
    public void deletePost(Long id, String email) {
        Post post = postRepository.findById(id).orElseThrow();
        User requester = userRepository.findByEmail(email).orElseThrow();

        boolean isAuthor = post.getUser().getEmail().equals(email);
        boolean isSuper = requester.getRole() == User.Role.ROLE_SUPER_ADMIN;
        boolean isDeptAdmin = requester.getRole() == User.Role.ROLE_ADMIN && 
                              requester.getDepartment() != null && 
                              requester.getDepartment().equals(post.getUser().getDepartment());

        if (!isAuthor && !isSuper && !isDeptAdmin) {
            throw new RuntimeException("Not authorized to delete this post");
        }

        careerRequestRepository.deleteAll(careerRequestRepository.findByPostId(id));
        mentorshipRequestRepository.deleteAll(mentorshipRequestRepository.findByPostId(id));

        postRepository.deleteById(id);
    }

    public Post updatePost(Long id, Post postUpdates, String email) {
        Post post = postRepository.findById(id).orElseThrow();
        User requester = userRepository.findByEmail(email).orElseThrow();

        boolean isAuthor = post.getUser().getEmail().equals(email);
        boolean isSuper = requester.getRole() == User.Role.ROLE_SUPER_ADMIN;
        boolean isDeptAdmin = requester.getRole() == User.Role.ROLE_ADMIN && 
                              requester.getDepartment() != null && 
                              requester.getDepartment().equals(post.getUser().getDepartment());

        if (!isAuthor && !isSuper && !isDeptAdmin) {
            throw new RuntimeException("Not authorized to update this post");
        }

        post.setPostType(postUpdates.getPostType());
        post.setTitle(postUpdates.getTitle());
        post.setDescription(postUpdates.getDescription());
        post.setCompany(postUpdates.getCompany());
        post.setLocation(postUpdates.getLocation());
        post.setApplyUrl(postUpdates.getApplyUrl());
        post.setWebinarDate(postUpdates.getWebinarDate());
        post.setWebinarLink(postUpdates.getWebinarLink());

        return postRepository.save(post);
    }
}
