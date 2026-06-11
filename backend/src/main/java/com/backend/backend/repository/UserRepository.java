package com.backend.backend.repository;

import com.backend.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    List<User> findByStatus(User.Status status);

    List<User> findByStatusAndRole(User.Status status, User.Role role);
    List<User> findByStatusAndRoleAndDepartment(User.Status status, User.Role role, String department);

    List<User> findByRole(User.Role role);
    List<User> findByRoleAndDepartment(User.Role role, String department);

    long countByRoleAndStatus(User.Role role, User.Status status);
    long countByRoleAndStatusAndDepartment(User.Role role, User.Status status, String department);

    @Query("SELECT COUNT(DISTINCT u.company) FROM User u WHERE u.status = :status AND u.company IS NOT NULL AND u.company <> ''")
    long countDistinctCompaniesByStatus(@Param("status") User.Status status);

    @Query("SELECT COUNT(DISTINCT u.location) FROM User u WHERE u.status = :status AND u.location IS NOT NULL AND u.location <> ''")
    long countDistinctLocationsByStatus(@Param("status") User.Status status);
}
