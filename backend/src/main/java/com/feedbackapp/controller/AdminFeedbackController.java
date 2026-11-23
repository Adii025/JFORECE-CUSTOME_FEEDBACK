package com.feedbackapp.controller;

import com.feedbackapp.dto.AdminFeedbackUpdateRequest;
import com.feedbackapp.dto.DashboardStats;
import com.feedbackapp.model.Feedback;
import com.feedbackapp.service.FeedbackService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/feedback")
public class AdminFeedbackController {
    private final FeedbackService feedbackService;

    public AdminFeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    // Step 4: Admin Read all feedback with category, status, and search filters
    @GetMapping
    public ResponseEntity<List<Feedback>> getAllFeedback(
            @RequestParam(required = false, defaultValue = "ALL") String category,
            @RequestParam(required = false, defaultValue = "ALL") String status,
            @RequestParam(required = false, defaultValue = "") String search) {
        List<Feedback> list = feedbackService.getAllFeedbacks(category, status, search);
        return ResponseEntity.ok(list);
    }

    // Step 4: Admin Read single feedback by ID
    @GetMapping("/{id}")
    public ResponseEntity<Feedback> getFeedbackById(@PathVariable Long id) {
        try {
            Feedback f = feedbackService.getFeedbackById(id);
            return ResponseEntity.ok(f);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // Step 4: Admin Dashboard Stats summary
    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getStats() {
        return ResponseEntity.ok(feedbackService.getDashboardStats());
    }

    // Step 4: Admin Create Feedback
    @PostMapping
    public ResponseEntity<Feedback> createFeedback(@RequestBody Feedback feedback) {
        Feedback created = feedbackService.createAdminFeedback(feedback);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // Step 4: Admin Update Feedback (Modify content, rating, status, and add admin remarks)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateFeedback(@PathVariable Long id, @RequestBody AdminFeedbackUpdateRequest req) {
        try {
            Feedback updated = feedbackService.updateAdminFeedback(id, req);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // Step 4: Admin Delete Feedback
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFeedback(@PathVariable Long id) {
        boolean deleted = feedbackService.deleteFeedback(id);
        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Feedback not found with id " + id);
        }
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Feedback deleted successfully");
        resp.put("id", id);
        return ResponseEntity.ok(resp);
    }
}
