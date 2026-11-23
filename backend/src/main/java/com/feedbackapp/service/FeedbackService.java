package com.feedbackapp.service;

import com.feedbackapp.dto.AdminFeedbackUpdateRequest;
import com.feedbackapp.dto.DashboardStats;
import com.feedbackapp.dto.FeedbackRequest;
import com.feedbackapp.model.Feedback;
import com.feedbackapp.model.User;
import com.feedbackapp.repository.FeedbackRepository;
import com.feedbackapp.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class FeedbackService {
    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;

    public FeedbackService(FeedbackRepository feedbackRepository, UserRepository userRepository) {
        this.feedbackRepository = feedbackRepository;
        this.userRepository = userRepository;
    }

    // Step 1 & Step 3: Get all feedback submitted by this user (by ID or Username)
    public List<Feedback> getFeedbackByUser(Long userId) {
        return feedbackRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Feedback> getFeedbackByUsername(String username) {
        return feedbackRepository.findByUsernameOrderByCreatedAtDesc(username);
    }

    // Step 3: Add new feedback (persists directly into PostgreSQL feedbacks table)
    public Feedback createFeedback(Long userId, FeedbackRequest req) {
        Optional<User> userOpt = Optional.empty();
        if (userId != null) {
            userOpt = userRepository.findById(userId);
        }
        if (userOpt.isEmpty() && req.getUsername() != null && !req.getUsername().trim().isEmpty()) {
            userOpt = userRepository.findByUsername(req.getUsername().trim());
        }

        Feedback feedback = new Feedback();
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            feedback.setUserId(user.getId());
            feedback.setUsername(user.getUsername());
            feedback.setUserFullName(user.getFullName());
        } else {
            feedback.setUserId(userId != null ? userId : 0L);
            feedback.setUsername(req.getUsername() != null && !req.getUsername().trim().isEmpty() ? req.getUsername() : "User");
            feedback.setUserFullName(req.getUserFullName() != null && !req.getUserFullName().trim().isEmpty() ? req.getUserFullName() : feedback.getUsername());
        }

        feedback.setTitle(req.getTitle());
        feedback.setCategory(req.getCategory() != null ? req.getCategory() : "General");
        feedback.setRating(req.getRating() != null ? req.getRating() : 5);
        feedback.setComments(req.getComments());
        feedback.setStatus("PENDING");
        return feedbackRepository.save(feedback);
    }

    // Step 1 & Step 3: User edits their previously submitted feedback
    public Feedback updateFeedback(Long userId, Long feedbackId, FeedbackRequest req) {
        Feedback existing = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new IllegalArgumentException("Feedback not found with id: " + feedbackId));

        if (req.getTitle() != null && !req.getTitle().trim().isEmpty()) {
            existing.setTitle(req.getTitle().trim());
        }
        if (req.getCategory() != null) {
            existing.setCategory(req.getCategory());
        }
        if (req.getRating() != null) {
            existing.setRating(req.getRating());
        }
        if (req.getComments() != null) {
            existing.setComments(req.getComments());
        }

        return feedbackRepository.save(existing);
    }

    // Step 4: Admin CRUD - Read All with Search & Filters
    public List<Feedback> getAllFeedbacks(String category, String status, String search) {
        List<Feedback> all = feedbackRepository.findAllByOrderByCreatedAtDesc();

        return all.stream()
                .filter(f -> category == null || category.equalsIgnoreCase("ALL") || f.getCategory().equalsIgnoreCase(category))
                .filter(f -> status == null || status.equalsIgnoreCase("ALL") || f.getStatus().equalsIgnoreCase(status))
                .filter(f -> {
                    if (search == null || search.trim().isEmpty()) return true;
                    String q = search.toLowerCase();
                    return (f.getTitle() != null && f.getTitle().toLowerCase().contains(q))
                            || (f.getComments() != null && f.getComments().toLowerCase().contains(q))
                            || (f.getUserFullName() != null && f.getUserFullName().toLowerCase().contains(q))
                            || (f.getUsername() != null && f.getUsername().toLowerCase().contains(q));
                })
                .collect(Collectors.toList());
    }

    public Feedback getFeedbackById(Long id) {
        return feedbackRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Feedback not found with id: " + id));
    }

    // Step 4: Admin Create
    public Feedback createAdminFeedback(Feedback feedback) {
        if (feedback.getUserId() != null) {
            userRepository.findById(feedback.getUserId()).ifPresent(u -> {
                feedback.setUsername(u.getUsername());
                feedback.setUserFullName(u.getFullName());
            });
        }
        if (feedback.getStatus() == null) feedback.setStatus("PENDING");
        return feedbackRepository.save(feedback);
    }

    // Step 4: Admin Update (Full control over title, category, rating, comments, status, adminRemarks)
    public Feedback updateAdminFeedback(Long id, AdminFeedbackUpdateRequest req) {
        Feedback existing = feedbackRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Feedback not found with id: " + id));

        if (req.getTitle() != null) existing.setTitle(req.getTitle());
        if (req.getCategory() != null) existing.setCategory(req.getCategory());
        if (req.getRating() != null) existing.setRating(req.getRating());
        if (req.getComments() != null) existing.setComments(req.getComments());
        if (req.getStatus() != null) existing.setStatus(req.getStatus());
        if (req.getAdminRemarks() != null) existing.setAdminRemarks(req.getAdminRemarks());

        return feedbackRepository.save(existing);
    }

    // Step 4: Admin Delete
    public boolean deleteFeedback(Long id) {
        if (feedbackRepository.existsById(id)) {
            feedbackRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // Step 4: Admin Dashboard Stats
    public DashboardStats getDashboardStats() {
        List<Feedback> all = feedbackRepository.findAllByOrderByCreatedAtDesc();
        long total = all.size();
        double avgRating = all.isEmpty() ? 0.0 : all.stream().mapToInt(Feedback::getRating).average().orElse(0.0);
        long pending = all.stream().filter(f -> "PENDING".equalsIgnoreCase(f.getStatus())).count();
        long inReview = all.stream().filter(f -> "IN_REVIEW".equalsIgnoreCase(f.getStatus())).count();
        long resolved = all.stream().filter(f -> "RESOLVED".equalsIgnoreCase(f.getStatus())).count();
        long rejected = all.stream().filter(f -> "REJECTED".equalsIgnoreCase(f.getStatus())).count();

        Map<String, Long> categoryCounts = all.stream()
                .collect(Collectors.groupingBy(Feedback::getCategory, Collectors.counting()));

        return new DashboardStats(total, Math.round(avgRating * 10.0) / 10.0, pending, inReview, resolved, rejected, categoryCounts);
    }
}
