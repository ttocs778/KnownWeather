-- Create the database
CREATE DATABASE IF NOT EXISTS WeatherConditions;
USE WeatherConditions;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- Create searches table
CREATE TABLE IF NOT EXISTS searches (
    search_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    search_query VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Add indexes for better performance
CREATE INDEX idx_username ON users(username);
CREATE INDEX idx_user_searches ON searches(user_id);
CREATE INDEX idx_timestamp ON searches(timestamp);