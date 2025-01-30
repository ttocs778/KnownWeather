package com.weatherconditions.model;

public class User {
    private int userId;
    private String username;
    private String password;

    // Default constructor
    public User() {}

    // Constructor for new user creation
    public User(String username, String password) {
        this.username = username;
        this.password = password;
    }

    // Getters and Setters
    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}