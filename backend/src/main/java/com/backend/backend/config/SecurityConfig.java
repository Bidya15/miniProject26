package com.backend.backend.config;
import org.springframework.beans.factory.annotation.Value;

import com.backend.backend.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .headers(headers -> headers
                        .addHeaderWriter((request, response) -> {
                            // same-origin is more secure and helps with GSI in some cases
                            // same-origin-allow-popups is specifically for the opener
                            response.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
                        }))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/alumni/public").permitAll()
                        .requestMatchers("/api/auth/**", "/api/health", "/error").permitAll()
                        .requestMatchers("/api/alumni/**")
                        .hasAnyAuthority("ROLE_SUPER_ADMIN", "ROLE_ADMIN", "ROLE_ALUMNI")
                        .requestMatchers("/api/admin/**").hasAnyAuthority("ROLE_SUPER_ADMIN", "ROLE_ADMIN")
                        .requestMatchers("/api/superadmin/**").hasAuthority("ROLE_SUPER_ADMIN")
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/cms/**", "/api/events/**",
                                "/api/coordinators/**", "/api/testimonials/**")
                        .permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/events/*/register")
                        .hasAnyAuthority("ROLE_SUPER_ADMIN", "ROLE_ADMIN", "ROLE_ALUMNI")
                        .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/events/*/register")
                        .hasAnyAuthority("ROLE_SUPER_ADMIN", "ROLE_ADMIN", "ROLE_ALUMNI")
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/events/*/registrations")
                        .hasAnyAuthority("ROLE_SUPER_ADMIN", "ROLE_ADMIN")
                        .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/events/registrations/*")
                        .hasAnyAuthority("ROLE_SUPER_ADMIN", "ROLE_ADMIN")
                        .requestMatchers("/api/cms/**").hasAuthority("ROLE_SUPER_ADMIN")
                        .requestMatchers("/api/events/**", "/api/coordinators/**").hasAnyAuthority("ROLE_SUPER_ADMIN", "ROLE_ADMIN")
                        .requestMatchers("/api/testimonials/**").hasAnyAuthority("ROLE_SUPER_ADMIN", "ROLE_ALUMNI")
                        .requestMatchers("/api/notifications/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPER_ADMIN", "ROLE_ALUMNI")
                        .anyRequest().authenticated())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Value("${allowed.origins:http://localhost:5173,http://localhost:5174,http://localhost:5175}")
    private String allowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        Set<String> originPatterns = new LinkedHashSet<>();

        if (allowedOrigins != null && !allowedOrigins.isBlank()) {
            Arrays.stream(allowedOrigins.split(","))
                    .map(String::trim)
                    .filter(origin -> !origin.isEmpty())
                    .forEach(originPatterns::add);
        }

        // Allow Vite/dev-server ports that shift during local development.
        originPatterns.add("http://localhost:*");
        originPatterns.add("http://127.0.0.1:*");
        originPatterns.add("http://[::1]:*");

        configuration.setAllowedOriginPatterns(new ArrayList<>(originPatterns));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> web.ignoring().requestMatchers("/api/alumni/public");
    }
}
