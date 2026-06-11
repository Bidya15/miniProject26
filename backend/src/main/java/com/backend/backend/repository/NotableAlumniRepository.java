package com.backend.backend.repository;

import com.backend.backend.model.NotableAlumni;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotableAlumniRepository extends JpaRepository<NotableAlumni, Long> {
}
