package com.project.back_end.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.back_end.models.Patient;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    // Find a patient by exact email match
    Patient findByEmail(String email);

    // Find a patient by email OR phone (either can match)
    Patient findByEmailOrPhone(String email, String phone);
}
