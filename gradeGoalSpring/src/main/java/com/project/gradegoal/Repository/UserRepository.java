package com.project.gradegoal.Repository;

import com.project.gradegoal.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * User Repository
 * 
 * JPA repository for User entity operations.
 * Provides data access methods for user management.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    /**
     * Find user by username
     * @param username Username to search for
     * @return Optional containing user if found
     */
    Optional<User> findByUsername(String username);
    
    /**
     * Find user by email
     * @param email Email to search for
     * @return Optional containing user if found
     */
    Optional<User> findByEmail(String email);
    
    /**
     * Find user by Firebase UID
     * @param firebaseUid Firebase UID to search for
     * @return Optional containing user if found
     */
    Optional<User> findByFirebaseUid(String firebaseUid);
    
    /**
     * Check if Firebase UID exists
     * @param firebaseUid Firebase UID to check
     * @return true if Firebase UID exists, false otherwise
     */
    boolean existsByFirebaseUid(String firebaseUid);
    
    /**
     * Check if username exists
     * @param username Username to check
     * @return true if username exists, false otherwise
     */
    boolean existsByUsername(String username);
    
    /**
     * Check if email exists
     * @param email Email to check
     * @return true if email exists, false otherwise
     */
    boolean existsByEmail(String email);
    
    /**
     * Count users by role (excluding specified role)
     * @param role Role to exclude
     * @return count of users not having the specified role
     */
    long countByRoleNot(String role);
    
    /**
     * Count active users by role (excluding specified role)
     * @param role Role to exclude
     * @return count of active users not having the specified role
     */
    long countByIsActiveTrueAndRoleNot(String role);
    
    /**
     * Find users by role (excluding specified role)
     * @param role Role to exclude
     * @return list of users not having the specified role
     */
    List<User> findByRoleNot(String role);
    
    /**
     * Count users by creation date range and role (excluding specified role)
     * @param startDate Start date
     * @param endDate End date
     * @param role Role to exclude
     * @return count of users created between dates and not having the specified role
     */
    long countByCreatedAtBetweenAndRoleNot(LocalDateTime startDate, LocalDateTime endDate, String role);
}