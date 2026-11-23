package com.feedbackapp.controller;

import com.feedbackapp.dto.FeedbackRequest;
import com.feedbackapp.model.Feedback;
import com.feedbackapp.service.FeedbackService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {
    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    // Step 1 & Step 3: Get all previously submitted feedback for a user
    @GetMapping("/my-feedback")
    public ResponseEntity<List<Feedback>> getMyFeedback(@RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
                                                        @RequestParam(value = "userId", required = false) Long queryUserId,
                                                        @RequestParam(value = "username", required = false) String username) {
        Long userId = headerUserId != null ? headerUserId : queryUserId;
        if (userId != null && userId > 0) {
            return ResponseEntity.ok(feedbackService.getFeedbackByUser(userId));
        }
        if (username != null && !username.trim().isEmpty()) {
            return ResponseEntity.ok(feedbackService.getFeedbackByUsername(username.trim()));
        }
        return ResponseEntity.ok(Collections.emptyList());
    }

    // Step 3: Add new feedback (persists directly into PostgreSQL database)
    @PostMapping
    public ResponseEntity<?> submitFeedback(@RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
                                            @RequestParam(value = "userId", required = false) Long queryUserId,
                                            @RequestBody FeedbackRequest request) {
        Long userId = headerUserId != null ? headerUserId : (queryUserId != null ? queryUserId : request.getUserId());
        try {
            Feedback created = feedbackService.createFeedback(userId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // Step 1 & Step 3: Edit previously submitted feedback
    @PutMapping("/{id}")
    public ResponseEntity<?> editFeedback(@PathVariable("id") Long feedbackId,
                                          @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
                                          @RequestParam(value = "userId", required = false) Long queryUserId,
                                          @RequestBody FeedbackRequest request) {
        Long userId = headerUserId != null ? headerUserId : (queryUserId != null ? queryUserId : request.getUserId());
        try {
            Feedback updated = feedbackService.updateFeedback(userId, feedbackId, request);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
