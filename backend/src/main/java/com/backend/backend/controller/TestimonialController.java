package com.backend.backend.controller;

import com.backend.backend.model.Testimonial;
import com.backend.backend.repository.TestimonialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/testimonials")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TestimonialController {

    private final TestimonialRepository testimonialRepository;

    @GetMapping
    public ResponseEntity<List<Testimonial>> getAllTestimonials() {
        return ResponseEntity.ok(testimonialRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Testimonial> createTestimonial(@RequestBody Testimonial testimonial) {
        return ResponseEntity.ok(testimonialRepository.save(testimonial));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTestimonial(@PathVariable Long id) {
        if (!testimonialRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        testimonialRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Testimonial> updateTestimonial(@PathVariable Long id,
            @RequestBody Testimonial testimonialDetails) {
        return testimonialRepository.findById(id)
                .map(existing -> {
                    existing.setAuthorName(testimonialDetails.getAuthorName());
                    existing.setBatchYear(testimonialDetails.getBatchYear());
                    existing.setContent(testimonialDetails.getContent());
                    existing.setAvatarUrl(testimonialDetails.getAvatarUrl());
                    existing.setUserId(testimonialDetails.getUserId());
                    return ResponseEntity.ok(testimonialRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
