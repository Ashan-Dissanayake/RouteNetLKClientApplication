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
    allowedBusTypes:`${baseUrl}/allowedbustypes/list`,
    crewStatuses:`${baseUrl}/crewstatuses/list`,
    routeFamiliarityLevels:`${baseUrl}/routefamiliaritylevels/list`,
    licenseCategories:`${baseUrl}/licensecategories/list`,

  //Vehicle
    vehicles:`${baseUrl}/vehicles`,
    conditionrate:`${baseUrl}/conditionrates/list`,
    fueltype:`${baseUrl}/fueltypes/list`,
    vehiclestatus:`${baseUrl}/vehiclestatuses/list`,
    make:`${baseUrl}/makes/list`,
    model:`${baseUrl}/models/list`,
    bustype:`${baseUrl}/bustypes/list`,
    vehicledeactivate: `${baseUrl}/vehicles/deactivate`,


} as const;
