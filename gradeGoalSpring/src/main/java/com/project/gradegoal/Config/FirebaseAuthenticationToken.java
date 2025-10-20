package com.project.gradegoal.Config;

import com.google.firebase.auth.FirebaseToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collection;
import java.util.Collections;

/**
 * Firebase Authentication Token
 * Custom authentication token for Firebase users
 */
public class FirebaseAuthenticationToken extends UsernamePasswordAuthenticationToken {
    
    private final FirebaseToken firebaseToken;
    
    public FirebaseAuthenticationToken(FirebaseToken firebaseToken) {
        super(firebaseToken.getUid(), null, getAuthorities(firebaseToken));
        this.firebaseToken = firebaseToken;
    }
    
    private static Collection<? extends GrantedAuthority> getAuthorities(FirebaseToken firebaseToken) {
        // For now, all Firebase users get USER role
        // You can customize this based on custom claims in the token
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));
    }
    
    public FirebaseToken getFirebaseToken() {
        return firebaseToken;
    }
    
    public String getUid() {
        return firebaseToken.getUid();
    }
    
    public String getEmail() {
        return firebaseToken.getEmail();
    }
}
