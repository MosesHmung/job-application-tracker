package com.jobtracker.job_tracker.repository;

import com.jobtracker.job_tracker.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyRepository
        extends JpaRepository<Company, Long> {

    List<Company> findByNameContainingIgnoreCase(String name);

    Optional<Company> findByNameIgnoreCase(String name);
}