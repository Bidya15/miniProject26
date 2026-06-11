package com.backend.backend.service;

import com.backend.backend.model.User;
import com.backend.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlumniService {

        private final UserRepository userRepository;

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

        public List<User> searchAlumni(String city, String company, String techStack, Integer batch, String department) {
                String normalizedDept = normalizeDepartment(department);
                return userRepository.findAll().stream()
                                .filter(u -> u.getRole() == User.Role.ROLE_ALUMNI
                                                && u.getStatus() == User.Status.APPROVED)
                                .filter(u -> normalizedDept == null
                                                || (u.getDepartment() != null
                                                                && normalizeDepartment(u.getDepartment())
                                                                                .equals(normalizedDept)))
                                .filter(u -> city == null
                                                || (u.getLocation() != null && u.getLocation().toLowerCase()
                                                                .contains(city.toLowerCase())))
                                .filter(u -> company == null
                                                || (u.getCompany() != null && u.getCompany().toLowerCase()
                                                                .contains(company.toLowerCase())))
                                .filter(u -> techStack == null || (u.getTechStack() != null
                                                && u.getTechStack().toLowerCase().contains(techStack.toLowerCase())))
                                .filter(u -> batch == null || (u.getBatch() != null && u.getBatch().equals(batch)))
                                .collect(Collectors.toList());
        }

        public User updateProfile(Long id, User update) {
                User user = userRepository.findById(id).orElseThrow();
                user.setCompany(update.getCompany());
                user.setDesignation(update.getDesignation());
                user.setLocation(update.getLocation());
                user.setTechStack(update.getTechStack());
                user.setLinkedinUrl(update.getLinkedinUrl());
                user.setBio(update.getBio());
                user.setDepartment(normalizeDepartment(update.getDepartment()));
                user.setProfileImage(update.getProfileImage());
                return userRepository.save(user);
        }
}
