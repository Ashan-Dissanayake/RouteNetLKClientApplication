/*
 === API Endpoints Constant ===
  Centralize API endpoints for better maintainabilit
 */

const baseUrl = 'http://localhost:8080';

export const ApiEndpoints = {
    branchstatuses:`${baseUrl}/branchstatuses/list`,
    branchtypes:`${baseUrl}/branchtypes/list`,
    districts:`${baseUrl}/districts/list`,
    regexes: `${baseUrl}/regexes`,
    branches: `${baseUrl}/branches`,
    provinces:`${baseUrl}/provinces/list`,
} as const;
