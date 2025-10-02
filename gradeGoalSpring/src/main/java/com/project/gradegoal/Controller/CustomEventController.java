package com.project.gradegoal.Controller;

import com.project.gradegoal.Entity.CustomEvent;
import com.project.gradegoal.Service.CustomEventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/custom-events")
@CrossOrigin(origins = "*")
public class CustomEventController {

    @Autowired
    private CustomEventService customEventService;


    /**
     * Create a new custom event
     */
    @PostMapping
    public ResponseEntity<?> createCustomEvent(@RequestBody CustomEvent customEvent) {
        try {
            CustomEvent createdEvent = customEventService.createCustomEvent(customEvent);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdEvent);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get all custom events for a user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getCustomEventsByUserId(@PathVariable Long userId) {
        try {
            List<CustomEvent> events = customEventService.getCustomEventsByUserId(userId);
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch custom events: " + e.getMessage()));
        }
    }

    /**
     * Get custom events for a user within a date range
     */
    @GetMapping("/user/{userId}/range")
    public ResponseEntity<?> getCustomEventsByDateRange(
            @PathVariable Long userId,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            LocalDateTime start = LocalDateTime.parse(startDate);
            LocalDateTime end = LocalDateTime.parse(endDate);
            List<CustomEvent> events = customEventService.getCustomEventsByUserIdAndDateRange(userId, start, end);
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "Invalid date format or failed to fetch events: " + e.getMessage()));
        }
    }

    /**
     * Get a specific custom event by ID
     */
    @GetMapping("/{eventId}")
    public ResponseEntity<?> getCustomEventById(@PathVariable Long eventId) {
        try {
            Optional<CustomEvent> event = customEventService.getCustomEventById(eventId);
            if (event.isPresent()) {
                return ResponseEntity.ok(event.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch custom event: " + e.getMessage()));
        }
    }

    /**
     * Update a custom event
     */
    @PutMapping("/{eventId}")
    public ResponseEntity<?> updateCustomEvent(@PathVariable Long eventId, @RequestBody CustomEvent customEvent) {
        try {
            CustomEvent updatedEvent = customEventService.updateCustomEvent(eventId, customEvent);
            return ResponseEntity.ok(updatedEvent);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Delete a custom event
     */
    @DeleteMapping("/{eventId}")
    public ResponseEntity<?> deleteCustomEvent(@PathVariable Long eventId) {
        try {
            boolean deleted = customEventService.deleteCustomEvent(eventId);
            if (deleted) {
                return ResponseEntity.ok(Map.of("message", "Custom event deleted successfully"));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to delete custom event: " + e.getMessage()));
        }
    }

    /**
     * Get upcoming events for reminders (admin/internal use)
     */
    @GetMapping("/upcoming-reminders")
    public ResponseEntity<?> getUpcomingEventsForReminder() {
        try {
            List<CustomEvent> events = customEventService.getUpcomingEventsForReminder();
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch upcoming events: " + e.getMessage()));
        }
    }
}
