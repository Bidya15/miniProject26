package com.backend.backend.repository;

import com.backend.backend.model.MentorshipRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MentorshipRequestRepository extends JpaRepository<MentorshipRequest, Long> {
    List<MentorshipRequest> findByMentorId(Long mentorId);

    List<MentorshipRequest> findByMenteeId(Long menteeId);

    boolean existsByMenteeIdAndPostId(Long menteeId, Long postId);

    List<MentorshipRequest> findByPostUserId(Long postUserId);

    List<MentorshipRequest> findByPostId(Long postId);
}
