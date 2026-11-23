package com.feedbackapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FeedbackAppApplication {
    public static void main(String[] args) {
        SpringApplication.run(FeedbackAppApplication.class, args);
        System.out.println("=================================================");
        System.out.println(" Feedback Application Backend Started Successfully!");
        System.out.println(" Port: 8080");
        System.out.println(" Health check: http://localhost:8080/api/auth/demo-users");
        System.out.println("=================================================");
    }
}
