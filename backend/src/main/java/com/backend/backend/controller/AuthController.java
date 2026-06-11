package com.backend.backend.controller;

import com.backend.backend.dto.AuthResponse;
import com.backend.backend.dto.LoginRequest;
import com.backend.backend.dto.RegisterRequest;
import com.backend.backend.model.User;
import com.backend.backend.repository.UserRepository;
import com.backend.backend.service.AuthService;
import com.backend.backend.service.OtpService;
import com.backend.backend.service.GoogleAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final OtpService otpService;
    private final UserRepository userRepository;
    private final GoogleAuthService googleAuthService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        // Direct login without OTP as requested
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/login/verify")
    public ResponseEntity<AuthResponse> verifyLogin(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        String department = request.get("department");
        return ResponseEntity.ok(authService.completeLogin(email, otp, department));
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> request) {
        String idToken = request.get("idToken");
        String requestedRole = request.get("role");
        String department = authService.normalizeDept(request.get("department"));
        return googleAuthService.verifyAndGetUser(idToken, department, requestedRole)
                .map(user -> {
                    if (requestedRole != null && !requestedRole.isBlank()
                            && !user.getRole().name().equals(requestedRole)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(Map.of("message", "Please sign in with the account that matches the selected role."));
                    }
                    if (user.getStatus() != com.backend.backend.model.User.Status.APPROVED) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(Map.of("message", "Your account is pending approval or has been suspended by the administrators."));
                    }
                    if (user.getRole() != com.backend.backend.model.User.Role.ROLE_SUPER_ADMIN) {
                        if (department == null || department.trim().isEmpty()) {
                            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                    .body(Map.of("message", "Please select your branch."));
                        }
                        if (!authService.sameDept(user.getDepartment(), department)) {
                            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                    .body(Map.of("message", "Choose correct department"));
                        }
                    }
                    return ResponseEntity.ok(authService.generateAuthResponse(user, true));
                })
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    @Deprecated
    /*
    private ResponseEntity<?> oldGoogleLoginPlaceholder(Map<String, String> request) {
        String idToken = request.get("idToken");
        return googleAuthService.verifyAndGetUser(idToken)
                .map(user -> ResponseEntity.ok(authService.generateAuthResponse(user, true)))
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Principal principal) {
        if (principal == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        User currentUser = userRepository.findByEmail(principal.getName()).orElse(null);
        if (currentUser == null)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        return ResponseEntity.ok(AuthResponse.builder()
                .id(currentUser.getId())
                .name(currentUser.getName())
                .email(currentUser.getEmail())
                .role(currentUser.getRole().name())
                .status(currentUser.getStatus().name())
                .batch(currentUser.getBatch())
                .degree(currentUser.getDegree())
                .company(currentUser.getCompany())
                .designation(currentUser.getDesignation())
                .location(currentUser.getLocation())
                .techStack(currentUser.getTechStack())
                .linkedinUrl(currentUser.getLinkedinUrl())
                .bio(currentUser.getBio())
                .profileImage(currentUser.getProfileImage())
                .build());
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestParam String email) {
        try {
            authService.sendOtpForRegisteredUser(email);
            return ResponseEntity.ok("OTP Sent Successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestParam String email, @RequestParam String otp) {
        boolean isValid = otpService.verifyOtp(email, otp);
        if (isValid) {
            return ResponseEntity.ok("Email verified successfully.");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid or expired OTP.");
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(Principal principal, @RequestBody Map<String, String> request) {
        if (principal == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        String oldPassword = request.get("oldPassword");
        String newPassword = request.get("newPassword");
        try {
            authService.changePassword(principal.getName(), oldPassword, newPassword);
            return ResponseEntity.ok("Password updated successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        try {
            authService.forgotPassword(email);
            return ResponseEntity.ok("Reset OTP sent to your email.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        String newPassword = request.get("newPassword");
        try {
            authService.resetPassword(email, otp, newPassword);
            return ResponseEntity.ok("Password reset successfully. You can now login.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

}
