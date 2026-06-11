package com.backend.backend.repository;

import com.backend.backend.model.Notification;
import com.backend.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByTargetRoleAndRead(User.Role targetRole, boolean read);
    List<Notification> findByTargetUserIdAndRead(Long targetUserId, boolean read);

    List<Notification> findByRelatedEntityIdAndType(Long relatedEntityId, Notification.Type type);

    List<Notification> findByTargetUserId(Long targetUserId);
}
