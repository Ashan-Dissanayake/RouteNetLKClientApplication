import {Driver} from '../../features/crew/model/driver';

export  class DriverMapper{
  static fromForm(payload: any):Driver{
    return {
      id: payload.id,
      employee: payload.employee,
      number: payload.number,
      licensenumber: payload.licensenumber,
      dolicenseissued:payload.licenseDateRange.start,
      dolicenseexpired: payload.licenseDateRange?.end,
      domedicalissued: payload.medicalDateRange?.start,
      domedicalexpired: payload.medicalDateRange?.end,
      licensecategory: payload.licensecategory,
      crewstatus: payload.crewstatus,
      routefamiliaritylevel: payload.routefamiliaritylevel,
      allowedbustype: payload.allowedbustype // if exists
    };
  }


  // Transform driver DTO into form patch object
  static toForm(driver: any): any {
    return {
      id: driver.id,
      employee: driver.employee,
      number: driver.number,
      licensenumber: driver.licensenumber,
      licensecategory: driver.licensecategory,
      crewstatus: driver.crewstatus,
      routefamiliaritylevel: driver.routefamiliaritylevel,

      // Map separate dates into date-range group
      licenseDateRange: {
        start: driver.dolicenseissued ? new Date(driver.dolicenseissued) : null,
        end: driver.dolicenseexpired ? new Date(driver.dolicenseexpired) : null,
      },
      medicalDateRange: {
        start: driver.domedicalissued ? new Date(driver.domedicalissued) : null,
        end: driver.domedicalexpired ? new Date(driver.domedicalexpired) : null,
      }
    };
  }
}
