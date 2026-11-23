package com.feedbackapp.dto;

import com.feedbackapp.model.User;

public class AuthResponse {
    private boolean success;
    private String message;
    private String token;
    private UserDto user;

    public AuthResponse() {}

    public AuthResponse(boolean success, String message, String token, User user) {
        this.success = success;
        this.message = message;
        this.token = token;
        if (user != null) {
            this.user = new UserDto(user.getId(), user.getUsername(), user.getEmail(), user.getFullName(), user.getRole().name());
        }
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public UserDto getUser() { return user; }
    public void setUser(UserDto user) { this.user = user; }

    public static class UserDto {
        private Long id;
        private String username;
        private String email;
        private String fullName;
        private String role;

        public UserDto(Long id, String username, String email, String fullName, String role) {
            this.id = id;
            this.username = username;
            this.email = email;
            this.fullName = fullName;
            this.role = role;
        }

        public Long getId() { return id; }
        public String getUsername() { return username; }
        public String getEmail() { return email; }
        public String getFullName() { return fullName; }
        public String getRole() { return role; }
    }
}
