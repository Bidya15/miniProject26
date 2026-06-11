package com.backend.backend.repository;

import com.backend.backend.model.GivingInitiative;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GivingInitiativeRepository extends JpaRepository<GivingInitiative, Long> {
}
