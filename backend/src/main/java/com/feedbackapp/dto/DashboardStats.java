package com.feedbackapp.dto;

import java.util.Map;

public class DashboardStats {
    private long totalFeedbacks;
    private double averageRating;
    private long pendingCount;
    private long inReviewCount;
    private long resolvedCount;
    private long rejectedCount;
    private Map<String, Long> categoryCounts;

    public DashboardStats() {}

    public DashboardStats(long totalFeedbacks, double averageRating, long pendingCount, 
                          long inReviewCount, long resolvedCount, long rejectedCount, 
                          Map<String, Long> categoryCounts) {
        this.totalFeedbacks = totalFeedbacks;
        this.averageRating = averageRating;
        this.pendingCount = pendingCount;
        this.inReviewCount = inReviewCount;
        this.resolvedCount = resolvedCount;
        this.rejectedCount = rejectedCount;
        this.categoryCounts = categoryCounts;
    }

    public long getTotalFeedbacks() { return totalFeedbacks; }
    public void setTotalFeedbacks(long totalFeedbacks) { this.totalFeedbacks = totalFeedbacks; }

    public double getAverageRating() { return averageRating; }
    public void setAverageRating(double averageRating) { this.averageRating = averageRating; }

    public long getPendingCount() { return pendingCount; }
    public void setPendingCount(long pendingCount) { this.pendingCount = pendingCount; }

    public long getInReviewCount() { return inReviewCount; }
    public void setInReviewCount(long inReviewCount) { this.inReviewCount = inReviewCount; }

    public long getResolvedCount() { return resolvedCount; }
    public void setResolvedCount(long resolvedCount) { this.resolvedCount = resolvedCount; }

    public long getRejectedCount() { return rejectedCount; }
    public void setRejectedCount(long rejectedCount) { this.rejectedCount = rejectedCount; }

    public Map<String, Long> getCategoryCounts() { return categoryCounts; }
    public void setCategoryCounts(Map<String, Long> categoryCounts) { this.categoryCounts = categoryCounts; }
}
