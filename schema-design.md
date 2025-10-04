## MySQL Database Design

This section proposes a clean, production-ready relational model for the clinic. It emphasizes **data integrity**, **auditability**, and **non-overlapping bookings** by using doctor availability time slots that appointments reference one-to-one.

---

### Design Overview (Key Decisions)

- **Retention:** Patients/doctors are **soft-deleted** (`deleted_at`) to preserve history. Foreign keys use `ON DELETE RESTRICT` to prevent accidental data loss.  
- **No double-booking:** Appointments reference a **single doctor time slot**; a `UNIQUE` constraint on `appointments.slot_id` guarantees only one appointment per slot.  
- **Security:** Passwords are stored **hashed + salted** (application-level), never plain text.  
- **Validation:** Email/phone format validation occurs in application code; DB enforces uniqueness and NOT NULL where appropriate.  
- **Time zones:** Store datetimes in UTC; convert in the app layer.

---

### Entities (Tables)

- `patients`
- `doctors`
- `admins`
- `clinic_locations`
- `doctor_time_slots` (doctor availability / unavailability, the source of truth for booking)
- `appointments`
- `payments`
- `prescriptions` (tied to appointments)

---

### Table: patients
- `id`: INT UNSIGNED, **PK**, AUTO_INCREMENT  
- `first_name`: VARCHAR(100), NOT NULL  
- `last_name`: VARCHAR(100), NOT NULL  
- `email`: VARCHAR(255), NOT NULL, **UNIQUE**  
- `phone`: VARCHAR(30), NULL  
- `date_of_birth`: DATE, NULL  
- `gender`: ENUM('male','female','other','prefer_not_to_say'), NULL  
- `notes`: TEXT, NULL  
- `created_at`: TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP  
- `updated_at`: TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP  
- `deleted_at`: TIMESTAMP, NULL  _(soft delete)_

**Indexes:** (`email`), (`last_name`,`first_name`)

---

### Table: doctors
- `id`: INT UNSIGNED, **PK**, AUTO_INCREMENT  
- `first_name`: VARCHAR(100), NOT NULL  
- `last_name`: VARCHAR(100), NOT NULL  
- `email`: VARCHAR(255), NOT NULL, **UNIQUE**  
- `phone`: VARCHAR(30), NULL  
- `specialization`: VARCHAR(120), NOT NULL  
- `bio`: TEXT, NULL  
- `location_id`: INT UNSIGNED, NULL, **FK → clinic_locations(id)**  
- `password_hash`: CHAR(60), NOT NULL  _(bcrypt/argon2 hash)_  
- `is_active`: TINYINT(1), NOT NULL, DEFAULT 1  
- `created_at`: TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP  
- `updated_at`: TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP  
- `deleted_at`: TIMESTAMP, NULL

**Indexes:** (`email`), (`specialization`), (`location_id`)

---

### Table: admins
- `id`: INT UNSIGNED, **PK**, AUTO_INCREMENT  
- `username`: VARCHAR(100), NOT NULL, **UNIQUE**  
- `email`: VARCHAR(255), NOT NULL, **UNIQUE**  
- `password_hash`: CHAR(60), NOT NULL  
- `last_login_at`: TIMESTAMP, NULL  
- `created_at`: TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP  
- `updated_at`: TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP  
- `deleted_at`: TIMESTAMP, NULL

**Indexes:** (`username`), (`email`)

---

### Table: clinic_locations
- `id`: INT UNSIGNED, **PK**, AUTO_INCREMENT  
- `name`: VARCHAR(120), NOT NULL  
- `address_line1`: VARCHAR(255), NOT NULL  
- `address_line2`: VARCHAR(255), NULL  
- `city`: VARCHAR(100), NOT NULL  
- `state_region`: VARCHAR(100), NULL  
- `postal_code`: VARCHAR(20), NULL  
- `country`: VARCHAR(100), NOT NULL  
- `phone`: VARCHAR(30), NULL  
- `timezone`: VARCHAR(64), NOT NULL DEFAULT 'UTC'  
- `created_at`: TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP  
- `updated_at`: TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

**Indexes:** (`city`,`country`)

---

### Table: doctor_time_slots  _(doctor availability & unavailability)_
> **Why this table?** It eliminates overlaps. Each bookable slot (e.g., 60 minutes) is a row. Mark unavailability by setting `is_available = 0` or by not generating slots for those periods.

- `id`: INT UNSIGNED, **PK**, AUTO_INCREMENT  
- `doctor_id`: INT UNSIGNED, NOT NULL, **FK → doctors(id)**  
- `location_id`: INT UNSIGNED, NULL, **FK → clinic_locations(id)**  
- `start_time_utc`: DATETIME, NOT NULL  
- `end_time_utc`: DATETIME, NOT NULL  
- `is_available`: TINYINT(1), NOT NULL, DEFAULT 1  
- `created_at`: TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP  
- `updated_at`: TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP  

**Constraints / Rules:**  
- `CHECK (end_time_utc > start_time_utc)`  
- `UNIQUE (doctor_id, start_time_utc, end_time_utc)`  _(no duplicate slots)_  

**Indexes:** (`doctor_id`, `start_time_utc`), (`location_id`)

---

### Table: appointments
- `id`: INT UNSIGNED, **PK**, AUTO_INCREMENT  
- `slot_id`: INT UNSIGNED, NOT NULL, **FK → doctor_time_slots(id)**  
- `doctor_id`: INT UNSIGNED, NOT NULL, **FK → doctors(id)**  
- `patient_id`: INT UNSIGNED, NOT NULL, **FK → patients(id)**  
- `location_id`: INT UNSIGNED, NULL, **FK → clinic_locations(id)**  
- `status`: ENUM('scheduled','completed','cancelled','no_show'), NOT NULL DEFAULT 'scheduled'  
- `reason`: VARCHAR(255), NULL  
- `notes`: TEXT, NULL  
- `created_at`: TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP  
- `updated_at`: TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP  

**Constraints / Rules:**  
- **One appointment per slot:** `UNIQUE (slot_id)`  
- **FKs** use `ON DELETE RESTRICT` to retain history.  
- Duration is implied by the slot’s start/end times.  

**Indexes:** (`doctor_id`,`patient_id`), (`status`), (`location_id`)

---

### Table: payments
- `id`: INT UNSIGNED, **PK**, AUTO_INCREMENT  
- `appointment_id`: INT UNSIGNED, NOT NULL, **FK → appointments(id)**  
- `amount_cents`: INT UNSIGNED, NOT NULL  
- `currency`: CHAR(3), NOT NULL DEFAULT 'USD'  
- `method`: ENUM('cash','card','transfer','other'), NOT NULL  
- `status`: ENUM('pending','paid','refunded','failed'), NOT NULL DEFAULT 'pending'  
- `transaction_ref`: VARCHAR(100), NULL, **UNIQUE**  
- `paid_at`: DATETIME, NULL  
- `created_at`: TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP  
- `updated_at`: TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP  

**Indexes:** (`appointment_id`), (`status`), (`transaction_ref`)

---

### Table: prescriptions
- `id`: INT UNSIGNED, **PK**, AUTO_INCREMENT  
- `appointment_id`: INT UNSIGNED, NOT NULL, **FK → appointments(id)**  
- `doctor_id`: INT UNSIGNED, NOT NULL, **FK → doctors(id)**  
- `patient_id`: INT UNSIGNED, NOT NULL, **FK → patients(id)**  
- `instructions`: TEXT, NOT NULL  
- `issued_at`: DATETIME, NOT NULL, DEFAULT CURRENT_TIMESTAMP  
- `created_at`: TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP  
- `updated_at`: TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP  

**Indexes:** (`appointment_id`), (`doctor_id`,`patient_id`)

---

## Example DDL (MySQL 8+, InnoDB, utf8mb4)

```sql
-- Schema: clinic
CREATE DATABASE IF NOT EXISTS clinic
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_0900_ai_ci;
USE clinic;

-- Helper: standard timestamp defaults are used throughout
-- Note: enforce UTC at application/connection level (e.g., SET time_zone = '+00:00')

CREATE TABLE clinic_locations (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state_region VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) NOT NULL,
  phone VARCHAR(30),
  timezone VARCHAR(64) NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_city_country (city, country)
) ENGINE=InnoDB;

CREATE TABLE patients (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(30),
  date_of_birth DATE,
  gender ENUM('male','female','other','prefer_not_to_say'),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  INDEX idx_patient_name (last_name, first_name)
) ENGINE=InnoDB;

CREATE TABLE doctors (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(30),
  specialization VARCHAR(120) NOT NULL,
  bio TEXT,
  location_id INT UNSIGNED,
  password_hash CHAR(60) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  CONSTRAINT fk_doctors_location
    FOREIGN KEY (location_id) REFERENCES clinic_locations(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_doctor_spec (specialization),
  INDEX idx_doctor_location (location_id)
) ENGINE=InnoDB;

CREATE TABLE admins (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash CHAR(60) NOT NULL,
  last_login_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
) ENGINE=InnoDB;

-- Availability slots for doctors (bookable or blocked)
CREATE TABLE doctor_time_slots (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  doctor_id INT UNSIGNED NOT NULL,
  location_id INT UNSIGNED,
  start_time_utc DATETIME NOT NULL,
  end_time_utc DATETIME NOT NULL,
  is_available TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_slots_doctor
    FOREIGN KEY (doctor_id) REFERENCES doctors(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_slots_location
    FOREIGN KEY (location_id) REFERENCES clinic_locations(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_slot_time CHECK (end_time_utc > start_time_utc),
  UNIQUE KEY uq_doctor_timespan (doctor_id, start_time_utc, end_time_utc),
  INDEX idx_slot_doctor_start (doctor_id, start_time_utc),
  INDEX idx_slot_location (location_id)
) ENGINE=InnoDB;

-- Appointments bind a patient to exactly one doctor_time_slot
CREATE TABLE appointments (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  slot_id INT UNSIGNED NOT NULL,
  doctor_id INT UNSIGNED NOT NULL,
  patient_id INT UNSIGNED NOT NULL,
  location_id INT UNSIGNED,
  status ENUM('scheduled','completed','cancelled','no_show') NOT NULL DEFAULT 'scheduled',
  reason VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_appt_slot
    FOREIGN KEY (slot_id) REFERENCES doctor_time_slots(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_appt_doctor
    FOREIGN KEY (doctor_id) REFERENCES doctors(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_appt_patient
    FOREIGN KEY (patient_id) REFERENCES patients(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_appt_location
    FOREIGN KEY (location_id) REFERENCES clinic_locations(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  UNIQUE KEY uq_one_appt_per_slot (slot_id),
  INDEX idx_appt_doctor_patient (doctor_id, patient_id),
  INDEX idx_appt_status (status)
) ENGINE=InnoDB;

CREATE TABLE payments (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  appointment_id INT UNSIGNED NOT NULL,
  amount_cents INT UNSIGNED NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  method ENUM('cash','card','transfer','other') NOT NULL,
  status ENUM('pending','paid','refunded','failed') NOT NULL DEFAULT 'pending',
  transaction_ref VARCHAR(100) UNIQUE,
  paid_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_payment_appt
    FOREIGN KEY (appointment_id) REFERENCES appointments(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_payment_status (status)
) ENGINE=InnoDB;

CREATE TABLE prescriptions (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  appointment_id INT UNSIGNED NOT NULL,
  doctor_id INT UNSIGNED NOT NULL,
  patient_id INT UNSIGNED NOT NULL,
  instructions TEXT NOT NULL,
  issued_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_rx_appt
    FOREIGN KEY (appointment_id) REFERENCES appointments(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_rx_doctor
    FOREIGN KEY (doctor_id) REFERENCES doctors(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_rx_patient
    FOREIGN KEY (patient_id) REFERENCES patients(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_rx_doctor_patient (doctor_id, patient_id)
) ENGINE=InnoDB;


## MongoDB Collection Design

MongoDB will complement your MySQL core (patients, doctors, appointments) by storing **flexible, semi-structured data** that doesn’t fit rigid tables—such as chat messages, rich doctor notes, file attachments, and read receipts.

---

### Collection: `messages`  _(doctor–patient chat & check-ins)_

**Why this fits MongoDB**
- Messages can include **free-form text**, **attachments**, **nested metadata**, **read receipts**, and **extensible tags**.
- We keep **authoritative identities** (patient/doctor/appointment) in MySQL, and **reference** them here via IDs.  
- We allow **denormalized snapshots** (e.g., patient/doctor display names) to speed reads without extra joins.

**One document = one message.** (Scales better than giant embedded arrays. Threads are grouped by `thread_id`.)

#### Example document
```json
{
  "_id": { "$oid": "66ff1a7f8f1b2c3456789abc" },
  "thread_id": "apt-2025-10-04-000123",                // app-defined thread identifier (e.g., per appointment)
  "type": "chat",                                      // chat | system | file | note
  "text": "Hi John, please drink more water and rest today.",
  "rich_text": {
    "markdown": "Hi **John**, please drink more water and rest today."
  },

  "relationalRefs": {
    "appointment_id": 123,                             // MySQL appointments.id
    "patient_id": 501,                                 // MySQL patients.id
    "doctor_id": 42,                                   // MySQL doctors.id
    "location_id": 3                                   // MySQL clinic_locations.id (optional)
  },

  "author": {
    "role": "doctor",                                  // doctor | patient | admin | system
    "id": 42,                                          // matches relationalRefs.doctor_id when role=doctor
    "display_name": "Dr. Alice Tan",
    "avatar_url": "https://cdn.example.com/u/42.png"
  },

  "attachments": [
    {
      "file_id": "f_9c1c4eaa",                         // storage key / UUID
      "file_name": "lab-report-2025-10-01.pdf",
      "mime_type": "application/pdf",
      "size_bytes": 183422,
      "sha256": "4c1f0c...e9b",
      "storage": { "bucket": "clinic-prod", "region": "ap-southeast-1" }
    }
  ],

  "read_receipts": [
    { "user_role": "patient", "user_id": 501, "read_at": { "$date": "2025-10-04T06:31:20Z" } }
  ],

  "tags": ["follow-up", "advice", "mild-symptoms"],

  "denorm": {                                          // optional snapshots for fast reads
    "patient": { "display_name": "John Smith" },
    "doctor":  { "specialization": "General Medicine" }
  },

  "meta": {
    "created_at": { "$date": "2025-10-04T06:30:00Z" },
    "created_by": { "role": "doctor", "id": 42 },
    "updated_at": { "$date": "2025-10-04T06:31:20Z" },
    "client": { "ua": "Mozilla/5.0", "platform": "web" },
    "version": 1
  }
}
