package com.project.gradegoal.Service;

import com.project.gradegoal.Entity.User;
import com.project.gradegoal.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private LoginStreakService loginStreakService;

    public User createUser(String email, String password, String firstName, String lastName) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("User with email " + email + " already exists");
        }

        User user = new User();
        user.setEmail(email);
        user.setUsername(email); // Use email as username for now
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setIsActive(true);

        return userRepository.save(user);
    }

    public User authenticateUser(String emailOrUsername, String password) {
        // Try to find user by email first
        Optional<User> userOpt = userRepository.findByEmail(emailOrUsername);
        
        // If not found by email, try to find by username
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByUsername(emailOrUsername);
        }
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(password, user.getPasswordHashForAuth())) {
                // Update login streak
                try {
                    loginStreakService.updateLoginStreak(user.getUserId());
                } catch (Exception e) {
                    // Log error but don't fail authentication
                }
                return user;
            }
        }
        return null;
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findById(Long userId) {
        return userRepository.findById(userId);
    }
    
    /**
     * Get login streak information for a user
     * @param userId the user ID
     * @return LoginStreakService.StreakInfo object
     */
    public LoginStreakService.StreakInfo getLoginStreakInfo(Long userId) {
        return loginStreakService.getStreakInfo(userId);
    }

    /**
     * Update login streak for a user
     * @param userId the user ID
     * @return LoginStreakService.StreakInfo object
     */
    public LoginStreakService.StreakInfo updateLoginStreak(Long userId) {
        return loginStreakService.updateLoginStreak(userId);
    }

    public User updateProfile(Long userId, String firstName, String lastName) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User with ID " + userId + " not found");
        }

        User user = userOpt.get();
        user.setFirstName(firstName);
        user.setLastName(lastName);

        return userRepository.save(user);
    }

    public User updateProfileWithPicture(Long userId, String firstName, String lastName, String profilePictureUrl) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User with ID " + userId + " not found");
        }

        User user = userOpt.get();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setProfilePictureUrl(profilePictureUrl);

        return userRepository.save(user);
    }

    public User updateProfileComplete(Long userId, String firstName, String lastName, String username, String profilePictureUrl, String currentYearLevel) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User with ID " + userId + " not found");
        }

        User user = userOpt.get();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        if (username != null) {
            user.setUsername(username);
        }
        if (profilePictureUrl != null) {
            user.setProfilePictureUrl(profilePictureUrl);
        }
        if (currentYearLevel != null) {
            user.setCurrentYearLevel(currentYearLevel);
        }

        return userRepository.save(user);
    }

    public User updateUser(User user) {
        return userRepository.save(user);
    }

    public boolean updatePassword(Long userId, String currentPassword, String newPassword) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return false;
        }

        User user = userOpt.get();
        if (passwordEncoder.matches(currentPassword, user.getPasswordHashForAuth())) {
            user.setPasswordHash(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            return true;
        }

        return false;
    }

    public User updateNotificationPreferences(Long userId, Boolean emailNotificationsEnabled,
                                            Boolean pushNotificationsEnabled) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User with ID " + userId + " not found");
        }

        User user = userOpt.get();
        user.setEmailNotificationsEnabled(emailNotificationsEnabled);
        user.setPushNotificationsEnabled(pushNotificationsEnabled);
        return userRepository.save(user);
    }

    public User updateProfilePicture(Long userId, String profilePictureUrl) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User with ID " + userId + " not found");
        }

        User user = userOpt.get();
        user.setProfilePictureUrl(profilePictureUrl);
        return userRepository.save(user);
    }

    /**
     * Update user's current year level
     */
    public User updateYearLevel(Long userId, String newYearLevel) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (!userOpt.isPresent()) {
            throw new RuntimeException("User not found with ID: " + userId);
        }

        User user = userOpt.get();
        user.setCurrentYearLevel(newYearLevel);
        return userRepository.save(user);
    }

    /**
     * Get user's current year level
     */
    public String getCurrentYearLevel(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            return user.getCurrentYearLevel();
        }
        return "1"; // Default to first year
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getUsersWithEmailNotifications() {
        return userRepository.findAll().stream()
            .filter(user -> user.getEmail() != null && !user.getEmail().isEmpty() && 
                           user.getEmailNotificationsEnabled() != null && user.getEmailNotificationsEnabled())
            .collect(Collectors.toList());
    }

    public List<User> getUsersWithPushNotifications() {
        return userRepository.findAll().stream()
            .filter(user -> user.getIsActive() != null && user.getIsActive() && 
                           user.getPushNotificationsEnabled() != null && user.getPushNotificationsEnabled())
            .collect(Collectors.toList());
    }

    public List<User> searchUsersByName(String name) {
        return userRepository.findAll().stream()
            .filter(user -> (user.getFirstName() != null && user.getFirstName().toLowerCase().contains(name.toLowerCase())) ||
                           (user.getLastName() != null && user.getLastName().toLowerCase().contains(name.toLowerCase())))
            .collect(Collectors.toList());
    }

    public UserStatistics getUserStatistics() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.findAll().stream()
            .filter(user -> user.getIsActive() != null && user.getIsActive())
            .count();
        long usersWithEmail = userRepository.findAll().stream()
            .filter(user -> user.getEmail() != null && !user.getEmail().isEmpty())
            .count();

        return new UserStatistics(totalUsers, activeUsers, usersWithEmail);
    }

    public boolean deleteUser(Long userId) {
        if (userRepository.existsById(userId)) {
            userRepository.deleteById(userId);
            return true;
        }
        return false;
    }

    public User updateUserAccountStatus(Long userId, Boolean isActive) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User with ID " + userId + " not found");
        }

        User user = userOpt.get();
        user.setIsActive(isActive);
        return userRepository.save(user);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User createGoogleUser(String email, String firstName, String lastName, String profilePictureUrl) {
        User user = new User();
        user.setEmail(email);
        user.setUsername(email); // Use email as username
        user.setPasswordHash(null); // OAuth users don't have passwords
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setIsActive(true);
        user.setRole("USER"); // Default role for new OAuth users
        user.setEmailNotificationsEnabled(true); // Enable email notifications by default
        user.setPushNotificationsEnabled(true); // Disable push notifications by default (user can enable later)

        return userRepository.save(user);
    }

    public boolean isUsernameAvailable(String username) {
        return userRepository.findByUsername(username).isEmpty();
    }

    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public static class UserStatistics {
        private final long totalUsers;
        private final long activeUsers;
        private final long usersWithEmail;

        public UserStatistics(long totalUsers, long activeUsers, long usersWithEmail) {
            this.totalUsers = totalUsers;
            this.activeUsers = activeUsers;
            this.usersWithEmail = usersWithEmail;
        }

        public long getTotalUsers() { return totalUsers; }
        public long getActiveUsers() { return activeUsers; }
        public long getUsersWithEmail() { return usersWithEmail; }
    }
}
