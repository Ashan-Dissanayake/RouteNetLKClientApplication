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


} as const;
