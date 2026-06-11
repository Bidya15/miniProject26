package com.backend.backend.controller;

import com.backend.backend.dto.RegisterRequest;
import com.backend.backend.model.User;
import com.backend.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/pending")
    public ResponseEntity<List<User>> getPendingAlumni(org.springframework.security.core.Authentication auth) {
        String email = auth.getName();
        User admin = adminService.getUserByEmail(email);
        return ResponseEntity.ok(adminService.getPendingAlumni(admin.getRole().name(), admin.getDepartment()));
    }

    @PutMapping("/approve/{id}")
    public ResponseEntity<User> approveAlumni(@PathVariable Long id,
            org.springframework.security.core.Authentication auth) {
        String email = auth.getName();
        User admin = adminService.getUserByEmail(email);
        return ResponseEntity.ok(adminService.approveAlumni(id, admin.getRole().name(), admin.getDepartment()));
    }

    @PutMapping("/reject/{id}")
    public ResponseEntity<User> rejectAlumni(@PathVariable Long id,
            org.springframework.security.core.Authentication auth) {
        String email = auth.getName();
        User admin = adminService.getUserByEmail(email);
        return ResponseEntity.ok(adminService.rejectAlumni(id, admin.getRole().name(), admin.getDepartment()));
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportAlumni(org.springframework.security.core.Authentication auth) throws IOException {
        String email = auth.getName();
        User admin = adminService.getUserByEmail(email);
        String dept = (admin.getRole() == User.Role.ROLE_SUPER_ADMIN) ? null : admin.getDepartment();
        byte[] excelContent = adminService.exportAlumniToExcel(dept);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=alumni_data.xlsx")
                .contentType(
                        MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelContent);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id,
            org.springframework.security.core.Authentication auth) {
        String email = auth.getName();
        User admin = adminService.getUserByEmail(email);
        adminService.deleteUser(id, admin.getRole().name(), admin.getDepartment());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/bulk-register")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<User>> bulkRegister(@RequestBody List<RegisterRequest> requests) {
        return ResponseEntity.ok(adminService.bulkAddAlumni(requests));
    }
}
