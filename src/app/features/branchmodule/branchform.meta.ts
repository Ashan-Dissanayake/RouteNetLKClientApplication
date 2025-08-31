import {FormField} from '../../shared/form/formfieldata.model';


export const BranchFormMeta = [
  { name: 'name', type: 'text', label: 'Branch Name', required: true, mode: 'regex'},
  { name: 'code', type: 'text', label: 'Branch Code', required: true, mode: 'regex'},
  { name: 'address', type: 'text', label: 'Branch Address', required: true, mode: 'regex'},
  { name: 'telephone', type: 'text', label: 'Telephone', required: true, mode: 'regex' },
  { name: 'docreated', type: 'date', label: 'Date of Created', required: true, mode: 'date',
    dateConfig:{
    minDate:new Date(),
      maxDate:new Date()
    }
  },
  { name: 'districts', type: 'dualist', label: 'Branch Coverage', required: true, mode: 'options'},
  { name: 'remarks', type: 'text', label: 'Remarks', required: false, mode: 'none'},
  { name: 'branchtype', type: 'select', label: 'Branch Type', required: true, mode: 'options'},
  { name: 'branchstatus', type: 'select', label: 'Branch Status', required: true, mode: 'options' }
] as FormField[];
