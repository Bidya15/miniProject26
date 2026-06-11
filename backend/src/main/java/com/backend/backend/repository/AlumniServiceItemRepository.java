package com.backend.backend.repository;

import com.backend.backend.model.AlumniServiceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AlumniServiceItemRepository extends JpaRepository<AlumniServiceItem, Long> {
}
