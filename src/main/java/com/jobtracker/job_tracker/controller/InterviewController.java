package com.jobtracker.job_tracker.controller;

import com.jobtracker.job_tracker.entity.Interview;
import com.jobtracker.job_tracker.service.InterviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/interviews")
@CrossOrigin(origins = "*")
public class InterviewController {

    @Autowired
    private InterviewService interviewService;

    @GetMapping("/application/{applicationId}")
    public List<Interview> getByApplication(
            @PathVariable Long applicationId) {
        return interviewService.getByApplicationId(applicationId);
    }

    @PostMapping
    public Interview createInterview(
            @RequestBody Interview interview) {
        return interviewService.createInterview(interview);
    }

    @PutMapping("/{id}")
    public Interview updateInterview(
            @PathVariable Long id,
            @RequestBody Interview interview) {
        return interviewService.updateInterview(id, interview);
    }

    @DeleteMapping("/{id}")
    public void deleteInterview(@PathVariable Long id) {
        interviewService.deleteInterview(id);
    }
}