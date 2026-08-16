package com.jobtracker.job_tracker.repository;

import com.jobtracker.job_tracker.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Repository
public interface ApplicationRepository
        extends JpaRepository<Application, Long> {
    List<Application> findByStatus(Application.Status status);
    List<Application> findByCompanyId(Long companyId);
    long countByStatus(Application.Status status);
    long countByStatusAndStatusUpdatedAtBetween(
            Application.Status status,
            LocalDateTime start,
            LocalDateTime end
    );

    long countByDateAppliedBetween(
            LocalDate start,
            LocalDate end
    );
}