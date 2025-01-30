package com.weatherconditions.servlet;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.weatherconditions.util.DBConnection;

@WebServlet("/api/register")
public class RegisterServlet extends HttpServlet {
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

            try (Connection conn = DBConnection.getConnection()) {
                // Check if username already exists
                String checkSql = "SELECT COUNT(*) FROM users WHERE username = ?";
                try (PreparedStatement checkStmt = conn.prepareStatement(checkSql)) {
                    checkStmt.setString(1, username);
                    ResultSet rs = checkStmt.executeQuery();
                    rs.next();
                    if (rs.getInt(1) > 0) {
                        jsonResponse.addProperty("success", false);
                        jsonResponse.addProperty("message", "Username already exists");
                        response.setStatus(HttpServletResponse.SC_CONFLICT);
                        response.getWriter().write(gson.toJson(jsonResponse));
                        return;
                    }
                }

                // Insert new user
                String insertSql = "INSERT INTO users (username, password) VALUES (?, ?)";
                try (PreparedStatement pstmt = conn.prepareStatement(insertSql, Statement.RETURN_GENERATED_KEYS)) {
                    pstmt.setString(1, username);
                    pstmt.setString(2, password); // In real app, use password hashing

                    int affectedRows = pstmt.executeUpdate();
                    if (affectedRows > 0) {
                        // Get the generated user ID
                        ResultSet generatedKeys = pstmt.getGeneratedKeys();
                        if (generatedKeys.next()) {
                            jsonResponse.addProperty("success", true);
                            jsonResponse.addProperty("userId", generatedKeys.getInt(1));
                            jsonResponse.addProperty("username", username);
                            response.setStatus(HttpServletResponse.SC_OK);
                        }
                    }
                }
            }
        } catch (SQLException e) {
            jsonResponse.addProperty("success", false);
            jsonResponse.addProperty("message", "Database error occurred");
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            e.printStackTrace();
        } catch (Exception e) {
            jsonResponse.addProperty("success", false);
            jsonResponse.addProperty("message", e.getMessage());
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        }

        response.getWriter().write(gson.toJson(jsonResponse));
    }
}