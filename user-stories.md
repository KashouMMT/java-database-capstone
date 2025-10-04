# 🧩 Admin Stories

---

## **User Story 1: Admin Login**

**Title:**  
_Admin logs into the portal securely_

**User Story:**  
_As an admin, I want to log into the portal with my username and password so that I can manage the platform securely._

**Acceptance Criteria:**
1. The system must provide a login page with fields for username and password.  
2. The login form must include a **“Login”** button.  
3. The system must validate credentials against stored admin records in the database.  
4. On successful login, the admin is redirected to the **Admin Dashboard**.  
5. On failed login, an error message (e.g., “Invalid username or password”) is displayed without exposing sensitive details.  
6. The session remains active until the admin logs out or the session times out due to inactivity.  
7. Passwords must be stored securely (hashed + salted) and never shown in plain text.  

**Priority:** High  
**Story Points:** 3  

---

## **User Story 2: Admin Logout**

**Title:**  
_Admin logs out of the portal_

**User Story:**  
_As an admin, I want to log out of the portal so that I can protect system access when I’m not using it._

**Acceptance Criteria:**
1. The system must provide a logout option accessible from the dashboard.  
2. On logout, the current session must be terminated.  
3. The admin must be redirected to the login page.  
4. No restricted content should be accessible after logout (e.g., via the back button).  

**Priority:** High  
**Story Points:** 2  

---

## **User Story 3: Add Doctor**

**Title:**  
_Admin adds a new doctor to the portal_

**User Story:**  
_As an admin, I want to add doctors to the portal so that they can access the system and manage patients and appointments._

**Acceptance Criteria:**
1. The admin can access an **“Add Doctor”** form from the dashboard.  
2. The form must include fields for doctor’s name, email, specialty, and login credentials.  
3. On submission, the system must validate required fields.  
4. The new doctor is stored in the MySQL database as a user with the **Doctor** role.  
5. A confirmation message is displayed after successful creation.  
6. Duplicate entries (e.g., same email) must be prevented.  

**Priority:** High  
**Story Points:** 5  

---

## **User Story 4: Delete Doctor**

**Title:**  
_Admin deletes an existing doctor’s profile_

**User Story:**  
_As an admin, I want to delete a doctor’s profile so that I can remove doctors who are no longer part of the system._

**Acceptance Criteria:**
1. The admin can view a list of doctors in the portal.  
2. Each doctor entry must include a delete option.  
3. On selecting delete, the system must ask for confirmation (e.g., “Are you sure?”).  
4. Once confirmed, the doctor record must be removed from the MySQL database.  
5. A success message is displayed after deletion.  
6. Deleted doctors should no longer be able to log into the portal.  

**Priority:** Medium  
**Story Points:** 3  

---

## **User Story 5: Run MySQL Stored Procedure**

**Title:**  
_Admin runs a stored procedure to track monthly appointments_

**User Story:**  
_As an admin, I want to run a stored procedure in the MySQL CLI so that I can get the number of appointments per month and track usage statistics._

**Acceptance Criteria:**
1. The system must have a predefined stored procedure in MySQL (e.g., `GetAppointmentsPerMonth`).  
2. When executed, the procedure must return the count of appointments grouped by month.  
3. The output must be accurate and reflect current data.  
4. The procedure must handle cases with no appointments for a month (e.g., return 0).  
5. Execution must be documented for repeatability (e.g., command to run in CLI).  
6. Admins can use the output to generate usage reports.  

**Priority:** Medium  
**Story Points:** 5  

---

# 👩‍⚕️ Patient Stories

---

## **User Story 6: View Doctors Without Login**

**Title:**  
_Patient views list of doctors without logging in_

**User Story:**  
_As a patient, I want to view a list of doctors without logging in so that I can explore available options before registering._

**Acceptance Criteria:**
1. The system must provide a publicly accessible page listing doctors.  
2. The list must include doctor name, specialty, and availability.  
3. Booking actions must require registration or login.  
4. Patients can search or filter doctors by specialty.  

**Priority:** Medium  
**Story Points:** 3  

---

## **User Story 7: Patient Signup**

**Title:**  
_Patient signs up using email and password_

**User Story:**  
_As a patient, I want to sign up with my email and password so that I can book appointments in the portal._

**Acceptance Criteria:**
1. The signup form must include name, email, password, and contact info.  
2. The system must validate unique email addresses.  
3. Passwords must be stored securely (hashed + salted).  
4. On successful signup, the patient is redirected to the login page with a confirmation message.  

**Priority:** High  
**Story Points:** 5  

---

## **User Story 8: Patient Login**

**Title:**  
_Patient logs into the portal_

**User Story:**  
_As a patient, I want to log into the portal so that I can manage my bookings._

**Acceptance Criteria:**
1. The login page must allow entry of email and password.  
2. The system must validate credentials against patient records in the database.  
3. On successful login, the patient is redirected to the **Patient Dashboard**.  
4. Failed logins must show a clear error message without exposing details.  
5. The session remains active until logout or timeout.  

**Priority:** High  
**Story Points:** 3  

---

## **User Story 9: Patient Logout**

**Title:**  
_Patient logs out of the portal_

**User Story:**  
_As a patient, I want to log out of the portal so that I can secure my account._

**Acceptance Criteria:**
1. A logout option must be available in the patient dashboard.  
2. On logout, the current session must be terminated.  
3. After logout, the system redirects to the login page.  
4. No restricted content should be accessible after logout (e.g., via back button).  

**Priority:** High  
**Story Points:** 2  

---

## **User Story 10: Book Appointment**

**Title:**  
_Patient books an hour-long appointment_

**User Story:**  
_As a patient, I want to log in and book an hour-long appointment with a doctor so that I can consult with them._

**Acceptance Criteria:**
1. The patient must be logged in to book an appointment.  
2. The system must allow selection of doctor, date, and time slot.  
3. Appointment duration is fixed at **1 hour**.  
4. The system must prevent double-booking of doctors or patients for the same time slot.  
5. A confirmation message must be shown after successful booking.  
6. Appointment details must be saved in the MySQL database.  

**Priority:** High  
**Story Points:** 8  

---

## **User Story 11: View Upcoming Appointments**

**Title:**  
_Patient views upcoming appointments_

**User Story:**  
_As a patient, I want to view my upcoming appointments so that I can prepare accordingly._

**Acceptance Criteria:**
1. Patients must be logged in to access their appointments.  
2. The system must display a list of upcoming appointments with details (doctor, date, time).  
3. Past appointments must be excluded or shown separately.  
4. If no upcoming appointments exist, the system must display an informative message.  

**Priority:** Medium  
**Story Points:** 3  

---

# 🩺 Doctor Stories

---

## **User Story 12: Doctor Login**

**Title:**  
_Doctor logs into the portal_

**User Story:**  
_As a doctor, I want to log into the portal so that I can manage my appointments._

**Acceptance Criteria:**
1. The login form must accept email/username and password.  
2. Credentials must be validated against stored doctor records in the database.  
3. On successful login, the doctor is redirected to the **Doctor Dashboard**.  
4. On failed login, an appropriate error message must be shown.  
5. The session remains active until logout or timeout.  

**Priority:** High  
**Story Points:** 3  

---

## **User Story 13: Doctor Logout**

**Title:**  
_Doctor logs out of the portal_

**User Story:**  
_As a doctor, I want to log out of the portal so that I can protect my data and prevent unauthorized access._

**Acceptance Criteria:**
1. A logout option must be available from the doctor dashboard.  
2. On logout, the system must terminate the current session.  
3. The doctor must be redirected to the login page.  
4. After logout, no restricted content should be accessible (e.g., via browser back button).  

**Priority:** High  
**Story Points:** 2  

---

## **User Story 14: View Appointment Calendar**

**Title:**  
_Doctor views appointment calendar_

**User Story:**  
_As a doctor, I want to view my appointment calendar so that I can stay organized and plan my consultations effectively._

**Acceptance Criteria:**
1. The doctor must be logged in to access the appointment calendar.  
2. The calendar must display appointments by date and time.  
3. Each appointment entry must include patient name and consultation time.  
4. Doctors must be able to navigate by day, week, or month.  
5. The interface should clearly indicate available and booked slots.  

**Priority:** Medium  
**Story Points:** 5  

---

## **User Story 15: Mark Unavailability**

**Title:**  
_Doctor marks unavailability in the system_

**User Story:**  
_As a doctor, I want to mark my unavailability so that patients can only book appointments during my available slots._

**Acceptance Criteria:**
1. The doctor can access a scheduling section from the dashboard.  
2. The doctor must be able to specify unavailable dates or time ranges.  
3. The system must automatically block those time slots from patient booking.  
4. A confirmation message must appear after successful update.  
5. Marked unavailable slots should be clearly visible on the calendar.  

**Priority:** Medium  
**Story Points:** 5  

---

## **User Story 16: Update Doctor Profile**

**Title:**  
_Doctor updates profile information_

**User Story:**  
_As a doctor, I want to update my profile with specialization and contact information so that patients have accurate and up-to-date details._

**Acceptance Criteria:**
1. The doctor can access an “Edit Profile” section from the dashboard.  
2. Editable fields include name, specialization, contact info, and bio.  
3. The system must validate required fields before saving.  
4. Updated details must be stored in the MySQL database.  
5. Patients viewing the doctor list must see the updated information.  
6. A success message should appear after successful profile update.  

**Priority:** Medium  
**Story Points:** 3  

---

## **User Story 17: View Patient Details for Upcoming Appointments**

**Title:**  
_Doctor views patient details for upcoming appointments_

**User Story:**  
_As a doctor, I want to view patient details for my upcoming appointments so that I can prepare before the consultation._

**Acceptance Criteria:**
1. The doctor must be logged in to view upcoming appointments.  
2. Each appointment entry should include patient name, age, contact info, and appointment date/time.  
3. The system must ensure only the assigned doctor can access patient details.  
4. Past appointments should be displayed separately or archived.  
5. If no upcoming appointments exist, display an informative message.  

**Priority:** Medium  
**Story Points:** 4  

