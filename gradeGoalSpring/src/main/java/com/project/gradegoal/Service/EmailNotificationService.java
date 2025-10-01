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
}
