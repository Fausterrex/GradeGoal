package com.project.gradegoal.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import java.io.File;
import java.io.FileOutputStream;
import java.util.Map;

@RestController
@RequestMapping("/api/exports")
@CrossOrigin(origins = "http://localhost:5173")
public class ExportController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private static final String EXPORT_DIR = "uploads/exports/";

    @PostMapping("/log")
    public ResponseEntity<String> logExport(@RequestBody Map<String, Object> payload) {
        try {
            Long userId = ((Number) payload.get("userId")).longValue();
            String exportType = (String) payload.get("exportType");
            String fileName = (String) payload.get("fileName");
            String fileBase64 = (String) payload.get("fileData");
            Object exportParams = payload.get("exportParameters");

            String createdAt = (String) payload.get("createdAt");
            String completedAt = (String) payload.get("completedAt");
            String expiresAt = (String) payload.get("expiresAt");

            File dir = new File(EXPORT_DIR);
            if (!dir.exists()) dir.mkdirs();

            String filePath = EXPORT_DIR + fileName;

            // 🧾 Save the PDF file from base64
            if (fileBase64 != null && fileBase64.startsWith("data:application/pdf")) {
                String base64Content = fileBase64.split(",")[1];
                byte[] decodedBytes = java.util.Base64.getDecoder().decode(base64Content);
                try (FileOutputStream fos = new FileOutputStream(filePath)) {
                    fos.write(decodedBytes);
                }
            }

            // Insert full data into export_logs
            String sql = """
                INSERT INTO export_logs 
                (user_id, export_type, file_name, file_path, export_parameters, status, created_at, completed_at, expires_at)
                VALUES (?, ?, ?, ?, CAST(? AS JSON), 'COMPLETED', ?, ?, ?)
                """;

            jdbcTemplate.update(sql,
                    userId,
                    exportType,
                    fileName,
                    filePath,
                    exportParams != null ? exportParams.toString() : "{}",
                    createdAt,
                    completedAt,
                    expiresAt
            );

            return ResponseEntity.ok("✅ Export logged successfully with timestamps and parameters.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ Failed to log export: " + e.getMessage());
        }
    }
}

