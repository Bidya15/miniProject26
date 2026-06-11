package com.backend.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.backend.backend.model.Coordinator;
import com.backend.backend.repository.CoordinatorRepository;

import java.util.List;

@RestController
@RequestMapping("/api/coordinators")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CoordinatorController {

    @Autowired
    private CoordinatorRepository coordinatorRepository;

    @GetMapping
    public List<Coordinator> getAllCoordinators() {
        return coordinatorRepository.findAll();
    }

    @PostMapping
    public Coordinator createCoordinator(@RequestBody Coordinator coordinator) {
        return coordinatorRepository.save(coordinator);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Coordinator> updateCoordinator(@PathVariable Long id,
            @RequestBody Coordinator coordinatorDetails) {
        return coordinatorRepository.findById(id)
                .map(coordinator -> {
                    coordinator.setName(coordinatorDetails.getName());
                    coordinator.setRole(coordinatorDetails.getRole());
                    coordinator.setDepartment(coordinatorDetails.getDepartment());
                    coordinator.setImageUrl(coordinatorDetails.getImageUrl());
                    coordinator.setLinkedInUrl(coordinatorDetails.getLinkedInUrl());
                    return ResponseEntity.ok(coordinatorRepository.save(coordinator));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCoordinator(@PathVariable Long id) {
        return coordinatorRepository.findById(id)
                .map(coordinator -> {
                    coordinatorRepository.delete(coordinator);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
