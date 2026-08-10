package com.jobtracker.job_tracker.dto;

import com.jobtracker.job_tracker.entity.Application;
import lombok.Data;

import java.time.LocalDate;


@Data
public class ApplicationResponse {

    private Long id;
    private String jobTitle;
    private String status;
    private LocalDate dateApplied;
    private Integer salaryMin;
    private Integer salaryMax;
    private String notes;
    private String companyName;

    public ApplicationResponse(Application application) {
        this.id = application.getId();
        this.jobTitle = application.getJobTitle();
        this.status = application.getStatus().name();
        this.dateApplied = application.getDateApplied();
        this.salaryMin = application.getSalaryMin();
        this.salaryMax = application.getSalaryMax();
        this.notes = application.getNotes();
        this.companyName = application.getCompany().getName();
    }

}

