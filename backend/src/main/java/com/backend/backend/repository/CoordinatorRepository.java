package com.backend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.backend.backend.model.Coordinator;

public interface CoordinatorRepository extends JpaRepository<Coordinator, Long> {
}
