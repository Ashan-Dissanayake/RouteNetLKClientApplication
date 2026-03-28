import {Conductor} from '../../features/crew/entity/conductor';

export  class ConductorMapper{
  static fromForm(payload: any):Conductor{
    return {
      id: payload.id,
      employee: payload.employee,
      number: payload.number,
      domedicalissued: payload.medicalDateRange?.start,
      domedicalexpired: payload.medicalDateRange?.end,
      crewstatus: payload.crewstatus,
      routefamiliaritylevel: payload.routefamiliaritylevel,
      allowedbustype: payload.allowedbustype // if exists
    };
  }


  // Transform driver DTO into form patch object
  static toForm(conductor: any): any {
    return {
      id: conductor.id,
      employee: conductor.employee,
      number: conductor.number,
      crewstatus: conductor.crewstatus,
      routefamiliaritylevel: conductor.routefamiliaritylevel,

      // Map separate dates into date-range group
      medicalDateRange: {
        start: conductor.domedicalissued ? new Date(conductor.domedicalissued) : null,
        end: conductor.domedicalexpired ? new Date(conductor.domedicalexpired) : null,
      }
    };
  }
}
