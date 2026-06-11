package com.backend.backend.repository;

import com.backend.backend.model.ConnectionRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConnectionRequestRepository extends JpaRepository<ConnectionRequest, Long> {
    List<ConnectionRequest> findByReceiverId(Long receiverId);

    List<ConnectionRequest> findBySenderId(Long senderId);

    // To check if a specific connection exists
    boolean existsBySenderIdAndReceiverId(Long senderId, Long receiverId);
}
