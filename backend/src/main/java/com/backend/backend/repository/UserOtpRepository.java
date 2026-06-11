package com.backend.backend.repository;

import com.backend.backend.model.UserOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserOtpRepository extends JpaRepository<UserOtp, Long> {

    Optional<UserOtp> findByEmail(String email);

    void deleteByEmail(String email);
}
