package com.jobtracker.job_tracker.service;

import com.jobtracker.job_tracker.entity.Application;
import com.jobtracker.job_tracker.repository.ApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import com.jobtracker.job_tracker.dto.ApplicationResponse;
import com.jobtracker.job_tracker.entity.Company;

@Service
public class ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private CompanyService companyService;

    private ApplicationResponse toResponse(Application application) {
        return new ApplicationResponse(application);
    }

    public List<ApplicationResponse> getAllApplications() {

        return applicationRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();

    }

    public Application getApplicationById(Long id) {
        return applicationRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Application not found: " + id));
    }

    public List<Application> getByStatus(Application.Status status) {
        return applicationRepository.findByStatus(status);
    }

    public Application createApplication(Application application) {
        Company company = companyService.getOrCreateCompany(application.getCompany().getName());
        application.setCompany(company);
        return applicationRepository.save(application);
    }

    public Application updateApplication(Long id, Application updated) {

        Application existing = getApplicationById(id);

        existing.setJobTitle(updated.getJobTitle());
        existing.setStatus(updated.getStatus());
        existing.setDateApplied(updated.getDateApplied());
        existing.setJobPostingUrl(updated.getJobPostingUrl());
        existing.setSalaryMin(updated.getSalaryMin());
        existing.setSalaryMax(updated.getSalaryMax());
        existing.setNotes(updated.getNotes());

        Company company = companyService.getOrCreateCompany(updated.getCompany().getName());

        existing.setCompany(company);
        return applicationRepository.save(existing);
    }

    public void deleteApplication(Long id) {
        applicationRepository.deleteById(id);
    }

    public ApplicationResponse getApplicationResponseById(Long id) {

        Application application = getApplicationById(id);

        return toResponse(application);
    }
}

