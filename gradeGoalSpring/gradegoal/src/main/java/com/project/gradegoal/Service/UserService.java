package com.project.gradegoal.Service;

import com.project.gradegoal.Entity.User;
import com.project.gradegoal.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User createUser(String email, String password, String firstName, String lastName) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("User with email " + email + " already exists");
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setPlatformPreference(User.PlatformPreference.WEB);
        user.setEmailNotificationsEnabled(true);
        user.setPushNotificationsEnabled(true);

        return userRepository.save(user);
    }

    public User authenticateUser(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(password, user.getPasswordHash())) {

                user.updateLastLogin();
                userRepository.save(user);
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

    public User updateProfile(Long userId, String firstName, String lastName,
                             User.PlatformPreference platformPreference) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User with ID " + userId + " not found");
        }

        User user = userOpt.get();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setPlatformPreference(platformPreference);

        return userRepository.save(user);
    }

    public boolean updatePassword(Long userId, String currentPassword, String newPassword) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return false;
        }

        User user = userOpt.get();
        if (passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
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

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getUsersByPlatformPreference(User.PlatformPreference platformPreference) {
        return userRepository.findByPlatformPreference(platformPreference);
    }

    public List<User> getUsersWithEmailNotifications() {
        return userRepository.findByEmailNotificationsEnabledTrue();
    }

    public List<User> getUsersWithPushNotifications() {
        return userRepository.findByPushNotificationsEnabledTrue();
    }

    public List<User> searchUsersByName(String name) {
        return userRepository.findByFullNameContaining(name);
    }

    public UserStatistics getUserStatistics() {
        long totalUsers = userRepository.count();
        long webUsers = userRepository.countByPlatformPreference(User.PlatformPreference.WEB);
        long mobileUsers = userRepository.countByPlatformPreference(User.PlatformPreference.MOBILE);
        long bothUsers = userRepository.countByPlatformPreference(User.PlatformPreference.BOTH);
        long activeUsers = userRepository.countActiveUsers(LocalDateTime.now().minusDays(30));

        return new UserStatistics(totalUsers, webUsers, mobileUsers, bothUsers, activeUsers);
    }

    public boolean deleteUser(Long userId) {
        if (userRepository.existsById(userId)) {
            userRepository.deleteById(userId);
            return true;
        }
        return false;
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User createGoogleUser(String email, String firstName, String lastName, String profilePictureUrl) {
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(null);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setProfilePictureUrl(profilePictureUrl);
        user.setPlatformPreference(User.PlatformPreference.WEB);
        user.setEmailNotificationsEnabled(true);
        user.setPushNotificationsEnabled(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }

    public static class UserStatistics {
        private final long totalUsers;
        private final long webUsers;
        private final long mobileUsers;
        private final long bothUsers;
        private final long activeUsers;

        public UserStatistics(long totalUsers, long webUsers, long mobileUsers, long bothUsers, long activeUsers) {
            this.totalUsers = totalUsers;
            this.webUsers = webUsers;
            this.mobileUsers = mobileUsers;
            this.bothUsers = bothUsers;
            this.activeUsers = activeUsers;
        }

        public long getTotalUsers() { return totalUsers; }
        public long getWebUsers() { return webUsers; }
        public long getMobileUsers() { return mobileUsers; }
        public long getBothUsers() { return bothUsers; }
        public long getActiveUsers() { return activeUsers; }
    }
}
