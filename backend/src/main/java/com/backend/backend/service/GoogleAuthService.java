package com.backend.backend.service;

import com.backend.backend.model.User;
import com.backend.backend.repository.UserRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.Collections;
import java.util.Optional;

@Service
public class GoogleAuthService {

    private final UserRepository userRepository;
    private final String clientId;
    private final GoogleIdTokenVerifier verifier;

    public GoogleAuthService(UserRepository userRepository, @Value("${google.client.id}") String clientId) {
        this.userRepository = userRepository;
        this.clientId = clientId;
        this.verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(clientId))
                // Allow up to 5 minutes clock skew (Render free tier can have drift)
                .setAcceptableTimeSkewSeconds(300)
                .build();
    }

    public Optional<User> verifyAndGetUser(String idTokenString, String department, String requestedRole) {
        try {
            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();
                String email = payload.getEmail();
                String name = (String) payload.get("name");
                String pictureUrl = (String) payload.get("picture");

                Optional<User> existingUser = userRepository.findByEmail(email);
                if (existingUser.isPresent()) {
                    return existingUser;
                }

                if (requestedRole != null && !requestedRole.isBlank()
                        && !"ROLE_ALUMNI".equals(requestedRole)) {
                    return Optional.empty();
                }

                User newUser = User.builder()
                        .name(name)
                        .email(email)
                        .password("GOOGLE_AUTH_USER")
                        .role(User.Role.ROLE_ALUMNI)
                        .status(User.Status.PENDING)
                        .profileImage(pictureUrl)
                        .department(department)
                        .build();

                return Optional.of(userRepository.save(newUser));
            } else {
                System.err.println("[GoogleAuth] Token verification returned null — token may be expired, malformed, or audience mismatch. ClientId=" + clientId);
            }
        } catch (Exception e) {
            System.err.println("[GoogleAuth] Exception during token verification: " + e.getMessage());
            e.printStackTrace();
        }
        return Optional.empty();
    }
}
