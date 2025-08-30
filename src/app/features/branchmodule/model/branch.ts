import { Field } from '../../../shared/form/formfield.factory';
import {Branchcoverage} from './branchcoverage';

export class Branch {

  @Field({mode: 'regex', name: 'name', type: 'text', label: 'Branch Name', required: true})
  name!: string;

  @Field({mode:"regex", name: 'code', type: 'text', label: 'Branch Code', required: true })
  code!: string;

  @Field({mode: "regex", name: 'address', type: 'text', label: 'Branch Address', required: true })
  address!: string;

  @Field({mode: "regex", name: 'telephone', type: 'text', label: 'Telephone', required: true})
  telephone!: string;

  @Field({mode: "none", name:'docreated',type: 'date', label: 'Date of Created', required: true})
  docreated!: Date;

  @Field({mode: "options", name:'districts',type: 'dualist', label: 'Branch Coverage', required: true})
  districts!:Branchcoverage;

  @Field({mode: "none", name:'remarks',type: 'text', label: 'Remarks', required: false})
  remarks!: string;

  @Field({mode: "options", name:'branchtype', type: 'select', label: 'Branch Type', required: true })
  branchtype!: boolean;

  @Field({mode: "options", name:'branchstatus',type: 'select', label: 'Branch Status', required: true})
  branchstatus!: string;


}


