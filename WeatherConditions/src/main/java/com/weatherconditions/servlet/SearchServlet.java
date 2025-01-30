package com.weatherconditions.servlet;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.weatherconditions.util.DBConnection;

@WebServlet("/api/searches/*")
public class SearchServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        String userId = request.getParameter("userId");

        if (userId == null || userId.trim().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write(gson.toJson("userId is required"));
            return;
        }

        try (Connection conn = DBConnection.getConnection()) {
            String sql = "SELECT search_query, timestamp FROM searches WHERE user_id = ? ORDER BY timestamp DESC";
            try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
                pstmt.setInt(1, Integer.parseInt(userId));
                ResultSet rs = pstmt.executeQuery();

                List<JsonObject> searches = new ArrayList<>();
                while (rs.next()) {
                    JsonObject search = new JsonObject();
                    search.addProperty("searchQuery", rs.getString("search_query"));
                    search.addProperty("timestamp", rs.getTimestamp("timestamp").toString());
                    searches.add(search);
                }

                response.getWriter().write(gson.toJson(searches));
            }
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write(gson.toJson("Database error occurred"));
            e.printStackTrace();
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        JsonObject jsonResponse = new JsonObject();

        try {
            JsonObject requestBody = gson.fromJson(request.getReader(), JsonObject.class);
            int userId = requestBody.get("userId").getAsInt();
            String searchQuery = requestBody.get("searchQuery").getAsString();

            try (Connection conn = DBConnection.getConnection()) {
                String sql = "INSERT INTO searches (user_id, search_query) VALUES (?, ?)";
                try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
                    pstmt.setInt(1, userId);
                    pstmt.setString(2, searchQuery);
                    
                    int affectedRows = pstmt.executeUpdate();
                    if (affectedRows > 0) {
                        jsonResponse.addProperty("success", true);
                        response.setStatus(HttpServletResponse.SC_OK);
                    } else {
                        throw new SQLException("Failed to save search");
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
