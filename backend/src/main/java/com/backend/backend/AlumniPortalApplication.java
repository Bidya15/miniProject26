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
			if (repository.count() == 0) {
				MessageDeskItem hod = new MessageDeskItem();
				hod.setSenderName("Dr. Bidyut Baruah");
				hod.setSenderRole("Head of Department (HOD), CSE");
				hod.setContent(
						"Our alumni are our greatest pride. We are committed to fostering a lifelong bond between the department and its former students. Welcome back to your second home.");
				hod.setImageUrl("https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop");
				hod.setSortOrder(1);

				MessageDeskItem secretary = new MessageDeskItem();
				secretary.setSenderName("Er. Pranjal Baruah");
				secretary.setSenderRole("Secretary, AEC Alumni Association");
				secretary.setContent(
						"The AEC Alumni Association is dedicated to supporting your growth and connecting you with the global AEC family. Together, we can make a difference.");
				secretary.setImageUrl(
						"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop");
				secretary.setSortOrder(2);

				repository.save(hod);
				repository.save(secretary);
				System.out.println("🌱 Message Desk Seeding: Added initial institutional messages.");
			}
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
