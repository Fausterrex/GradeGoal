package com.project.gradegoal.Repository;

import com.project.gradegoal.Entity.CustomEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CustomEventRepository extends JpaRepository<CustomEvent, Long> {

    /**
     * Find all custom events for a specific user
     */
    List<CustomEvent> findByUserIdOrderByEventStartAsc(Long userId);

    /**
     * Find custom events for a user within a date range
     */
    @Query("SELECT ce FROM CustomEvent ce WHERE ce.userId = :userId AND ce.eventStart BETWEEN :startDate AND :endDate ORDER BY ce.eventStart ASC")
    List<CustomEvent> findByUserIdAndDateRange(@Param("userId") Long userId, 
                                              @Param("startDate") LocalDateTime startDate, 
                                              @Param("endDate") LocalDateTime endDate);

    /**
     * Find upcoming custom events that need reminders
     */
    @Query("SELECT ce FROM CustomEvent ce WHERE ce.reminderEnabled = true AND ce.isNotified = false " +
           "AND ce.eventStart BETWEEN :now AND :reminderDate ORDER BY ce.eventStart ASC")
    List<CustomEvent> findUpcomingEventsForReminder(@Param("now") LocalDateTime now, 
                                                   @Param("reminderDate") LocalDateTime reminderDate);

    /**
     * Find custom events by user and event type
     */
    List<CustomEvent> findByUserIdAndEventTypeOrderByEventStartAsc(Long userId, String eventType);

    /**
     * Count custom events for a user
     */
    long countByUserId(Long userId);

    /**
     * Find custom events that are due for notification
     */
    @Query("SELECT ce FROM CustomEvent ce WHERE ce.reminderEnabled = true AND ce.isNotified = false " +
           "AND ce.eventStart <= :notificationTime ORDER BY ce.eventStart ASC")
    List<CustomEvent> findEventsDueForNotification(@Param("notificationTime") LocalDateTime notificationTime);
}
