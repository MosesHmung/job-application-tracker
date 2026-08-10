package com.jobtracker.job_tracker.service;

import com.jobtracker.job_tracker.entity.Company;
import com.jobtracker.job_tracker.repository.CompanyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CompanyService {

    @Autowired
    private CompanyRepository companyRepository;

    public List<Company> getAllCompanies() {
        return companyRepository.findAll();
    }

    public Company getCompanyById(Long id) {
        return companyRepository.findById(id).orElseThrow(() -> new RuntimeException("Company not found: " + id));
    }

    public Company createCompany(Company company) {
        return companyRepository.save(company);
    }

    public Company updateCompany(Long id, Company updated) {
        Company existing = getCompanyById(id);
        existing.setName(updated.getName());
        existing.setWebsite(updated.getWebsite());
        existing.setIndustry(updated.getIndustry());
        existing.setLocation(updated.getLocation());
        existing.setNotes(updated.getNotes());
        return companyRepository.save(existing);
    }

    public void deleteCompany(Long id) {
        companyRepository.deleteById(id);
    }

    public Company getOrCreateCompany(String companyName) {

        String cleanedName = companyName.trim();

        return companyRepository
                .findByNameIgnoreCase(cleanedName)
                .map(existingCompany -> {
                    existingCompany.setName(cleanedName);
                    return companyRepository.save(existingCompany);
                })
                .orElseGet(() -> {
                    Company company = new Company();
                    company.setName(cleanedName);

                    return companyRepository.save(company);
                });
    }
}