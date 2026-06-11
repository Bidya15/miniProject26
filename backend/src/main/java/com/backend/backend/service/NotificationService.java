package com.backend.backend.service;

import com.backend.backend.model.Notification;
import com.backend.backend.model.User;
import com.backend.backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Comparator;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public Notification createNotification(String message, Notification.Type type, User.Role targetRole,
            Long relatedEntityId, String department) {
        Notification notification = Notification.builder()
                .message(message)
                .type(type)
                .targetRole(targetRole)
                .relatedEntityId(relatedEntityId)
                .department(department)
                .read(false)
                .build();
        return notificationRepository.save(notification);
    }

    public Notification createUserNotification(String message, Notification.Type type, Long targetUserId,
            Long relatedEntityId, String department) {
        Notification notification = Notification.builder()
                .message(message)
                .type(type)
                .targetUserId(targetUserId)
                .relatedEntityId(relatedEntityId)
                .department(department)
                .read(false)
                .build();
        return notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsForUser(User user) {
        List<Notification> notifications = new ArrayList<>();
        notifications.addAll(notificationRepository.findByTargetUserIdAndRead(user.getId(), false));

        if (user.getRole() == User.Role.ROLE_SUPER_ADMIN) {
            notifications.addAll(notificationRepository.findByTargetRoleAndRead(user.getRole(), false));
        } else if (user.getRole() == User.Role.ROLE_ADMIN) {
            notifications.addAll(notificationRepository.findByTargetRoleAndRead(user.getRole(), false).stream()
                    .filter(n -> user.getDepartment() == null
                            || n.getDepartment() == null
                            || user.getDepartment().equals(n.getDepartment()))
                    .toList());
        } else {
            notifications.addAll(notificationRepository.findByTargetRoleAndRead(user.getRole(), false));
        }

        return notifications.stream()
                .sorted(Comparator.comparing(Notification::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .distinct()
                .toList();
    }

    public void markAsRead(Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    public void markAsReadByRelatedEntity(Long relatedEntityId, Notification.Type type) {
        List<Notification> notifications = notificationRepository.findByRelatedEntityIdAndType(relatedEntityId, type);
        for (Notification n : notifications) {
            n.setRead(true);
            notificationRepository.save(n);
        }
    }
}
