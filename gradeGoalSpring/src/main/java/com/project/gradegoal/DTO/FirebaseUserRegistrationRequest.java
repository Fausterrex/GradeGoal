package com.project.gradegoal.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Firebase User Registration Request DTO
 * Request object for Firebase-based user registration
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FirebaseUserRegistrationRequest {
    private String firebaseUid;
    private String email;
    private String firstName;
    private String lastName;
}
