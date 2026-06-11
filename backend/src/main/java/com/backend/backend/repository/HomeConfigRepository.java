package com.backend.backend.repository;

import com.backend.backend.model.HomeConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HomeConfigRepository extends JpaRepository<HomeConfig, Long> {
}
