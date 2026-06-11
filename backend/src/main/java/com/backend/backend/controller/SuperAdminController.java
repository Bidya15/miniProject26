package com.backend.backend.controller;

import com.backend.backend.model.User;
import com.backend.backend.service.SuperAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/superadmin")
@RequiredArgsConstructor
public class SuperAdminController {

    private final SuperAdminService superAdminService;

    @PostMapping("/create-admin")
    public ResponseEntity<User> createAdmin(@RequestBody User admin) {
        // Now using assignAdmin endpoint primarily, but keeping for backward compatibility
        return ResponseEntity.ok(superAdminService.createAdmin(admin));
    }

    @PutMapping("/assign-admin/{id}")
    public ResponseEntity<User> assignAdmin(
            @PathVariable("id") Long id,
            @RequestBody java.util.Map<String, String> payload) {
        return ResponseEntity.ok(superAdminService.assignAdminRole(id, payload.get("department")));
    }

    @PutMapping("/revoke-admin/{id}")
    public ResponseEntity<Void> revokeAdmin(@PathVariable("id") Long id) {
        superAdminService.revokeAdminRole(id);
        return ResponseEntity.noContent().build();
    }


    @PutMapping("/promote/{id}")
    public ResponseEntity<Void> promoteToSuperAdmin(@PathVariable("id") Long id) {
        superAdminService.promoteToSuperAdmin(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/users/{id}/department")
    public ResponseEntity<User> updateUserDepartment(
            @PathVariable("id") Long id,
            @RequestBody java.util.Map<String, String> payload) {
        return ResponseEntity.ok(superAdminService.updateUserDepartment(id, payload.get("department")));
    }

    @GetMapping("/admins")
    public ResponseEntity<List<User>> getAllAdmins() {
        return ResponseEntity.ok(superAdminService.getAllAdmins());
    }
}
