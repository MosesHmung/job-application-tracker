package com.jobtracker.job_tracker.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonBackReference;
import java.time.LocalDateTime;


@Entity
@Table(name = "applications")
@Data
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String jobTitle;

    @Enumerated(EnumType.STRING)
    private Status status = Status.APPLIED;

    private LocalDate dateApplied;
    private LocalDateTime statusUpdatedAt;
    private String jobPostingUrl;
    private Integer salaryMin;
    private Integer salaryMax;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL)
    private List<Interview> interviews;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL)
    private List<Contact> contacts;

    public enum Status {
        WATCHING,
        APPLIED,
        PHONE_SCREEN,
        INTERVIEWING,
        OFFER,
        REJECTED,
        WITHDRAWN
    }
}