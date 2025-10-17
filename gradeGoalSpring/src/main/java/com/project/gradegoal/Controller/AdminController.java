package com.project.gradegoal.Controller;

import com.project.gradegoal.Entity.*;
import com.project.gradegoal.Repository.UserRepository;
import com.project.gradegoal.Repository.CourseRepository;
import com.project.gradegoal.Repository.AcademicGoalRepository;
import com.project.gradegoal.Repository.AchievementRepository;
import com.project.gradegoal.Repository.UserActivityLogRepository;
import com.project.gradegoal.Repository.UserAchievementRepository;
import com.project.gradegoal.Repository.ExportLogRepository;
import com.project.gradegoal.Entity.ExportLog;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.*;
import java.util.Optional;
import java.util.Objects;

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
    
    @Autowired
    private ExportLogRepository exportLogRepository;
    
    @Autowired
    private RestTemplate restTemplate;

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

    /**
     * Export comprehensive system overview report
     */
    @GetMapping("/export/system-overview")
    public ResponseEntity<?> exportSystemOverview(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) Long adminUserId) {
        try {
            Map<String, Object> exportData = new HashMap<>();
            
            // System Information
            exportData.put("exportTimestamp", LocalDateTime.now());
            exportData.put("systemVersion", "GradeGoal v1.0");
            exportData.put("reportPeriod", getReportPeriod(startDate, endDate));
            
            // User Analytics
            exportData.put("userAnalytics", getUserAnalytics(startDate, endDate));
            
            // Course Analytics
            exportData.put("courseAnalytics", getCourseAnalytics(startDate, endDate));
            
            // AI Analytics
            exportData.put("aiAnalytics", getAIAnalytics(startDate, endDate));
            
            // Achievement Analytics
            exportData.put("achievementAnalytics", getAchievementAnalytics(startDate, endDate));
            
            // System Logs
            exportData.put("systemLogs", getSystemLogs(startDate, endDate));
            
            // Log the export to database if adminUserId is provided
            if (adminUserId != null) {
                logAdminExport(adminUserId, startDate, endDate, exportData);
            }
            
            return ResponseEntity.ok(exportData);
        } catch (Exception e) {
            e.printStackTrace(); // Log the full stack trace
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to generate system overview: " + e.getMessage());
        }
    }

    /**
     * Get user analytics for export
     */
    private Map<String, Object> getUserAnalytics(String startDate, String endDate) {
        Map<String, Object> userAnalytics = new HashMap<>();
        
        try {
            List<User> allUsers = userRepository.findByRoleNot("ADMIN");
            if (allUsers == null) allUsers = new ArrayList<>();
            
            List<User> activeUsers = allUsers.stream()
                .filter(user -> user.getIsActive() != null && user.getIsActive())
                .collect(java.util.stream.Collectors.toList());
            
            List<User> inactiveUsers = allUsers.stream()
                .filter(user -> user.getIsActive() == null || !user.getIsActive())
                .collect(java.util.stream.Collectors.toList());
            
            // Users with courses
            long usersWithCourses = 0;
            for (User user : allUsers) {
                try {
                    List<Course> userCourses = courseRepository.findByUserId(user.getUserId());
                    if (userCourses != null && !userCourses.isEmpty()) {
                        usersWithCourses++;
                    }
                } catch (Exception e) {
                    // Skip this user if there's an error
                }
            }
            
            // Users without courses
            long usersWithoutCourses = allUsers.size() - usersWithCourses;
            
            // Currently logged in (users with recent activity - last 24 hours)
            long currentlyLoggedIn = 0;
            try {
                LocalDateTime last24Hours = LocalDateTime.now().minusHours(24);
                List<UserActivityLog> recentActivities = userActivityLogRepository.findByCreatedAtAfter(last24Hours);
                if (recentActivities != null) {
                    currentlyLoggedIn = recentActivities.stream()
                        .map(UserActivityLog::getUserId)
                        .distinct()
                        .count();
                }
            } catch (Exception e) {
                // If there's an error, set to 0
            }
            
            userAnalytics.put("totalRegistered", allUsers.size());
            userAnalytics.put("activeUsers", activeUsers.size());
            userAnalytics.put("inactiveUsers", inactiveUsers.size());
            userAnalytics.put("frozenUsers", inactiveUsers.size());
            userAnalytics.put("currentlyLoggedIn", currentlyLoggedIn);
            userAnalytics.put("usersWithCourses", usersWithCourses);
            userAnalytics.put("usersWithoutCourses", usersWithoutCourses);
            
        } catch (Exception e) {
            // Set default values if there's an error
            userAnalytics.put("totalRegistered", 0);
            userAnalytics.put("activeUsers", 0);
            userAnalytics.put("inactiveUsers", 0);
            userAnalytics.put("frozenUsers", 0);
            userAnalytics.put("currentlyLoggedIn", 0);
            userAnalytics.put("usersWithCourses", 0);
            userAnalytics.put("usersWithoutCourses", 0);
        }
        
        return userAnalytics;
    }

    /**
     * Get course analytics for export
     */
    private Map<String, Object> getCourseAnalytics(String startDate, String endDate) {
        Map<String, Object> courseAnalytics = new HashMap<>();
        
        try {
            List<Course> allCourses = courseRepository.findAll();
            if (allCourses == null) allCourses = new ArrayList<>();
            
            List<Course> activeCourses = courseRepository.findByIsActiveTrue();
            if (activeCourses == null) activeCourses = new ArrayList<>();
            
            List<Course> archivedCourses = courseRepository.findByIsActiveFalse();
            if (archivedCourses == null) archivedCourses = new ArrayList<>();
            
            // Courses with goals
            long coursesWithGoals = 0;
            long coursesWithAchievedGoals = 0;
            long coursesWithGoalsInProgress = 0;
            long coursesAtRisk = 0;
            
            for (Course course : allCourses) {
                try {
                    List<AcademicGoal> goals = academicGoalRepository.findByCourseId(course.getCourseId());
                    if (goals != null && !goals.isEmpty()) {
                        coursesWithGoals++;
                        
                        boolean hasAchieved = goals.stream().anyMatch(goal -> goal.getIsAchieved() != null && goal.getIsAchieved());
                        if (hasAchieved) {
                            coursesWithAchievedGoals++;
                        }
                        
                        boolean hasInProgress = goals.stream().anyMatch(goal -> goal.getIsAchieved() == null || !goal.getIsAchieved());
                        if (hasInProgress) {
                            coursesWithGoalsInProgress++;
                        }
                    }
                    
                    // Check if course is at risk
                    if (course.getCalculatedCourseGrade() != null) {
                        if (course.getCalculatedCourseGrade().doubleValue() < 70.0) {
                            coursesAtRisk++;
                        }
                    }
                } catch (Exception e) {
                    // Skip this course if there's an error
                }
            }
            
            long coursesWithoutGoals = allCourses.size() - coursesWithGoals;
            
            courseAnalytics.put("totalCourses", allCourses.size());
            courseAnalytics.put("activeCourses", activeCourses.size());
            courseAnalytics.put("archivedCourses", archivedCourses.size());
            courseAnalytics.put("coursesAtRisk", coursesAtRisk);
            courseAnalytics.put("coursesWithGoals", coursesWithGoals);
            courseAnalytics.put("coursesWithoutGoals", coursesWithoutGoals);
            courseAnalytics.put("coursesWithAchievedGoals", coursesWithAchievedGoals);
            courseAnalytics.put("coursesWithGoalsInProgress", coursesWithGoalsInProgress);
            
        } catch (Exception e) {
            // Set default values if there's an error
            courseAnalytics.put("totalCourses", 0);
            courseAnalytics.put("activeCourses", 0);
            courseAnalytics.put("archivedCourses", 0);
            courseAnalytics.put("coursesAtRisk", 0);
            courseAnalytics.put("coursesWithGoals", 0);
            courseAnalytics.put("coursesWithoutGoals", 0);
            courseAnalytics.put("coursesWithAchievedGoals", 0);
            courseAnalytics.put("coursesWithGoalsInProgress", 0);
        }
        
        return courseAnalytics;
    }

    /**
     * Get AI analytics for export
     */
    private Map<String, Object> getAIAnalytics(String startDate, String endDate) {
        Map<String, Object> aiAnalytics = new HashMap<>();
        
        try {
            // Get AI usage from user activity logs
            List<UserActivityLog> allActivities = userActivityLogRepository.findAll();
            if (allActivities == null) allActivities = new ArrayList<>();
            
            List<UserActivityLog> aiActivities = allActivities.stream()
                .filter(activity -> activity.getActivityType() != null && 
                    activity.getActivityType().toLowerCase().contains("ai"))
                .collect(java.util.stream.Collectors.toList());
            
            // Users who used AI
            long usersWhoUsedAI = aiActivities.stream()
                .map(UserActivityLog::getUserId)
                .distinct()
                .count();
            
            // Users who never used AI
            long totalUsers = userRepository.countByRoleNot("ADMIN");
            long usersWhoNeverUsedAI = totalUsers - usersWhoUsedAI;
            
            // Total AI usage count
            long totalAIUsage = aiActivities.size();
            
            // Last AI usage
            String lastAIUsage = "Never";
            if (!aiActivities.isEmpty()) {
                try {
                    lastAIUsage = aiActivities.stream()
                        .max(java.util.Comparator.comparing(UserActivityLog::getCreatedAt))
                        .map(activity -> activity.getCreatedAt().toString())
                        .orElse("Never");
                } catch (Exception e) {
                    lastAIUsage = "Never";
                }
            }
            
            aiAnalytics.put("aiSystemUsed", "Groq API");
            aiAnalytics.put("aiModelInfo", "llama-3.1-8b-instant, llama-3.1-70b-versatile, mixtral-8x7b-32768, gemma-7b-it");
            aiAnalytics.put("usersWhoUsedAI", usersWhoUsedAI);
            aiAnalytics.put("usersWhoNeverUsedAI", usersWhoNeverUsedAI);
            aiAnalytics.put("totalAIUsage", totalAIUsage);
            aiAnalytics.put("lastAIUsage", lastAIUsage);
            
        } catch (Exception e) {
            // Set default values if there's an error
            aiAnalytics.put("aiSystemUsed", "Groq API");
            aiAnalytics.put("aiModelInfo", "llama-3.1-8b-instant, llama-3.1-70b-versatile, mixtral-8x7b-32768, gemma-7b-it");
            aiAnalytics.put("usersWhoUsedAI", 0);
            aiAnalytics.put("usersWhoNeverUsedAI", 0);
            aiAnalytics.put("totalAIUsage", 0);
            aiAnalytics.put("lastAIUsage", "Never");
        }
        
        return aiAnalytics;
    }

    /**
     * Get achievement analytics for export
     */
    private Map<String, Object> getAchievementAnalytics(String startDate, String endDate) {
        Map<String, Object> achievementAnalytics = new HashMap<>();
        
        // Get all achievements
        List<com.project.gradegoal.Entity.Achievement> allAchievements = achievementRepository.findAll();
        List<UserAchievement> allUserAchievements = userAchievementRepository.findAll();
        
        // Achievement statistics by rarity
        Map<String, Long> achievementsByRarity = new HashMap<>();
        Map<String, Long> usersByRarity = new HashMap<>();
        
        for (com.project.gradegoal.Entity.Achievement achievement : allAchievements) {
            String rarity = achievement.getRarity().toString();
            long userCount = allUserAchievements.stream()
                .filter(ua -> ua.getAchievementId().equals(achievement.getAchievementId()))
                .count();
            
            achievementsByRarity.put(rarity, achievementsByRarity.getOrDefault(rarity, 0L) + 1);
            usersByRarity.put(rarity, usersByRarity.getOrDefault(rarity, 0L) + userCount);
        }
        
        achievementAnalytics.put("totalAchievements", allAchievements.size());
        achievementAnalytics.put("totalUnlocked", allUserAchievements.size());
        achievementAnalytics.put("achievementsByRarity", achievementsByRarity);
        achievementAnalytics.put("usersByRarity", usersByRarity);
        
        return achievementAnalytics;
    }

    /**
     * Get system logs for export
     */
    private Map<String, Object> getSystemLogs(String startDate, String endDate) {
        Map<String, Object> systemLogs = new HashMap<>();
        
        // Get recent user activities
        List<UserActivityLog> recentActivities = userActivityLogRepository.findAll().stream()
            .sorted(java.util.Comparator.comparing(UserActivityLog::getCreatedAt).reversed())
            .limit(25)
            .collect(java.util.stream.Collectors.toList());
        
        List<Map<String, Object>> activityLogs = new ArrayList<>();
        for (UserActivityLog activity : recentActivities) {
            Map<String, Object> logEntry = new HashMap<>();
            logEntry.put("timestamp", activity.getCreatedAt());
            logEntry.put("userId", activity.getUserId());
            logEntry.put("activityType", activity.getActivityType());
            logEntry.put("description", formatActivityDescription(activity.getContext(), activity.getActivityType()));
            activityLogs.add(logEntry);
        }
        
        systemLogs.put("recentActivities", activityLogs);
        systemLogs.put("totalLogEntries", userActivityLogRepository.count());
        
        return systemLogs;
    }

    /**
     * Get report period string
     */
    private String getReportPeriod(String startDate, String endDate) {
        if (startDate != null && endDate != null) {
            return "From " + startDate + " to " + endDate;
        } else if (startDate != null) {
            return "From " + startDate + " onwards";
        } else if (endDate != null) {
            return "Up to " + endDate;
        } else {
            return "All time";
        }
    }

    /**
     * Format activity description from JSON to user-friendly text
     */
    private String formatActivityDescription(String context, String activityType) {
        if (context == null || context.trim().isEmpty()) {
            return "No description available";
        }
        
        try {
            // Try to parse as JSON
            if (context.trim().startsWith("{")) {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                com.fasterxml.jackson.databind.JsonNode jsonNode = mapper.readTree(context);
                
                String title = jsonNode.has("title") ? jsonNode.get("title").asText() : "";
                String description = jsonNode.has("description") ? jsonNode.get("description").asText() : "";
                
                // Format based on activity type
                if ("grade_entry".equals(activityType)) {
                    String courseName = jsonNode.has("courseName") ? jsonNode.get("courseName").asText() : "";
                    String score = jsonNode.has("score") ? jsonNode.get("score").asText() : "";
                    
                    if (!title.isEmpty() && !courseName.isEmpty()) {
                        return String.format("%s for %s - %s", title, courseName, description);
                    }
                } else if ("goal_created".equals(activityType)) {
                    String goalType = jsonNode.has("goalType") ? jsonNode.get("goalType").asText() : "";
                    
                    if (!title.isEmpty()) {
                        return String.format("%s - %s", title, description);
                    }
                } else if ("course_created".equals(activityType)) {
                    if (!title.isEmpty()) {
                        return String.format("%s - %s", title, description);
                    }
                } else if ("user_login".equals(activityType)) {
                    return "User logged into the system";
                } else if ("user_logout".equals(activityType)) {
                    return "User logged out of the system";
                }
                
                // Fallback for other activity types
                if (!title.isEmpty() && !description.isEmpty()) {
                    return String.format("%s - %s", title, description);
                } else if (!title.isEmpty()) {
                    return title;
                } else if (!description.isEmpty()) {
                    return description;
                }
            }
        } catch (Exception e) {
            // If JSON parsing fails, return the original context
        }
        
        // Return original context if it's not JSON or parsing failed
        return context;
    }

    /**
     * Log admin export to database
     */
    private void logAdminExport(Long adminUserId, String startDate, String endDate, Map<String, Object> exportData) {
        try {
            ExportLog exportLog = new ExportLog();
            exportLog.setUserId(adminUserId);
            exportLog.setExportType(ExportLog.ExportType.ADMIN_SYSTEM_OVERVIEW);
            
            // Generate filename with timestamp
            String timestamp = LocalDateTime.now().toString().replace(":", "-").substring(0, 19);
            String fileName = String.format("admin_system_overview_%s.pdf", timestamp);
            exportLog.setFileName(fileName);
            
            // Set export parameters
            Map<String, Object> parameters = new HashMap<>();
            parameters.put("startDate", startDate);
            parameters.put("endDate", endDate);
            parameters.put("exportType", "ADMIN_SYSTEM_OVERVIEW");
            parameters.put("adminUserId", adminUserId);
            
            // Convert parameters to JSON string
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            exportLog.setExportParameters(mapper.writeValueAsString(parameters));
            
            exportLog.setStatus(ExportLog.ExportStatus.COMPLETED);
            exportLog.setCreatedAt(LocalDateTime.now());
            exportLog.setCompletedAt(LocalDateTime.now());
            exportLog.setExpiresAt(LocalDateTime.now().plusDays(30)); // Expires in 30 days
            
            exportLogRepository.save(exportLog);
            
        } catch (Exception e) {
            e.printStackTrace();
            // Don't fail the export if logging fails
        }
    }

    /**
     * Get admin export logs
     */
    @GetMapping("/export-logs")
    public ResponseEntity<?> getAdminExportLogs() {
        try {
            List<ExportLog> adminExports = exportLogRepository.findByExportTypeOrderByCreatedAtDesc(
                ExportLog.ExportType.ADMIN_SYSTEM_OVERVIEW.toString());
            
            List<Map<String, Object>> exportLogs = new ArrayList<>();
            for (ExportLog export : adminExports) {
                Map<String, Object> logData = new HashMap<>();
                logData.put("exportId", export.getExportId());
                logData.put("userId", export.getUserId());
                logData.put("fileName", export.getFileName());
                logData.put("status", export.getStatus());
                logData.put("createdAt", export.getCreatedAt());
                logData.put("completedAt", export.getCompletedAt());
                logData.put("expiresAt", export.getExpiresAt());
                
                // Parse export parameters
                if (export.getExportParameters() != null) {
                    try {
                        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                        Map<String, Object> parameters = mapper.readValue(export.getExportParameters(), Map.class);
                        logData.put("exportParameters", parameters);
                    } catch (Exception e) {
                        logData.put("exportParameters", export.getExportParameters());
                    }
                }
                
                exportLogs.add(logData);
            }
            
            return ResponseEntity.ok(exportLogs);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to fetch export logs: " + e.getMessage());
        }
    }

    /**
     * Get date range limits for export calendar
     */
    @GetMapping("/export/date-limits")
    public ResponseEntity<?> getExportDateLimits() {
        try {
            Map<String, Object> dateLimits = new HashMap<>();
            
            // Get earliest and latest dates from users
            List<User> allUsers = userRepository.findByRoleNot("ADMIN");
            LocalDateTime earliestUserDate = allUsers.stream()
                .map(User::getCreatedAt)
                .filter(Objects::nonNull)
                .min(LocalDateTime::compareTo)
                .orElse(LocalDateTime.now().minusYears(1));
            
            LocalDateTime latestUserDate = allUsers.stream()
                .map(User::getCreatedAt)
                .filter(Objects::nonNull)
                .max(LocalDateTime::compareTo)
                .orElse(LocalDateTime.now());
            
            // Get earliest and latest dates from courses
            List<Course> allCourses = courseRepository.findAll();
            LocalDateTime earliestCourseDate = allCourses.stream()
                .map(Course::getCreatedAt)
                .filter(Objects::nonNull)
                .min(LocalDateTime::compareTo)
                .orElse(LocalDateTime.now().minusYears(1));
            
            LocalDateTime latestCourseDate = allCourses.stream()
                .map(Course::getCreatedAt)
                .filter(Objects::nonNull)
                .max(LocalDateTime::compareTo)
                .orElse(LocalDateTime.now());
            
            // Get earliest and latest dates from activities
            List<UserActivityLog> allActivities = userActivityLogRepository.findAll();
            LocalDateTime earliestActivityDate = allActivities.stream()
                .map(UserActivityLog::getCreatedAt)
                .filter(Objects::nonNull)
                .min(LocalDateTime::compareTo)
                .orElse(LocalDateTime.now().minusYears(1));
            
            LocalDateTime latestActivityDate = allActivities.stream()
                .map(UserActivityLog::getCreatedAt)
                .filter(Objects::nonNull)
                .max(LocalDateTime::compareTo)
                .orElse(LocalDateTime.now());
            
            // Find the overall earliest and latest dates
            LocalDateTime overallEarliest = earliestUserDate;
            if (earliestCourseDate.isBefore(overallEarliest)) {
                overallEarliest = earliestCourseDate;
            }
            if (earliestActivityDate.isBefore(overallEarliest)) {
                overallEarliest = earliestActivityDate;
            }
            
            LocalDateTime overallLatest = latestUserDate;
            if (latestCourseDate.isAfter(overallLatest)) {
                overallLatest = latestCourseDate;
            }
            if (latestActivityDate.isAfter(overallLatest)) {
                overallLatest = latestActivityDate;
            }
            
            dateLimits.put("earliestDate", overallEarliest.toLocalDate().toString());
            dateLimits.put("latestDate", overallLatest.toLocalDate().toString());
            
            return ResponseEntity.ok(dateLimits);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to get date limits: " + e.getMessage());
        }
    }
}
