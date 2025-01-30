package com.weatherconditions.servlet;

import java.io.IOException;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

@WebServlet("/api/weather/*")
public class WeatherServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private static final String API_KEY = "3874e236f9d0a62346304e5868c809ac";
    private static final String WEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
    private static final String GEO_BASE_URL = "http://api.openweathermap.org/geo/1.0/direct";
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        String pathInfo = request.getPathInfo();
        
        try {
            if ("/city".equals(pathInfo)) {
                String city = request.getParameter("q");
                if (city == null || city.trim().isEmpty()) {
                    throw new IllegalArgumentException("City parameter is required");
                }
                
                // First get coordinates for the city
                String geoUrl = String.format("%s?q=%s&limit=5&appid=%s",
                    GEO_BASE_URL,
                    URLEncoder.encode(city, StandardCharsets.UTF_8.toString()),
                    API_KEY);
                
                String geoResponse = fetchUrl(geoUrl);
                response.getWriter().write(geoResponse);

            } else if ("/coords".equals(pathInfo)) {
                String lat = request.getParameter("lat");
                String lon = request.getParameter("lon");
                
                if (lat == null || lon == null) {
                    throw new IllegalArgumentException("Both latitude and longitude are required");
                }

                String weatherUrl = String.format("%s?lat=%s&lon=%s&appid=%s",
                    WEATHER_BASE_URL,
                    lat,
                    lon,
                    API_KEY);
                
                String weatherResponse = fetchUrl(weatherUrl);
                response.getWriter().write(weatherResponse);
            } else {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write(gson.toJson("Invalid request path"));
            }
        } catch (IllegalArgumentException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write(gson.toJson(e.getMessage()));
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write(gson.toJson("Error fetching weather data"));
            e.printStackTrace();
        }
    }

    private String fetchUrl(String urlString) throws IOException {
        URL url = new URL(urlString);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        
        StringBuilder response = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(conn.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                response.append(line);
            }
        }
        
        return response.toString();
    }
}