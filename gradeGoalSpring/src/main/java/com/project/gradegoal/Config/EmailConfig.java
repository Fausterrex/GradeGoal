package com.project.gradegoal.Config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.Properties;

/**
 * Email Configuration
 * 
 * Configuration class for email-related features.
 * Enables scheduling for automated email notifications.
 */
@Configuration
@EnableScheduling
public class EmailConfig {

    @Bean
    public JavaMailSender getJavaMailSender() {
        // Load .env file
        Dotenv dotenv = Dotenv.configure()
                .directory("./")
                .ignoreIfMalformed()
                .ignoreIfMissing()
                .load();

        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost("smtp.gmail.com");
        mailSender.setPort(587);
        
        // Get credentials from .env file or environment variables
        String username = dotenv.get("MAIL_USERNAME");
        String password = dotenv.get("MAIL_PASSWORD");
        
        // Fallback to environment variables if .env values are null
        if (username == null) {
            username = System.getenv("MAIL_USERNAME");
        }
        if (password == null) {
            password = System.getenv("MAIL_PASSWORD");
        }
        
        mailSender.setUsername(username);
        mailSender.setPassword(password);

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", true);
        props.put("mail.smtp.starttls.enable", true);

        return mailSender;
    }
}
