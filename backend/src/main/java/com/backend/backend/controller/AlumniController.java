package com.backend.backend.controller;

import com.backend.backend.model.User;
import com.backend.backend.service.AlumniService;
import com.backend.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alumni")
@RequiredArgsConstructor
public class AlumniController {

    private final AlumniService alumniService;
    private final UserRepository userRepository;

    @GetMapping("/public")
    public ResponseEntity<List<User>> getPublicAlumni(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String company,
            @RequestParam(required = false) String techStack,
            @RequestParam(required = false) Integer batch) {
        return ResponseEntity.ok(alumniService.searchAlumni(city, company, techStack, batch, null));
    }

    @GetMapping
    public ResponseEntity<List<User>> getAlumni(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String company,
            @RequestParam(required = false) String techStack,
            @RequestParam(required = false) Integer batch,
            @RequestParam(required = false) String department,
            org.springframework.security.core.Authentication auth) {
        
        String filterDept = department;
        
        if (auth != null) {
            User currentUser = userRepository.findByEmail(auth.getName()).orElse(null);
            if (currentUser != null && (currentUser.getRole() == User.Role.ROLE_ADMIN || currentUser.getRole() == User.Role.ROLE_ALUMNI)) {
                filterDept = currentUser.getDepartment();
            }
        }
        
        return ResponseEntity.ok(alumniService.searchAlumni(city, company, techStack, batch, filterDept));
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateProfile(@PathVariable Long id, @RequestBody User user) {
        return ResponseEntity.ok(alumniService.updateProfile(id, user));
    }
}
