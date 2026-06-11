package com.backend.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "message_desk_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageDeskItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String senderName;
    private String senderRole;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    private Integer sortOrder;
}
