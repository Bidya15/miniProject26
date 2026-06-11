package com.backend.backend.repository;

import com.backend.backend.model.MessageDeskItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageDeskItemRepository extends JpaRepository<MessageDeskItem, Long> {
    List<MessageDeskItem> findAllByOrderBySortOrderAsc();
}
