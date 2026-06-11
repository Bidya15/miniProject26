package com.backend.backend.service;

import com.backend.backend.model.User;
import com.backend.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SuperAdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private String normalizeDepartment(String department) {
        if (department == null) return null;
        String normalized = department.trim().toLowerCase().replaceAll("\\s+", " ");
        normalized = normalized.replace(".", "");
        normalized = normalized.replace("&", "and");
        normalized = normalized.replaceAll("\\b(department|dept|branch)\\b$", "").trim();
        normalized = normalized.replaceAll("\\s+", " ").trim();

        return switch (normalized) {
            case "computer science and engineering", "cse", "cse dept", "cse department" -> "computer science and engineering";
            case "information technology", "it", "it dept", "it department" -> "information technology";
            case "electronics and communication engineering", "ece", "ece dept", "ece department" -> "electronics and communication engineering";
            case "electronics and telecommunication engineering", "ete", "ete dept", "ete department" -> "electronics and telecommunication engineering";
            case "electrical engineering", "eee", "eee dept", "eee department" -> "electrical engineering";
            case "mechanical engineering", "mechanical", "mech dept", "mech department" -> "mechanical engineering";
            case "civil engineering", "civil", "civil dept", "civil department" -> "civil engineering";
            case "chemical engineering", "chemical", "chemical dept", "chemical department" -> "chemical engineering";
            case "instrumentation engineering", "instrumentation", "instrumentation dept", "instrumentation department" -> "instrumentation engineering";
            case "industrial and production engineering", "industrial & production engineering", "ipe", "ipe dept", "ipe department" -> "industrial and production engineering";
            default -> normalized;
        };
    }

    public User createAdmin(User admin) {
        // Deprecated: We now promote existing alumni instead of manual creation
        admin.setRole(User.Role.ROLE_ADMIN);
        admin.setPassword(passwordEncoder.encode(admin.getPassword()));
        admin.setStatus(User.Status.APPROVED);
        admin.setDepartment(normalizeDepartment(admin.getDepartment()));
        return userRepository.save(admin);
    }

    public User assignAdminRole(Long userId, String department) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setRole(User.Role.ROLE_ADMIN);
        user.setDepartment(normalizeDepartment(department));
        user.setStatus(User.Status.APPROVED); // Ensure they are approved if they are admins
        return userRepository.save(user);
    }

    public void revokeAdminRole(Long id) {
        User user = userRepository.findById(id).orElseThrow();
        if (user.getRole() == User.Role.ROLE_ADMIN || user.getRole() == User.Role.ROLE_SUPER_ADMIN) {
            if (user.getRole() == User.Role.ROLE_SUPER_ADMIN) {
                long superAdminCount = userRepository.findAll().stream()
                        .filter(u -> u.getRole() == User.Role.ROLE_SUPER_ADMIN)
                        .count();
                if (superAdminCount <= 1) {
                    throw new RuntimeException("Cannot revoke the only Super Admin. Please assign another Super Admin first.");
                }
            }
            user.setRole(User.Role.ROLE_ALUMNI);
            user.setDepartment(null);
            userRepository.save(user);
        } else {
            throw new RuntimeException("Cannot revoke role from non-admin user");
        }
    }

    public void promoteToSuperAdmin(Long id) {
        User user = userRepository.findById(id).orElseThrow();
        if (user.getRole() == User.Role.ROLE_ADMIN) {
            user.setRole(User.Role.ROLE_SUPER_ADMIN);
            user.setDepartment(null);
            userRepository.save(user);
        } else {
            throw new RuntimeException("Only Admins can be promoted to Super Admin");
        }
    }

    public User updateUserDepartment(Long id, String newDepartment) {
        User user = userRepository.findById(id).orElseThrow();
        user.setDepartment(normalizeDepartment(newDepartment));
        return userRepository.save(user);
    }

    public List<User> getAllAdmins() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.ROLE_ADMIN || u.getRole() == User.Role.ROLE_SUPER_ADMIN)
                .toList();
    }
}
