package com.project.gradegoal.Repository;

import com.project.gradegoal.Entity.ExportLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExportLogRepository extends JpaRepository<ExportLog, Long> {
    
    List<ExportLog> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    List<ExportLog> findByExportTypeOrderByCreatedAtDesc(String exportType);
    
    @Query("SELECT e FROM ExportLog e WHERE e.status = 'COMPLETED' ORDER BY e.createdAt DESC")
    List<ExportLog> findCompletedExports();
    
    @Query("SELECT COUNT(e) FROM ExportLog e WHERE e.userId = :userId AND e.exportType = :exportType")
    long countByUserIdAndExportType(Long userId, String exportType);
}
