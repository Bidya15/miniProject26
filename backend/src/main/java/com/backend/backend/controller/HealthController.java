package com.backend.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Lightweight health-check endpoint.
 *
 * Accessible without authentication so the frontend Service Worker
 * can ping it every 10 minutes to prevent Render Free Tier cold starts.
 *
 * GET /api/health → 200 OK  { "status": "UP" }
 */
@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }
}
