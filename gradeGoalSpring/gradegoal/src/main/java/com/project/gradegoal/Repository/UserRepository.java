package com.project.gradegoal.Repository;

import com.project.gradegoal.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByPlatformPreference(User.PlatformPreference platformPreference);

    List<User> findByEmailNotificationsEnabledTrue();

    List<User> findByPushNotificationsEnabledTrue();

    List<User> findByLastLoginAtBefore(LocalDateTime lastLoginBefore);

    List<User> findByCreatedAtAfter(LocalDateTime createdAfter);

    @Query("SELECT u FROM User u WHERE u.firstName LIKE %:firstName% OR u.lastName LIKE %:lastName%")
    List<User> findByNameContaining(@Param("firstName") String firstName, @Param("lastName") String lastName);

    @Query("SELECT u FROM User u WHERE CONCAT(u.firstName, ' ', u.lastName) LIKE %:fullName%")
    List<User> findByFullNameContaining(@Param("fullName") String fullName);

    long countByPlatformPreference(User.PlatformPreference platformPreference);

    @Query("SELECT COUNT(u) FROM User u WHERE u.lastLoginAt >= :thirtyDaysAgo")
    long countActiveUsers(@Param("thirtyDaysAgo") LocalDateTime thirtyDaysAgo);
}
