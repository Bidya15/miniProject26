package com.backend.backend.controller;

import com.backend.backend.model.User;
import com.backend.backend.repository.UserRepository;
import com.backend.backend.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/admin/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private PostRepository postRepository;

        @GetMapping("/stats")
        public ResponseEntity<Map<String, Object>> getDashboardStats(org.springframework.security.core.Authentication auth) {
                Map<String, Object> stats = new HashMap<>();
                String email = auth.getName();
                User currentUser = userRepository.findByEmail(email).orElseThrow();
                String dept = currentUser.getDepartment();
                boolean isSuper = currentUser.getRole() == User.Role.ROLE_SUPER_ADMIN;

                List<User> allUsers;
                if (isSuper || dept == null || dept.isEmpty()) {
                        allUsers = userRepository.findAll();
                } else {
                        allUsers = userRepository.findByRoleAndDepartment(User.Role.ROLE_ALUMNI, dept);
                        // Also include the admin themselves if needed, but stats usually focus on alumni
                }

                // 1. User Status Counts
                stats.put("totalUsers", allUsers.size());
                stats.put("verifiedAlumni",
                                allUsers.stream().filter(u -> u.getRole() == User.Role.ROLE_ALUMNI
                                                && u.getStatus() == User.Status.APPROVED).count());
                stats.put("pendingAlumni",
                                allUsers.stream().filter(u -> u.getRole() == User.Role.ROLE_ALUMNI
                                                && u.getStatus() == User.Status.PENDING).count());

                LocalDateTime activeCutoff = LocalDateTime.now().minusDays(30);
                stats.put("monthlyActiveUsers",
                                allUsers.stream()
                                                .filter(u -> u.getStatus() == User.Status.APPROVED)
                                                .filter(u -> u.getLastLoginAt() != null
                                                                && u.getLastLoginAt().isAfter(activeCutoff))
                                                .count());
                
                if (isSuper) {
                    stats.put("totalAdmins",
                                    userRepository.findAll().stream().filter(u -> u.getRole() == User.Role.ROLE_ADMIN
                                                    || u.getRole() == User.Role.ROLE_SUPER_ADMIN).count());
                }

                // 2. Role Distribution
                Map<User.Role, Long> roles = allUsers.stream()
                                .collect(Collectors.groupingBy(User::getRole, Collectors.counting()));
                stats.put("roleDistribution", roles);

                // 3. Batch Distribution
                Map<Integer, Long> batches = allUsers.stream()
                                .filter(u -> u.getRole() == User.Role.ROLE_ALUMNI && u.getBatch() != null)
                                .collect(Collectors.groupingBy(User::getBatch, Collectors.counting()));
                stats.put("batchDistribution", batches);

                // 4. Location Distribution
                Map<String, Long> locations = allUsers.stream()
                                .filter(u -> u.getRole() == User.Role.ROLE_ALUMNI && u.getLocation() != null
                                                && !u.getLocation().isEmpty())
                                .collect(Collectors.groupingBy(User::getLocation, Collectors.counting()));
                List<Map<String, Object>> topLocationsList = locations.entrySet().stream()
                                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                                .limit(5)
                                .map(entry -> {
                                        Map<String, Object> m = new HashMap<>();
                                        m.put("name", entry.getKey());
                                        m.put("count", entry.getValue());
                                        return m;
                                })
                                .collect(Collectors.toList());
                stats.put("topLocations", topLocationsList);

                // 5. Total Post Count
                if (isSuper || dept == null) {
                    stats.put("totalPosts", postRepository.count());
                } else {
                    // Filter posts by user department
                    stats.put("totalPosts", postRepository.findAll().stream()
                        .filter(p -> p.getUser() != null && dept.equals(p.getUser().getDepartment()))
                        .count());
                }

                // 6. Recent Activity
                List<User> recentUsers = allUsers.stream()
                                .sorted(Comparator.comparing(User::getCreatedAt,
                                                Comparator.nullsLast(Comparator.reverseOrder())))
                                .limit(5)
                                .collect(Collectors.toList());
                stats.put("recentUsers", recentUsers);
                stats.put("recentRegistrations", recentUsers);
                stats.put("recentRegistrationsCount", recentUsers.size());

                return ResponseEntity.ok(stats);
        }
}
