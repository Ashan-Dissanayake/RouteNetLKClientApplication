/*
 === API Endpoints Constant ===
  Centralize API endpoints for better maintainabilit
 */

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

} as const;
