/*
 === API Endpoints Constant ===
  Centralize API endpoints for better maintainabilit
 */

const baseUrl = 'http://localhost:8080';

export const ApiEndpoints = {

    regexes: `${baseUrl}/regexes`,

  //Branch
    branchstatuses:`${baseUrl}/branch-statuses/summaries`,
    branchtypes:`${baseUrl}/branch-types/summaries`,
    branches: `${baseUrl}/branches`,
    brancheslist: `${baseUrl}/branches/summaries`,
    branchesdeactivate: `${baseUrl}/branches`,
    regionaloffice:`${baseUrl}/regional-offices/summaries`,
    branchcode:`${baseUrl}/number-generator/branch`,

    //Employee
    genders:`${baseUrl}/genders/summaries`,
    departments:`${baseUrl}/departments/summaries`,
    designations:`${baseUrl}/designations/summaries`,
    employeetypes:`${baseUrl}/employee-types/summaries`,
    employeestatuses:`${baseUrl}/employee-statuses/summaries`,
    employees:`${baseUrl}/employees`,
    employeesByDriver:`${baseUrl}/employees/summaries/driver`,
    employeesByConductor:`${baseUrl}/employees/summaries/conductor`,
    employeesList:`${baseUrl}/employees/summaries`,
    employeesdeactivate: `${baseUrl}/employees/deactivate`,
    employeenumber:`${baseUrl}/number-generator/employee`,


  //Crew
    drivers:`${baseUrl}/drivers`,
    conductors:`${baseUrl}/conductors`,
    // allowedBusTypes:`${baseUrl}/allowedbustypes/summaries`,
    crewStatuses:`${baseUrl}/crew-statuses/summaries`,
    routeFamiliarityLevels:`${baseUrl}/route-familiarity-levels/summaries`,
    licenseCategories:`${baseUrl}/license-categories/summaries`,

  //Vehicle
    vehicles:`${baseUrl}/vehicles`,
    conditionrate:`${baseUrl}/condition-rates/summaries`,
    fueltype:`${baseUrl}/fuel-types/summaries`,
    vehiclestatus:`${baseUrl}/vehicle-statuses/summaries`,
    make:`${baseUrl}/makes/summaries`,
    model:`${baseUrl}/models/summaries`,
    bustype:`${baseUrl}/bus-types/summaries`,
    vehicledeactivate: `${baseUrl}/vehicles/deactivate`,


} as const;
