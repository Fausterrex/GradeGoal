package com.project.gradegoal.Service;

import com.project.gradegoal.Entity.Assessment;
import com.project.gradegoal.Entity.User;
import com.project.gradegoal.Repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Email Notification Service
 * 
 * Service class for sending email notifications for overdue and upcoming assessments.
 * Uses Gmail SMTP for reliable email delivery.
 */
@Service
public class EmailNotificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(EmailNotificationService.class);
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Autowired
    private UserRepository userRepository;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    @Value("${notification.upcoming.days.before}")
    private int upcomingDaysBefore;
    
    /**
     * Check if user has email notifications enabled
     * @param userEmail User's email address
     * @return true if notifications are enabled, false otherwise
     */
    private boolean isEmailNotificationsEnabled(String userEmail) {
        try {
            User user = userRepository.findByEmail(userEmail).orElse(null);
            return user != null && 
                   user.getEmailNotificationsEnabled() != null && 
                   user.getEmailNotificationsEnabled();
        } catch (Exception e) {
            logger.warn("Error checking email notification preference for user: {}", userEmail, e);
            return false; // Default to disabled if error
        }
    }
    
    /**
     * Send overdue assessment notification
     * @param userEmail User's email address
     * @param overdueAssessments List of overdue assessments
     */
    public void sendOverdueNotification(String userEmail, List<Assessment> overdueAssessments) {
        if (overdueAssessments.isEmpty() || !isEmailNotificationsEnabled(userEmail)) {
            return;
        }
        
        String subject = "⚠️ Overdue Assessments - GradeGoal";
        String content = buildOverdueEmailContent(overdueAssessments);
        
        sendEmail(userEmail, subject, content);
    }
    
    /**
     * Send upcoming assessment notification
     * @param userEmail User's email address
     * @param upcomingAssessments List of upcoming assessments
     */
    public void sendUpcomingNotification(String userEmail, List<Assessment> upcomingAssessments) {
        if (upcomingAssessments.isEmpty() || !isEmailNotificationsEnabled(userEmail)) {
            return;
        }
        
        String subject = "📅 Upcoming Assessments - GradeGoal";
        String content = buildUpcomingEmailContent(upcomingAssessments);
        
        sendEmail(userEmail, subject, content);
    }
    
    /**
     * Send real-time grade alert notification
     * @param userEmail User's email address
     * @param courseName Course name
     * @param assessmentName Assessment name
     * @param score Grade score
     * @param maxScore Maximum possible score
     */
    public void sendGradeAlertNotification(String userEmail, String courseName, String assessmentName, double score, double maxScore) {
        if (!isEmailNotificationsEnabled(userEmail)) {
            return;
        }
        
        String subject = "⚠️ Grade Alert - Low Score Detected";
        String content = buildGradeAlertEmailContent(courseName, assessmentName, score, maxScore);
        
        sendEmail(userEmail, subject, content);
    }
    
    
    /**
     * Send real-time course completion notification
     * @param userEmail User's email address
     * @param courseName Course name
     * @param finalGrade Final course grade
     * @param semester Semester information
     */
    public void sendCourseCompletionNotification(String userEmail, String courseName, String finalGrade, String semester) {
        if (!isEmailNotificationsEnabled(userEmail)) {
            return;
        }
        
        String subject = "🎓 Course Completed Successfully!";
        String content = buildCourseCompletionEmailContent(courseName, finalGrade, semester);
        
        sendEmail(userEmail, subject, content);
    }
    
    
    /**
     * Send real-time custom reminder notification
     * @param userEmail User's email address
     * @param reminderTitle Reminder title
     * @param reminderMessage Reminder message
     * @param reminderType Reminder type
     */
    public void sendCustomReminderNotification(String userEmail, String reminderTitle, String reminderMessage, String reminderType) {
        if (!isEmailNotificationsEnabled(userEmail)) {
            return;
        }
        
        String subject = "🔔 " + reminderTitle;
        String content = buildCustomReminderEmailContent(reminderTitle, reminderMessage, reminderType);
        
        sendEmail(userEmail, subject, content);
    }
    
    /**
     * Send goal achievement notification
     * @param userEmail User's email address
     * @param goalTitle Goal title
     * @param goalType Goal type
     * @param achievedValue Achieved value
     * @param courseName Course name
     * @param semester Semester
     */
    public void sendGoalAchievementNotification(String userEmail, String goalTitle, String goalType, String achievedValue, String courseName, String semester) {
        if (!isEmailNotificationsEnabled(userEmail)) {
            return;
        }
        
        String subject = "🎯 Goal Achieved - Congratulations!";
        String content = buildGoalAchievementEmailContent(goalTitle, goalType, achievedValue, courseName, semester);
        
        sendEmail(userEmail, subject, content);
    }
    
    /**
     * Send assessment created notification
     * @param userEmail User's email address
     * @param assessmentName Assessment name
     * @param assessmentType Assessment type (Quiz, Assignment, etc.)
     * @param courseName Course name
     * @param dueDate Due date
     * @param semester Semester
     * @param yearLevel Year level
     */
    public void sendAssessmentCreatedNotification(String userEmail, String assessmentName, String assessmentType, String courseName, String dueDate, String semester, String yearLevel) {
        if (!isEmailNotificationsEnabled(userEmail)) {
            return;
        }
        
        String subject = "📚 New Assessment Added - " + courseName;
        String content = buildAssessmentCreatedEmailContent(assessmentName, assessmentType, courseName, dueDate, semester, yearLevel);
        
        sendEmail(userEmail, subject, content);
    }
    
    /**
     * Send email using Gmail SMTP
     * @param toEmail Recipient email
     * @param subject Email subject
     * @param content Email content
     */
    public void sendEmail(String toEmail, String subject, String content) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail, "GradeGoal");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(content, true); // true indicates HTML content
            
            mailSender.send(message);
            logger.info("Email sent successfully to: {}", toEmail);
            
        } catch (MessagingException e) {
            logger.error("Failed to send email to: {}", toEmail, e);
        } catch (Exception e) {
            logger.error("Error sending email to: {}", toEmail, e);
        }
    }
    
    /**
     * Build HTML content for overdue assessments email
     * @param overdueAssessments List of overdue assessments
     * @return HTML email content
     */
    private String buildOverdueEmailContent(List<Assessment> overdueAssessments) {
        StringBuilder content = new StringBuilder();
        
        content.append("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #ff6b6b, #ee5a52); color: white; padding: 20px; border-radius: 8px; text-align: center; }
                    .assessment-item { background: #f8f9fa; border-left: 4px solid #ff6b6b; padding: 15px; margin: 10px 0; border-radius: 4px; }
                    .course-name { font-weight: bold; color: #495057; }
                    .assessment-title { font-size: 18px; margin: 5px 0; }
                    .due-date { color: #dc3545; font-weight: bold; }
                    .footer { text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>⚠️ Overdue Assessments</h1>
                        <p>You have <strong>""").append(overdueAssessments.size()).append("</strong> overdue assessment(s)</p>");
        
        content.append("""
                    </div>
                    <div class="assessments">
            """);
        
        for (Assessment assessment : overdueAssessments) {
            content.append("<div class=\"assessment-item\">");
            content.append("<div class=\"course-name\">").append(assessment.getCourseName()).append("</div>");
            content.append("<div class=\"assessment-title\">").append(assessment.getAssessmentName()).append("</div>");
            content.append("<div class=\"due-date\">Due: ").append(assessment.getDueDate().format(DateTimeFormatter.ofPattern("MMM dd, yyyy"))).append("</div>");
            if (assessment.getDescription() != null && !assessment.getDescription().isEmpty()) {
                content.append("<div>").append(assessment.getDescription()).append("</div>");
            }
            content.append("</div>");
        }
        
        content.append("""
                    </div>
                    <div class="footer">
                        <p>Please complete these assessments as soon as possible to avoid further penalties.</p>
                        <p>Visit <a href="http://localhost:3000">GradeGoal</a> to manage your assessments.</p>
                    </div>
                </div>
            </body>
            </html>
            """);
        
        return content.toString();
    }
    
    /**
     * Build HTML content for upcoming assessments email
     * @param upcomingAssessments List of upcoming assessments
     * @return HTML email content
     */
    private String buildUpcomingEmailContent(List<Assessment> upcomingAssessments) {
        StringBuilder content = new StringBuilder();
        
        content.append("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 20px; border-radius: 8px; text-align: center; }
                    .assessment-item { background: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; margin: 10px 0; border-radius: 4px; }
                    .course-name { font-weight: bold; color: #495057; }
                    .assessment-title { font-size: 18px; margin: 5px 0; }
                    .due-date { color: #667eea; font-weight: bold; }
                    .footer { text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📅 Upcoming Assessments</h1>
                        <p>You have <strong>""").append(upcomingAssessments.size()).append("</strong> assessment(s) due in the next ").append(upcomingDaysBefore).append(" days</p>");
        
        content.append("""
                    </div>
                    <div class="assessments">
            """);
        
        for (Assessment assessment : upcomingAssessments) {
            content.append("<div class=\"assessment-item\">");
            content.append("<div class=\"course-name\">").append(assessment.getCourseName()).append("</div>");
            content.append("<div class=\"assessment-title\">").append(assessment.getAssessmentName()).append("</div>");
            content.append("<div class=\"due-date\">Due: ").append(assessment.getDueDate().format(DateTimeFormatter.ofPattern("MMM dd, yyyy"))).append("</div>");
            if (assessment.getDescription() != null && !assessment.getDescription().isEmpty()) {
                content.append("<div>").append(assessment.getDescription()).append("</div>");
            }
            content.append("</div>");
        }
        
        content.append("""
                    </div>
                    <div class="footer">
                        <p>Don't forget to prepare for these upcoming assessments!</p>
                        <p>Visit <a href="http://localhost:3000">GradeGoal</a> to manage your assessments.</p>
                    </div>
                </div>
            </body>
            </html>
            """);
        
        return content.toString();
    }
    
    /**
     * Build HTML content for grade alert email
     * @param courseName Course name
     * @param assessmentName Assessment name
     * @param score Grade score
     * @param maxScore Maximum possible score
     * @return HTML email content
     */
    private String buildGradeAlertEmailContent(String courseName, String assessmentName, double score, double maxScore) {
        StringBuilder content = new StringBuilder();
        double percentage = (score / maxScore) * 100;
        
        content.append("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #ff6b6b, #ee5a52); color: white; padding: 20px; border-radius: 8px; text-align: center; }
                    .alert-box { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0; border-radius: 4px; }
                    .score-display { font-size: 24px; font-weight: bold; color: #dc3545; text-align: center; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>⚠️ Grade Alert</h1>
                        <p>Low score detected in your assessment</p>
                    </div>
                    <div class="alert-box">
                        <h3>Assessment Details:</h3>
                        <p><strong>Course:</strong> """).append(courseName).append("</p>");
        content.append("<p><strong>Assessment:</strong> ").append(assessmentName).append("</p>");
        content.append("<div class=\"score-display\">");
        content.append("Score: ").append(String.format("%.1f", score)).append(" / ").append(String.format("%.1f", maxScore));
        content.append("<br>Percentage: ").append(String.format("%.1f", percentage)).append("%");
        content.append("</div>");
        
        content.append("""
                    </div>
                    <div class="footer">
                        <p>Consider reviewing the material and seeking help if needed.</p>
                        <p>Visit <a href="http://localhost:3000">GradeGoal</a> to view detailed feedback.</p>
                    </div>
                </div>
            </body>
            </html>
            """);
        
        return content.toString();
    }
    
    
    /**
     * Build HTML content for course completion email
     * @param courseName Course name
     * @param finalGrade Final grade
     * @param semester Semester
     * @return HTML email content
     */
    private String buildCourseCompletionEmailContent(String courseName, String finalGrade, String semester) {
        StringBuilder content = new StringBuilder();
        
        content.append("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #6f42c1, #e83e8c); color: white; padding: 20px; border-radius: 8px; text-align: center; }
                    .completion-box { background: #e2e3e5; border: 1px solid #d6d8db; padding: 20px; margin: 20px 0; border-radius: 4px; }
                    .grade-display { font-size: 32px; font-weight: bold; color: #6f42c1; text-align: center; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎓 Course Completed!</h1>
                        <p>Congratulations on successfully completing your course!</p>
                    </div>
                    <div class="completion-box">
                        <h3>Course Details:</h3>
                        <p><strong>Course:</strong> """).append(courseName).append("</p>");
        content.append("<p><strong>Semester:</strong> ").append(semester).append("</p>");
        content.append("<div class=\"grade-display\">Final Grade: ").append(finalGrade).append("</div>");
        
        content.append("""
                    </div>
                    <div class="footer">
                        <p>Well done! Your hard work has paid off. Ready for the next challenge?</p>
                        <p>Visit <a href="http://localhost:3000">GradeGoal</a> to view your academic progress.</p>
                    </div>
                </div>
            </body>
            </html>
            """);
        
        return content.toString();
    }
    
    
    /**
     * Build HTML content for custom reminder email
     * @param reminderTitle Reminder title
     * @param reminderMessage Reminder message
     * @param reminderType Reminder type
     * @return HTML email content
     */
    private String buildCustomReminderEmailContent(String reminderTitle, String reminderMessage, String reminderType) {
        StringBuilder content = new StringBuilder();
        
        content.append("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #fd7e14, #e83e8c); color: white; padding: 20px; border-radius: 8px; text-align: center; }
                    .reminder-box { background: #f8f9fa; border: 1px solid #e9ecef; padding: 20px; margin: 20px 0; border-radius: 4px; }
                    .reminder-type { background: #e9ecef; padding: 5px 10px; border-radius: 15px; font-size: 12px; color: #495057; }
                    .footer { text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔔 """).append(reminderTitle).append("</h1>");
        content.append("<p>Don't forget this important reminder!</p>");
        content.append("</div>");
        content.append("<div class=\"reminder-box\">");
        content.append("<span class=\"reminder-type\">").append(reminderType).append("</span>");
        content.append("<p style=\"margin-top: 15px;\">").append(reminderMessage).append("</p>");
        content.append("</div>");
        
        content.append("""
                    <div class="footer">
                        <p>Stay organized and on top of your academic responsibilities!</p>
                        <p>Visit <a href="http://localhost:3000">GradeGoal</a> to manage your reminders.</p>
                    </div>
                </div>
            </body>
            </html>
            """);
        
        return content.toString();
    }

    /**
     * Send custom event notification email
     */
    public void sendCustomEventNotification(String userEmail, String eventTitle, String eventDescription, java.time.LocalDateTime eventDate, String action) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(userEmail);
            helper.setSubject("Custom Event " + action.substring(0, 1).toUpperCase() + action.substring(1) + " - " + eventTitle);
            helper.setText(buildCustomEventEmailContent(eventTitle, eventDescription, eventDate, action), true);
            
            mailSender.send(message);
            logger.info("Custom event notification email sent successfully to: {}", userEmail);
            
        } catch (MessagingException e) {
            logger.error("Failed to send custom event notification email to: {}", userEmail, e);
            throw new RuntimeException("Failed to send custom event notification email", e);
        }
    }

    /**
     * Build custom event email content
     */
    private String buildCustomEventEmailContent(String eventTitle, String eventDescription, java.time.LocalDateTime eventDate, String action) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEEE, MMMM dd, yyyy 'at' h:mm a");
        String formattedDate = eventDate.format(formatter);
        String capitalizedAction = action.substring(0, 1).toUpperCase() + action.substring(1);
        
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Custom Event Notification</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
                    .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; text-align: center; }
                    .content { padding: 30px; }
                    .event-card { background: linear-gradient(135deg, #9c27b0 0%%, #673ab7 100%%); color: white; padding: 20px; border-radius: 12px; margin: 20px 0; }
                    .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
                    .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 10px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎯 GradeGoal</h1>
                        <p>Custom Event Notification</p>
                    </div>
                    <div class="content">
                        <h2>Your Custom Event Has Been %s</h2>
                        <div class="event-card">
                            <h3>📅 %s</h3>
                            <p><strong>Description:</strong> %s</p>
                            <p><strong>Event Date:</strong> %s</p>
                        </div>
                        <p>Your custom event has been successfully %s and is now visible in your calendar.</p>
                        <p>You'll receive reminders based on your notification preferences.</p>
                        <div style="text-align: center;">
                            <a href="http://localhost:3000/calendar" class="button">View Calendar</a>
                        </div>
                    </div>
                    <div class="footer">
                        <p>Visit <a href="http://localhost:3000">GradeGoal</a> to manage your events and notifications.</p>
                    </div>
                </div>
            </body>
            </html>
            """, capitalizedAction, eventTitle, eventDescription, formattedDate, action);
    }

    /**
     * Send assessment reminder notification email
     */
    public void sendAssessmentReminderNotification(String userEmail, List<Assessment> reminderAssessments) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(userEmail);
            helper.setSubject("📚 Study Reminder - " + reminderAssessments.size() + " Assessment(s) in 2 Days");
            helper.setText(buildAssessmentReminderEmailContent(reminderAssessments), true);
            
            mailSender.send(message);
            logger.info("Assessment reminder notification email sent successfully to: {}", userEmail);
            
        } catch (MessagingException e) {
            logger.error("Failed to send assessment reminder notification email to: {}", userEmail, e);
            throw new RuntimeException("Failed to send assessment reminder notification email", e);
        }
    }

    /**
     * Build assessment reminder email content
     */
    private String buildAssessmentReminderEmailContent(List<Assessment> reminderAssessments) {
        StringBuilder content = new StringBuilder();
        content.append("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Study Reminder</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
                    .content { padding: 30px; }
                    .reminder-card { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 20px; border-radius: 12px; margin: 20px 0; }
                    .assessment-item { background-color: #f1f5f9; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #667eea; }
                    .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
                    .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 10px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📚 GradeGoal</h1>
                        <p>Study Reminder - 2 Days Ahead</p>
                    </div>
                    <div class="content">
                        <div class="reminder-card">
                            <h2>⏰ Time to Review!</h2>
                            <p>You have <strong>" + reminderAssessments.size() + " assessment(s)</strong> coming up in 2 days. 
                            This is the perfect time to review your materials and prepare for success!</p>
                        </div>
                        
                        <h3>📋 Upcoming Assessments:</h3>
            """);
        
        for (Assessment assessment : reminderAssessments) {
            content.append(String.format("""
                        <div class="assessment-item">
                            <h4>%s</h4>
                            <p><strong>Course:</strong> %s</p>
                            <p><strong>Due Date:</strong> %s</p>
                            <p><strong>Max Points:</strong> %s</p>
                        </div>
                """, 
                assessment.getAssessmentName(),
                assessment.getCourseName(),
                assessment.getDueDate(),
                assessment.getMaxPoints()
            ));
        }
        
        content.append("""
                        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h4>💡 Study Tips:</h4>
                            <ul>
                                <li>Review your course materials and notes</li>
                                <li>Practice with sample questions if available</li>
                                <li>Create a study schedule for the next 2 days</li>
                                <li>Get a good night's sleep before the assessment</li>
                                <li>Stay hydrated and eat well</li>
                            </ul>
                        </div>
                        
                        <div style="text-align: center;">
                            <a href="http://localhost:3000/calendar" class="button">View Calendar</a>
                            <a href="http://localhost:3000/dashboard" class="button">Go to Dashboard</a>
                        </div>
                    </div>
                    <div class="footer">
                        <p>Visit <a href="http://localhost:3000">GradeGoal</a> to manage your assessments and track your progress.</p>
                    </div>
                </div>
            </body>
            </html>
            """);
        
        return content.toString();
    }
    
    /**
     * Build HTML content for goal achievement email
     * @param goalTitle Goal title
     * @param goalType Goal type
     * @param achievedValue Achieved value
     * @param courseName Course name
     * @param semester Semester
     * @return HTML email content
     */
    private String buildGoalAchievementEmailContent(String goalTitle, String goalType, String achievedValue, String courseName, String semester) {
        StringBuilder content = new StringBuilder();
        
        content.append("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 20px; border-radius: 8px; text-align: center; }
                    .achievement-box { background: #e8f5e8; border: 1px solid #d4edda; padding: 20px; margin: 20px 0; border-radius: 4px; }
                    .goal-display { font-size: 24px; font-weight: bold; color: #28a745; text-align: center; margin: 20px 0; }
                    .stats { display: flex; justify-content: space-around; margin: 20px 0; }
                    .stat-box { background: #f8f9fa; padding: 15px; text-align: center; border-radius: 4px; flex: 1; margin: 0 5px; }
                    .stat-label { font-size: 12px; color: #6c757d; margin-bottom: 5px; }
                    .stat-value { font-size: 18px; font-weight: bold; color: #495057; }
                    .footer { text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎯 Goal Achieved!</h1>
                        <p>Congratulations on achieving your academic goal!</p>
                    </div>
                    <div class="achievement-box">
                        <h3>Goal Details:</h3>
                        <p><strong>Goal:</strong> """).append(goalTitle).append("</p>");
        content.append("<p><strong>Type:</strong> ").append(goalType).append("</p>");
        content.append("<p><strong>Course:</strong> ").append(courseName).append("</p>");
        content.append("<p><strong>Semester:</strong> ").append(semester).append("</p>");
        
        content.append("<div class=\"goal-display\">");
        content.append("Achieved: ").append(achievedValue).append("<br>");
        content.append("🎉 SUCCESS!").append("</div>");
        
        content.append("""
                    </div>
                    <div class="stats">
                        <div class="stat-box">
                            <div class="stat-label">Goal Type</div>
                            <div class="stat-value">""").append(goalType).append("</div>");
        content.append("</div>");
        content.append("<div class=\"stat-box\">");
        content.append("<div class=\"stat-label\">Achieved Value</div>");
        content.append("<div class=\"stat-value\">").append(achievedValue).append("</div>");
        content.append("</div>");
        content.append("<div class=\"stat-box\">");
        content.append("<div class=\"stat-label\">Status</div>");
        content.append("<div class=\"stat-value\">✅ Achieved</div>");
        content.append("</div>");
        
        content.append("""
                    </div>
                    <div class="footer">
                        <p>Keep up the excellent work! Achieving goals is a step towards academic success.</p>
                        <p>Visit <a href="http://localhost:3000">GradeGoal</a> to track your progress and set new goals.</p>
                    </div>
                </div>
            </body>
            </html>
            """);
        
        return content.toString();
    }
    
    /**
     * Build HTML content for assessment created email
     * @param assessmentName Assessment name
     * @param assessmentType Assessment type
     * @param courseName Course name
     * @param dueDate Due date
     * @param semester Semester
     * @param yearLevel Year level
     * @return HTML email content
     */
    private String buildAssessmentCreatedEmailContent(String assessmentName, String assessmentType, String courseName, String dueDate, String semester, String yearLevel) {
        StringBuilder content = new StringBuilder();
        
        content.append("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #4285f4, #34a853); color: white; padding: 20px; border-radius: 8px; text-align: center; }
                    .assessment-box { background: #e8f0fe; border: 1px solid #d2e3fc; padding: 20px; margin: 20px 0; border-radius: 4px; }
                    .assessment-title { font-size: 22px; font-weight: bold; color: #1565c0; text-align: center; margin: 15px 0; }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                    .info-item { background: #f8f9fa; padding: 12px; border-radius: 4px; border-left: 4px solid #4285f4; }
                    .info-label { font-size: 12px; color: #6c757d; margin-bottom: 3px; text-transform: uppercase; }
                    .info-value { font-weight: bold; color: #495057; }
                    .due-date-highlight { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 15px 0; border-radius: 4px; text-align: center; }
                    .footer { text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📚 New Assessment Added</h1>
                        <p>A new assessment has been added to your course!</p>
                    </div>
                    <div class="assessment-box">
                        <div class="assessment-title">""").append(assessmentName).append("</div>");
        
        content.append("<div class=\"info-grid\">");
        content.append("<div class=\"info-item\">");
        content.append("<div class=\"info-label\">Assessment Type</div>");
        content.append("<div class=\"info-value\">").append(assessmentType).append("</div>");
        content.append("</div>");
        content.append("<div class=\"info-item\">");
        content.append("<div class=\"info-label\">Course</div>");
        content.append("<div class=\"info-value\">").append(courseName).append("</div>");
        content.append("</div>");
        content.append("<div class=\"info-item\">");
        content.append("<div class=\"info-label\">Semester</div>");
        content.append("<div class=\"info-value\">").append(semester).append("</div>");
        content.append("</div>");
        content.append("<div class=\"info-item\">");
        content.append("<div class=\"info-label\">Year Level</div>");
        content.append("<div class=\"info-value\">").append(yearLevel).append("</div>");
        content.append("</div>");
        content.append("</div>");
        
        content.append("<div class=\"due-date-highlight\">");
        content.append("<h3 style=\"margin: 0; color: #856404;\">📅 Due Date</h3>");
        content.append("<p style=\"margin: 5px 0; font-size: 18px; font-weight: bold; color: #856404;\">").append(dueDate).append("</p>");
        content.append("</div>");
        
        content.append("""
                    </div>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h4 style="margin-top: 0; color: #495057;">💡 Important Notes:</h4>
                        <ul style="margin: 0; padding-left: 20px;">
                            <li>Make sure to prepare thoroughly for this assessment</li>
                            <li>Check the due date and plan your schedule accordingly</li>
                            <li>Review course materials and assignments</li>
                            <li>Contact your instructor if you have any questions</li>
                        </ul>
                    </div>
                    <div class="footer">
                        <p>Stay organized and on top of your assignments!</p>
                        <p>Visit <a href="http://localhost:3000">GradeGoal</a> to track your progress and manage your assessments.</p>
                    </div>
                </div>
            </body>
            </html>
            """);
        
        return content.toString();
    }
}
