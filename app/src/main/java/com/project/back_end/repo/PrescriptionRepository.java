package com.project.back_end.repo;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.project.back_end.models.Prescription;

@Repository
public interface PrescriptionRepository extends MongoRepository<Prescription, String> {

    // 🔹 Find all prescriptions linked to a specific appointment
    List<Prescription> findByAppointmentId(Long appointmentId);
}
