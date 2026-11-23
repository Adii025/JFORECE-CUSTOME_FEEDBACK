package com.feedbackapp.dto;

public class FeedbackRequest {
    private Long userId;
    private String username;
    private String userFullName;
    private String title;
    private String category;
    private Integer rating;
    private String comments;

    public FeedbackRequest() {}

    public FeedbackRequest(Long userId, String username, String userFullName, String title, String category, Integer rating, String comments) {
        this.userId = userId;
        this.username = username;
        this.userFullName = userFullName;
        this.title = title;
        this.category = category;
        this.rating = rating;
        this.comments = comments;
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getUserFullName() { return userFullName; }
    public void setUserFullName(String userFullName) { this.userFullName = userFullName; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
}
