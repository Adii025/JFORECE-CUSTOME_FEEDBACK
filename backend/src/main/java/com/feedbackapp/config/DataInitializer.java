package com.feedbackapp.config;

import com.feedbackapp.model.Role;
import com.feedbackapp.model.User;
import com.feedbackapp.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;

    public DataInitializer(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        // Automatically seed ONLY Admin into PostgreSQL if the users table is empty.
        // All regular users are removed so you can register and add them yourself!
        if (userRepository.count() == 0) {
            userRepository.save(new User(
                    null,
                    "admin",
                    "admin@feedback.com",
                    "admin123",
                    "System Administrator",
                    Role.ADMIN
            ));

            System.out.println("=================================================================");
            System.out.println(">>> PostgreSQL Seeded: ONLY Admin user created (admin / admin123)");
            System.out.println(">>> All other users removed. Register your new users via Step 2!");
            System.out.println("=================================================================");
        }
    }
}
