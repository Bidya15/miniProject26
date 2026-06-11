package com.backend.backend.repository;

import com.backend.backend.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findAllByOrderByCreatedAtDesc();

    List<Event> findByDepartmentOrderByCreatedAtDesc(String department);

    @org.springframework.data.jpa.repository.Query("SELECT e FROM Event e WHERE (e.category = :category " +
            "OR (e.category IS NULL AND :category = 'UPCOMING')) " +
            "AND (:department IS NULL OR e.department = :department OR e.department = 'Global') " +
            "ORDER BY e.eventDate ASC")
    List<Event> findAllByCategoryAndDepartment(
            @org.springframework.data.repository.query.Param("category") String category, 
            @org.springframework.data.repository.query.Param("department") String department);
}
