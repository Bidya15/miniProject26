package com.backend.backend.repository;

import com.backend.backend.model.FooterConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FooterConfigRepository extends JpaRepository<FooterConfig, Long> {
}
