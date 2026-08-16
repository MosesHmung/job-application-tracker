package com.jobtracker.job_tracker.controller;

import com.jobtracker.job_tracker.entity.Application;
import com.jobtracker.job_tracker.service.ApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.jobtracker.job_tracker.dto.ApplicationResponse;


@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "*")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    @GetMapping
    public List<ApplicationResponse> getAllApplications() {
        return applicationService.getAllApplications();
    }

    @GetMapping("/{id}")
    public ApplicationResponse getApplication(@PathVariable Long id) {
        return applicationService.getApplicationResponseById(id);
    }

    @GetMapping("/status/{status}")
    public List<Application> getByStatus(
            @PathVariable Application.Status status) {
        return applicationService.getByStatus(status);
    }

    @PostMapping
    public Application createApplication(
            @RequestBody Application application) {
        return applicationService.createApplication(application);
    }

    @PutMapping("/{id}")
    public Application updateApplication(
            @PathVariable Long id,
            @RequestBody Application application) {
        return applicationService.updateApplication(id, application);
    }

    @DeleteMapping("/{id}")
    public void deleteApplication(@PathVariable Long id) {
        applicationService.deleteApplication(id);
    }
}