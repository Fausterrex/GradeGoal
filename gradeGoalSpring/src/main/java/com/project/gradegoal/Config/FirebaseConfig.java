package com.project.gradegoal.Config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;

/**
 * Firebase Configuration
 * 
 * Configuration class for Firebase Admin SDK initialization.
 * Handles Firebase Cloud Messaging setup for push notifications.
 */
@Configuration
public class FirebaseConfig {
    
    private static final Logger logger = LoggerFactory.getLogger(FirebaseConfig.class);
    
    @Value("${firebase.project-id:}")
    private String projectId;
    
    @Value("${firebase.credentials.path:}")
    private String credentialsPath;
    
    @Value("${firebase.enabled:true}")
    private boolean firebaseEnabled;
    
    @PostConstruct
    public void initialize() {
        if (!firebaseEnabled) {
            logger.info("Firebase is disabled. Push notifications will not be available.");
            return;
        }
        
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                InputStream credentialsStream = getCredentialsStream();
                if (credentialsStream != null) {
                    FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(credentialsStream))
                        .setProjectId(projectId)
                        .build();
                    
                    FirebaseApp.initializeApp(options);
                    logger.info("Firebase Admin SDK initialized successfully");
                } else {
                    logger.warn("Firebase credentials not found. Push notifications will be disabled.");
                }
            } else {
                logger.info("Firebase Admin SDK already initialized");
            }
        } catch (Exception e) {
            logger.warn("Failed to initialize Firebase Admin SDK. Push notifications will be disabled.", e);
        }
    }
    
    @Bean
    public FirebaseMessaging firebaseMessaging() {
        try {
            if (!firebaseEnabled) {
                logger.info("Firebase is disabled. Returning null FirebaseMessaging bean.");
                return null;
            }
            
            if (FirebaseApp.getApps().isEmpty()) {
                logger.warn("Firebase not initialized. Push notifications will be disabled.");
                return null;
            }
            return FirebaseMessaging.getInstance();
        } catch (Exception e) {
            logger.warn("Failed to create FirebaseMessaging bean. Push notifications will be disabled.", e);
            return null;
        }
    }
    
    private InputStream getCredentialsStream() throws IOException {
        if (credentialsPath != null && !credentialsPath.isEmpty()) {
            // Try to load from classpath first
            try {
                return new ClassPathResource(credentialsPath).getInputStream();
            } catch (Exception e) {
                logger.warn("Could not load Firebase credentials from classpath: {}", credentialsPath);
            }
        }
        
        // Try to load from environment variable or default location
        String credentialsEnv = System.getenv("GOOGLE_APPLICATION_CREDENTIALS");
        if (credentialsEnv != null && !credentialsEnv.isEmpty()) {
            try {
                return new ClassPathResource(credentialsEnv).getInputStream();
            } catch (Exception e) {
                logger.warn("Could not load Firebase credentials from environment variable");
            }
        }
        
        // Try default service account key
        try {
            return new ClassPathResource("firebase-service-account.json").getInputStream();
        } catch (Exception e) {
            logger.warn("Could not load default Firebase service account key");
        }
        
        // If all else fails, try to use default credentials (for local development)
        logger.info("Using default Google Application Credentials");
        return null;
    }
}
