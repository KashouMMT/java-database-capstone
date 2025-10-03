# Application Schema & Architecture

## Overview
This Spring Boot application is designed to support a **healthcare management system** that provides both **dashboard views** for administrative and medical staff and **RESTful APIs** for other modules.  
The architecture combines **Spring MVC**, **Thymeleaf**, and **REST controllers**, ensuring a clear separation between the web-based user interface and API-driven services.

---

## Controllers

### Spring MVC with Thymeleaf
- Used primarily for the **Admin Dashboard** and **Doctor Dashboard**.  
- Provides a **server-side rendered user interface**, enabling administrators and doctors to manage system data interactively.

### REST Controllers
- Expose **RESTful endpoints** for modules such as patient management, appointment scheduling, and prescription handling.  
- Designed to support **external clients** (e.g., mobile apps, third-party integrations) with JSON-based APIs.

---

## Service Layer
- All incoming requests, whether from MVC controllers or REST controllers, are routed through a **common service layer**.  
- Ensures **consistent business logic execution** across both web-based dashboards and APIs.  
- Promotes **reusability** by decoupling controller logic from data access.  
- Manages **transaction boundaries** and coordinates with repositories.

---

## Data Persistence Layer
The application interacts with **two databases** based on the type of data being managed:

### MySQL (Relational Database)
- Stores structured and relational data:
  - Patients  
  - Doctors  
  - Appointments  
  - Admin records  
- Managed via **Spring Data JPA**, with entities mapped to relational tables.

### MongoDB (NoSQL Document Database)
- Used specifically for **prescription data**.  
- Stores documents in a **flexible schema**, well-suited for dynamic and semi-structured medical records.  
- Managed via **Spring Data MongoDB**, using document models.

---

## Data & Control Flow (Step-by-Step)

1. **User Interaction**  
   - Admins and Doctors access the **Thymeleaf Dashboards** (`AdminDashboard`, `DoctorDashboard`).  
   - Patients and other modules interact through **REST APIs** (`Appointments`, `PatientDashboard`, `PatientRecord`).  

2. **Controller Layer**  
   - Requests are directed to either:  
     - **Thymeleaf Controllers** (for dashboards), or  
     - **REST Controllers** (for API-based modules).  

3. **Service Layer Invocation**  
   - Both controller types forward requests to the **Service Layer**, which encapsulates all business logic and decision-making.  

4. **Repository Delegation**  
   - The service layer determines whether the request involves:  
     - **MySQL Repositories** (relational data), or  
     - **MongoDB Repository** (document data).  

5. **Database Access**  
   - Repositories interact with the respective databases:  
     - **MySQL Database** for Patients, Doctors, Appointments, and Admins.  
     - **MongoDB Database** for Prescription data.  

6. **Model Mapping**  
   - Data is mapped back into application-level models:  
     - **JPA Entities** for MySQL tables.  
     - **Document Models** for MongoDB collections.  

7. **Response Handling**  
   - The service layer returns the processed results to the controllers, which then:  
     - Render **Thymeleaf views (HTML pages)** for dashboards, or  
     - Send **JSON responses** for REST API clients.  

