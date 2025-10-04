package com.project.back_end.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.back_end.models.Doctor;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    // 🔹 Find a doctor by email
    Doctor findByEmail(String email);

    // 🔹 Find doctors whose name partially matches (case-sensitive)
    List<Doctor> findByNameLike(String name);

    // 🔹 Find doctors by name (partial, case-insensitive) and specialty (exact, case-insensitive)
    List<Doctor> findByNameContainingIgnoreCaseAndSpecialtyIgnoreCase(String name, String specialty);

    // 🔹 Find all doctors by specialty (case-insensitive)
    List<Doctor> findBySpecialtyIgnoreCase(String specialty);
}
