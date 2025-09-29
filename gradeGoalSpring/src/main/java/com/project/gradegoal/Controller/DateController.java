package com.project.gradegoal.Controller;


import com.project.gradegoal.Entity.Date;
import com.project.gradegoal.Repository.DateRepository;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/assessments")
@CrossOrigin(origins = "http://localhost:3000")
public class DateController {
    private final DateRepository dateRepository;

    public DateController(DateRepository dateRepository) {
        this.dateRepository = dateRepository;
    }

    @GetMapping
    public List<Date> getAllAssessments() {
        return dateRepository.findAll();
    }
}
