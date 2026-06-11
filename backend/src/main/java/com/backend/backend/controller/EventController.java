package com.backend.backend.controller;

import com.backend.backend.dto.EventRegistrationRequest;
import com.backend.backend.model.Event;
import com.backend.backend.model.EventRegistration;
import com.backend.backend.model.User;
import com.backend.backend.repository.EventRegistrationRepository;
import com.backend.backend.repository.EventRepository;
import com.backend.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Global config might cover this, but explicit for safety
public class EventController {

    private final EventRepository eventRepository;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllEvents(
            @RequestParam(required = false) String category,
            org.springframework.security.core.Authentication auth) {
        
        List<Event> events;
        String dept = null;
        
        if (auth != null) {
            User currentUser = userRepository.findByEmail(auth.getName()).orElse(null);
            if (currentUser != null && currentUser.getRole() == User.Role.ROLE_ADMIN) {
                dept = currentUser.getDepartment();
            }
        }

        if (category != null && !category.isEmpty()) {
            events = eventRepository.findAllByCategoryAndDepartment(category, dept);
        } else {
            if (dept != null) {
                events = eventRepository.findByDepartmentOrderByCreatedAtDesc(dept);
            } else {
                events = eventRepository.findAllByOrderByCreatedAtDesc();
            }
        }

        List<Map<String, Object>> result = events.stream().map(event -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", event.getId());
            map.put("title", event.getTitle());
            map.put("description", event.getDescription());
            map.put("eventDate", event.getEventDate());
            map.put("location", event.getLocation());
            map.put("imageUrl", event.getImageUrl());
            map.put("category", event.getCategory());
            map.put("createdAt", event.getCreatedAt());

            // Manual count using direct ID query for maximum reliability
            long count = eventRegistrationRepository.countByEventId(event.getId());
            map.put("registrationCount", (int) count);

            return map;
        }).collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<Event> createEvent(@RequestBody Event event, 
            org.springframework.security.core.Authentication auth) {
        if (auth != null) {
            User currentUser = userRepository.findByEmail(auth.getName()).orElse(null);
            if (currentUser != null && currentUser.getRole() == User.Role.ROLE_ADMIN) {
                event.setDepartment(currentUser.getDepartment());
            } else if (currentUser != null && currentUser.getRole() == User.Role.ROLE_SUPER_ADMIN) {
                if (event.getDepartment() == null) event.setDepartment("Global");
            }
        }
        return ResponseEntity.ok(eventRepository.save(event));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(@PathVariable Long id, @RequestBody Event event,
            org.springframework.security.core.Authentication auth) {
        Optional<Event> existing = eventRepository.findById(id);
        if (existing.isEmpty()) return ResponseEntity.notFound().build();

        if (auth != null) {
            User currentUser = userRepository.findByEmail(auth.getName()).orElse(null);
            if (currentUser != null && currentUser.getRole() == User.Role.ROLE_ADMIN) {
                if (!existing.get().getDepartment().equals(currentUser.getDepartment())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                }
                event.setDepartment(currentUser.getDepartment()); // Prevent changing dept
            }
        }

        event.setId(id);
        return ResponseEntity.ok(eventRepository.save(event));
    }

    @org.springframework.transaction.annotation.Transactional
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id,
            org.springframework.security.core.Authentication auth) {
        Optional<Event> existing = eventRepository.findById(id);
        if (existing.isEmpty()) return ResponseEntity.notFound().build();

        if (auth != null) {
            User currentUser = userRepository.findByEmail(auth.getName()).orElse(null);
            if (currentUser != null && currentUser.getRole() == User.Role.ROLE_ADMIN) {
                if (!existing.get().getDepartment().equals(currentUser.getDepartment())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                }
            }
        }

        // Clean up associated registrations first
        eventRegistrationRepository.deleteAll(eventRegistrationRepository.findByEventId(id));

        eventRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // ─── Registration Endpoints ───────────────────────────────────

    @PostMapping("/{id}/register")
    public ResponseEntity<?> registerForEvent(@PathVariable Long id,
            @RequestBody EventRegistrationRequest registrationRequest) {
        Optional<Event> eventOpt = eventRepository.findById(id);

        if (registrationRequest.getUserId() == null) {
            return ResponseEntity.badRequest().body("User ID is required");
        }

        Long userId = registrationRequest.getUserId();
        Optional<User> userOpt = userRepository.findById(userId);

        if (eventOpt.isEmpty() || userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Event or User not found");
        }

        if (eventRegistrationRepository.existsByUserAndEvent(userOpt.get(), eventOpt.get())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Already registered");
        }

        EventRegistration registration = new EventRegistration();
        registration.setEvent(eventOpt.get());
        registration.setUser(userOpt.get());
        registration.setFirstName(registrationRequest.getFirstName());
        registration.setLastName(registrationRequest.getLastName());
        registration.setEmail(registrationRequest.getEmail());
        registration.setPhone(registrationRequest.getPhone());
        registration.setComments(registrationRequest.getComments());

        eventRegistrationRepository.save(registration);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Successfully registered"));
    }

    @DeleteMapping("/{id}/register")
    public ResponseEntity<?> unregisterFromEvent(@PathVariable Long id, @RequestParam Long userId) {
        Optional<Event> eventOpt = eventRepository.findById(id);
        Optional<User> userOpt = userRepository.findById(userId);

        if (eventOpt.isEmpty() || userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Event or User not found");
        }

        Optional<EventRegistration> reg = eventRegistrationRepository.findByUserAndEvent(userOpt.get(), eventOpt.get());
        if (reg.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Registration not found");
        }

        eventRegistrationRepository.delete(reg.get());
        return ResponseEntity.ok(Map.of("message", "Successfully unregistered"));
    }

    @GetMapping("/{id}/is-registered")
    public ResponseEntity<?> isRegistered(@PathVariable Long id, @RequestParam Long userId) {
        Optional<Event> eventOpt = eventRepository.findById(id);
        Optional<User> userOpt = userRepository.findById(userId);

        if (eventOpt.isEmpty() || userOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of("registered", false));
        }

        boolean exists = eventRegistrationRepository.existsByUserAndEvent(userOpt.get(), eventOpt.get());
        return ResponseEntity.ok(Map.of("registered", exists));
    }

    @GetMapping("/{id}/registrations")
    public ResponseEntity<List<EventRegistration>> getRegistrationsForEvent(@PathVariable Long id) {
        if (!eventRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        // Use repo method that finds by event id directly
        List<EventRegistration> registrations = eventRegistrationRepository.findByEventId(id);
        return ResponseEntity.ok(registrations);
    }

    @DeleteMapping("/registrations/{regId}")
    public ResponseEntity<?> deleteRegistration(@PathVariable Long regId) {
        if (!eventRegistrationRepository.existsById(regId)) {
            return ResponseEntity.notFound().build();
        }
        eventRegistrationRepository.deleteById(regId);
        return ResponseEntity.ok(Map.of("message", "Registration cancelled by admin"));
    }

    @PutMapping("/registrations/{regId}")
    public ResponseEntity<EventRegistration> updateRegistration(@PathVariable Long regId,
            @RequestBody EventRegistrationRequest updateRequest) {
        return eventRegistrationRepository.findById(regId).map(reg -> {
            reg.setFirstName(updateRequest.getFirstName());
            reg.setLastName(updateRequest.getLastName());
            reg.setEmail(updateRequest.getEmail());
            reg.setPhone(updateRequest.getPhone());
            reg.setComments(updateRequest.getComments());
            return ResponseEntity.ok(eventRegistrationRepository.save(reg));
        }).orElse(ResponseEntity.notFound().build());
    }
}
