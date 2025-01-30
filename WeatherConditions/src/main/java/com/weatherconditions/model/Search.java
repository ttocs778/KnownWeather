package com.weatherconditions.model;

import java.sql.Timestamp;

public class Search {
    private int searchId;
    private int userId;
    private String searchQuery;
    private Timestamp timestamp;

    // Default constructor
    public Search() {}

    // Constructor for new search creation
    public Search(int userId, String searchQuery) {
        this.userId = userId;
        this.searchQuery = searchQuery;
    }

    // Getters and Setters
    public int getSearchId() {
        return searchId;
    }

    public void setSearchId(int searchId) {
        this.searchId = searchId;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public String getSearchQuery() {
        return searchQuery;
    }

    public void setSearchQuery(String searchQuery) {
        this.searchQuery = searchQuery;
    }

    public Timestamp getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Timestamp timestamp) {
        this.timestamp = timestamp;
    }
}