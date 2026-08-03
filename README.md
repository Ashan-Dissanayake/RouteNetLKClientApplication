# RouteNetLK - Fleet, Operation and Service Delivery Management System for SLTB (Client Application)

## 🌴 Overview

**RouteNetLK Client Application** is the modern, responsive web dashboard built for Sri Lanka Transport Board (SLTB) depot administration. Designed with **Angular 19**, it provides an intuitive user interface for managing day-to-day public transit operations, including driver and conductor crew rostering, permit management, real-time trip execution, incident handling, fare collection, fleet maintenance, and comprehensive operational reporting.

## 🎯 Project Objectives

- **Enhance User Experience:** Provide depot officers with a clean, fast, and responsive web application built with modern UI design principles.
- **Role-Based Operational Access:** Enforce strict access control so depot staff, maintenance personnel, and administrators only access relevant functional modules.
- **Visual Analytics & Reporting:** Enable data-driven decisions with dynamic charts, real-time dashboards, and customizable PDF/Excel export capabilities.
- **Seamless Integration:** Interface smoothly with the Spring Boot backend REST APIs for real-time roster optimization and operational data persistence.

## 🚀 Key Features

* **Planning & Scheduling:**
  * **Employee & Crew Management:** Full driver and conductor profiling, license validation, and shift allocation tracking.
  * **Permit Management:** Registration and validity monitoring for SLTB route permits.
  * **Trip Planning & Rostering:** Interactive roster generation and daily trip scheduling views.
* **Depot Operations:**
  * **Trip Execution & Dispatching:** Monitor scheduled vs. actual trip dispatches in real-time.
  * **Incident & Breakdown Handling:** Instant logging of vehicle breakdowns and seamless on-the-fly vehicle re-allocation.
  * **Fare Collection Management:** Aggregate manual ticketing and electronic ticketing system (ETM) collections with daily revenue tracking.
* **Maintenance & Inventory:**
  * **Fleet & Vehicle Registry:** Comprehensive bus database tracking operational status, fitness certificates, and depot assignments.
  * **Vehicle Service Records:** Service logging, preventive maintenance scheduling, and repair history tracking.
  * **Spare Parts & Inventory:** Spare parts catalog management, internal part requests, and Goods Received Notes (GRN) processing.
* **Interactive Operational Reports:**
  * **Dispatch Summary:** Route execution and dispatch metrics.
  * **Revenue by Payment Method:** Cash vs. digital ticketing revenue breakdown.
  * **Maintenance Trends:** Breakdown frequency and servicing cost analytics.
  * **Fleet Performance:** Vehicle availability, distance covered, and utilization metrics.
  * **Incident Breakdown:** Analysis of route disruptions and vehicle downtime.
* **System Administration:**
  * **User Management:** User account lifecycle, password resets, and depot assignments.
  * **Privilege Management:** Granular role and permission assignment.
  * **Depot / Branch Settings:** Multi-depot administrative configuration.

## 🏗️ System Architecture & Engineering Highlights

The client application is architected using **Angular 19 Standalone Components**, following modern frontend engineering principles for high performance, modularity, and maintainability.

### 🧠 Modern Frontend Architecture & Design Patterns
* **Standalone Architecture & Lazy Loading:** Decomposed into modular feature routes loaded on-demand via Angular's `loadComponent()` dynamic imports, ensuring minimal initial bundle size and rapid page load.
* **State Management (@ngrx/signals):** Leverages Angular Signals and `@ngrx/signals` for reactive, high-performance state management across complex multi-step workflows.
* **Fine-Grained Security & Permission System:**
  * **HTTP Interceptor (`auth.interceptor`):** Automatically injects Bearer JWT tokens into outgoing REST requests and handles security headers.
  * **Route Guards (`authGuard` & `permissionGuard`):** Protects application routes based on JWT authentication status and `ngx-permissions` privilege mappings.
* **Data Visualization & Document Generation:**
  * Embedded **Chart.js** & **ng2-charts** for interactive real-time analytical dashboards.
  * Client-side export engines using **jsPDF / jsPDF-AutoTable** for official PDF reports and **SheetJS (xlsx) / file-saver** for tabular Excel exports.

### Technology Stack
* **Core Framework:** Angular 19 (Standalone Components, RxJS 7.8, Angular Signals)
* **UI Component Library:** Angular Material 19, Custom SCSS Modern Design System
* **State & Authorization:** `@ngrx/signals`, `ngx-permissions`, `jwt-decode`
* **Data Visualization:** Chart.js 4.5, ng2-charts 8.0
* **Export Utilities:** jsPDF 3.0, jsPDF-AutoTable 5.0, SheetJS (xlsx) 0.18, file-saver 2.0
* **Language & Tooling:** TypeScript 5.7, Angular CLI 19.2.15, Cypress, Karma/Jasmine

### System Requirements

#### Client Workstation / Browser
- **CPU**: Intel Core i3 or equivalent (Recommended: Intel Core i5 / AMD Ryzen 5)
- **RAM**: Minimum 8 GB
- **Storage**: 250 MB free disk space (browser cache)
- **Browser**: Google Chrome 100+, Microsoft Edge 100+, Firefox 100+, or Safari 15+ (JavaScript enabled)

#### Development Environment
- **Node.js**: v20.17.0 LTS or higher
- **Package Manager**: npm 10.x+
- **CLI**: Angular CLI v19.2.15

## 📋 Project Scope

### Included Features
✅ Modular Dashboard & Visual Operational Analytics  
✅ Driver & Conductor Crew Allocation Management  
✅ Trip Scheduling & Real-time Execution Tracking  
✅ Breakdown Reporting & Vehicle Re-allocation UI  
✅ Fare Collection & Multi-Payment Revenue Reporting  
✅ Fleet Service Records & Spare Part Requests / GRN  
✅ Dynamic PDF & Excel Report Exports  
✅ Role-Based Access Control (RBAC) & Route Security  

### Out of Scope
❌ Live GPS real-time vehicle map tracking on frontend maps (restricted by hardware scope)  
❌ Legal insurance claims submission workflow  

## 🔧 Installation & Setup

### Prerequisites
Ensure Node.js and Angular CLI are installed on your machine:
```bash
# Node.js (v20.17.0 or higher recommended)
node -v

# npm
npm -v

# Angular CLI (v19.2.15)
ng version
```

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ashan-Dissanayake/RouteNetLKClientApplication
   cd RouteNetLKClientApplication
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run Development Server**
   ```bash
   ng serve
   ```
   Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

4. **Build for Production**
   ```bash
   ng build
   ```
   Build artifacts will be stored in the `dist/` directory.


## 📊 Development Methodology

This project follows an **Iterative Incremental Development** approach:
1. **Requirements & UI/UX Wireframing:** Stakeholder workflow mapping for SLTB depot operations.
2. **Component Architecture:** Modular standalone component decomposition & Angular Material styling.
3. **API Integration & State Wiring:** Connecting reactive forms and `@ngrx/signals` with Spring Boot REST endpoints.
4. **Testing & Performance Optimization:** Route lazy-loading, Cypress E2E flows, and client-side validation testing.

## 🎓 Academic Context

This project was developed as part of the **IT5106 - Software Development Project** at University of Colombo School of Computing (UCSC).

## 📞 Contact

**Developer**: Ashan Dissanayake  
**Email**: ashanpathum899@gmail.com  
**Phone**: +94 71 60 42 647  

## 🤝 Contributing

This is an academic project, but contributions and suggestions are welcome for educational purposes.

## 📄 License

This project is developed for academic purposes as part of a university degree program.

---

*Empowering Sri Lanka's public transport through innovative digital solutions.*
