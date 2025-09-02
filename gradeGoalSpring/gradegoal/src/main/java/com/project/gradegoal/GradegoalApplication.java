package com.project.gradegoal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * GradeGoal Spring Boot Application
 * 
 * Main entry point for the GradeGoal backend application.
 * This class initializes the Spring Boot application context and starts
 * the embedded web server for handling API requests.
 * 
 * Key Features:
 * - Spring Boot auto-configuration for web applications
 * - Embedded Tomcat server for HTTP request handling
 * - Automatic component scanning and dependency injection
 * - RESTful API endpoint exposure
 * 
 * The application provides a comprehensive backend API for:
 * - User authentication and management
 * - Course creation and management
 * - Grade tracking and calculations
 * - Academic goal setting and tracking
 * - Category and assessment management
 * 
 * @author GradeGoal Development Team
 * @version 1.0.0
 * @since 2024
 */
@SpringBootApplication
public class GradegoalApplication {

    /**
     * Main method - Application entry point
     * 
     * Initializes the Spring application context and starts the embedded web server.
     * This method is called when the JAR file is executed or when running from an IDE.
     * 
     * @param args Command line arguments passed to the application
     */
    public static void main(String[] args) {
        // Start the Spring Boot application
        SpringApplication.run(GradegoalApplication.class, args);
    }
}
