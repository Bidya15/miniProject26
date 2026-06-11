package com.backend.backend.service;

import com.backend.backend.dto.RegisterRequest;
import com.backend.backend.model.User;
import com.backend.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final PasswordEncoder passwordEncoder;
    private final com.backend.backend.repository.ConnectionRequestRepository connectionRequestRepository;
    private final com.backend.backend.repository.MessageRepository messageRepository;
    private final com.backend.backend.repository.MentorshipRequestRepository mentorshipRequestRepository;
    private final com.backend.backend.repository.EventRegistrationRepository eventRegistrationRepository;
    private final com.backend.backend.repository.PostRepository postRepository;
    private final com.backend.backend.repository.CareerRequestRepository careerRequestRepository;
    private final com.backend.backend.repository.NotificationRepository notificationRepository;
    private final com.backend.backend.repository.TestimonialRepository testimonialRepository;
    private final com.backend.backend.repository.UserOtpRepository userOtpRepository;

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

    private boolean sameDepartment(String left, String right) {
        String a = normalizeDepartment(left);
        String b = normalizeDepartment(right);
        if (a == null || b == null) return false;
        return a.equals(b);
    }

    public List<User> getPendingAlumni(String requesterRole, String department) {
        if ("ROLE_SUPER_ADMIN".equals(requesterRole)) {
            return userRepository.findByStatus(User.Status.PENDING);
        }
        // Department Admins only see pending Alumni from their own department
        if (department != null && !department.isEmpty()) {
            String normalizedDept = normalizeDepartment(department);
            return userRepository.findByStatus(User.Status.PENDING).stream()
                    .filter(u -> u.getRole() == User.Role.ROLE_ALUMNI)
                    .filter(u -> sameDepartment(u.getDepartment(), normalizedDept))
                    .toList();
        }
        return userRepository.findByStatusAndRole(User.Status.PENDING, User.Role.ROLE_ALUMNI);
    }

    public User approveAlumni(Long id, String requesterRole, String adminDept) {
        User user = userRepository.findById(id).orElseThrow();

        // 1. Security check: ROLE_ADMIN cannot approve other roles
        if ("ROLE_ADMIN".equals(requesterRole) && user.getRole() != User.Role.ROLE_ALUMNI) {
            throw new RuntimeException("Admins can only approve alumni accounts.");
        }

        // 2. Department check: ROLE_ADMIN can only approve their own department
        if ("ROLE_ADMIN".equals(requesterRole) && adminDept != null && !sameDepartment(adminDept, user.getDepartment())) {
            throw new RuntimeException("You are not authorized to approve alumni from other departments.");
        }

        user.setStatus(User.Status.APPROVED);
        User saved = userRepository.save(user);

        // Mark notification as read
        notificationService.markAsReadByRelatedEntity(id,
                com.backend.backend.model.Notification.Type.REGISTRATION_APPROVAL);

        return saved;
    }

    public User rejectAlumni(Long id, String requesterRole, String adminDept) {
        User user = userRepository.findById(id).orElseThrow();

        // 1. Security check: Only ROLE_ALUMNI can be rejected by standard admins
        if ("ROLE_ADMIN".equals(requesterRole) && user.getRole() != User.Role.ROLE_ALUMNI) {
            throw new RuntimeException("Admins can only manage alumni accounts.");
        }

        // 2. Department check
        if ("ROLE_ADMIN".equals(requesterRole) && adminDept != null && !sameDepartment(adminDept, user.getDepartment())) {
            throw new RuntimeException("Authorization error: Department mismatch.");
        }

        user.setStatus(User.Status.REJECTED);
        User saved = userRepository.save(user);

        // Mark notification as read
        notificationService.markAsReadByRelatedEntity(id,
                com.backend.backend.model.Notification.Type.REGISTRATION_APPROVAL);

        return saved;
    }

    public byte[] exportAlumniToExcel(String department) throws IOException {
        List<User> alumni;
        if (department != null && !department.isEmpty()) {
            String normalizedDept = normalizeDepartment(department);
            alumni = userRepository.findByRole(User.Role.ROLE_ALUMNI).stream()
                    .filter(u -> sameDepartment(u.getDepartment(), normalizedDept))
                    .toList();
        } else {
            alumni = userRepository.findByRole(User.Role.ROLE_ALUMNI);
        }

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Alumni");

            // Header
            Row headerRow = sheet.createRow(0);
            String[] columns = { "Name", "Batch", "Degree", "Company", "Designation", "Location", "Tech Stack", "Email",
                    "LinkedIn" };
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
            }

            // Data
            int rowIdx = 1;
            for (User user : alumni) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(user.getName());
                row.createCell(1).setCellValue(user.getBatch() != null ? user.getBatch().toString() : "");
                row.createCell(2).setCellValue(user.getDegree());
                row.createCell(3).setCellValue(user.getCompany());
                row.createCell(4).setCellValue(user.getDesignation());
                row.createCell(5).setCellValue(user.getLocation());
                row.createCell(6).setCellValue(user.getTechStack());
                row.createCell(7).setCellValue(user.getEmail());
                row.createCell(8).setCellValue(user.getLinkedinUrl());
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Admin not found"));
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteUser(Long id, String requesterRole, String adminDept) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found."));

        // 1. Role Check
        if ("ROLE_ADMIN".equals(requesterRole) && user.getRole() != User.Role.ROLE_ALUMNI) {
            throw new RuntimeException("Admins can only delete alumni accounts.");
        }

        // 2. Department Check
        if ("ROLE_ADMIN".equals(requesterRole) && adminDept != null && !sameDepartment(adminDept, user.getDepartment())) {
            throw new RuntimeException("You do not have permission to delete users from this department.");
        }

        // 3. Clean up associated data to avoid foreign key violations using simple, standard JPA methods

        // Delete connection requests (both sent and received)
        connectionRequestRepository.deleteAll(connectionRequestRepository.findBySenderId(id));
        connectionRequestRepository.deleteAll(connectionRequestRepository.findByReceiverId(id));

        // Delete messages (both sent and received)
        messageRepository.deleteAll(messageRepository.findBySenderId(id));
        messageRepository.deleteAll(messageRepository.findByReceiverId(id));

        // Delete mentorship requests
        mentorshipRequestRepository.deleteAll(mentorshipRequestRepository.findByMentorId(id));
        mentorshipRequestRepository.deleteAll(mentorshipRequestRepository.findByMenteeId(id));
        mentorshipRequestRepository.deleteAll(mentorshipRequestRepository.findByPostUserId(id));

        // Delete career requests
        careerRequestRepository.deleteAll(careerRequestRepository.findByApplicantId(id));
        careerRequestRepository.deleteAll(careerRequestRepository.findByPostUserId(id));

        // Delete event registrations
        eventRegistrationRepository.deleteAll(eventRegistrationRepository.findByUser(user));

        // Delete posts created by user
        postRepository.deleteAll(postRepository.findByUserId(id));

        // Delete notifications targeting the user
        notificationRepository.deleteAll(notificationRepository.findByTargetUserId(id));

        // Delete testimonials written by the user
        testimonialRepository.deleteAll(testimonialRepository.findByUserId(id));

        // Delete user OTP
        userOtpRepository.deleteByEmail(user.getEmail());

        // 4. Finally delete the user
        userRepository.delete(user);
    }

    public List<User> bulkAddAlumni(List<RegisterRequest> requests) {
        List<User> usersToSave = new ArrayList<>();

        for (RegisterRequest req : requests) {
            Optional<User> existingUser = userRepository.findByEmail(req.getEmail());
            User user;

            if (existingUser.isPresent()) {
                user = existingUser.get();
                // Update existing user details
                if (req.getName() != null) user.setName(req.getName());
                if (req.getBatch() != null) user.setBatch(req.getBatch());
                if (req.getDegree() != null) user.setDegree(req.getDegree());
                if (req.getCompany() != null) user.setCompany(req.getCompany());
                if (req.getDesignation() != null) user.setDesignation(req.getDesignation());
                if (req.getLocation() != null) user.setLocation(req.getLocation());
                if (req.getTechStack() != null) user.setTechStack(req.getTechStack());
                if (req.getLinkedinUrl() != null) user.setLinkedinUrl(req.getLinkedinUrl());
                if (req.getDepartment() != null) user.setDepartment(normalizeDepartment(req.getDepartment()));
                // We keep the existing status and password for safety
            } else {
                // Create new user
                user = User.builder()
                        .name(req.getName())
                        .email(req.getEmail())
                        .password(passwordEncoder.encode(req.getPassword() != null ? req.getPassword() : "Alumni@123"))
                        .role(User.Role.ROLE_ALUMNI)
                        .batch(req.getBatch())
                        .degree(req.getDegree())
                        .company(req.getCompany())
                        .designation(req.getDesignation())
                        .location(req.getLocation())
                        .techStack(req.getTechStack())
                        .linkedinUrl(req.getLinkedinUrl())
                        .department(normalizeDepartment(req.getDepartment()))
                        .status(User.Status.APPROVED)
                        .build();
            }
            usersToSave.add(user);
        }

        return userRepository.saveAll(usersToSave);
    }
}
