package com.project.gradegoal.Config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.io.InputStream;

/**
 * Firebase Configuration for Spring Boot Backend
 * Configures Firebase Admin SDK for token verification
 */
@Configuration
public class FirebaseConfig {
    
    @Bean
    public FirebaseAuth firebaseAuth() throws IOException {
        // Load Firebase service account from resources
        ClassPathResource resource = new ClassPathResource("firebase-service-account.json");
        InputStream serviceAccountStream = resource.getInputStream();
        
        // Initialize Firebase Admin SDK with service account
        FirebaseOptions options = FirebaseOptions.builder()
            .setCredentials(GoogleCredentials.fromStream(serviceAccountStream))
            .build();
        
        if (FirebaseApp.getApps().isEmpty()) {
            FirebaseApp.initializeApp(options);
        }
        
        return FirebaseAuth.getInstance();
    }
}