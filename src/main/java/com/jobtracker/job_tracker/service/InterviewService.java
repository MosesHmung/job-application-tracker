package com.jobtracker.job_tracker.service;

import com.jobtracker.job_tracker.entity.Interview;
import com.jobtracker.job_tracker.repository.InterviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class InterviewService {

    @Autowired
    private InterviewRepository interviewRepository;

    public List<Interview> getByApplicationId(Long applicationId) {
        return interviewRepository
                .findByApplicationId(applicationId);
    }

    public Interview createInterview(Interview interview) {
        return interviewRepository.save(interview);
    }

    public Interview updateInterview(Long id, Interview updated) {
        Interview existing = interviewRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Interview not found: " + id));
        existing.setRound(updated.getRound());
        existing.setType(updated.getType());
        existing.setScheduledDate(updated.getScheduledDate());
        existing.setNotes(updated.getNotes());
        existing.setOutcome(updated.getOutcome());
        return interviewRepository.save(existing);
    }

    public void deleteInterview(Long id) {
        interviewRepository.deleteById(id);
    }
}