package com.project.gradegoal.Controller;

import com.project.gradegoal.Entity.User;
import com.project.gradegoal.Service.UserService;
import com.project.gradegoal.Service.LoginStreakService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody UserRegistrationRequest request) {
        try {
            if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Password cannot be null or empty");
            }
            
            User createdUser = userService.createUser(
                request.getEmail(),
                request.getPassword(),
                request.getFirstName(),
                request.getLastName()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Registration failed: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody UserLoginRequest request) {
        try {
            User user = userService.authenticateUser(request.getEmail(), request.getPassword());
            if (user != null) {
                return ResponseEntity.ok(user);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Login failed");
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable Long userId) {
        try {
            Optional<User> user = userService.findById(userId);
            if (user.isPresent()) {
                return ResponseEntity.ok(user.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to fetch user");
        }
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<?> getUserByEmail(@PathVariable String email) {
        try {
            Optional<User> user = userService.findByEmail(email);
            if (user.isPresent()) {
                return ResponseEntity.ok(user.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to fetch user");
        }
    }
    
    @GetMapping("/{userId}/streak")
    public ResponseEntity<?> getUserLoginStreak(@PathVariable Long userId) {
        try {
            LoginStreakService.StreakInfo streakInfo = userService.getLoginStreakInfo(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("streakDays", streakInfo.getStreakDays());
            response.put("lastActivityDate", streakInfo.getLastActivityDate());
            response.put("isStreakActive", streakInfo.isStreakActive());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to fetch login streak");
        }
    }

    @PutMapping("/email/{email}/preferences")
    public ResponseEntity<?> updateUserPreferences(@PathVariable String email, @RequestBody UserPreferencesRequest request) {
        try {
            Optional<User> userOpt = userService.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }

            User user = userOpt.get();
            user.setEmailNotificationsEnabled(request.getEmailNotificationsEnabled());
            user.setPushNotificationsEnabled(request.getPushNotificationsEnabled());

            User updatedUser = userService.updateUser(user);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update preferences");
        }
    }

    @PutMapping("/{userId}/profile")
    public ResponseEntity<?> updateProfile(@PathVariable Long userId, @RequestBody ProfileUpdateRequest request) {
        try {
            System.out.println("Profile update request for userId: " + userId);
            System.out.println("Request data: firstName=" + request.getFirstName() + 
                             ", lastName=" + request.getLastName() + 
                             ", username=" + request.getUsername() +
                             ", profilePictureUrl=" + request.getProfilePictureUrl());
            
            User user;
            // Use comprehensive update method that includes year level and username
            System.out.println("Updating profile with all fields including year level: " + request.getCurrentYearLevel());
            user = userService.updateProfileComplete(
                userId,
                request.getFirstName(),
                request.getLastName(),
                request.getUsername(),
                request.getProfilePictureUrl(),
                request.getCurrentYearLevel()
            );
            
            System.out.println("Updated user profilePictureUrl: " + user.getProfilePictureUrl());
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            System.out.println("Profile update error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            System.out.println("Profile update exception: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Profile update failed");
        }
    }

    @PutMapping("/{userId}/password")
    public ResponseEntity<?> updatePassword(@PathVariable Long userId, @RequestBody PasswordUpdateRequest request) {
        try {
            boolean success = userService.updatePassword(
                userId,
                request.getCurrentPassword(),
                request.getNewPassword()
            );
            if (success) {
                return ResponseEntity.ok("Password updated successfully");
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid current password");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Password update failed");
        }
    }

    @PutMapping("/{userId}/notifications")
    public ResponseEntity<?> updateNotificationPreferences(@PathVariable Long userId, @RequestBody NotificationPreferencesRequest request) {
        try {
            User user = userService.updateNotificationPreferences(
                userId,
                request.getEmailNotificationsEnabled(),
                request.getPushNotificationsEnabled()
            );
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Notification preferences update failed");
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to fetch users");
        }
    }

    @GetMapping("/statistics")
    public ResponseEntity<?> getUserStatistics() {
        try {
            UserService.UserStatistics stats = userService.getUserStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to fetch statistics");
        }
    }

    @PostMapping("/google-signin")
    public ResponseEntity<?> googleSignIn(@RequestBody GoogleSignInRequest request) {
        try {

            Optional<User> existingUser = userService.getUserByEmail(request.getEmail());

            if (existingUser.isPresent()) {

                return ResponseEntity.ok(existingUser.get());
            } else {

                User newUser = userService.createGoogleUser(
                    request.getEmail(),
                    request.getFirstName(),
                    request.getLastName(),
                    request.getProfilePictureUrl()
                );
                return ResponseEntity.status(HttpStatus.CREATED).body(newUser);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Google sign in failed");
        }
    }

    @GetMapping("/username/{username}/available")
    public ResponseEntity<?> checkUsernameAvailability(@PathVariable String username) {
        try {
            boolean available = userService.isUsernameAvailable(username);
            return ResponseEntity.ok(new UsernameAvailabilityResponse(available));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to check username availability");
        }
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<?> getUserByUsername(@PathVariable String username) {
        try {
            Optional<User> user = userService.getUserByUsername(username);
            if (user.isPresent()) {
                return ResponseEntity.ok(user.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to fetch user");
        }
    }

    public static class UserRegistrationRequest {
        private String email;
        private String password;
        private String firstName;
        private String lastName;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
    }

    public static class UserLoginRequest {
        private String email;
        private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class ProfileUpdateRequest {
        private String firstName;
        private String lastName;
        private String username;
        private String profilePictureUrl;
        private String currentYearLevel;

        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getProfilePictureUrl() { return profilePictureUrl; }
        public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }
        public String getCurrentYearLevel() { return currentYearLevel; }
        public void setCurrentYearLevel(String currentYearLevel) { this.currentYearLevel = currentYearLevel; }
    }

    public static class PasswordUpdateRequest {
        private String currentPassword;
        private String newPassword;

        public String getCurrentPassword() { return currentPassword; }
        public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }

    public static class NotificationPreferencesRequest {
        private Boolean emailNotificationsEnabled;
        private Boolean pushNotificationsEnabled;

        public Boolean getEmailNotificationsEnabled() { return emailNotificationsEnabled; }
        public void setEmailNotificationsEnabled(Boolean emailNotificationsEnabled) { this.emailNotificationsEnabled = emailNotificationsEnabled; }
        public Boolean getPushNotificationsEnabled() { return pushNotificationsEnabled; }
        public void setPushNotificationsEnabled(Boolean pushNotificationsEnabled) { this.pushNotificationsEnabled = pushNotificationsEnabled; }
    }

    public static class GoogleSignInRequest {
        private String email;
        private String firstName;
        private String lastName;
        private String profilePictureUrl;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        public String getProfilePictureUrl() { return profilePictureUrl; }
        public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }
    }

    public static class UserPreferencesRequest {
        private Boolean emailNotificationsEnabled;
        private Boolean pushNotificationsEnabled;
        
        // Getters and setters
        public Boolean getEmailNotificationsEnabled() { return emailNotificationsEnabled; }
        public void setEmailNotificationsEnabled(Boolean emailNotificationsEnabled) { this.emailNotificationsEnabled = emailNotificationsEnabled; }
        public Boolean getPushNotificationsEnabled() { return pushNotificationsEnabled; }
        public void setPushNotificationsEnabled(Boolean pushNotificationsEnabled) { this.pushNotificationsEnabled = pushNotificationsEnabled; }
    }

    public static class UsernameAvailabilityResponse {
        private boolean available;

        public UsernameAvailabilityResponse(boolean available) {
            this.available = available;
        }

        public boolean isAvailable() { return available; }
        public void setAvailable(boolean available) { this.available = available; }
    }
}