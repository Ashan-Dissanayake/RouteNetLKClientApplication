/*
 === API Endpoints Constant ===
  Centralize API endpoints for better maintainabilit
 */

const baseUrl = 'http://localhost:8080';

export const ApiEndpoints = {

    //Branch
    branchstatuses:`${baseUrl}/branchstatuses/list`,
    branchtypes:`${baseUrl}/branchtypes/list`,
    districts:`${baseUrl}/districts/list`,
    regexes: `${baseUrl}/regexes`,
    branches: `${baseUrl}/branches`,
    brancheslist: `${baseUrl}/branches/list`,
    branchesdeactivate: `${baseUrl}/branches/deactivate`,
    provinces:`${baseUrl}/provinces/list`,

    //Employee
    genders:`${baseUrl}/genders/list`,
    departments:`${baseUrl}/departments/list`,
    designations:`${baseUrl}/designations/list`,
    employeetypes:`${baseUrl}/employeetypes/list`,
    employeestatuses:`${baseUrl}/employeestatuses/list`,
    employees:`${baseUrl}/employees`,
    employeesByDriver:`${baseUrl}/employees/list/driver`,
    employeesByConductor:`${baseUrl}/employees/list/conductor`,
    employeesList:`${baseUrl}/employees/list`,
    employeesdeactivate: `${baseUrl}/employees/deactivate`,

    //Crew
    drivers:`${baseUrl}/drivers`,
    conductors:`${baseUrl}/conductors`,
    allowedBusTypes:`${baseUrl}/allowedbustypes/list`,
    crewStatuses:`${baseUrl}/crewstatuses/list`,
    routeFamiliarityLevels:`${baseUrl}/routefamiliaritylevels/list`,
    licenseCategories:`${baseUrl}/licensecategories/list`,

  //Vehicle
    vehicles:`${baseUrl}/vehicles`,
    servicetype:`${baseUrl}/servicetypes/list`,
    conditionrate:`${baseUrl}/conditionrates/list`,
    fueltype:`${baseUrl}/fueltypes/list`,
    vehiclestatus:`${baseUrl}/vehiclestatuses/list`,
    make:`${baseUrl}/makes/list`,
    seatingcapacity:`${baseUrl}/seatingcapacities/list`,
    vehicledeactivate: `${baseUrl}/vehicles/deactivate`,


} as const;
