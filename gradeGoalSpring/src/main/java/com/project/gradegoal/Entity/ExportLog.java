package com.project.gradegoal.Entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "export_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ExportLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "export_id")
    private Long exportId;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "export_type", nullable = false, length = 50)
    private ExportType exportType;
    
    @Column(name = "file_name", nullable = false, length = 500)
    private String fileName;
    
    @Column(name = "file_path", length = 1000)
    private String filePath;
    
    @Column(name = "export_parameters", columnDefinition = "JSON")
    private String exportParameters;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ExportStatus status = ExportStatus.PENDING;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
    
    public enum ExportType {
        PDF_REPORT,
        CSV_GRADES,
        JSON_BACKUP,
        TRANSCRIPT,
        ADMIN_OVERVIEW  // Shortened from ADMIN_SYSTEM_OVERVIEW to fit database column
    }
    
    public enum ExportStatus {
        PENDING,
        PROCESSING,
        COMPLETED,
        FAILED
    }
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
