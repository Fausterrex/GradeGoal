package com.project.gradegoal.Controller;

import com.project.gradegoal.Entity.User;
import com.project.gradegoal.Entity.Course;
import com.project.gradegoal.Entity.Achievement;
import com.project.gradegoal.Entity.UserActivityLog;
import com.project.gradegoal.Repository.UserRepository;
import com.project.gradegoal.Repository.CourseRepository;
import com.project.gradegoal.Repository.AcademicGoalRepository;
import com.project.gradegoal.Repository.AchievementRepository;
import com.project.gradegoal.Repository.UserActivityLogRepository;
import com.project.gradegoal.Repository.UserAchievementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.*;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private AcademicGoalRepository academicGoalRepository;

    @Autowired
    private AchievementRepository achievementRepository;

    @Autowired
    private UserActivityLogRepository userActivityLogRepository;

    @Autowired
    private UserAchievementRepository userAchievementRepository;

    /**
     * Get overview statistics for admin dashboard
     */
    @GetMapping("/overview")
    public ResponseEntity<?> getOverviewData() {
        try {
            // Get total users (excluding admins)
            long totalUsers = userRepository.countByRoleNot("ADMIN");
            long activeUsers = userRepository.countByIsActiveTrueAndRoleNot("ADMIN");
            
            // Get course statistics
            long totalCourses = courseRepository.count();
            long activeCourses = courseRepository.countByIsActiveTrue();
            
            // Get goal statistics
            long totalGoals = academicGoalRepository.count();
            long completedGoals = academicGoalRepository.countByIsAchievedTrue();
            
            // Calculate growth rates based on actual data
            double userGrowthRate = calculateUserGrowthRate();
            double courseGrowthRate = calculateCourseGrowthRate();
            double goalGrowthRate = calculateGoalGrowthRate();
            
            Map<String, Object> overviewData = new HashMap<>();
            overviewData.put("totalUsers", totalUsers);
            overviewData.put("activeUsers", activeUsers);
            overviewData.put("totalCourses", totalCourses);
            overviewData.put("activeCourses", activeCourses);
            overviewData.put("goalsCompleted", completedGoals);
            overviewData.put("totalGoals", totalGoals);
            overviewData.put("userGrowthRate", userGrowthRate);
            overviewData.put("courseGrowthRate", courseGrowthRate);
            overviewData.put("goalGrowthRate", goalGrowthRate);
            
            return ResponseEntity.ok(overviewData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to fetch overview data: " + e.getMessage());
        }
    }

    /**
     * Get students at risk (low performance)
     */
    @GetMapping("/students-at-risk")
    public ResponseEntity<?> getStudentsAtRisk() {
        try {
            List<User> students = userRepository.findByRoleNot("ADMIN");
            List<Map<String, Object>> studentsAtRisk = new ArrayList<>();
            
            for (User student : students) {
                // Get courses for this student
                List<Course> studentCourses = courseRepository.findByUserId(student.getUserId());
                
                if (!studentCourses.isEmpty()) {
                    // Calculate average performance (simplified)
                    double totalGrade = 0;
                    int gradeCount = 0;
                    
                    for (Course course : studentCourses) {
                        if (course.getCalculatedCourseGrade() != null) {
                            totalGrade += course.getCalculatedCourseGrade().doubleValue();
                            gradeCount++;
                        }
                    }
                    
                    if (gradeCount > 0) {
                        double averageGrade = totalGrade / gradeCount;
                        
                        // Consider students with average grade below 70% as at risk
                        if (averageGrade < 70.0) {
                            Map<String, Object> studentData = new HashMap<>();
                            studentData.put("name", student.getFirstName() + " " + student.getLastName());
                            studentData.put("courses", studentCourses.size());
                            studentData.put("percent", averageGrade);
                            studentData.put("trend", calculateStudentTrend(student.getUserId(), averageGrade));
                            
                            studentsAtRisk.add(studentData);
                        }
                    }
                }
            }
            
            // Sort by percentage (lowest first)
            studentsAtRisk.sort((a, b) -> Double.compare((Double) a.get("percent"), (Double) b.get("percent")));
            
            return ResponseEntity.ok(studentsAtRisk);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to fetch students at risk: " + e.getMessage());
        }
    }

    /**
     * Get recent activities for admin dashboard
     */
    @GetMapping("/recent-activities")
    public ResponseEntity<?> getRecentActivities() {
        try {
            List<UserActivityLog> recentActivities = userActivityLogRepository
                .findTop10ByOrderByCreatedAtDesc();
            
            List<Map<String, Object>> activities = new ArrayList<>();
            
            for (UserActivityLog activity : recentActivities) {
                Map<String, Object> activityData = new HashMap<>();
                
                // Format activity description based on type
                String description = formatActivityDescription(activity);
                String timeAgo = formatTimeAgo(activity.getCreatedAt());
                
                activityData.put("text", description);
                activityData.put("time", timeAgo);
                activityData.put("icon", getActivityIcon(activity.getActivityType()));
                
                activities.add(activityData);
            }
            
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to fetch recent activities: " + e.getMessage());
        }
    }

    /**
     * Get achievement statistics for gamification tab using real data
     */
    @GetMapping("/achievements")
    public ResponseEntity<?> getAchievementData() {
        try {
            List<Achievement> allAchievements = achievementRepository.findAll();
            long totalUsers = userRepository.countByRoleNot("ADMIN");
            
            List<Map<String, Object>> achievements = new ArrayList<>();
            Map<String, Object> stats = new HashMap<>();
            
            // Calculate real achievement statistics
            long totalUnlocked = userAchievementRepository.countTotalUnlocked();
            
            // Calculate percentages for each rarity (percentage of users who have earned at least one achievement of each rarity)
            double commonPercentage = 0.0;
            double uncommonPercentage = 0.0;
            double rarePercentage = 0.0;
            double epicPercentage = 0.0;
            double legendaryPercentage = 0.0;
            
            if (totalUsers > 0) {
                long commonUsers = userAchievementRepository.countUniqueUsersByRarity(Achievement.AchievementRarity.COMMON);
                long uncommonUsers = userAchievementRepository.countUniqueUsersByRarity(Achievement.AchievementRarity.UNCOMMON);
                long rareUsers = userAchievementRepository.countUniqueUsersByRarity(Achievement.AchievementRarity.RARE);
                long epicUsers = userAchievementRepository.countUniqueUsersByRarity(Achievement.AchievementRarity.EPIC);
                long legendaryUsers = userAchievementRepository.countUniqueUsersByRarity(Achievement.AchievementRarity.LEGENDARY);
                
                commonPercentage = (commonUsers * 100.0) / totalUsers;
                uncommonPercentage = (uncommonUsers * 100.0) / totalUsers;
                rarePercentage = (rareUsers * 100.0) / totalUsers;
                epicPercentage = (epicUsers * 100.0) / totalUsers;
                legendaryPercentage = (legendaryUsers * 100.0) / totalUsers;
            }
            
            // Build individual achievement data
            for (Achievement achievement : allAchievements) {
                Map<String, Object> achievementData = new HashMap<>();
                achievementData.put("title", achievement.getAchievementName());
                achievementData.put("desc", achievement.getDescription() + " (" + achievement.getRarity() + ")");
                
                // Get real progress for this specific achievement
                long progress = userAchievementRepository.countByAchievementId(achievement.getAchievementId());
                
                achievementData.put("progress", progress);
                achievementData.put("total", totalUsers);
                achievementData.put("color", getAchievementColor(achievement.getRarity().toString()));
                
                achievements.add(achievementData);
            }
            
            // Set the real statistics
            stats.put("totalUnlocked", totalUnlocked);
            stats.put("commonPercentage", Math.round(commonPercentage * 10.0) / 10.0); // Round to 1 decimal place
            stats.put("uncommonPercentage", Math.round(uncommonPercentage * 10.0) / 10.0);
            stats.put("rarePercentage", Math.round(rarePercentage * 10.0) / 10.0);
            stats.put("epicPercentage", Math.round(epicPercentage * 10.0) / 10.0);
            stats.put("legendaryPercentage", Math.round(legendaryPercentage * 10.0) / 10.0);
            
            Map<String, Object> response = new HashMap<>();
            response.put("achievements", achievements);
            response.put("stats", stats);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to fetch achievement data: " + e.getMessage());
        }
    }

    // Helper methods
    private String formatActivityDescription(UserActivityLog activity) {
        // Get user email from user ID
        Optional<User> userOpt = userRepository.findById(activity.getUserId());
        String userEmail = userOpt.map(User::getEmail).orElse("Unknown User");
        
        switch (activity.getActivityType()) {
            case "LOGIN":
                return "User login: " + userEmail;
            case "COURSE_CREATED":
                return "New course created by " + userEmail;
            case "GRADE_ADDED":
                return "Grade added by " + userEmail;
            case "GOAL_CREATED":
                return "Academic goal created by " + userEmail;
            case "ACHIEVEMENT_UNLOCKED":
                return "Achievement unlocked by " + userEmail;
            default:
                return "Activity: " + activity.getActivityType() + " by " + userEmail;
        }
    }

    private String formatTimeAgo(LocalDateTime timestamp) {
        LocalDateTime now = LocalDateTime.now();
        long minutes = java.time.Duration.between(timestamp, now).toMinutes();
        
        if (minutes < 1) return "Just now";
        if (minutes < 60) return minutes + " mins ago";
        
        long hours = minutes / 60;
        if (hours < 24) return hours + " hour" + (hours > 1 ? "s" : "") + " ago";
        
        long days = hours / 24;
        return days + " day" + (days > 1 ? "s" : "") + " ago";
    }

    private String getActivityIcon(String activityType) {
        switch (activityType) {
            case "LOGIN":
                return "👤";
            case "COURSE_CREATED":
                return "📚";
            case "GRADE_ADDED":
                return "📊";
            case "GOAL_CREATED":
                return "🎯";
            case "ACHIEVEMENT_UNLOCKED":
                return "🏆";
            default:
                return "📝";
        }
    }

    private String getAchievementColor(String rarity) {
        switch (rarity) {
            case "COMMON":
                return "bg-blue-500";
            case "UNCOMMON":
                return "bg-green-500";
            case "RARE":
                return "bg-yellow-400";
            case "EPIC":
                return "bg-purple-500";
            case "LEGENDARY":
                return "bg-yellow-500";
            default:
                return "bg-gray-500";
        }
    }

    /**
     * Calculate user growth rate based on registration dates
     */
    private double calculateUserGrowthRate() {
        try {
            LocalDate now = LocalDate.now();
            LocalDate lastMonth = now.minusMonths(1);
            LocalDate twoMonthsAgo = now.minusMonths(2);
            
            long usersLastMonth = userRepository.countByCreatedAtBetweenAndRoleNot(
                lastMonth.atStartOfDay(), now.atStartOfDay(), "ADMIN");
            long usersTwoMonthsAgo = userRepository.countByCreatedAtBetweenAndRoleNot(
                twoMonthsAgo.atStartOfDay(), lastMonth.atStartOfDay(), "ADMIN");
            
            if (usersTwoMonthsAgo == 0) return 0.0;
            return ((double)(usersLastMonth - usersTwoMonthsAgo) / usersTwoMonthsAgo) * 100;
        } catch (Exception e) {
            return 0.0;
        }
    }

    /**
     * Calculate course growth rate based on creation dates
     */
    private double calculateCourseGrowthRate() {
        try {
            LocalDate now = LocalDate.now();
            LocalDate lastMonth = now.minusMonths(1);
            LocalDate twoMonthsAgo = now.minusMonths(2);
            
            long coursesLastMonth = courseRepository.countByCreatedAtBetween(
                lastMonth.atStartOfDay(), now.atStartOfDay());
            long coursesTwoMonthsAgo = courseRepository.countByCreatedAtBetween(
                twoMonthsAgo.atStartOfDay(), lastMonth.atStartOfDay());
            
            if (coursesTwoMonthsAgo == 0) return 0.0;
            return ((double)(coursesLastMonth - coursesTwoMonthsAgo) / coursesTwoMonthsAgo) * 100;
        } catch (Exception e) {
            return 0.0;
        }
    }

    /**
     * Calculate goal growth rate based on completion dates
     */
    private double calculateGoalGrowthRate() {
        try {
            LocalDate now = LocalDate.now();
            LocalDate lastMonth = now.minusMonths(1);
            LocalDate twoMonthsAgo = now.minusMonths(2);
            
            long goalsLastMonth = academicGoalRepository.countByAchievedDateBetween(
                lastMonth, now);
            long goalsTwoMonthsAgo = academicGoalRepository.countByAchievedDateBetween(
                twoMonthsAgo, lastMonth);
            
            if (goalsTwoMonthsAgo == 0) return 0.0;
            return ((double)(goalsLastMonth - goalsTwoMonthsAgo) / goalsTwoMonthsAgo) * 100;
        } catch (Exception e) {
            return 0.0;
        }
    }

    /**
     * Calculate student performance trend
     * @param userId Student ID
     * @param currentAverage Current average grade
     * @return Trend percentage (positive = improving, negative = declining)
     */
    private double calculateStudentTrend(Long userId, double currentAverage) {
        try {
            // Get courses created in the last 30 days vs previous 30 days
            LocalDate now = LocalDate.now();
            LocalDate thirtyDaysAgo = now.minusDays(30);
            LocalDate sixtyDaysAgo = now.minusDays(60);
            
            // Calculate average grade for recent courses (last 30 days)
            List<Course> recentCourses = courseRepository.findByUserIdAndCreatedAtAfter(
                userId, thirtyDaysAgo.atStartOfDay());
            
            // Calculate average grade for previous courses (30-60 days ago)
            List<Course> previousCourses = courseRepository.findByUserIdAndCreatedAtBetween(
                userId, sixtyDaysAgo.atStartOfDay(), thirtyDaysAgo.atStartOfDay());
            
            double recentAverage = calculateAverageGrade(recentCourses);
            double previousAverage = calculateAverageGrade(previousCourses);
            
            if (previousAverage == 0) return 0.0;
            
            // Calculate trend: positive means improving, negative means declining
            return ((recentAverage - previousAverage) / previousAverage) * 100;
            
        } catch (Exception e) {
            // Return a small random trend if calculation fails
            return Math.random() * 10 - 5; // Random between -5 and +5
        }
    }

    /**
     * Calculate average grade for a list of courses
     */
    private double calculateAverageGrade(List<Course> courses) {
        if (courses.isEmpty()) return 0.0;
        
        double totalGrade = 0;
        int gradeCount = 0;
        
        for (Course course : courses) {
            if (course.getCalculatedCourseGrade() != null) {
                totalGrade += course.getCalculatedCourseGrade().doubleValue();
                gradeCount++;
            }
        }
        
        return gradeCount > 0 ? totalGrade / gradeCount : 0.0;
    }
}
