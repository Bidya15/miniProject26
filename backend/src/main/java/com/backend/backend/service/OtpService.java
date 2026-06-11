package com.backend.backend.service;

import com.backend.backend.model.UserOtp;
import com.backend.backend.repository.UserOtpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class OtpService {
    private final UserOtpRepository userOtpRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void generateAndSendOtp(String email) {
        String rawOtp = generateSixDigitOtp();
        String encodedOtp = passwordEncoder.encode(rawOtp);
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(5);

        // Upsert logic: Update existing record or create new one
        UserOtp userOtp = userOtpRepository.findByEmail(email)
                .orElse(new UserOtp());

        userOtp.setEmail(email);
        userOtp.setOtp(encodedOtp);
        userOtp.setExpiryTime(expiryTime);

        userOtpRepository.save(userOtp);
        emailService.sendVerificationEmail(email, rawOtp);
    }

    @Transactional
    public void generateAndSendResetOtp(String email) {
        String rawOtp = generateSixDigitOtp();
        String encodedOtp = passwordEncoder.encode(rawOtp);
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(5);

        // Upsert logic: Update existing record or create new one
        UserOtp userOtp = userOtpRepository.findByEmail(email)
                .orElse(new UserOtp());

        userOtp.setEmail(email);
        userOtp.setOtp(encodedOtp);
        userOtp.setExpiryTime(expiryTime);

        userOtpRepository.save(userOtp);
        emailService.sendPasswordResetEmail(email, rawOtp);
    }

    @Transactional
    public boolean verifyOtp(String email, String rawOtp) {
        Optional<UserOtp> optionalUserOtp = userOtpRepository.findByEmail(email);

        if (optionalUserOtp.isPresent()) {
            UserOtp userOtp = optionalUserOtp.get();

            // Check expiry
            if (userOtp.getExpiryTime().isBefore(LocalDateTime.now())) {
                userOtpRepository.delete(userOtp); // Keep DB clean
                return false;
            }

            // Verify matches
            if (passwordEncoder.matches(rawOtp, userOtp.getOtp())) {
                userOtpRepository.delete(userOtp); // OTP consumed
                return true;
            }
        }

        return false;
    }

    private String generateSixDigitOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }
}
