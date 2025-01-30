package com.weatherconditions.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;
import java.io.InputStream;
import java.io.IOException;

public class DBConnection {
    private static final String CONFIG_FILE = "/db.properties";
    private static Properties props = new Properties();
    
    // Load database properties from configuration file
    static {
        try (InputStream input = DBConnection.class.getResourceAsStream(CONFIG_FILE)) {
            if (input == null) {
                // If config file is not found, use default values
                props.setProperty("db.url", "jdbc:mysql://localhost:3306/WeatherConditions");
                props.setProperty("db.user", "root");
                props.setProperty("db.password", "Tangrui2004!");
                props.setProperty("db.driver", "com.mysql.cj.jdbc.Driver");
            } else {
                props.load(input);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    
    /**
     * Get a connection to the database
     * @return Connection object
     * @throws SQLException if a database access error occurs
     */
    public static Connection getConnection() throws SQLException {
        try {
            // Register JDBC driver
            Class.forName(props.getProperty("db.driver"));
            
            // Create connection
            return DriverManager.getConnection(
                props.getProperty("db.url"),
                props.getProperty("db.user"),
                props.getProperty("db.password")
            );
        } catch (ClassNotFoundException e) {
            throw new SQLException("Database driver not found", e);
        }
    }
    
    /**
     * Test the database connection
     * @return true if connection is successful, false otherwise
     */
    public static boolean testConnection() {
        try (Connection conn = getConnection()) {
            return conn != null && !conn.isClosed();
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
    
    /**
     * Close the database connection
     * @param conn Connection to close
     */
    public static void closeConnection(Connection conn) {
        if (conn != null) {
            try {
                conn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
}
