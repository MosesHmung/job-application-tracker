package com.jobtracker.job_tracker.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "interviews")
@Data
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer round;

    @Enumerated(EnumType.STRING)
    private Type type;

    private LocalDateTime scheduledDate;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private String outcome;

    @ManyToOne
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    public enum Type {
        PHONE,
        VIDEO,
        ONSITE,
        TECHNICAL,
        BEHAVIOURAL,
        FINAL
    }
}