-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create sellers table
CREATE TABLE sellers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    video_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2),
    is_viral BOOLEAN DEFAULT FALSE,
    viral_reason TEXT,
    tiktok_url TEXT,
    last_scraped TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create users table for authentication
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX idx_sellers_followers ON sellers(followers_count);
CREATE INDEX idx_sellers_engagement ON sellers(engagement_rate);
CREATE INDEX idx_sellers_viral ON sellers(is_viral);

-- Enable Row Level Security
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read access for authenticated users"
ON sellers FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow insert for service role"
ON sellers FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Insert default user (password: admin123)
INSERT INTO users (email, password_hash)
VALUES ('admin@dashboard.com', '$2a$10$YourHashedPasswordHere');