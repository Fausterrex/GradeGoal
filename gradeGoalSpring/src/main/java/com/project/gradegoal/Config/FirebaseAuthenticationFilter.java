package com.project.gradegoal.Config;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Firebase Authentication Filter
 * Verifies Firebase ID tokens and sets authentication context
 */
@Component
public class FirebaseAuthenticationFilter extends OncePerRequestFilter {
    
    @Autowired
    private FirebaseAuth firebaseAuth;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                   FilterChain filterChain) throws ServletException, IOException {
        
        String authToken = request.getHeader("Authorization");
        
        if (authToken != null && authToken.startsWith("Bearer ")) {
            try {
                String token = authToken.substring(7);
                FirebaseToken decodedToken = firebaseAuth.verifyIdToken(token);
                
                // Create authentication object
                FirebaseAuthenticationToken authentication = new FirebaseAuthenticationToken(decodedToken);
                SecurityContextHolder.getContext().setAuthentication(authentication);
                
            } catch (FirebaseAuthException e) {
                logger.error("Firebase token verification failed: " + e.getMessage());
                // Continue without authentication - let other filters handle it
            }
        }
        
        filterChain.doFilter(request, response);
    }
}
