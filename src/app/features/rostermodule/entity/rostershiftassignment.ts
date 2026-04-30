export class RosterShiftAssignment {
  id!: number;
  rosterName!: string;
  shiftName!: string;
  employeeName!: string
  employeeNumber!: string
  designation!: string;
  shiftDate!: string;
  startTime!: string;
  endTime!: string;
  status!: string;

  constructor(id: number, rosterName: string, shiftName: string, employeeName: string, employeeNumber: string, designation: string, shiftDate: string, startTime: string, endTime: string, status: string) {
    this.id = id;
    this.rosterName = rosterName;
    this.shiftName = shiftName;
    this.employeeName = employeeName;
    this.employeeNumber = employeeNumber;
    this.designation = designation;
    this.shiftDate = shiftDate;
    this.startTime = startTime;
    this.endTime = endTime;
    this.status = status;
  }


}
