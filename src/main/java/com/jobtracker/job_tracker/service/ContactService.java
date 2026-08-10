package com.jobtracker.job_tracker.service;

import com.jobtracker.job_tracker.entity.Contact;
import com.jobtracker.job_tracker.repository.ContactRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ContactService {

    @Autowired
    private ContactRepository contactRepository;

    public List<Contact> getByApplicationId(Long applicationId) {
        return contactRepository
                .findByApplicationId(applicationId);
    }

    public Contact createContact(Contact contact) {
        return contactRepository.save(contact);
    }

    public Contact updateContact(Long id, Contact updated) {
        Contact existing = contactRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Contact not found: " + id));
        existing.setName(updated.getName());
        existing.setRole(updated.getRole());
        existing.setEmail(updated.getEmail());
        existing.setLinkedIn(updated.getLinkedIn());
        existing.setNotes(updated.getNotes());
        return contactRepository.save(existing);
    }

    public void deleteContact(Long id) {
        contactRepository.deleteById(id);
    }
}