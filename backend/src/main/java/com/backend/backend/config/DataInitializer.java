package com.backend.backend.config;

import com.backend.backend.model.User;
import com.backend.backend.repository.UserRepository;
import com.backend.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final AuthService authService;

        @Override
        public void run(String... args) throws Exception {
                // Normalize legacy user departments
                userRepository.findAll().forEach(user -> {
                        if (user.getDepartment() != null && !user.getDepartment().trim().isEmpty()) {
                                String normalized = authService.normalizeDept(user.getDepartment());
                                if (!normalized.equals(user.getDepartment())) {
                                        user.setDepartment(normalized);
                                        userRepository.save(user);
                                }
                        }
                });

                User superAdmin = userRepository.findByEmail("superadmin@college.edu").orElse(null);
                if (superAdmin != null) {
                        boolean changed = false;
                        if (superAdmin.getRole() != User.Role.ROLE_SUPER_ADMIN) {
                                superAdmin.setRole(User.Role.ROLE_SUPER_ADMIN);
                                changed = true;
                        }
                        if (superAdmin.getStatus() != User.Status.APPROVED) {
                                superAdmin.setStatus(User.Status.APPROVED);
                                changed = true;
                        }
                        if (superAdmin.getPassword() == null || superAdmin.getPassword().isBlank()) {
                                superAdmin.setPassword(passwordEncoder.encode("SuperAdmin@123"));
                                changed = true;
                        }
                        if (changed) {
                                userRepository.save(superAdmin);
                        }
                } else {
                        User seededSuperAdmin = User.builder()
                                        .name("Super Admin")
                                        .email("superadmin@college.edu")
                                        .password(passwordEncoder.encode("SuperAdmin@123"))
                                        .role(User.Role.ROLE_SUPER_ADMIN)
                                        .status(User.Status.APPROVED)
                                        .build();
                        userRepository.save(seededSuperAdmin);
                }

                System.out.println("=== INITIALIZED USERS IN DATABASE ===");
                userRepository.findAll().forEach(u -> {
                        System.out.println("USER: " + u.getName() + " | Email: " + u.getEmail() + " | Role: " + u.getRole() + " | Dept: " + u.getDepartment() + " | Status: " + u.getStatus());
                });
                System.out.println("=====================================");
        }
}
