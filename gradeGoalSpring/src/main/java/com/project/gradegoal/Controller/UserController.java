package com.project.gradegoal.Controller;

import com.project.gradegoal.Entity.User;
import com.project.gradegoal.Repository.UserRepository;
import com.project.gradegoal.Service.UserService;
import com.project.gradegoal.Service.LoginStreakService;
import com.project.gradegoal.DTO.FirebaseUserRegistrationRequest;
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
    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register-firebase")
    public ResponseEntity<?> registerUserWithFirebase(@RequestBody FirebaseUserRegistrationRequest request) {
        try {
            // Basic input validation
            if (request.getFirebaseUid() == null || request.getFirebaseUid().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Firebase UID is required");
            }
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email is required");
            }
            if (request.getFirstName() == null || request.getFirstName().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("First name is required");
            }
            if (request.getLastName() == null || request.getLastName().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Last name is required");
            }

            // Check if user already exists with this Firebase UID
            if (userRepository.existsByFirebaseUid(request.getFirebaseUid())) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("User with this Firebase UID already exists");
            }

            // Check if user already exists with this email
            if (userRepository.existsByEmail(request.getEmail())) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("User with this email already exists");
            }

            User user = userService.createUserWithFirebaseUid(
                request.getFirebaseUid(),
                request.getEmail(),
                request.getFirstName(),
                request.getLastName()
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(user);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Registration failed: " + e.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody UserRegistrationRequest request) {
        try {
            // Basic input validation
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email is required");
            }
            if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Password is required");
            }
            if (request.getPassword().length() < 6) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Password must be at least 6 characters");
            }
            if (request.getFirstName() == null || request.getFirstName().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("First name is required");
            }
            if (request.getLastName() == null || request.getLastName().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Last name is required");
            }
            
            // Basic email format validation
            if (!request.getEmail().contains("@") || !request.getEmail().contains(".")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Please enter a valid email address");
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
            // Basic input validation
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email is required");
            }
            if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Password is required");
            }
            if (request.getPassword().length() < 6) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Password must be at least 6 characters");
            }
            
            // Basic email format validation
            if (!request.getEmail().contains("@") || !request.getEmail().contains(".")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Please enter a valid email address");
            }

            User user = userService.authenticateUser(request.getEmail(), request.getPassword());

            if (user != null) {
                if (user.getIsActive() != null && !user.getIsActive()) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body("This account has been frozen by an administrator.");
                }

                return ResponseEntity.ok(user);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Login failed");
        }
    }

    @PutMapping("/freeze/{id}")
    public ResponseEntity<?> freezeUserAccount(@PathVariable Long id, @RequestParam boolean freeze) {
        return userRepository.findById(id).map(user -> {
            user.setIsActive(!freeze); // if freeze=true → set false (frozen)
            userRepository.save(user);

            String status = freeze ? "frozen" : "unfrozen";
            return ResponseEntity.ok(Map.of(
                    "message", "User account has been " + status,
                    "userId", user.getUserId(),
                    "isActive", user.getIsActive()
            ));
        }).orElse(ResponseEntity.notFound().build());
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

    @GetMapping("/firebase-uid/{firebaseUid}")
    public ResponseEntity<?> getUserByFirebaseUid(@PathVariable String firebaseUid) {
        try {
            Optional<User> user = userService.findByFirebaseUid(firebaseUid);
            if (user.isPresent()) {
                return ResponseEntity.ok(user.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching user: " + e.getMessage());
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

    @PostMapping("/{userId}/update-login-streak")
    public ResponseEntity<?> updateUserLoginStreak(@PathVariable Long userId) {
        try {
            LoginStreakService.StreakInfo streakInfo = userService.updateLoginStreak(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("streakDays", streakInfo.getStreakDays());
            response.put("lastActivityDate", streakInfo.getLastActivityDate());
            response.put("isStreakActive", streakInfo.isStreakActive());
            response.put("message", "Login streak updated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update login streak: " + e.getMessage());
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

            User user;
            // Use comprehensive update method that includes year level and username
            user = userService.updateProfileComplete(
                    userId,
                    request.getFirstName(),
                    request.getLastName(),
                    request.getUsername(),
                    request.getProfilePictureUrl(),
                    request.getCurrentYearLevel()
            );

            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
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
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Google sign in failed");
        }
    }

    @GetMapping("/username/{username}/available")
    public ResponseEntity<?> checkUsernameAvailability(@PathVariable String username) {
        try {
            boolean available = userService.isUsernameAvailable(username);
            return ResponseEntity.ok(new UsernameAvailabilityResponse(available));
        } catch (Exception e) {
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
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to fetch user");
        }
    }

    // ========================================
    // ADMIN ENDPOINTS
    // ========================================

    @PutMapping("/{userId}/status")
    public ResponseEntity<?> updateUserAccountStatus(@PathVariable Long userId, @RequestBody Map<String, Boolean> request) {
        try {
            Boolean isActive = request.get("isActive");
            if (isActive == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("isActive field is required");
            }

            User updatedUser = userService.updateUserAccountStatus(userId, isActive);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update account status");
        }
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        try {
            boolean deleted = userService.deleteUser(userId);
            if (deleted) {
                return ResponseEntity.ok("User deleted successfully");
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete user");
        }
    }

    @PutMapping("/profile/{id}")
    public ResponseEntity<?> updateUserProfile(
            @PathVariable Long id,
            @RequestBody Map<String, Object> updates) {

        return userRepository.findById(id).map(user -> {
            if (updates.containsKey("firstName")) {
                user.setFirstName((String) updates.get("firstName"));
            }
            if (updates.containsKey("lastName")) {
                user.setLastName((String) updates.get("lastName"));
            }
            if (updates.containsKey("profilePictureUrl")) {
                user.setProfilePictureUrl((String) updates.get("profilePictureUrl"));
            }
            if (updates.containsKey("currentYearLevel")) {
                user.setCurrentYearLevel((String) updates.get("currentYearLevel"));
            }

            userRepository.save(user);
            return ResponseEntity.ok(user);
        }).orElse(ResponseEntity.notFound().build());
    }


    public static class UserRegistrationRequest {
        private String email;
        private String password;
        private String firstName;
        private String lastName;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public String getFirstName() {
            return firstName;
        }

        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public void setLastName(String lastName) {
            this.lastName = lastName;
        }
    }

    public static class UserLoginRequest {
        private String email; // Can be either email or username
        private String password;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    public static class ProfileUpdateRequest {
        private String firstName;
        private String lastName;
        private String username;
        private String profilePictureUrl;
        private String currentYearLevel;

        public String getFirstName() {
            return firstName;
        }

        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public void setLastName(String lastName) {
            this.lastName = lastName;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getProfilePictureUrl() {
            return profilePictureUrl;
        }

        public void setProfilePictureUrl(String profilePictureUrl) {
            this.profilePictureUrl = profilePictureUrl;
        }

        public String getCurrentYearLevel() {
            return currentYearLevel;
        }

        public void setCurrentYearLevel(String currentYearLevel) {
            this.currentYearLevel = currentYearLevel;
        }
    }

    public static class PasswordUpdateRequest {
        private String currentPassword;
        private String newPassword;

        public String getCurrentPassword() {
            return currentPassword;
        }

        public void setCurrentPassword(String currentPassword) {
            this.currentPassword = currentPassword;
        }

        public String getNewPassword() {
            return newPassword;
        }

        public void setNewPassword(String newPassword) {
            this.newPassword = newPassword;
        }
    }

    public static class NotificationPreferencesRequest {
        private Boolean emailNotificationsEnabled;
        private Boolean pushNotificationsEnabled;

        public Boolean getEmailNotificationsEnabled() {
            return emailNotificationsEnabled;
        }

        public void setEmailNotificationsEnabled(Boolean emailNotificationsEnabled) {
            this.emailNotificationsEnabled = emailNotificationsEnabled;
        }

        public Boolean getPushNotificationsEnabled() {
            return pushNotificationsEnabled;
        }

        public void setPushNotificationsEnabled(Boolean pushNotificationsEnabled) {
            this.pushNotificationsEnabled = pushNotificationsEnabled;
        }
    }

    public static class GoogleSignInRequest {
        private String email;
        private String firstName;
        private String lastName;
        private String profilePictureUrl;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getFirstName() {
            return firstName;
        }

        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public void setLastName(String lastName) {
            this.lastName = lastName;
        }

        public String getProfilePictureUrl() {
            return profilePictureUrl;
        }

        public void setProfilePictureUrl(String profilePictureUrl) {
            this.profilePictureUrl = profilePictureUrl;
        }
    }

    public static class UserPreferencesRequest {
        private Boolean emailNotificationsEnabled;
        private Boolean pushNotificationsEnabled;

        // Getters and setters
        public Boolean getEmailNotificationsEnabled() {
            return emailNotificationsEnabled;
        }

        public void setEmailNotificationsEnabled(Boolean emailNotificationsEnabled) {
            this.emailNotificationsEnabled = emailNotificationsEnabled;
        }

        public Boolean getPushNotificationsEnabled() {
            return pushNotificationsEnabled;
        }

        public void setPushNotificationsEnabled(Boolean pushNotificationsEnabled) {
            this.pushNotificationsEnabled = pushNotificationsEnabled;
        }
    }

    public static class UsernameAvailabilityResponse {
        private boolean available;

        public UsernameAvailabilityResponse(boolean available) {
            this.available = available;
        }

        public boolean isAvailable() {
            return available;
        }

        public void setAvailable(boolean available) {
            this.available = available;
        }
    }
}