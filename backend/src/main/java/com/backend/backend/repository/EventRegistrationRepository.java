package com.backend.backend.repository;

import com.backend.backend.model.EventRegistration;
import com.backend.backend.model.User;
import com.backend.backend.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {
    List<EventRegistration> findByUser(User user);

    List<EventRegistration> findByEvent(Event event);

    List<EventRegistration> findByEventId(Long eventId);

    Optional<EventRegistration> findByUserAndEvent(User user, Event event);

    boolean existsByUserAndEvent(User user, Event event);

    long countByEvent(Event event);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(er) FROM EventRegistration er WHERE er.event.id = :eventId")
    long countByEventId(@org.springframework.data.repository.query.Param("eventId") Long eventId);
}
