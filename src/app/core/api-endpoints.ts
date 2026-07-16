const BASE_URL = 'http://localhost:8080';

export const ApiEndpoints = {

    regexes: `${BASE_URL}/regexes`,
    LOGIN: `${BASE_URL}/login`,

    //Branch
    BRANCH_STATUSES:`${BASE_URL}/branch-statuses/summaries`,
    BRANCH_TYPES:`${BASE_URL}/branch-types/summaries`,
    BRANCHES: `${BASE_URL}/branches`,
    BRANCH_SUMMARIES: `${BASE_URL}/branches/summaries`,
    BRANCH_DEACTIVATE: `${BASE_URL}/branches`,
    REGIONAL_OFFICES:`${BASE_URL}/regional-offices/summaries`,
    BRANCH_CODE:`${BASE_URL}/number-generator/branch`,

    //Employee
    GENDERS:`${BASE_URL}/genders/summaries`,
    DEPARTMENTS:`${BASE_URL}/departments/summaries`,
    DESIGNATIONS:`${BASE_URL}/designations/summaries`,
    EMPLOYEE_TYPES:`${BASE_URL}/employee-types/summaries`,
    EMPLOYEE_STATUSES:`${BASE_URL}/employee-statuses/summaries`,
    EMPLOYEES:`${BASE_URL}/employees`,
    EMPLOYEES_BY_DRIVER:`${BASE_URL}/employees/summaries/driver`,
    EMPLOYEES_BY_CONDUCTOR:`${BASE_URL}/employees/summaries/conductor`,
    EMPLOYEES_SUMMARIES:`${BASE_URL}/employees/summaries`,
    EMPLOYEES_DEACTIVATE: `${BASE_URL}/employees/deactivate`,
    EMPLOYEE_NUMBER:`${BASE_URL}/number-generator/employee`,

    //Crew
    DRIVERS:`${BASE_URL}/drivers`,
    CONDUCTORS:`${BASE_URL}/conductors`,

    CREW_STATUSES:`${BASE_URL}/crew-statuses/summaries`,
    ROUTE_FAMILIARITY_LEVELS:`${BASE_URL}/route-familiarity-levels/summaries`,
    LICENSE_CATEGORIES:`${BASE_URL}/license-categories/summaries`,

    //Vehicle
    VEHICLES:`${BASE_URL}/vehicles`,
    VEHICLES_SUMMARIES:`${BASE_URL}/vehicles/summaries`,
    CONDITION_RATE:`${BASE_URL}/condition-rates/summaries`,
    FUEL_TYPE:`${BASE_URL}/fuel-types/summaries`,
    VEHICLE_STATUS:`${BASE_URL}/vehicle-statuses/summaries`,
    MAKE:`${BASE_URL}/makes/summaries`,
    MODEL:`${BASE_URL}/models/summaries`,
    BUS_TYPE:`${BASE_URL}/bus-types/summaries`,
    VEHICLE_DEACTIVATE: `${BASE_URL}/vehicles/deactivate`,

    //permit
    SERVICE_TYPE:`${BASE_URL}/service-types/summaries`,
    PERMIT_STATUS:`${BASE_URL}/permit-statuses/summaries`,
    ROUTE:`${BASE_URL}/routes/summaries`,
    PERMIT:`${BASE_URL}/permits`,
    PERMIT_SUMMARIES:`${BASE_URL}/permits/summaries`,
    PERMIT_TRANSFER:`${BASE_URL}/permits/transfer`,

    //spare parts
    PART_STATUS:`${BASE_URL}/part-statuses/summaries`,
    PART_CATEGORY:`${BASE_URL}/part-categories/summaries`,
    UNIT_OF_MEASURE:`${BASE_URL}/unit-of-measures/summaries`,
    PART_MASTER:`${BASE_URL}/part-masters/summaries`,
    PART:`${BASE_URL}/parts`,
    PART_SUMMARIES:`${BASE_URL}/parts/summaries`,
    PART_DEACTIVATE: `${BASE_URL}/parts/deactivate`,

    //part request
    PART_REQUEST:`${BASE_URL}/part-requests`,
    PART_REQUEST_SUMMARIES:`${BASE_URL}/part-requests/summaries`,
    PART_REQUEST_STATUS:`${BASE_URL}/part-request-statuses/summaries`,

    //GRN
    GRN:`${BASE_URL}/grns`,
    GRN_STATUS:`${BASE_URL}/grn-statuses/summaries`,

    //ROSTER
    ROSTER:`${BASE_URL}/rosters`,
    ROSTER_SUMMARIES:`${BASE_URL}/rosters/summaries`,
    ROSTER_SHIFT:`${BASE_URL}/roster-shifts`,
    ROSTER_SHIFT_ASSIGNMENT_VIEW:`${BASE_URL}/roster-shift-assignment/view`,
    ROSTER_SHIFT_ASSIGNMENT:`${BASE_URL}/roster-shift-assignment`,

    //TRIP
    TRIP:`${BASE_URL}/trips`,
    TRIP_TYPE:`${BASE_URL}/trip-types/summaries`,
    TRIP_STATUS:`${BASE_URL}/trip-statuses/summaries`,
    OP_CALENDER:`${BASE_URL}/op-calenders/summaries`,
    ORIGIN_TERMINAL:`${BASE_URL}/origin-terminals/summaries`,

    //TRIP EXECUTION
    TRIP_EXECUTION:`${BASE_URL}/trip-execution`,
    TRIP_EXECUTION_SUMMARIES:`${BASE_URL}/trip-execution/summaries`,
    TRIP_EXECUTION_STATUS:`${BASE_URL}/trip-execution-statuses/summaries`,
    TRIP_EXECUTION_GENERATE_ASSIGNMENT:`${BASE_URL}/trip-execution/generate-assignments`,
    TRIP_EXECUTION_INITIALIZATION:`${BASE_URL}/trip-execution/initialize`,

    //INCIDENT
    INCIDENTS:`${BASE_URL}/incidents`,
    INCIDENTS_SUMMARIES:`${BASE_URL}/incidents/summaries`,
    INCIDENT_TYPES:`${BASE_URL}/incident-types/summaries`,
    INCIDENT_STATUS:`${BASE_URL}/incident-statuses/summaries`,

    //INCIDENT VEHICLE ALLOCATION
    INCIDENT_VEHICLE_ALLOCATION:`${BASE_URL}/incident-vehicle-allocations`,
    INCIDENT_VEHICLE_ALLOCATION_STATUS:`${BASE_URL}/incident-vehicle-allocation-statuses/summaries`,

    //FARE COLLECTION
    FARE_COLLECTION:`${BASE_URL}/fare-collections`,
    TICKET_MACHINES:`${BASE_URL}/ticket-machines/summaries`,

    //VEHICLE SERVICE
    VEHICLE_SERVICE:`${BASE_URL}/vehicle-services`,
    VEHICLE_SERVICE_TYPE:`${BASE_URL}/vehicle-service-types/summaries`,
    VEHICLE_SERVICE_STATUS:`${BASE_URL}/vehicle-service-statuses/summaries`,
    VEHICLE_SERVICE_PRIORITY:`${BASE_URL}/vehicle-service-priorities/summaries`,

    // USER MANAGEMENT
    USERS :`${BASE_URL}/users`,
    USER_DEACTIVATE_OR_ACTIVATE :`${BASE_URL}/users/activate-or-deactivate-user`,
    USER_STATUS:`${BASE_URL}/user-statuses/summaries`,
    USER_TYPE:`${BASE_URL}/user-types/summaries`,

} as const;
