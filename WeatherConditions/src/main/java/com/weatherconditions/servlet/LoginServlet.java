package com.weatherconditions.servlet;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.weatherconditions.util.DBConnection;

@WebServlet("/api/login")
public class LoginServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private final Gson gson = new Gson();
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        JsonObject jsonResponse = new JsonObject();

        try {
            // Parse request body
            JsonObject requestBody = gson.fromJson(request.getReader(), JsonObject.class);
            String username = requestBody.get("username").getAsString();
            String password = requestBody.get("password").getAsString();

            // Validate input
            if (username == null || username.trim().isEmpty() || 
                password == null || password.trim().isEmpty()) {
                throw new IllegalArgumentException("Username and password are required");
            }

            // Check credentials in database
            try (Connection conn = DBConnection.getConnection()) {
                String sql = "SELECT user_id, username FROM users WHERE username = ? AND password = ?";
                try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
                    pstmt.setString(1, username);
                    pstmt.setString(2, password); // In real app, use password hashing

                    ResultSet rs = pstmt.executeQuery();
                    if (rs.next()) {
                        // Login successful
                        jsonResponse.addProperty("success", true);
                        jsonResponse.addProperty("userId", rs.getInt("user_id"));
                        jsonResponse.addProperty("username", rs.getString("username"));
                        response.setStatus(HttpServletResponse.SC_OK);
                    } else {
                        // Login failed
                        jsonResponse.addProperty("success", false);
                        jsonResponse.addProperty("message", "Invalid username or password");
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    }
                }
            }
        } catch (SQLException e) {
            // Database error
            jsonResponse.addProperty("success", false);
            jsonResponse.addProperty("message", "Database error occurred");
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            e.printStackTrace();
        } catch (Exception e) {
            // Other errors
            jsonResponse.addProperty("success", false);
            jsonResponse.addProperty("message", e.getMessage());
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        }

        response.getWriter().write(gson.toJson(jsonResponse));
    }
}
