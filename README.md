# RouteNetLK Client Application

**Frontend application for RouteNetLK — a Fleet, Operations, and Service Delivery Management System designed for depot-level public transport operations.**

Built with **Angular 19 and TypeScript**, the RouteNetLK Client Application provides a modular web interface for managing fleet operations, employees, crew, permits, trips, incidents, maintenance, inventory, fare collection, reporting, and system administration.

The application follows a **feature-oriented frontend architecture** with reusable shared components, centralized application infrastructure, reactive state management, role and privilege-based access control, REST API integration, operational dashboards, and reporting capabilities.

---

# 🎯 Project Objectives

- Provide a modular and responsive web interface for depot-level operations.
- Organize frontend functionality around business features.
- Integrate with the RouteNetLK Spring Boot REST API.
- Implement authentication and privilege-based authorization.
- Provide reusable UI components and form-building mechanisms.
- Manage reactive application state across operational workflows.
- Provide operational dashboards and analytical reports.
- Support PDF and Excel document generation.
- Maintain a scalable and maintainable Angular application structure.

---

# 🚀 Key Features

## Planning & Scheduling

- Employee and crew management
- Driver and conductor management
- Permit management
- Trip scheduling
- Crew roster management
- Operational planning interfaces

## Depot Operations

- Trip execution and dispatch monitoring
- Trip lifecycle management
- Incident and breakdown management
- Alternative vehicle allocation
- Operational workflow management

## Fleet & Maintenance

- Vehicle registration
- Vehicle lifecycle management
- Vehicle availability and status tracking
- Vehicle service records
- Preventive maintenance management

## Inventory & Spare Parts

- Spare part catalogue management
- Inventory management
- Spare part request workflows
- Goods Received Note (GRN) processing
- Inventory transaction management

## Fare Collection & Reporting

- Fare collection management
- Revenue tracking
- Operational dashboards
- Dispatch summaries
- Fleet performance reports
- Maintenance trend reports
- Incident summary reports
- Revenue by payment method reports

## System Administration

- User management
- Role and privilege management
- Branch/depot configuration
- Authentication and authorization

---

# 🏗️ Frontend Architecture

The application follows a **feature-oriented Angular architecture**.

Business functionality is separated into individual feature areas under `features/`, while application-wide infrastructure is separated into `core/`, `security/`, `dashboard/`, `reports/`, and `shared/`.

The architecture is designed to keep business-specific functionality close to the feature it belongs to while allowing commonly used UI components, models, mappers, and utilities to be reused across the application.

---

# 📦 Project Structure

The high-level application structure is:

```text
src/
└── app/
    │
    ├── core/
    │
    ├── dashboard/
    │   └── dashboard/
    │
    ├── features/
    │   ├── branchmodule/
    │   ├── crew/
    │   ├── employeemodule/
    │   ├── farecollectionmodule/
    │   ├── grnmodule/
    │   ├── incidentreportmodule/
    │   ├── incidentvehicleallocationmodule/
    │   ├── login/
    │   ├── partrequestmodule/
    │   ├── permitmodule/
    │   ├── privilegemodule/
    │   ├── rostermodule/
    │   ├── sparepartmodule/
    │   ├── tripexecution/
    │   ├── tripmodule/
    │   ├── usermodule/
    │   ├── vehiclemodule/
    │   └── vehicleservicemodule/
    │
    ├── reports/
    │   ├── dispatchsummary/
    │   ├── fleetperformance/
    │   ├── incidentsummary/
    │   ├── maintenancetrends/
    │   ├── revenuebypaymethods/
    │   └── service/
    │
    ├── security/
    │
    └── shared/
        ├── base/
        ├── component/
        ├── mappers/
        └── models/
````

---

# 🧩 Feature-Oriented Organization

Each major business area is maintained as an independent feature under `features/`.

For example:

```text
features/
└── vehiclemodule/
    │
    ├── entity/
    ├── model/
    ├── service/
    │   ├── api/
    │   └── util/
    │
    └── vehicle/
```

A feature generally contains its own:

* UI components
* Entity representations
* DTO/model definitions
* API services
* Feature-specific utilities

This structure keeps feature-specific implementation separated from other business areas.

The same architectural approach is used across modules such as:

* Branch
* Employee
* Crew
* Vehicle
* Permit
* Trip
* Trip Execution
* Roster
* Incident Management
* Fare Collection
* Vehicle Service
* Spare Parts
* Part Requests
* GRN
* User Management
* Privilege Management

---

# 🔄 Facade-Based Application Flow

Feature components communicate with application state and API services through facade-style service abstractions.

A simplified flow is:

```text
Component
    │
    ▼
Facade / Feature Service
    │
    ├───────────────┐
    ▼               ▼
Application State   API Service
                        │
                        ▼
                 Spring Boot REST API
```

This approach reduces the amount of API communication and state-management logic placed directly inside UI components.

It also provides a consistent abstraction for operations such as:

* Loading data
* Creating records
* Updating records
* Deleting records
* Managing loading states
* Managing errors
* Updating feature state

---

# 🔄 Reactive State Management

The application uses **Angular Signals** and **@ngrx/signals** for reactive state management in selected application workflows.

State can represent:

* Current feature data
* Loading status
* Error status
* Selected entities
* Metadata
* Workflow state
* UI-related state

Signals allow UI components to react automatically when the underlying application state changes.

---

# 📝 Metadata-Driven Forms

The application includes reusable form-building mechanisms that use structured field metadata to dynamically construct form controls and their associated configurations.

Conceptually:

```text
Field Metadata
      │
      ▼
Form Builder
      │
      ▼
Reactive Form
      │
      ▼
Reusable Form Components
```

This approach reduces repetitive form configuration across modules and allows common form behavior to be implemented through reusable infrastructure.

The form system supports concerns such as:

* Dynamic form control creation
* Field metadata
* Validation configuration
* Select/options data
* Reusable form components
* Form popup workflows

---

# 🔐 Authentication & Authorization

The client integrates with the Spring Boot backend security layer using **JWT-based authentication**.

The frontend security flow can be represented as:

```text
Login
  │
  ▼
JWT Token
  │
  ▼
Authentication State
  │
  ├──────────────────┐
  ▼                  ▼
HTTP Interceptor    Route Guards
  │                  │
  ▼                  ▼
Bearer Token       Permission Check
  │                  │
  └────────┬─────────┘
           ▼
      Protected API / Route
```

## HTTP Interceptor

The authentication interceptor attaches the JWT Bearer token to authenticated HTTP requests.

## Route Guards

Route guards protect application routes based on authentication and authorization requirements.

## Privilege Management

The application uses user role and privilege information to control access to modules and operations.

This allows different operational users to access only the functionality relevant to their responsibilities.

---

# 📊 Dashboard

The `dashboard/` area provides the main operational dashboard functionality.

The dashboard is designed to provide an overview of important operational information and system metrics.

It acts as the primary entry point for users after authentication.

---

# 📈 Reporting Architecture

Reporting functionality is maintained separately under the `reports/` area rather than coupling reports directly to individual business modules.

Current report areas include:

```text
reports/
│
├── dispatchsummary/
├── fleetperformance/
├── incidentsummary/
├── maintenancetrends/
├── revenuebypaymethods/
└── service/
```

The reporting functionality supports operational analytics such as:

* Dispatch summaries
* Fleet performance
* Incident summaries
* Maintenance trends
* Revenue by payment method

---

# 🧱 Shared Component Library

The `shared/` area contains reusable UI components and common frontend abstractions used across multiple feature areas.

```text
shared/
│
├── base/
│
├── component/
│   ├── button/
│   │   └── button-panel/
│   │
│   ├── confirm/
│   ├── data-table/
│   ├── dual-list-box/
│   │
│   ├── export/
│   │   └── print/
│   │
│   ├── file-picker/
│   │
│   ├── form/
│   │   └── formpopup/
│   │
│   ├── innertable/
│   ├── message/
│   ├── notification-bell/
│   ├── side-view/
│   └── stats-grid/
│
├── mappers/
│
└── models/
```

The shared component layer provides reusable functionality for:

* Data tables
* Dynamic forms
* Confirmation dialogs
* Button panels
* File selection
* PDF/print exports
* Notifications
* Side views
* Statistics grids
* Nested tables
* Common messages

This reduces UI duplication across individual business features.

---

# 🎨 UI Architecture

The application uses **Angular Material** together with custom SCSS styling.

Reusable UI components are used throughout the application to maintain consistent behavior and presentation across different modules.

Common reusable UI concerns include:

* Forms
* Tables
* Dialogs
* Notifications
* Buttons
* File pickers
* Export functionality
* Statistics cards
* Nested data tables
* Side panels/views

---

# 🔌 Backend Integration

The client communicates with the RouteNetLK Spring Boot backend through REST APIs.

The overall system communication is:

```text
┌─────────────────────┐
│   Angular Client    │
│                     │
│ Components          │
│ Facades             │
│ Feature Services    │
└──────────┬──────────┘
           │
           │ HTTP / JSON
           ▼
┌─────────────────────┐
│ Spring Boot Backend │
│                     │
│ REST Controllers    │
│ Services            │
│ Validation          │
│ State / Events      │
│ Persistence         │
└──────────┬──────────┘
           │
           ▼
      ┌──────────┐
      │  MySQL   │
      └──────────┘
```

The frontend is responsible for:

* HTTP communication
* Request construction
* JWT authentication headers
* Response handling
* UI state management
* Form interaction
* User-facing validation and feedback
* Document/report generation

The backend remains responsible for core business rules, persistence, security enforcement, and domain-level validation.

---

# 📄 Document & Report Generation

The application supports client-side document generation.

## PDF Generation

Implemented using:

* jsPDF
* jsPDF-AutoTable

Used for generating structured operational reports and printable documents.

## Excel Generation

Implemented using:

* SheetJS (`xlsx`)
* file-saver

Used to export operational data into spreadsheet-compatible formats.

---

# 📊 Data Visualization

The dashboard and reporting interfaces use:

* Chart.js
* ng2-charts

These are used to visualize operational information such as:

* Fleet performance
* Revenue
* Maintenance trends
* Incident statistics
* Dispatch information

---

# 🛠️ Technology Stack

## Frontend

* Angular 19
* TypeScript
* RxJS
* Angular Signals
* @ngrx/signals
* Angular Material
* SCSS

## Architecture & Design

* Standalone Components
* Feature-Oriented Architecture
* Lazy Loading
* Reactive Forms
* Facade Pattern
* Metadata-Driven Form Architecture
* Component-Based Architecture

## Authentication & Authorization

* JWT
* HTTP Interceptors
* Route Guards
* ngx-permissions
* jwt-decode

## Data Visualization

* Chart.js
* ng2-charts

## Document Generation

* jsPDF
* jsPDF-AutoTable
* SheetJS (`xlsx`)
* file-saver

## Development Tools

* Angular CLI
* npm
* Git
* GitHub

---

# 📋 System Scope

## Included Features

* Dashboard
* Branch Management
* Employee Management
* Vehicle Management
* Permit Management
* Trip Management
* Trip Execution
* Crew Management
* Roster Management
* Incident Management
* Incident Vehicle Allocation
* Fare Collection
* Vehicle Service Management
* Spare Part Management
* Part Request Management
* GRN Management
* User Management
* Privilege Management
* Operational Reports
* PDF and Excel Exports

---

# 🔧 Installation & Setup

## Prerequisites

Ensure the following are installed:

```bash
node -v
npm -v
ng version
```

Recommended environment:

* Node.js 20 LTS or higher
* npm 10.x
* Angular CLI 19.x

---

# 1. Clone the Repository

```bash
git clone https://github.com/Ashan-Dissanayake/RouteNetLKClientApplication.git

cd RouteNetLKClientApplication
```

---

# 2. Install Dependencies

```bash
npm install
```

---

# 3. Configure Backend URL

Configure the backend API endpoint according to the application's environment configuration.

Example:

```typescript
export const environment = {
  apiUrl: 'http://localhost:8080'
};
```

Make sure the RouteNetLK Spring Boot backend is running before using API-dependent features.

---

# 4. Run Development Server

```bash
ng serve
```

The application will be available at:

```text
http://localhost:4200/
```

---

# 5. Build for Production

```bash
ng build
```

The production build artifacts will be generated under the `dist/` directory.

---

# 🧪 Testing

The frontend can be tested across multiple levels depending on the feature being verified.

Testing areas include:

* Component behavior
* Reactive form behavior
* Form validation
* Service behavior
* Authentication and authorization flows
* API integration
* User workflows

The application can also be validated against the running Spring Boot backend for end-to-end workflow verification.

---

# 📊 Development Methodology

The project follows an **Iterative Incremental Development** approach.

## 1. Requirements & Workflow Analysis

* Analyse operational workflows
* Identify user roles and privileges
* Define feature requirements
* Map frontend workflows to backend APIs

## 2. UI & Component Design

* Design reusable UI components
* Define feature interfaces
* Implement Angular Material components
* Establish reusable form structures

## 3. Feature Development

* Implement feature components
* Integrate REST APIs
* Implement reactive forms
* Implement state and facade services
* Implement authentication and authorization

## 4. Reporting & Optimization

* Implement operational dashboards
* Add data visualization
* Implement PDF and Excel exports
* Apply modular and reusable frontend architecture

## 5. Testing & Refinement

* Component testing
* Service testing
* Form validation testing
* API integration testing
* Workflow validation

---

# 🔗 Related Repository

## RouteNetLK Server Application

The Spring Boot backend responsible for REST APIs, business logic, validation, security, persistence, workflow processing, and operational services.

[https://github.com/Ashan-Dissanayake/RouteNetLKServerApplication](https://github.com/Ashan-Dissanayake/RouteNetLKServerApplication)

---

# 🎓 Academic Context

RouteNetLK was developed as the final-year software development project for the **Bachelor of Information Technology at the University of Colombo School of Computing (UCSC)**.

The project explores the design and implementation of a modular, workflow-oriented enterprise application for fleet and public transport operations.

---

# 📊 Project Highlights

| Area                | Implementation                  |
| ------------------- | ------------------------------- |
| Framework           | Angular 19                      |
| Language            | TypeScript                      |
| UI                  | Angular Material + SCSS         |
| Architecture        | Feature-Oriented Architecture   |
| Components          | Standalone Components           |
| Routing             | Lazy Loading                    |
| Forms               | Reactive Forms                  |
| State               | Angular Signals + @ngrx/signals |
| Service Abstraction | Facade Pattern                  |
| Authentication      | JWT                             |
| Authorization       | Route Guards + Permissions      |
| API Communication   | REST / HTTP                     |
| Charts              | Chart.js + ng2-charts           |
| PDF                 | jsPDF + jsPDF-AutoTable         |
| Excel               | SheetJS + file-saver            |
| Backend             | Spring Boot REST API            |
| Database            | MySQL                           |

---

# 👨‍💻 Developer

**Ashan Dissanayake**

Full-Stack Developer | Java | Spring Boot | Angular

* LinkedIn: [https://www.linkedin.com/in/Ashan-PDissanayake](https://www.linkedin.com/in/Ashan-PDissanayake)
* GitHub: [https://github.com/Ashan-Dissanayake](https://github.com/Ashan-Dissanayake)
* Email: [ashanpathum899@gmail.com](mailto:ashanpathum899@gmail.com)

---

> RouteNetLK is an academic software engineering project focused on modular frontend architecture, workflow-oriented interfaces, operational dashboards, reusable UI infrastructure, and integration with a Spring Boot enterprise backend.

```
```
