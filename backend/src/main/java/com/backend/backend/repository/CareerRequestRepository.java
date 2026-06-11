package com.backend.backend.repository;

import com.backend.backend.model.CareerRequest;
import com.backend.backend.model.User;
import com.backend.backend.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CareerRequestRepository extends JpaRepository<CareerRequest, Long> {
    List<CareerRequest> findByApplicant(User applicant);

    List<CareerRequest> findByPost(Post post);

    Optional<CareerRequest> findByApplicantAndPost(User applicant, Post post);

    boolean existsByApplicantAndPost(User applicant, Post post);

    List<CareerRequest> findByApplicantId(Long applicantId);

    List<CareerRequest> findByPostUserId(Long postUserId);

    List<CareerRequest> findByPostId(Long postId);
}
