const BASE_URL = 'http://localhost:8080';

export const ApiEndpoints = {

    regexes: `${BASE_URL}/regexes`,

    //Branch
    branchstatuses:`${BASE_URL}/branch-statuses/summaries`,
    branchtypes:`${BASE_URL}/branch-types/summaries`,
    branches: `${BASE_URL}/branches`,
    brancheslist: `${BASE_URL}/branches/summaries`,
    branchesdeactivate: `${BASE_URL}/branches`,
    regionaloffice:`${BASE_URL}/regional-offices/summaries`,
    branchcode:`${BASE_URL}/number-generator/branch`,

    //Employee
    genders:`${BASE_URL}/genders/summaries`,
    departments:`${BASE_URL}/departments/summaries`,
    designations:`${BASE_URL}/designations/summaries`,
    employeetypes:`${BASE_URL}/employee-types/summaries`,
    employeestatuses:`${BASE_URL}/employee-statuses/summaries`,
    employees:`${BASE_URL}/employees`,
    employeesByDriver:`${BASE_URL}/employees/summaries/driver`,
    employeesByConductor:`${BASE_URL}/employees/summaries/conductor`,
    employeesList:`${BASE_URL}/employees/summaries`,
    employeesdeactivate: `${BASE_URL}/employees/deactivate`,
    employeenumber:`${BASE_URL}/number-generator/employee`,


    //Crew
    drivers:`${BASE_URL}/drivers`,
    conductors:`${BASE_URL}/conductors`,

    crewStatuses:`${BASE_URL}/crew-statuses/summaries`,
    routeFamiliarityLevels:`${BASE_URL}/route-familiarity-levels/summaries`,
    licenseCategories:`${BASE_URL}/license-categories/summaries`,

    //Vehicle
    vehicles:`${BASE_URL}/vehicles`,
    vehiclessummaries:`${BASE_URL}/vehicles/summaries`,
    conditionrate:`${BASE_URL}/condition-rates/summaries`,
    fueltype:`${BASE_URL}/fuel-types/summaries`,
    vehiclestatus:`${BASE_URL}/vehicle-statuses/summaries`,
    make:`${BASE_URL}/makes/summaries`,
    model:`${BASE_URL}/models/summaries`,
    bustype:`${BASE_URL}/bus-types/summaries`,
    vehicledeactivate: `${BASE_URL}/vehicles/deactivate`,

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

} as const;
