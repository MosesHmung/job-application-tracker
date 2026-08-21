package com.jobtracker.job_tracker.controller;

import com.jobtracker.job_tracker.entity.Application;
import com.jobtracker.job_tracker.repository.ApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.time.LocalDateTime;
import java.time.DayOfWeek;
import java.time.temporal.TemporalAdjusters;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin(origins = "*")
public class StatsController {

    @Autowired
    private ApplicationRepository applicationRepository;

    @GetMapping
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();

        LocalDateTime now = LocalDateTime.now();

        LocalDateTime startOfWeek = now
                .with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
                .toLocalDate()
                .atStartOfDay();

        LocalDateTime endOfWeek = startOfWeek.plusDays(7);

        stats.put("total", applicationRepository.count());

        stats.put("applied",
                applicationRepository.countByStatus(
                        Application.Status.APPLIED));

        stats.put("phoneScreen",
                applicationRepository.countByStatus(
                        Application.Status.PHONE_SCREEN));

        stats.put("interviewing",
                applicationRepository.countByStatus(
                        Application.Status.INTERVIEWING));

        stats.put("offers",
                applicationRepository.countByStatus(
                        Application.Status.OFFER));

        stats.put("rejected",
                applicationRepository.countByStatus(
                        Application.Status.REJECTED));

        stats.put("watching",
                applicationRepository.countByStatus(
                        Application.Status.WATCHING));

        stats.put("applicationsThisWeek",
                applicationRepository.countByDateAppliedBetweenAndStatusNot(
                        startOfWeek.toLocalDate(),
                        endOfWeek.minusDays(1).toLocalDate(),
                        Application.Status.WATCHING
                ));

        stats.put("interviewingThisWeek",
                applicationRepository.countByStatusAndStatusUpdatedAtBetween(
                        Application.Status.INTERVIEWING,
                        startOfWeek,
                        endOfWeek));

        stats.put("offersThisWeek",
                applicationRepository.countByStatusAndStatusUpdatedAtBetween(
                        Application.Status.OFFER,
                        startOfWeek,
                        endOfWeek));

        stats.put("watchingThisWeek",
                applicationRepository.countByStatusAndStatusUpdatedAtBetween(
                        Application.Status.WATCHING,
                        startOfWeek,
                        endOfWeek));

        stats.put("withdrawn",
                applicationRepository.countByStatus(
                        Application.Status.WITHDRAWN));

        return stats;
    }
}