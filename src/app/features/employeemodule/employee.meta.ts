// define columns: keys must match fields (or nested paths) and labels shown in headers
export const TableMeta= [
  { key: 'number', label: 'Number' },
  { key: 'fullname', label: 'Full Name' },
  { key: 'nic', label: 'NIC' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'email', label: 'Email' },
  { key: 'address', label: 'Address' },
  { key: 'emergencycontact', label: 'Emergency Contact' },
  { key: 'branch.name', label: 'Branch' },
  { key: 'designation.name', label: 'Designation' },
  { key: 'department.name', label: 'Department' },
  { key: 'employeestatus.name', label: 'Status' },
  { key: 'actions', label: 'Actions' } // provide a template for this column below
];
