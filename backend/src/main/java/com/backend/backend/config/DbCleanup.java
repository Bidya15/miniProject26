package com.backend.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DbCleanup implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        dropCheckConstraints("users", "role");
        dropCheckConstraints("notifications", "type");
        dropCheckConstraints("notifications", "target_role");
    }

    private void dropCheckConstraints(String tableName, String columnName) {
        try {
            // Drop constraints dynamically using information_schema
            String sql = "SELECT tc.constraint_name " +
                         "FROM information_schema.table_constraints tc " +
                         "JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name " +
                         "WHERE tc.table_name = ? AND ccu.column_name = ? AND tc.constraint_type = 'CHECK'";
            List<String> constraints = jdbcTemplate.queryForList(sql, String.class, tableName, columnName);
            for (String constraint : constraints) {
                try {
                    jdbcTemplate.execute("ALTER TABLE " + tableName + " DROP CONSTRAINT IF EXISTS " + constraint);
                    System.out.println("DbCleanup: Successfully dropped constraint " + constraint + " on table " + tableName);
                } catch (Exception e) {
                    System.err.println("DbCleanup: Failed to drop constraint " + constraint + " on table " + tableName + ": " + e.getMessage());
                }
            }
        } catch (Exception e) {
            System.err.println("DbCleanup: Failed to query constraints for " + tableName + "." + columnName + ": " + e.getMessage());
        }

        // Fallback: try common default constraint names directly
        try {
            jdbcTemplate.execute("ALTER TABLE " + tableName + " DROP CONSTRAINT IF EXISTS " + tableName + "_" + columnName + "_check");
            System.out.println("DbCleanup: Attempted fallback drop for " + tableName + "_" + columnName + "_check");
        } catch (Exception e) {
            // Ignore if constraint doesn't exist or already dropped
        }
    }
}

