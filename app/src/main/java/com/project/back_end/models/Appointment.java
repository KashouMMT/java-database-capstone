package com.project.back_end.models;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "appointments")
public class Appointment {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@NotNull(message = "Doctor is required!")
	@ManyToOne(fetch = FetchType.LAZY,optional = false)
	@JoinColumn(name = "doctor_id", nullable = false)
	private Doctor doctor;
	
	@NotNull(message = "Patient is required!")
	@ManyToOne(fetch = FetchType.LAZY,optional = false)
	@JoinColumn(name = "patient_id",nullable = false)
	private Patient patient;
	
	@NotNull(message = "Appointment time is required")
	@Future
	@Column(name = "appointment_time",nullable = false)
	private LocalDateTime appointmentTime;
	
    /**
     * Status of the appointment:
     * 0 = Scheduled
     * 1 = Completed
     */
    @NotNull(message = "Status is required")
    @Min(0)
    @Max(1)
    @Column(nullable = false)
    private Integer status;
    
 // ----- Helpers (not persisted) -----

    /**
     * Returns the end time of the appointment (1 hour after start time).
     */
    @Transient
    public LocalDateTime getEndTime() {
        return appointmentTime != null
                ? appointmentTime.plus(Duration.ofHours(1))
                : null;
    }

    /**
     * Returns only the date portion of the appointment.
     */
    @Transient
    public LocalDate getAppointmentDate() {
        return appointmentTime != null
                ? appointmentTime.toLocalDate()
                : null;
    }

    /**
     * Returns only the time portion of the appointment.
     */
    @Transient
    public LocalTime getAppointmentTimeOnly() {
        return appointmentTime != null
                ? appointmentTime.toLocalTime()
                : null;
    }

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Doctor getDoctor() {
		return doctor;
	}

	public void setDoctor(Doctor doctor) {
		this.doctor = doctor;
	}

	public Patient getPatient() {
		return patient;
	}

	public void setPatient(Patient patient) {
		this.patient = patient;
	}

	public LocalDateTime getAppointmentTime() {
		return appointmentTime;
	}

	public void setAppointmentTime(LocalDateTime appointmentTime) {
		this.appointmentTime = appointmentTime;
	}

	public Integer getStatus() {
		return status;
	}

	public void setStatus(Integer status) {
		this.status = status;
	}

	public Appointment(Long id, @NotNull(message = "Doctor is required!") Doctor doctor,
			@NotNull(message = "Patient is required!") Patient patient,
			@NotNull(message = "Appointment time is required") @Future LocalDateTime appointmentTime,
			@NotNull(message = "Status is required") @Min(0) @Max(1) Integer status) {
		super();
		this.id = id;
		this.doctor = doctor;
		this.patient = patient;
		this.appointmentTime = appointmentTime;
		this.status = status;
	}
    
    public Appointment() {
    	
    }
}

