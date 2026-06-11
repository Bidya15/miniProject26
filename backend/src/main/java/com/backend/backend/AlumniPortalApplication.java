package com.backend.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;
import com.backend.backend.model.MessageDeskItem;
import com.backend.backend.repository.MessageDeskItemRepository;

@SpringBootApplication
public class AlumniPortalApplication {

	public static void main(String[] args) {
		SpringApplication.run(AlumniPortalApplication.class, args);
	}

	@Bean
	CommandLineRunner seedMessageDesk(MessageDeskItemRepository repository) {
		return args -> {
			// No dummy data seeded
		};
	}

	@Bean
	CommandLineRunner migrateCoordinatorsTable(JdbcTemplate jdbcTemplate) {
		return args -> {
			try {
				jdbcTemplate.execute("ALTER TABLE coordinators ALTER COLUMN image_url TYPE TEXT;");
				jdbcTemplate.execute("ALTER TABLE coordinators ALTER COLUMN linked_in_url TYPE TEXT;");
				jdbcTemplate.execute("ALTER TABLE message_desk_items ALTER COLUMN content TYPE TEXT;");
				jdbcTemplate.execute("ALTER TABLE message_desk_items ALTER COLUMN image_url TYPE TEXT;");
				System.out.println("✅ DB Migration: Successfully updated table columns to TEXT.");
			} catch (Exception e) {
				System.out.println("⚠️ DB Migration: Table migration skipped or failed: " + e.getMessage());
			}
		};
	}
}
