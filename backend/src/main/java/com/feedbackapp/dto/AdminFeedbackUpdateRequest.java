package com.feedbackapp.dto;

public class AdminFeedbackUpdateRequest {
    private String title;
    private String category;
    private Integer rating;
    private String comments;
    private String status;       // PENDING, IN_REVIEW, RESOLVED, REJECTED
    private String adminRemarks;

    public AdminFeedbackUpdateRequest() {}

    public AdminFeedbackUpdateRequest(String title, String category, Integer rating, 
                                      String comments, String status, String adminRemarks) {
        this.title = title;
        this.category = category;
        this.rating = rating;
        this.comments = comments;
        this.status = status;
        this.adminRemarks = adminRemarks;
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAdminRemarks() { return adminRemarks; }
    public void setAdminRemarks(String adminRemarks) { this.adminRemarks = adminRemarks; }
}
