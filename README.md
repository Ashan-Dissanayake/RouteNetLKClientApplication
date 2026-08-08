# RouteNetLK Server Application

**Backend application for RouteNetLK — a fleet, operations, and service delivery management system designed around depot-level public transport workflows.**

Built with **Java 17 and Spring Boot 3**, the backend provides RESTful APIs for vehicle and employee management, permit and route operations, trip scheduling and execution, crew rostering, incident handling, maintenance, inventory, fare collection, reporting, and system administration.

The project focuses on implementing **complex business workflows, domain-specific validation, lifecycle state management, role-based security, relational data integrity, automated testing, and constraint-based operational optimization**.

---

## 🎯 Project Objectives

* Model and automate depot-level fleet and operational workflows.
* Implement domain-specific business rules and validation across operational modules.
* Provide secure REST APIs with authentication and role/privilege-based authorization.
* Maintain relational data integrity using MySQL, JPA, and Hibernate.
* Automate crew rostering and resource allocation using constraint-based optimization.
* Support reliable application behavior through unit and integration testing.
* Maintain a modular backend structure that separates shared infrastructure from domain-specific functionality.

---

## 🚀 Key Features

### Planning & Scheduling

* Employee and crew management
* Driver and conductor profile management
* License and validity validation
* Permit registration and route assignment
* Trip scheduling and operational planning
* Automated crew rostering using Timefold Solver

### Depot Operations

* Trip execution and dispatch management
* Trip lifecycle and state transition handling
* Incident and breakdown management
* Alternative vehicle allocation
* Operational workflow validation

### Fleet & Maintenance

* Vehicle registration and lifecycle management
* Vehicle availability and status tracking
* Fitness and compliance information
* Preventive maintenance records
* Vehicle service and repair history

### Inventory & Spare Parts

* Spare part catalogue management
* Inventory adjustments
* Internal spare part requests
* Goods Received Note (GRN) workflows
* Inventory transaction management

### Fare Collection & Reporting

* Daily fare collection management
* Multi-source revenue aggregation
* Dispatch summaries
* Revenue analysis
* Fleet utilization reporting
* Maintenance and incident reporting

### Security & Administration

* Stateless JWT-based authentication
* Role and privilege-based authorization
* User and privilege management
* Branch/depot configuration
* Automated email notifications
* Centralized exception handling

---

# 🏗️ Architecture

The backend follows a **modular layered architecture**. Domain modules are organized independently while shared infrastructure provides common functionality used across the application.

At the application level, the architecture can be represented as:

```text
┌──────────────────────────────────────────────────────────────┐
│                         REST API Layer                       │
│                         Controllers                          │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                       Application Layer                      │
│                           Services                           │
└──────────────────────────────┬───────────────────────────────┘
                               │
                ┌──────────────┴──────────────┐
                ▼                             ▼
┌───────────────────────────┐   ┌──────────────────────────────┐
│     Domain Modules        │   │     Cross-Cutting Services   │
│                           │   │                              │
│ Branch                    │   │ Security                     │
│ Employee                  │   │ Auditing                     │
│ Vehicle                   │   │ Notifications                │
│ Permit                    │   │ Email                        │
│ Route                     │   │ Exception Handling            │
│ Trip                      │   │ Transactions                  │
│ Crew                      │   │ Number Generation             │
│ Maintenance               │   │ Configuration                 │
│ Inventory                 │   │ Shared API Components          │
│ Fare Collection           │   │ Base Domain Components         │
│ Incident                  │   │                              │
│ ...                       │   │                              │
└──────────────┬────────────┘   └──────────────┬───────────────┘
               │                               │
               └──────────────┬────────────────┘
                              ▼
                 ┌────────────────────────┐
                 │     Repository Layer   │
                 │   Spring Data JPA      │
                 └────────────┬───────────┘
                              │
                              ▼
                       ┌─────────────┐
                       │    MySQL    │
                       └─────────────┘
```

---

## 📦 Project Structure

The source code is organized around business modules rather than placing all classes into a single global package structure.

```text
src/main/java/
│
├── module/
│   │
│   ├── branch/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── model/
│   │   │   ├── entity/
│   │   │   └── dto/
│   │   └── ...
│   │
│   ├── employee/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── model/
│   │   │   ├── entity/
│   │   │   └── dto/
│   │   └── ...
│   │
│   ├── vehicle/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── model/
│   │   │   ├── entity/
│   │   │   └── dto/
│   │   ├── validation/
│   │   └── state/
│   │
│   ├── permit/
│   ├── route/
│   │
│   ├── trip/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── model/
│   │   │   ├── entity/
│   │   │   └── dto/
│   │   ├── validation/
│   │   ├── state/
│   │   └── event/
│   │
│   ├── crew/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── model/
│   │   │   ├── entity/
│   │   │   └── dto/
│   │   └── ...
│   │
│   ├── maintenance/
│   ├── inventory/
│   ├── incident/
│   └── ...
│
├── dashboard/
│
├── report/
│
├── security/
│
└── shared/
    ├── api/
    ├── auditing/
    ├── config/
    ├── email/
    ├── exception/
    ├── notification/
    ├── model/
    ├── numbergeneration/
    └── transaction/
```

The exact module set evolves with the application, while the overall structure separates **domain-specific functionality from shared application infrastructure**.
Not every module contains every component. Validation, state, planning, and event components are introduced only where the corresponding domain requires them.

---

# 🧠 Engineering Highlights

## 1. Modular Domain Organization

Business functionality is grouped into domain modules such as Branch, Employee, Vehicle, Permit, Route, Trip, Crew, Maintenance, Inventory, and Incident.

Each major module maintains its own application components such as:

```text
Module
├── Controller
├── Service
├── Repository
└── Model
    ├── Entity
    └── DTO
```

This reduces coupling between unrelated business domains and makes individual modules easier to maintain and evolve.Additional components are introduced according to domain requirements.

---

## 2. Layered Application Architecture

The backend separates responsibilities across application layers:

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
Database
```

### Controller

Responsible for:

* HTTP request handling
* Request validation
* API response handling
* Mapping requests into application operations

### Service

Responsible for:

* Business logic
* Workflow orchestration
* Transaction boundaries
* Coordination between domain components

### Repository

Responsible for:

* Persistence operations
* Database queries
* Entity retrieval and storage

### Model

Contains persistence entities and DTOs used to represent domain data and API contracts.

---

## 3. Strategy Pattern for Business Validation

Business validation rules are separated into dedicated strategy implementations under the validation layer.

Instead of concentrating multiple business rules inside large service methods, individual strategies can encapsulate specific validation responsibilities.

Conceptually:

```text
                 ┌──────────────────────┐
                 │ Validation Context   │
                 └──────────┬───────────┘
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
       Strategy A      Strategy B      Strategy C
       Uniqueness      Create Rule     Domain Rule
```

This approach supports:

* Single-responsibility validation components
* Easier testing of individual rules
* Reduced conditional complexity
* Extensibility when new business rules are introduced

---

## 4. State Pattern for Lifecycle Management

State-based business behavior is isolated through the State pattern for workflows where operations depend on the current lifecycle state.

This allows state-specific behavior and transition rules to remain separated from general service orchestration.

The approach helps prevent invalid state transitions and keeps lifecycle rules explicit within the domain model.

---

## 5. Constraint-Based Planning with Timefold

The system uses **Timefold Solver** for selected operational planning problems, particularly crew rostering and resource allocation.

The planning model separates:

* Planning variables
* Hard constraints
* Soft constraints
* Constraint scoring
* Optimization

This allows complex scheduling requirements to be expressed as a constraint optimization problem rather than relying entirely on manually coded scheduling logic.

---

## 6. Event-Driven Components

Selected workflows use application events to decouple actions that should occur as a consequence of another business operation.

For example, an operation can publish an application event while a dedicated listener handles the resulting workflow without tightly coupling the original service to every downstream action.

This approach is applied selectively rather than as a system-wide event-driven architecture.

---

## 7. Security Architecture

The backend uses **Spring Security** with stateless JWT-based authentication.

The security layer provides:

* JWT authentication
* Bearer token processing
* Role-based authorization
* Privilege-based access control
* Protected REST endpoints
* Stateless session management

Authorization is designed around application roles and granular privileges so that access to operational modules can be controlled according to the responsibilities of different users.

---

## 8. DTO-Based API Contracts

API requests and responses are represented using DTOs rather than exposing persistence entities directly.

**MapStruct** is used for object mapping between DTOs and entities.

This provides:

* Separation between persistence and API models
* Explicit API contracts
* Reduced coupling between database entities and clients
* Compile-time generated mapping code

---

## 9. Relational Persistence

The application uses **MySQL** with **Spring Data JPA / Hibernate**.

The database design focuses on:

* Normalized relational structures
* Entity relationships
* Referential integrity
* Domain-specific constraints
* Transactional consistency
* Indexed queries where appropriate

---

## 10. Shared Application Infrastructure

Common functionality is isolated under the shared layer to avoid duplicating cross-cutting concerns across individual modules.

Shared components include:

```text
shared/
├── api/
├── auditing/
├── config/
├── email/
├── exception/
├── notification/
├── model/
├── numbergeneration/
└── transaction/
```

Examples include:

* Centralized exception handling
* API response structures
* Audit aware support
* Application configuration
* Email services
* Notification services
* Base entity functionality
* Business identifier/number generation
* Transaction-related infrastructure

---

# 🛠️ Technology Stack

### Backend

* Java 17
* Spring Boot 3
* Spring MVC
* Spring Security
* Spring Data JPA
* Hibernate
* MapStruct
* Lombok
* Maven

### Database

* MySQL 8
* SQL
* Relational Database Design

### Security

* Spring Security
* JWT
* Role-Based Access Control
* Privilege-Based Authorization

### Optimization

* Timefold Solver

### Communication & Notifications

* REST APIs
* Java Mail
* Thymeleaf

### Testing

* JUnit 5
* Spring Security Test
* Testcontainers
* MySQL Testcontainers
* Postman

### Development Tools

* Git
* GitHub
* Docker

---

# 📋 System Scope

## Included

* Fleet and vehicle management
* Employee and crew management
* Permit and route management
* Trip planning and execution
* Crew rostering
* Incident and breakdown management
* Vehicle maintenance
* Spare parts and inventory
* Goods Received Note workflows
* Fare collection
* Operational reporting
* User and privilege management
* Branch/depot configuration
* Notifications and email communication

## Out of Scope

* Live GPS tracking and hardware-integrated vehicle positioning
* Legal accident and insurance claim processing

---

# 🔧 Installation & Setup

## Prerequisites

Ensure the following are installed:

```bash
java -version
mvn -v
mysql --version
```

Required:

* JDK 17
* Maven
* MySQL 8.x

---

## 1. Clone the Repository

```bash
git clone https://github.com/Ashan-Dissanayake/RouteNetLKServerApplication.git

cd RouteNetLKServerApplication
```

---

## 2. Configure MySQL

Create the application database:

```sql
CREATE DATABASE routenetlk;
```

Configure the database connection in the application's configuration file.

Example:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/routenetlk?createDatabaseIfNotExist=true&useSSL=false
spring.datasource.username=your_mysql_user
spring.datasource.password=your_mysql_password

spring.jpa.hibernate.ddl-auto=update
```

---

## 3. Build the Application

Using the Maven wrapper:

```bash
./mvnw clean install
```

On Windows:

```bash
mvnw.cmd clean install
```

---

## 4. Run the Application

```bash
./mvnw spring-boot:run
```

On Windows:

```bash
mvnw.cmd spring-boot:run
```

The application starts on:

```text
http://localhost:8080
```

---

## 5. Client Application

The Angular frontend is maintained in a separate repository:

**RouteNetLK Client Application**

```text
https://github.com/Ashan-Dissanayake/RouteNetLKClientApplication
```

---

# 🧪 Testing

The backend contains unit, integration, security, and API-level testing.

### Unit Testing

JUnit 5 is used to verify individual components and business rules.

```bash
./mvnw test
```

### Integration Testing

Database-dependent integration tests use **Testcontainers** to execute against isolated MySQL containers.

This allows persistence and application behavior to be tested against a real MySQL database environment.

### Security Testing

Spring Security Test utilities are used to verify authentication and authorization behavior.

### API Testing

REST endpoints are manually and systematically validated using Postman collections.

---

# 📊 Development Approach

The system was developed using an iterative and incremental approach.

### 1. Requirements & Domain Analysis

* Identify operational workflows
* Analyse domain entities and relationships
* Define business rules and constraints

### 2. Architecture & Database Design

* Design modular application structure
* Define relational database model
* Establish entity relationships
* Define DTO and API contracts

### 3. Feature Development

* Implement domain modules
* Develop REST APIs
* Implement business rules
* Integrate security and persistence

### 4. Optimization & Workflow Automation

* Model selected scheduling problems
* Define hard and soft constraints
* Integrate Timefold Solver
* Implement state-based workflows

### 5. Testing & Refinement

* Unit testing
* Integration testing
* Security testing
* API testing
* Business-rule validation

---

# 🎓 Academic Context

RouteNetLK was developed as the final-year software development project for the **Bachelor of Information Technology at the University of Colombo School of Computing (UCSC)**.

The project was designed to explore the engineering challenges involved in developing a modular, workflow-oriented enterprise application for fleet and public transport operations.

---

# 📌 Project Highlights

| Area                 | Implementation               |
| -------------------- | ---------------------------- |
| Backend              | Java 17 + Spring Boot 3      |
| Frontend             | Angular 19                   |
| Database             | MySQL                        |
| Security             | Spring Security + JWT        |
| Authorization        | Role & Privilege Based       |
| Architecture         | Modular Layered Architecture |
| Business Rules       | Strategy Pattern             |
| Lifecycle Management | State Pattern                |
| Optimization         | Timefold Solver              |
| DTO Mapping          | MapStruct                    |
| Persistence          | JPA / Hibernate              |
| Testing              | JUnit 5 + Testcontainers     |
| API Testing          | Postman                      |
| Notifications        | Java Mail + Thymeleaf      |

---

# 🔗 Related Repository

**RouteNetLK Client Application**

Angular-based frontend application for the RouteNetLK system.

```text
https://github.com/Ashan-Dissanayake/RouteNetLKClientApplication
```

---

## 👨‍💻 Developer

**Ashan Dissanayake**

Full-Stack Developer | Java | Spring Boot | Angular

* LinkedIn: https://www.linkedin.com/in/ashan-pdissanayake
* GitHub: https://github.com/Ashan-Dissanayake
* Email: [ashanpathum899@gmail.com](mailto:ashanpathum899@gmail.com)

---

> **RouteNetLK — a modular software engineering project focused on fleet operations, workflow automation, and public transport service management.**
