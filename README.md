# RouteNetLK Client Application

> Enterprise-grade, modular Angular 19 frontend application for **RouteNetLK** — an integrated Fleet Management, Depot Operations, and Transport Service Delivery platform engineered for large-scale public transport depots (Sri Lanka Transport Board - SLTB).

The **RouteNetLK Client Application** serves as the presentation and workflow orchestration layer of the RouteNetLK platform. It provides depot managers, dispatchers, maintenance engineers, and administrative staff with a high-throughput, reactive interface to oversee end-to-end transport operations — from daily crew rostering and vehicle dispatching to spare parts inventory, breakdown recovery, revenue reconciliation, and analytical reporting.

The client application connects to an independent [RouteNetLK Server Application](https://github.com/Ashan-Dissanayake/RouteNetLKServerApplication) powered by Spring Boot, MySQL, and Spring Security. For complete system architecture and domain workflows, refer to the [RouteNetLK System Overview](https://github.com/Ashan-Dissanayake/RouteNetLK-Overview).

---

## Table of Contents

- [Frontend Responsibilities](#frontend-responsibilities)
- [Frontend Architecture](#frontend-architecture)
- [Feature-Oriented Architecture](#feature-oriented-architecture)
- [Component Architecture](#component-architecture)
- [Facade / Service Architecture](#facade--service-architecture)
- [Reactive State Management](#reactive-state-management)
- [API Integration](#api-integration)
- [Authentication & Authorization](#authentication--authorization)
- [Forms Architecture](#forms-architecture)
- [Shared UI Infrastructure](#shared-ui-infrastructure)
- [Routing & Lazy Loading](#routing--lazy-loading)
- [Dashboard & Reporting](#dashboard--reporting)
- [Document Generation](#document-generation)
- [Data Visualization](#data-visualization)
- [Error / Loading / User Feedback](#error--loading--user-feedback)
- [Testing](#testing)
- [Containerization](#containerization)
- [CI/CD](#cicd)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Local Development](#local-development)
- [Related Repositories](#related-repositories)
- [Engineering Highlights](#engineering-highlights)

---

## Frontend Responsibilities

The client application exclusively manages presentation, client-side state, user interactions, and workflow coordination:

- **Presentation & Interaction Layer**: Renders responsive, accessible UI components utilizing Angular Material and tailored SCSS design tokens.
- **Workflow & Operational Coordination**: Orchestrates multi-step operational flows including trip execution, crew dispatching, spare parts request fulfillment, and emergency breakdown recovery.
- **Client-Side State Containers**: Encapsulates entity collections, lookup metadata, active filters, loading flags, and error contexts via reactive Facade services.
- **Asynchronous API Communication**: Communicates with the Spring Boot backend via typed HTTP clients, intercepting requests to inject JWT Bearer credentials.
- **Authentication & Privilege Enforcement**: Handles session storage, token decoding, automatic token expiration validation, and granular role/privilege-based route and UI authorization.
- **Metadata-Driven Form Construction**: Dynamically builds reactive forms, handles lookup option resolution, binds dynamic regex validations from the server, and computes change diffs.
- **Real-Time Push Notifications**: Ingests Server-Sent Events (SSE) from the backend, surfacing real-time toast alerts and updating unread badge counters.
- **Client-Side Document Export**: Compiles and exports structured tabular reports into branded PDF documents (jsPDF & AutoTable) and Excel spreadsheets (SheetJS & FileSaver).
- **Data Analytics Visualization**: Transforms backend analytics streams into responsive interactive charts (Chart.js).

---

## Frontend Architecture

The application adopts a **Layered, Feature-Oriented Angular Architecture** leveraging **Standalone Components** throughout. Responsibilities are divided into clear architectural layers:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                               App Shell                                │
│        (Responsive Sidenav, Navbar, Notification Bell, Route Outlet)    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
       ┌────────────────────────────┼────────────────────────────┐
       ▼                            ▼                            ▼
┌──────────────┐             ┌──────────────┐             ┌──────────────┐
│  Security    │             │     Core     │             │    Shared    │
│  - AuthState │             │  - BaseHttp  │             │  - BaseComp  │
│  - JWT Guard │             │  - FormBuild │             │  - BaseFacade│
│  - PermGuard │             │  - DialogSvc │             │  - DataTable │
│  - Intercept │             │  - NotifSvc  │             │  - DynFields │
└──────┬───────┘             └──────┬───────┘             └──────┬───────┘
       │                            │                            │
       └────────────────────────────┼────────────────────────────┘
                                    │
       ┌────────────────────────────┼────────────────────────────┐
       ▼                            ▼                            ▼
┌──────────────┐             ┌──────────────┐             ┌──────────────┐
│   Features   │             │  Dashboard   │             │   Reports    │
│  (18 Modules)│             │  - Overview  │             │  - 5 Chart   │
│  - Facades   │             │  - Metrics   │             │    Analytics │
│  - FormSvcs  │             │  - Facade    │             │  - Filtering │
│  - API Svcs  │             │              │             │              │
└──────────────┘             └──────────────┘             └──────────────┘
```

### Architectural Subsystems

1. **App Shell (`app.component.ts`)**: Hosts the primary navigation shell, dynamic menu filtering based on loaded user permissions, responsive breakpoint observer, and SSE event stream connection.
2. **Core Layer (`src/app/core/`)**: Houses foundational singleton services including `BaseHttpService`, `FormbuilderService`, `DialogService`, `NotificationService`, `ErrorInterceptor`, and API endpoint definitions.
3. **Security Layer (`src/app/security/`)**: Controls JWT lifecycle, `authInterceptor`, `authGuard`, and parameterized `permissionGuard` for fine-grained authorization.
4. **Shared Layer (`src/app/shared/`)**: Provides abstract foundation classes (`BaseComponent`, `BaseFacade`), generic UI components (data table, form popup, side view, inner table, dual listbox), and export utilities.
5. **Features Layer (`src/app/features/`)**: Contains 18 decoupled domain feature modules, each encapsulating its own entities, models, API services, form services, metadata services, and facade containers.
6. **Dashboard Layer (`src/app/dashboard/`)**: Dedicated module delivering real-time depot metrics via an isolated facade.
7. **Reports Layer (`src/app/reports/`)**: Houses 5 distinct analytical reporting views with Chart.js integration.

---

## Feature-Oriented Architecture

Each business domain is isolated inside `src/app/features/`. Modules do not cross-import feature-private services or models; shared concerns are mediated strictly through the `core/` and `shared/` layers.

```text
src/app/features/
├── branchmodule/                      # Depot branches & regional office topology
├── crew/                              # Drivers & conductors registry and licensing
├── employeemodule/                    # Staff records, designations, and departments
├── farecollectionmodule/              # Ticket machine (ETM) revenue & physical cash logs
├── grnmodule/                         # Goods Received Notes & inventory intake
├── incidentreportmodule/              # Route incidents, accidents, and mechanical breakdowns
├── incidentvehicleallocationmodule/   # Replacement bus dispatching for stranded trips
├── login/                             # User authentication & session establishment
├── partrequestmodule/                 # Garage spare part requisition workflows
├── permitmodule/                      # Route permits, service types, and transfers
├── privilegemodule/                   # Operations and modules privilege matrix
├── rostermodule/                      # Shift schedules & crew shift assignment
├── sparepartmodule/                   # Spare parts catalog, inventory levels, & reorder
├── tripexecution/                     # Trip dispatch, status tracking, & completion
├── tripmodule/                        # Scheduled trip configuration & operational calendar
├── usermodule/                        # System user accounts, status, & credentials
├── vehiclemodule/                     # Fleet registry, condition rating, & bus types
└── vehicleservicemodule/              # Maintenance logs, garage tasks, & service priorities
```

### Standard Feature Package Structure

Every feature module strictly follows a clean, predictable internal anatomy:

```text
features/vehiclemodule/
├── entity/                           # Domain TypeScript interfaces (DTOs & Entities)
│   ├── vehicle.ts
│   ├── bustype.ts
│   ├── conditionrate.ts
│   ├── fueltype.ts
│   ├── make.ts
│   ├── model.ts
│   └── vehiclestatus.ts
├── model/                            # Declarative metadata & composite state models
│   ├── vehicle.meta.ts               # Table columns, form fields, immutable fields, export meta
│   └── vehicle.metadata.model.ts     # Aggregate metadata interface (lookups + regexes)
├── service/
│   ├── api/                          # Domain REST clients extending BaseHttpService
│   │   ├── vehicle.service.ts
│   │   ├── bustype.service.ts
│   │   ├── conditionrate.service.ts
│   │   ├── fueltype.service.ts
│   │   ├── make.service.ts
│   │   ├── model.service.ts
│   │   └── vehiclestatus.service.ts
│   └── util/                         # State, forms, and metadata aggregators
│       ├── vehiclefacade.service.ts  # State management extending BaseFacade
│       ├── vehicleform.service.ts    # Form creation using FormbuilderService
│       └── vehicle.metadata.service.ts # forkJoin lookup and regex loader
└── vehicle/                          # Feature component extending BaseComponent
    ├── vehicle.component.ts
    ├── vehicle.component.html
    └── vehicle.component.scss
```

---

## Component Architecture

The presentation layer is built entirely with **Angular 19 Standalone Components** (`standalone: true`), eliminating NgModule overhead and optimizing tree-shaking.

```text
┌──────────────────────────────────────────────────────────────────┐
│                   BaseComponent<TEntity, TMetadata>              │
│  - Lifecycle: initialize(), reload(), watchFilterForm()          │
│  - Selection State: activeRow, selectedRows, selectedCount       │
│  - Form Handlers: openCreateForm(), openEditForm(), save()       │
│  - Export Actions: toPdf(), toExcel()                            │
│  - Modal Triggers: showFormPopup(), showConfirmation()           │
└─────────────────────────────────┬────────────────────────────────┘
                                  │ extends
         ┌────────────────────────┴────────────────────────┐
         ▼                                                 ▼
┌──────────────────────────────┐        ┌──────────────────────────────┐
│       VehicleComponent       │        │       EmployeeComponent      │
│  - Injects VehicleFacade     │        │  - Injects EmployeeFacade    │
│  - Defines VEHICLE_META      │        │  - Defines EMPLOYEE_META     │
│  - Custom row actions & rules│        │  - Custom row actions & rules│
└──────────────────────────────┘        └──────────────────────────────┘
```

### Inheritance & Reusability

- **`BaseComponent<TEntity, TMetadata>`**: Abstract directive providing standardized UI coordination. Concrete components inherit complete CRUD workflows, search debounce handlers, bulk deactivation triggers, PDF/Excel export pipelines, and detail side-views in ~50–90 lines of code.
- **Encapsulated Providers**: Facade and form services are scoped to component injectors (`providers: [VehicleFacadeService, VehicleFormService, VehicleMetadataService]`), ensuring clean lifecycle destruction when navigating away.
- **Template Content Projection**: The generic data table utilizes `TableCellDirective` (`<ng-template [appTableCell]="'columnKey'">`) to allow feature components to inject custom badge renderers or action buttons without altering table logic.

---

## Facade / Service Architecture

The **Facade Pattern** decouples UI components from HTTP communication, metadata resolution, caching, and state synchronization:

```text
┌────────────────────────┐
│   Feature Component    │
│  (e.g., VehicleComp)   │
└───────────┬────────────┘
            │ 1. Triggers actions / Observes streams
            ▼
┌────────────────────────┐
│  BaseFacade / Facade   │ ◄─── Manages items$, metadata$, loading$, error$
│ (e.g., VehicleFacade)  │
└─────┬────────────┬─────┘
      │ 2. Calls   │ 3. Aggregates via forkJoin
      ▼            ▼
┌───────────┐ ┌───────────────┐
│ API Client│ │MetadataService│
│(BaseHttp) │ └───────┬───────┘
└─────┬─────┘         │
      │ 4. HTTP / REST│
      ▼               ▼
┌─────────────────────────────┐
│  Spring Boot REST Endpoints │
└─────────────────────────────┘
```

### `BaseFacade<TEntity, TMetadata>` Capabilities

- **State Streams**: Exposes read-only Observables: `items$`, `metadata$`, `loading$`, `error$`.
- **Initialization Lifecycle**: `initialize()` triggers concurrent metadata loading via the feature's `MetadataService`, followed by entity retrieval, managing the loading and error subjects atomically.
- **Normalized Querying**: `filter(criteria)` strips empty/null query parameters via `normalizeSearchCriteria` and refreshes entity state.
- **Extensibility Hooks**: Concrete facades override template methods for business validations and custom payload transformations:
  - `validateCreate(data)`: Validates entity preconditions before dispatching API calls (e.g., verifying vehicle status is "Available" and not "Poor/Critical").
  - `validateUpdate(data)`: Enforces update rules.
  - `beforeCreate(data)` / `beforeUpdate(data)`: Normalizes payloads.
  - `getDeactivationIds(items)`: Filters eligible entities for bulk deactivation (e.g., only allowing "Decommissioned" or "Out of Service" vehicles).

---

## Reactive State Management

State management in RouteNetLK combines **RxJS BehaviorSubjects** for feature entity caching and **Angular Signals** for application-wide reactive state:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                          State Architecture                             │
├────────────────────────────────────┬────────────────────────────────────┤
│     RxJS Facade State Containers   │       Angular Core Signals         │
│     (Feature & Dashboard State)    │      (Auth, SSE, & UI State)       │
├────────────────────────────────────┼────────────────────────────────────┤
│ • itemsSubject: BehaviorSubject    │ • currentUser = signal<User>()     │
│ • metadataSubject: BehaviorSubject │ • isAuthenticated = computed()     │
│ • loadingSubject: BehaviorSubject  │ • notifications = signal<Notif[]>()│
│ • errorSubject: BehaviorSubject    │ • unreadCount = computed()         │
│ • Normalized filter dispatching    │ • filteredMenuItems = computed()   │
│ • takeUntil(destroy$) cleanup      │ • Local component UI toggle signals│
└────────────────────────────────────┴────────────────────────────────────┘
```

### State Boundaries

1. **Feature Domain State**: Contained in `BaseFacade` instances using `BehaviorSubject`. Components consume state via standard `AsyncPipe` (`vehicles$ | async`, `loading$ | async`), guaranteeing zero memory leaks via `takeUntil(this.destroy$)`.
2. **Authentication State**: Implemented in `AuthService` using `signal<UserProfile | null>` and `computed(() => !!this.currentUser())`.
3. **Real-Time Notification State**: Maintained in `NotificationService` via `signal<AppNotification[]>([])` with a `computed()` selector deriving `unreadCount`.
4. **Reactive Navigation Menu**: The App Shell derives `filteredMenuItems` via a `computed()` signal that dynamically filters the navigation tree against user authorities loaded into `NgxPermissionsService`.

---

## API Integration

Backend communication is structured through a strongly typed, hierarchical HTTP client layer:

```text
Feature Component
       │
       ▼
Feature Facade Service
       │
       ▼
Domain API Service (e.g., VehicleService)
       │ extends
BaseHttpService<T>
       │
       ▼
HttpClient (with authInterceptor & ErrorInterceptor)
       │
       ▼
Spring Boot REST API (/api/*)
```

### `BaseHttpService<T>`

An abstract HTTP client providing standard REST operations and query parameter normalization:

- `getAll<T>(url, params?)`: Fetches arrays enclosed in `ApiResponse<T>`, automatically filtering out `null`, `undefined`, and empty strings from query parameters.
- `getObject<T>(url, params?)`: Fetches single-object envelopes (`ApiResponse<T, false>`).
- `getById<T>(url, id)`: Fetches a single entity by primary key.
- `post(url, data)` / `put(url, data)` / `delete(url, id)`: Standard mutating verbs.
- `postById`, `putById`, `postActionById`, `putActionById`, `deleteActionByIds`: REST sub-resource operations for RPC-style domain transitions (e.g., `/api/user-roles/{id}/roles/{roleId}`).

### Standard API Envelope Contract

```typescript
export interface ApiResponse<T, IsArray extends boolean = true> {
  success: boolean;
  message: string;
  data: IsArray extends true ? T[] : T;
  timestamp?: string;
}
```

---

## Authentication & Authorization

RouteNetLK implements a secure **JWT + Privilege-Based Access Control (PBAC)** system:

```text
┌─────────────┐
│ Login Form  │──► POST /api/login ──► JWT + Authorities Token
└─────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│                        AuthService                          │
│  - Stores JWT in localStorage ('auth_token')                │
│  - Decodes token payload via jwt-decode                     │
│  - Loads authorities into NgxPermissionsService             │
│  - Sets currentUser signal & isAuthenticated computed signal │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐
│       authInterceptor        │ │     Route Guards & Shell     │
│  - Injects Authorization:    │ │  - authGuard: Check session  │
│    Bearer <token> header     │ │  - permissionGuard('perm'):  │
│  - Handles 401/403 redirects │ │    Verifies user privileges  │
└──────────────────────────────┘ └──────────────────────────────┘
```

### Route Guards & Interceptors

- **`authGuard`**: Verifies user session state and validates token expiration timestamp (`decoded.exp`). Redirects unauthenticated users to `/login?returnUrl=...`.
- **`permissionGuard(permission)`**: Parameterized factory guard checking whether the active user possesses the required permission key(s) in `NgxPermissionsService`.
- **`authInterceptor`**: Functional HTTP interceptor (`HttpInterceptorFn`) that automatically appends the Bearer token to all requests except the login endpoint. Captures `401 Unauthorized` and `403 Forbidden` responses to force session termination and login redirection.
- **`ErrorInterceptor`**: Class-based interceptor capturing `HttpErrorResponse` and extracting human-readable messages or backend validation error arrays (`err.details`).

---

## Forms Architecture

The application implements a **Metadata-Driven Reactive Forms Engine** that eliminates boilerplate form templates and centralizes validation:

```text
┌────────────────────────────────┐      ┌────────────────────────────────┐
│   Feature Form Metadata Array  │      │   Backend Dynamic Regexes      │
│      (FormField[] Meta)        │      │       (/api/regexes)           │
└───────────────┬────────────────┘      └───────────────┬────────────────┘
                │                                       │
                └───────────────────┬───────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         FormbuilderService                             │
│  - build(fields, dataMap): Generates typed FormGroup                   │
│  - Injects server-driven Regex validators (Validators.pattern)         │
│  - Binds dynamic dropdown options from metadata maps                   │
│  - Handles special control types: inner-table, date-range, time-range  │
│  - Tracks dirty controls for change-diff calculation                   │
│  - handleSave(): Orchestrates validation dialogs & update diff modals  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        DynamicFieldComponent                           │
│  - Renders Material inputs dynamically via ngSwitch                    │
│  - Types: text, password, select, date, date-range, time-range, file,  │
│           dual-listbox, inner-table, hidden                            │
│  - Automatic validation message rendering (required, pattern)          │
└────────────────────────────────────────────────────────────────────────┘
```

### Form Features

- **Dynamic Options Resolution**: Metadata references (e.g., `mode: 'options'`) are dynamically populated from `VehicleMetadataService` lookups.
- **Server-Driven Regex Validation**: Regular expressions for license numbers, phone numbers, NICs, and plate numbers are fetched at runtime from `/api/regexes` and injected as `Validators.pattern`.
- **Update Change-Diff Verification**: On update submission, `FormbuilderService.handleSave` extracts only modified (`dirty`) controls and displays a confirmation dialog listing the specific fields being changed before dispatching the PUT request.

---

## Shared UI Infrastructure

Reusable UI components are centralized in `src/app/shared/component/`:

| Component | Responsibility | Key Features |
| :--- | :--- | :--- |
| **`DataTableComponent`** | Primary enterprise data grid | `OnPush` change detection, sorting (`MatSort`), pagination (`MatPaginator`), multi-row selection, template projection (`TableCellDirective`). |
| **`DynamicFieldComponent`** | Declarative field renderer | Material input switch (text, select, date, date-range, time-range, file, dual-listbox, inner-table). |
| **`FormpopupComponent`** | Modal dialog form container | Embeds `DynamicFieldComponent`, handles save/cancel workflows, validation toasts, and diff prompts. |
| **`ButtonPanelComponent`** | Standardized CRUD/Export toolbar | Configured via `action-panel.factory.ts`, supports permission-based disabling and dropdown menus. |
| **`ConfirmComponent`** | User confirmation dialog | Parameterized headings, formatted HTML body lists, confirm/cancel Observables. |
| **`MessageComponent`** | Alert and validation message dialog | Displays error summaries and bulleted validation failure lists. |
| **`SideViewComponent`** | Entity detail inspection drawer | Slide-out overlay showing complete record attributes when clicking a data table row. |
| **`InnerableComponent`** | Master-detail nested grid editor | Sub-table form control for line items (e.g., GRN item receipts, service task checklists). |
| **`MatDualListboxComponent`**| Dual-column transfer control | Multi-select transfer list for assigning user roles and privileges. |
| **`FilePickerComponent`** | Custom file upload control | Base64 / multipart file selection integrated with Angular Reactive Forms. |
| **`NotificationBellComponent`**| Real-time alerts trigger | Badge indicator showing live unread count and dropdown list of SSE notifications. |
| **`PrintTableComponent`** | Print / PDF preview modal | Structured document preview dialog before dispatching to printer or PDF generation. |

---

## Routing & Lazy Loading

Application routing is configured in `src/app/app.routes.ts` using **Route-Level Lazy Loading** with `loadComponent: () => import(...)`:

```typescript
export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      // Dashboard
      { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard/dashboard.component').then(m => m.DashboardComponent) },

      // Planning & Scheduling
      { path: 'employee', canActivate: [permissionGuard('employee-view')], loadComponent: () => import('./features/employeemodule/employee/employee.component').then(m => m.EmployeeComponent) },
      { path: 'driver', canActivate: [permissionGuard('driver-view')], loadComponent: () => import('./features/crew/driver/driver.component').then(m => m.DriverComponent) },
      { path: 'conductor', canActivate: [permissionGuard('conductor-view')], loadComponent: () => import('./features/crew/conductor/conductor.component').then(m => m.ConductorComponent) },
      { path: 'permit', canActivate: [permissionGuard('permit-view')], loadComponent: () => import('./features/permitmodule/permit/permit.component').then(m => m.PermitComponent) },
      { path: 'trip', canActivate: [permissionGuard('trip-view')], loadComponent: () => import('./features/tripmodule/trip/trip.component').then(m => m.TripComponent) },
      { path: 'roster', canActivate: [permissionGuard('roster-view')], loadComponent: () => import('./features/rostermodule/roster/roster.component').then(m => m.RosterComponent) },

      // Depot Operations
      { path: 'trip-execution', canActivate: [permissionGuard('trip-execution-view')], loadComponent: () => import('./features/tripexecution/tripexecution/tripexecution.component').then(m => m.TripExecutionComponent) },
      { path: 'incident-report', canActivate: [permissionGuard('incident-view')], loadComponent: () => import('./features/incidentreportmodule/incidentreport/incidentreport.component').then(m => m.IncidentReportComponent) },
      { path: 'incident-vehicle-allocation', canActivate: [permissionGuard('incident-vehicle-allocation-view')], loadComponent: () => import('./features/incidentvehicleallocationmodule/incidentvehicleallocation/incidentvehicleallocation.component').then(m => m.IncidentVehicleAllocationComponent) },
      { path: 'fare-collection', canActivate: [permissionGuard('fare-collection-view')], loadComponent: () => import('./features/farecollectionmodule/farecollection/farecollection.component').then(m => m.FareCollectionComponent) },

      // Fleet & Maintenance
      { path: 'vehicle', canActivate: [permissionGuard('vehicle-view')], loadComponent: () => import('./features/vehiclemodule/vehicle/vehicle.component').then(m => m.VehicleComponent) },
      { path: 'vehicle-service', canActivate: [permissionGuard('vehicle-service-view')], loadComponent: () => import('./features/vehicleservicemodule/vehicleservice/vehicleservice.component').then(m => m.VehicleServiceComponent) },
      { path: 'part', canActivate: [permissionGuard('part-view')], loadComponent: () => import('./features/sparepartmodule/sparepart/sparepart.component').then(m => m.SparePartComponent) },
      { path: 'part-request', canActivate: [permissionGuard('part-request-view')], loadComponent: () => import('./features/partrequestmodule/partrequest/partrequest.component').then(m => m.PartRequestComponent) },
      { path: 'grn', canActivate: [permissionGuard('grn-view')], loadComponent: () => import('./features/grnmodule/grn/grn.component').then(m => m.GrnComponent) },

      // Operational Reports
      { path: 'report-1', loadComponent: () => import('./reports/dispatchsummary/report-1/report-1.component').then(m => m.Report1Component) },
      { path: 'report-2', loadComponent: () => import('./reports/revenuebypaymethods/report-2/report-2.component').then(m => m.Report2Component) },
      { path: 'report-3', loadComponent: () => import('./reports/maintenancetrends/report-3/report-3.component').then(m => m.Report3Component) },
      { path: 'report-4', loadComponent: () => import('./reports/fleetperformance/report-4/report-4.component').then(m => m.Report4Component) },
      { path: 'report-5', loadComponent: () => import('./reports/incidentsummary/report-5/report-5.component').then(m => m.Report5Component) },

      // Administration
      { path: 'user', canActivate: [permissionGuard('user-view')], loadComponent: () => import('./features/usermodule/user/user.component').then(m => m.UserComponent) },
      { path: 'privilege', canActivate: [permissionGuard('privilege-view')], loadComponent: () => import('./features/privilegemodule/privilege/privilege.component').then(m => m.PrivilegeComponent) },
      { path: 'branch', canActivate: [permissionGuard('branch-view')], loadComponent: () => import('./features/branchmodule/branch/branch.component').then(m => m.BranchComponent) }
    ]
  },
  { path: '**', redirectTo: '/branch' }
];
```

---

## Dashboard & Reporting

The dashboard and reporting modules deliver operational oversight and analytical insights into depot productivity.

### Operational Dashboard (`/dashboard`)

The dashboard is backed by `DashboardFacadeService` and `DashboardService`, fetching high-frequency operational metrics from `/api/dashboard/overview`:

- **Real-Time Counters**: Active trips count, pending unresolved incidents, delayed trips, and logged breakdown count.
- **Crew Allocation KPIs**: Total assigned drivers, assigned conductors, and percentage shift coverage.
- **Daily Operations Summary**: Scheduled vs. completed trips count for the active scheduling day.

---

## Document Generation

Client-side document generation enables offline auditing and compliance exports without placing rendering strain on the Spring Boot backend:

```text
Selected Table Rows
        │
        ├───────────────────────────────────┐
        ▼                                   ▼
PrintService (jsPDF + AutoTable)     excel-export.util (SheetJS + FileSaver)
        │                                   │
        ▼                                   ▼
Formatted Vector PDF                Structured Excel Workbook (.xlsx)
(Headers, pagination, styling)      (Dynamic columns, auto-width)
```

### PDF Generation (`PrintService`)
- Implemented using **`jspdf`** and **`jspdf-autotable`**.
- Features corporate palette header styling (`#16a085`), alternating row shading, dynamic date stamping, deep property resolution (`path.to.property`), and dynamic page numbering footers (`Page X of Y`).

### Excel Generation (`exportToExcel`)
- Implemented using **`xlsx` (SheetJS)** and **`file-saver`**.
- Converts structured entity selections to worksheets, calculates dynamic column widths (`wch`) based on header and data length, and triggers instant browser binary downloads via `saveAs`.

---

## Data Visualization

Analytics dashboards use **Chart.js** with customized canvas rendering:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        Data Visualization Suite                        │
├──────────┬─────────────────────────────────────┬───────────────────────┤
│ View     │ Operational Focus                   │ Chart Type & Palette  │
├──────────┼─────────────────────────────────────┼───────────────────────┤
│ Report 1 │ Dispatch Summary vs Breakdowns      │ Dual Bar Chart        │
│ Report 2 │ Depot Revenue (Cash vs ETM Digital) │ Horizontal Stacked Bar│
│ Report 3 │ Maintenance Lifecycle Trends        │ Rounded Bar Chart     │
│ Report 4 │ Fleet Utilization & Density         │ Dual-Axis Line Chart  │
│ Report 5 │ Incident & Anomaly Distribution     │ Multi-Color Pie Chart │
└──────────┴─────────────────────────────────────┴───────────────────────┘
```

- **Report 1 (Dispatch vs. Breakdown)**: Compares successful trip executions against breakdown incidents over daily intervals.
- **Report 2 (Revenue Auditing Split)**: Compares physical cash vault collections against digital Electronic Ticket Machine (ETM) collections across depot branches.
- **Report 3 (Maintenance Trends)**: Tracks completed garage services against pending maintenance backlog.
- **Report 4 (Fleet Utilization)**: Uses a dual Y-axis line chart with date range picker filtering (`MatDateRangePicker`) to correlate aggregated passenger volume with total distance traveled (KM).
- **Report 5 (Incident Distribution)**: Displays route incident breakdowns (mechanical, route deviations, accidents, electronic flaws) in a color-coded pie chart.

---

## Error / Loading / User Feedback

The application implements a multi-tiered feedback mechanism:

- **Global HTTP Error Handling**: `ErrorInterceptor` catches backend API exceptions, extracts formatted error details (`error.details`), and attaches a clean `friendlyMessage`.
- **Centralized Dialog & Alert Service (`DialogService`)**:
  - `showMessage()`: Renders Material modal dialogs for validation errors.
  - `showConfirmation()`: Renders confirmation prompts before destructive actions.
  - `showSuccess()`, `showWarning()`, `showError()`: Triggers customized top-aligned `MatSnackBar` toast notifications.
- **Progress Indicators**: Asynchronous data loading is reflected via `MatProgressBar` across module headers and `MatProgressSpinner` inside chart canvases.
- **Real-Time Push Alerts**: `NotificationService` captures Server-Sent Events from `/api/notifications/stream` and immediately dispatches interactive floating snackbars.

---

## Testing

Testing infrastructure is configured with Karma, Jasmine, and Cypress:

- **Unit Testing**: Configured via `@angular-devkit/build-angular:karma` with Jasmine runner (`tsconfig.spec.json`).
- **Component Test Harness**: Verification of root shell creation and layout baseline in `src/app/app.component.spec.ts`.
- **E2E Testing Infrastructure**: Configured via `cypress.config.ts` for end-to-end integration testing.

```bash
# Execute unit test suite
npm run test

# Run E2E Cypress tests
npm run cypress:run
```

---

## Containerization

The client application uses a **Multi-Stage Dockerfile** optimized for security, performance, and minimal image footprint:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ Stage 1: Build (node:20-alpine)                                        │
│  - Copies package.json & runs npm ci --prefer-offline                  │
│  - Builds production bundle: npm run build -- --configuration production│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Outputs dist/routenet-lk/browser
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Stage 2: Runtime (nginx:alpine-slim)                                   │
│  - Copies custom nginx.conf configuration                              │
│  - Copies compiled assets to /usr/share/nginx/html                     │
│  - Sets non-root permissions (chown nginx:nginx)                       │
│  - Enables Gzip compression & static asset caching                     │
│  - Configures SPA HTML5 routing fallback & API reverse proxy           │
└────────────────────────────────────────────────────────────────────────┘
```

### Nginx Production Configuration (`nginx.conf`)

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip Compression for low bandwidth & faster loading
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_min_length 256;

    # SPA Routing (Redirects 404s to Angular index.html)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests internally to Spring Boot backend
    location /api/ {
        proxy_pass http://backend:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

---

## CI/CD

Continuous Integration and Continuous Deployment is automated through **GitHub Actions** (`.github/workflows/deploy.yml`):

```text
Git Push to master
       │
       ▼
GitHub Actions Runner (ubuntu-latest)
       │
       ├─► Set up Docker Buildx
       ├─► Authenticate with Docker Hub
       ├─► Build & Push Docker Image (latest + ${{ github.sha }})
       │
       ▼
Deploy to AWS EC2 via SSH (appleboy/ssh-action)
       │
       ├─► Pull updated frontend image: docker compose pull frontend
       ├─► Zero-downtime recreation: docker compose up -d --no-deps frontend
       └─► Clean up dangling images: docker image prune -f
```

---

## Technology Stack

| Category | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | Angular | `^19.2.0` | Core SPA web application framework |
| **Language** | TypeScript | `~5.7.2` | Strongly typed frontend engineering |
| **UI Components** | Angular Material / CDK | `^19.2.19` | Enterprise UI components & layout utilities |
| **Styling** | SCSS | — | Responsive styles and custom theme tokens |
| **Reactive State** | RxJS & Angular Signals | `~7.8.0` / `^19.2.0` | Reactive state streams & signal primitives |
| **Forms** | Angular Reactive Forms | `^19.2.0` | Metadata-driven form generation & validation |
| **HTTP Client** | Angular HttpClient | `^19.2.0` | Typed REST API communication |
| **Authentication** | JWT Decode | `^4.0.0` | Client-side JWT inspection & expiration check |
| **Authorization** | ngx-permissions | `^19.0.0` | Role & privilege-based UI & route authorization |
| **Visualization** | Chart.js & ng2-charts | `^4.5.1` / `^8.0.0` | Canvas-rendered operational charts |
| **PDF Generation** | jsPDF & jsPDF-AutoTable | `^3.0.3` / `^5.0.2` | Client-side vector PDF generation |
| **Excel Export** | SheetJS (`xlsx`) & FileSaver | `^0.18.5` / `^2.0.5` | Spreadsheet generation & file saving |
| **Real-Time SSE** | Native EventSource | — | Server-Sent Events push notification stream |
| **Unit Testing** | Karma & Jasmine | `~6.4.0` / `~5.6.0` | Browser-based unit testing |
| **E2E Testing** | Cypress | — | End-to-end user workflow testing |
| **Web Server** | Nginx Alpine | `alpine-slim` | Production static file hosting & reverse proxy |
| **Containerization**| Docker | Multi-Stage | Reproducible builds & lightweight images |
| **CI/CD** | GitHub Actions | v4 | Automated Docker builds & AWS EC2 deployment |

---

## Project Structure

```text
RouteNetLKClientApplication/
├── .github/
│   └── workflows/
│       └── deploy.yml              # CI/CD deployment pipeline to AWS EC2
├── public/                         # Static assets, icons, and themes
├── src/
│   ├── app/
│   │   ├── core/                   # Singleton services, interceptors, and utilities
│   │   │   ├── api-endpoints.ts
│   │   │   ├── basehttp.service.ts
│   │   │   ├── dialog.service.ts
│   │   │   ├── errorInterceptor.ts
│   │   │   ├── formbuilder.service.ts
│   │   │   ├── notification.service.ts
│   │   │   └── regex.service.ts
│   │   ├── dashboard/              # Operational KPI dashboard & facade
│   │   ├── features/               # 18 isolated business feature modules
│   │   │   ├── branchmodule/
│   │   │   ├── crew/
│   │   │   ├── employeemodule/
│   │   │   ├── farecollectionmodule/
│   │   │   ├── grnmodule/
│   │   │   ├── incidentreportmodule/
│   │   │   ├── incidentvehicleallocationmodule/
│   │   │   ├── login/
│   │   │   ├── partrequestmodule/
│   │   │   ├── permitmodule/
│   │   │   ├── privilegemodule/
│   │   │   ├── rostermodule/
│   │   │   ├── sparepartmodule/
│   │   │   ├── tripexecution/
│   │   │   ├── tripmodule/
│   │   │   ├── usermodule/
│   │   │   ├── vehiclemodule/
│   │   │   └── vehicleservicemodule/
│   │   ├── reports/                # Operational reports & Chart.js components
│   │   │   ├── dispatchsummary/
│   │   │   ├── fleetperformance/
│   │   │   ├── incidentsummary/
│   │   │   ├── maintenancetrends/
│   │   │   ├── revenuebypaymethods/
│   │   │   └── service/
│   │   ├── security/               # Auth state, interceptors, and guards
│   │   │   ├── auth.guard.ts
│   │   │   ├── auth.interceptor.ts
│   │   │   ├── auth.service.ts
│   │   │   └── permission.guard.ts
│   │   ├── shared/                 # Base classes, generic components, and mappers
│   │   │   ├── base/
│   │   │   │   ├── base.component.ts
│   │   │   │   └── base.facade.ts
│   │   │   ├── component/          # Reusable UI library (tables, dialogs, forms)
│   │   │   ├── mappers/
│   │   │   └── models/
│   │   ├── app.component.ts        # App Shell & navigation
│   │   ├── app.config.ts
│   │   └── app.routes.ts           # Lazy-loaded route hierarchy
│   ├── index.html
│   ├── main.ts                     # Application bootstrap & provider configuration
│   └── styles.scss                 # Global styling & Angular Material theme
├── angular.json                    # Angular CLI build & architect configuration
├── Dockerfile                      # Multi-stage production container definition
├── nginx.conf                      # Production Nginx reverse proxy & SPA config
├── package.json
└── tsconfig.json
```

---

## Local Development

### Prerequisites

- **Node.js**: `v20.x LTS` or higher
- **npm**: `v10.x` or higher
- **Angular CLI**: `^19.2.x` (`npm install -g @angular/cli`)
- **RouteNetLK Backend**: Running instance of [RouteNetLKServerApplication](https://github.com/Ashan-Dissanayake/RouteNetLKServerApplication) on `http://localhost:8080`.

### 1. Clone the Repository

```bash
git clone https://github.com/Ashan-Dissanayake/RouteNetLKClientApplication.git
cd RouteNetLKClientApplication
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
ng serve
```

Navigate to `http://localhost:4200/`. The application will automatically reload if you change any source files.

### 4. Build Production Bundle

```bash
ng build --configuration production
```

Build artifacts will be compiled to `dist/routenet-lk/browser`.

---

## Related Repositories

- **RouteNetLK Overview**: [https://github.com/Ashan-Dissanayake/RouteNetLK-Overview](https://github.com/Ashan-Dissanayake/RouteNetLK-Overview) — System-level architecture, database schema, operational workflows, and end-to-end documentation.
- **RouteNetLK Server Application**: [https://github.com/Ashan-Dissanayake/RouteNetLKServerApplication](https://github.com/Ashan-Dissanayake/RouteNetLKServerApplication) — Enterprise Spring Boot backend with REST APIs, Hibernate/JPA persistence, Spring Security, and domain services.

---

## Engineering Highlights

- **100% Standalone Architecture**: Modern Angular 19 architecture without NgModules, utilizing `bootstrapApplication` and route-level `loadComponent` lazy loading.
- **Strict Facade Separation**: Total decoupling of presentation components from HTTP communication and RxJS stream management via `BaseFacade<TEntity, TMetadata>`.
- **Metadata-Driven Form Engine**: Reusable reactive form builder generating inputs, validations, dynamic dropdown options, and server-side regex enforcement dynamically.
- **Granular Privilege-Based Security**: Dynamic menu and route protection utilizing JWT token decoding, functional HTTP interceptors, and `ngx-permissions`.
- **Real-Time Push Integration**: Server-Sent Events (SSE) integration bridging backend lifecycle events directly to Angular Signals and Material toast alerts.
- **Client-Side Document Export**: Browser-based PDF formatting (jsPDF + AutoTable) and Excel synthesis (SheetJS + FileSaver).
- **Production-Ready Multi-Stage Docker & Nginx Deployment**: Non-root Alpine runtime, Gzip compression, static asset caching, SPA routing, and automated GitHub Actions CI/CD to AWS EC2.

---

## Author

**Ashan Dissanayake**  
*Full-Stack Software Engineer*  
- **LinkedIn**: [https://www.linkedin.com/in/Ashan-PDissanayake](https://www.linkedin.com/in/Ashan-PDissanayake)  
- **GitHub**: [https://github.com/Ashan-Dissanayake](https://github.com/Ashan-Dissanayake)  
- **Email**: [ashanpathum899@gmail.com](mailto:ashanpathum899@gmail.com)
