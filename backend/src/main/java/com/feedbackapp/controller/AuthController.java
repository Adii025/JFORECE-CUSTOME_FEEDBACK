package com.feedbackapp.controller;

import com.feedbackapp.dto.AuthResponse;
import com.feedbackapp.dto.LoginRequest;
import com.feedbackapp.dto.RegisterRequest;
import com.feedbackapp.repository.UserRepository;
import com.feedbackapp.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    // Step 2: User Registration
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        if (!response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Step 1: User / Admin Login
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        if (!response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        return ResponseEntity.ok(response);
    }

    // Helper: Demo accounts list for quick testing
    @GetMapping("/demo-users")
    public ResponseEntity<Map<String, Object>> getDemoUsers() {
        List<Map<String, String>> users = userRepository.findAll().stream().map(u -> {
            Map<String, String> m = new HashMap<>();
            m.put("username", u.getUsername());
            m.put("password", u.getPassword());
            m.put("role", u.getRole().name());
            m.put("fullName", u.getFullName());
            return m;
        }).collect(Collectors.toList());

        Map<String, Object> resp = new HashMap<>();
        resp.put("status", "UP");
        resp.put("system", "Feedback Management System");
        resp.put("availableDemoAccounts", users);
        return ResponseEntity.ok(resp);
    }
}
