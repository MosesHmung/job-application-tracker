package com.jobtracker.job_tracker.repository;

import com.jobtracker.job_tracker.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InterviewRepository
        extends JpaRepository<Interview, Long> {
    List<Interview> findByApplicationId(Long applicationId);
}