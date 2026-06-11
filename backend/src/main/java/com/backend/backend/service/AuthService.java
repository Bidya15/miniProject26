package com.backend.backend.service;

import com.backend.backend.dto.AuthResponse;
import com.backend.backend.dto.LoginRequest;
import com.backend.backend.dto.RegisterRequest;
import com.backend.backend.model.User;
import com.backend.backend.repository.UserRepository;
import com.backend.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Collections;
import java.util.List;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;
        private final AuthenticationManager authenticationManager;
        private final NotificationService notificationService;
        private final EmailService emailService;
        private final OtpService otpService;

        public AuthResponse generateAuthResponse(User user) {
                return generateAuthResponse(user, true);
        }

        public AuthResponse generateAuthResponse(User user, boolean recordActivity) {
                if (recordActivity && user.getStatus() == User.Status.APPROVED) {
                        user.setLastLoginAt(LocalDateTime.now());
                        userRepository.save(user);
                }

                var jwtToken = jwtService.generateToken(new org.springframework.security.core.userdetails.User(
                                user.getEmail(),
                                user.getPassword(),
                                Collections.emptyList()));

                return mapUserToResponse(user, jwtToken);
        }

        private AuthResponse mapUserToResponse(User user, String token) {
                return AuthResponse.builder()
                                .id(user.getId())
                                .token(token)
                                .name(user.getName())
                                .email(user.getEmail())
                                .role(user.getRole().name())
                                .status(user.getStatus().name())
                                .department(user.getDepartment())
                                .batch(user.getBatch())
                                .degree(user.getDegree())
                                .company(user.getCompany())
                                .designation(user.getDesignation())
                                .location(user.getLocation())
                                .techStack(user.getTechStack())
                                .linkedinUrl(user.getLinkedinUrl())
                                .bio(user.getBio())
                                .profileImage(user.getProfileImage())
                                .build();
        }

        public AuthResponse register(RegisterRequest request) {
                if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                        throw new RuntimeException("Email already registered");
                }

                String department = normalizeDept(request.getDepartment());

                // Enforce Alumni role for all public registrations.
                // Department Admins must be explicitly assigned by Super Admin.
                User.Role role = User.Role.ROLE_ALUMNI;

                var user = User.builder()
                                .name(request.getName())
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .role(role)
                                .batch(request.getBatch())
                                .degree(request.getDegree())
                                .company(request.getCompany())
                                .designation(request.getDesignation())
                                .location(request.getLocation())
                                .techStack(request.getTechStack())
                                .linkedinUrl(request.getLinkedinUrl())
                                .department(department)
                                .status(User.Status.PENDING)
                                .build();

                userRepository.save(user);

                // Create Notification & Send Emails for Alumni
                notificationService.createNotification(
                                "New alumni registration pending approval: " + user.getName(),
                                com.backend.backend.model.Notification.Type.REGISTRATION_APPROVAL,
                                User.Role.ROLE_ADMIN,
                                user.getId(),
                                user.getDepartment());

                notificationService.createUserNotification(
                                "Your registration has been submitted and is pending admin approval. We will notify you once it is reviewed.",
                                com.backend.backend.model.Notification.Type.REGISTRATION_APPROVAL,
                                user.getId(),
                                user.getId(),
                                user.getDepartment());

                // Notify Department Admins via Email
                List<User> admins = userRepository.findByRole(User.Role.ROLE_ADMIN);
                for (User admin : admins) {
                        if (user.getDepartment() != null && user.getDepartment().equals(admin.getDepartment())) {
                                emailService.sendApprovalNotification(admin.getEmail(), user.getName(), "Alumni");
                        }
                }

                return AuthResponse.builder()
                                .email(user.getEmail())
                                .status(user.getStatus().name())
                                .build();
        }

        public AuthResponse initiateLogin(LoginRequest request) {
                var user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                if (user.getStatus() != User.Status.APPROVED) {
                        throw new RuntimeException(
                                        "Your account is pending approval or has been suspended by the administrators.");
                }

                if (user.getRole() != User.Role.ROLE_SUPER_ADMIN) {
                        if (request.getDepartment() == null || request.getDepartment().trim().isEmpty()) {
                                throw new RuntimeException("Please select your branch.");
                        }
                        if (!sameDept(user.getDepartment(), request.getDepartment())) {
                                throw new RuntimeException("Choose correct department");
                        }
                }

                // Step 1: Verify Password
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getEmail(),
                                                request.getPassword()));

                // Step 2: Send OTP
                otpService.generateAndSendOtp(request.getEmail());

                // Return a partial response indicating OTP is sent
                return AuthResponse.builder()
                                .email(request.getEmail())
                                .status("OTP_REQUIRED")
                                .build();
        }

        public AuthResponse completeLogin(String email, String otp, String department) {
                if (!otpService.verifyOtp(email, otp)) {
                        throw new RuntimeException("Invalid or expired OTP");
                }
                var user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                if (user.getStatus() != User.Status.APPROVED) {
                        throw new RuntimeException(
                                        "Your account is pending approval or has been suspended by the administrators.");
                }
                if (user.getRole() != User.Role.ROLE_SUPER_ADMIN) {
                        if (department == null || department.trim().isEmpty()) {
                                throw new RuntimeException("Please select your branch.");
                        }
                        if (!sameDept(user.getDepartment(), department)) {
                                throw new RuntimeException("Choose correct department");
                        }
                }
                return generateAuthResponse(user, true);
        }

        @Deprecated
        private void dummyCompleteLogin() {
        }

        public AuthResponse login(LoginRequest request) {
                var user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> new RuntimeException("User not found"));
                if (user.getStatus() != User.Status.APPROVED) {
                        throw new RuntimeException(
                                        "Your account is pending approval or has been suspended by the administrators.");
                }

                if (user.getRole() != User.Role.ROLE_SUPER_ADMIN) {
                        if (request.getDepartment() == null || request.getDepartment().trim().isEmpty()) {
                                throw new RuntimeException("Please select your branch.");
                        }
                        if (!sameDept(user.getDepartment(), request.getDepartment())) {
                                throw new RuntimeException("Choose correct department");
                        }
                }

                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getEmail(),
                                                request.getPassword()));
                return generateAuthResponse(user, true);
        }

        @Deprecated
        private void dummyLoginPlaceholder() {
        }

        /*
         * public AuthResponse loginOld(LoginRequest request) {
         * // Step 3: Verify OTP
         * if (!otpService.verifyOtp(email, otp)) {
         * throw new RuntimeException("Invalid or expired OTP");
         * }
         * 
         * // Step 4: Finalize Login and Issue Token
         * var user = userRepository.findByEmail(email)
         * .orElseThrow(() -> new RuntimeException("User not found"));
         * 
         * return generateAuthResponse(user, true);
         * }
         * 
         * public AuthResponse login(LoginRequest request) {
         * // Keep the old login for backward compatibility or direct usage if needed,
         * // but we will mainly use initiateLogin + completeLogin in the UI.
         * authenticationManager.authenticate(
         * new UsernamePasswordAuthenticationToken(
         * request.getEmail(),
         * request.getPassword()));
         * var user = userRepository.findByEmail(request.getEmail())
         * .orElseThrow();
         * 
         * return generateAuthResponse(user, true);
         * }
         * 
         */
        public void changePassword(String email, String oldPassword, String newPassword) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
                        throw new RuntimeException("Invalid current password");
                }

                user.setPassword(passwordEncoder.encode(newPassword));
                userRepository.save(user);
        }

        public void forgotPassword(String email) {
                if (userRepository.findByEmail(email).isEmpty()) {
                        throw new RuntimeException("Account with this email does not exist");
                }
                otpService.generateAndSendResetOtp(email);
        }

        public void sendOtpForRegisteredUser(String email) {
                if (userRepository.findByEmail(email).isEmpty()) {
                        throw new RuntimeException("Account with this email does not exist");
                }
                otpService.generateAndSendOtp(email);
        }

        public void resetPassword(String email, String otp, String newPassword) {
                if (!otpService.verifyOtp(email, otp)) {
                        throw new RuntimeException("Invalid or expired OTP");
                }
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                user.setPassword(passwordEncoder.encode(newPassword));
                userRepository.save(user);
        }

        public String normalizeDept(String department) {
                if (department == null)
                        return "";
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

        public boolean sameDept(String left, String right) {
                return normalizeDept(left).equals(normalizeDept(right));
        }
}
