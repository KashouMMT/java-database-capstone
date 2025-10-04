package com.project.back_end.controllers;

import com.project.back_end.models.Doctor;
import com.project.back_end.models.dto.Login;
import com.project.back_end.services.DoctorService;
import com.project.back_end.services.TokenValidationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Doctor REST Controller
 * Base path: ${api.path}doctor
 * 
 * Endpoints (suggested contract to match your frontend):
 *   GET    /                             -> list all doctors
 *   GET    /availability/{user}/{doctorId}/{date}/{token}
 *   GET    /filter/{name}/{time}/{specialty}
 *   POST   /save/{token}                 -> admin creates doctor
 *   POST   /login                        -> doctor login
 *   PUT    /update/{token}               -> admin updates doctor
 *   DELETE /delete/{id}/{token}          -> admin deletes doctor
 *
 * Notes:
 * - TokenValidationService returns EMPTY map when token is valid (per your convention).
 * - `user` path variable for availability should be "patient" or "doctor".
 */
@Validated
@RestController
@RequestMapping("${api.path}doctor")
public class DoctorController {

    private final DoctorService doctorService;
    private final TokenValidationService tokenValidationService;

    public DoctorController(DoctorService doctorService,
                            TokenValidationService tokenValidationService) {
        this.doctorService = doctorService;
        this.tokenValidationService = tokenValidationService;
    }

    // ---------------------------------------------------------------------
    // 3) Check a doctor's availability for a given date
    // ---------------------------------------------------------------------
    @GetMapping("/availability/{user}/{doctorId}/{date}/{token}")
    public ResponseEntity<Map<String, Object>> getDoctorAvailability(
            @PathVariable("user") String user,
            @PathVariable("doctorId") Long doctorId,
            @PathVariable("date") String dateIso,         // yyyy-MM-dd
            @PathVariable("token") String token) {

        Map<String, Object> body = new HashMap<>();

        // Validate token for user role ("patient" or "doctor")
        Map<String, Object> validation = tokenValidationService.validateToken(token, user);
        if (validation != null && !validation.isEmpty()) {
            body.put("success", false);
            body.put("message", validation.getOrDefault("error", "Invalid token"));
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
        }

        try {
            LocalDate date = LocalDate.parse(dateIso);
            // You can shape the result to your needs: boolean, time slots, etc.
            Object availability = doctorService.getAvailabilityForDate(doctorId, date);

            body.put("success", true);
            body.put("availability", availability);
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            body.put("success", false);
            body.put("message", "Failed to fetch availability");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
        }
    }

    // ---------------------------------------------------------------------
    // 4) Get all doctors
    // ---------------------------------------------------------------------
    @GetMapping
    public ResponseEntity<Map<String, Object>> getDoctor() {
        Map<String, Object> body = new HashMap<>();
        try {
            List<Doctor> doctors = doctorService.getAllDoctors();
            body.put("doctors", doctors);
            body.put("success", true);
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            body.put("success", false);
            body.put("message", "Failed to load doctors");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
        }
    }

    // ---------------------------------------------------------------------
    // 5) Save (register) a new doctor (ADMIN)
    // Frontend hits: POST /doctor/save/{token}
    // ---------------------------------------------------------------------
    @PostMapping("/save/{token}")
    public ResponseEntity<Map<String, Object>> saveDoctor(
            @PathVariable("token") String token,
            @Valid @RequestBody Doctor doctor) {

        Map<String, Object> body = new HashMap<>();

        // Validate admin token
        Map<String, Object> validation = tokenValidationService.validateToken(token, "admin");
        if (validation != null && !validation.isEmpty()) {
            body.put("success", false);
            body.put("message", validation.getOrDefault("error", "Invalid token"));
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
        }

        try {
            if (doctorService.existsByEmail(doctor.getEmail())) {
                body.put("success", false);
                body.put("message", "Doctor already exists");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
            }

            Doctor saved = doctorService.saveDoctor(doctor);
            body.put("success", true);
            body.put("message", "Doctor saved successfully");
            body.put("doctor", saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(body);

        } catch (Exception e) {
            body.put("success", false);
            body.put("message", "Failed to save doctor");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
        }
    }

    // ---------------------------------------------------------------------
    // 6) Doctor login
    // Frontend hits: POST /doctor/login
    // Returns: { success, token, message }
    // ---------------------------------------------------------------------
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> doctorLogin(@Valid @RequestBody Login loginDto) {
        Map<String, Object> body = new HashMap<>();
        try {
            Map<String, Object> result = doctorService.login(loginDto);
            boolean success = Boolean.TRUE.equals(result.get("success"));
            return ResponseEntity.status(success ? HttpStatus.OK : HttpStatus.UNAUTHORIZED).body(result);
        } catch (Exception e) {
            body.put("success", false);
            body.put("message", "Login failed");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
        }
    }

    // ---------------------------------------------------------------------
    // 7) Update existing doctor (ADMIN)
    // Frontend hits: PUT /doctor/update/{token}
    // ---------------------------------------------------------------------
    @PutMapping("/update/{token}")
    public ResponseEntity<Map<String, Object>> updateDoctor(
            @PathVariable("token") String token,
            @Valid @RequestBody Doctor doctor) {

        Map<String, Object> body = new HashMap<>();

        // Validate admin token
        Map<String, Object> validation = tokenValidationService.validateToken(token, "admin");
        if (validation != null && !validation.isEmpty()) {
            body.put("success", false);
            body.put("message", validation.getOrDefault("error", "Invalid token"));
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
        }

        try {
            if (!doctorService.existsById(doctor.getId())) {
                body.put("success", false);
                body.put("message", "Doctor not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
            }

            Doctor updated = doctorService.updateDoctor(doctor);
            body.put("success", true);
            body.put("message", "Doctor updated successfully");
            body.put("doctor", updated);
            return ResponseEntity.ok(body);

        } catch (Exception e) {
            body.put("success", false);
            body.put("message", "Failed to update doctor");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
        }
    }

    // ---------------------------------------------------------------------
    // 8) Delete doctor by ID (ADMIN)
    // Frontend hits: DELETE /doctor/delete/{id}/{token}
    // Matches your JS: deleteDoctor(id, token)
    // ---------------------------------------------------------------------
    @DeleteMapping("/delete/{id}/{token}")
    public ResponseEntity<Map<String, Object>> deleteDoctor(
            @PathVariable("id") Long id,
            @PathVariable("token") String token) {

        Map<String, Object> body = new HashMap<>();

        // Validate admin token
        Map<String, Object> validation = tokenValidationService.validateToken(token, "admin");
        if (validation != null && !validation.isEmpty()) {
            body.put("success", false);
            body.put("message", validation.getOrDefault("error", "Invalid token"));
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
        }

        try {
            if (!doctorService.existsById(id)) {
                body.put("success", false);
                body.put("message", "Doctor not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
            }

            doctorService.deleteById(id);
            body.put("success", true);
            body.put("message", "Doctor deleted successfully");
            return ResponseEntity.ok(body);

        } catch (Exception e) {
            body.put("success", false);
            body.put("message", "Failed to delete doctor");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
        }
    }

    // ---------------------------------------------------------------------
    // 9) Filter doctors by name, time, and specialty
    // Frontend hits: GET /doctor/filter/{name}/{time}/{specialty}
    // Matches your JS: filterDoctors(name, time, specialty)
    // Use "null" placeholders for empty filters as your frontend does.
    // ---------------------------------------------------------------------
    @GetMapping("/filter/{name}/{time}/{specialty}")
    public ResponseEntity<Map<String, Object>> filter(
            @PathVariable("name") String name,
            @PathVariable("time") String time,
            @PathVariable("specialty") String specialty) {

        Map<String, Object> body = new HashMap<>();
        try {
            String n = "null".equalsIgnoreCase(name) ? null : name;
            String t = "null".equalsIgnoreCase(time) ? null : time;
            String s = "null".equalsIgnoreCase(specialty) ? null : specialty;

            List<Doctor> doctors = doctorService.filter(n, t, s);

            body.put("success", true);
            body.put("doctors", doctors);
            return ResponseEntity.ok(body);

        } catch (Exception e) {
            body.put("success", false);
            body.put("message", "Failed to filter doctors");
            body.put("doctors", List.of());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
        }
    }
}
