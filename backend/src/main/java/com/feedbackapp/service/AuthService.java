package com.feedbackapp.service;

import com.feedbackapp.dto.AuthResponse;
import com.feedbackapp.dto.LoginRequest;
import com.feedbackapp.dto.RegisterRequest;
import com.feedbackapp.model.Role;
import com.feedbackapp.model.User;
import com.feedbackapp.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {
    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public AuthResponse register(RegisterRequest req) {
        if (req.getUsername() == null || req.getUsername().trim().isEmpty()) {
            return new AuthResponse(false, "Username is required", null, null);
        }
        if (req.getEmail() == null || req.getEmail().trim().isEmpty()) {
            return new AuthResponse(false, "Email is required", null, null);
        }
        if (req.getPassword() == null || req.getPassword().length() < 6) {
            return new AuthResponse(false, "Password must be at least 6 characters long", null, null);
        }

        if (userRepository.findByUsername(req.getUsername().trim()).isPresent()) {
            return new AuthResponse(false, "Username '" + req.getUsername() + "' is already taken", null, null);
        }
        if (userRepository.findByEmail(req.getEmail().trim()).isPresent()) {
            return new AuthResponse(false, "Email '" + req.getEmail() + "' is already registered", null, null);
        }

        Role assignedRole = req.getRole() != null ? req.getRole() : Role.USER;
        String fullName = req.getFullName() != null && !req.getFullName().trim().isEmpty() 
                ? req.getFullName().trim() 
                : req.getUsername().trim();

        User newUser = new User(
                null,
                req.getUsername().trim(),
                req.getEmail().trim(),
                req.getPassword(), // In production, hash with BCryptPasswordEncoder
                fullName,
                assignedRole
        );

        User saved = userRepository.save(newUser);
        String token = "jwt-mock-" + UUID.randomUUID();
        return new AuthResponse(true, "Registration successful!", token, saved);
    }

    public AuthResponse login(LoginRequest req) {
        if (req.getUsernameOrEmail() == null || req.getUsernameOrEmail().trim().isEmpty()
                || req.getPassword() == null || req.getPassword().trim().isEmpty()) {
            return new AuthResponse(false, "Please provide username/email and password", null, null);
        }

        Optional<User> userOpt = userRepository.findByUsernameOrEmail(req.getUsernameOrEmail().trim());
        if (userOpt.isEmpty()) {
            return new AuthResponse(false, "Invalid username or password", null, null);
        }

        User user = userOpt.get();
        if (!user.getPassword().equals(req.getPassword())) {
            return new AuthResponse(false, "Invalid username or password", null, null);
        }

        String token = "jwt-mock-" + UUID.randomUUID();
        return new AuthResponse(true, "Login successful!", token, user);
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
}
