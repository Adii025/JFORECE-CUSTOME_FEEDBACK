-- ====================================================
-- PostgreSQL Database Initialization Script for FeedbackApp
-- Database: feedbackdb
-- ====================================================

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(20) NOT NULL
);

-- 2. Create Feedbacks Table
CREATE TABLE IF NOT EXISTS feedbacks (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    username VARCHAR(100) NOT NULL,
    user_full_name VARCHAR(150) NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comments TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    admin_remarks TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- 3. Seed ONLY Admin (All regular users removed so you can add yourself via Registration)
INSERT INTO users (username, email, password, full_name, role)
VALUES 
    ('admin', 'admin@feedback.com', 'admin123', 'System Administrator', 'ADMIN')
ON CONFLICT (username) DO NOTHING;
