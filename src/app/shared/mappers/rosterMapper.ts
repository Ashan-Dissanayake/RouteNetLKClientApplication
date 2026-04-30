import {Roster} from '../../features/rostermodule/entity/roster';

export class RosterMapper{
  static fromForm(payload: any):Roster{
    return {
      id: payload.id,
      branch: payload.branch,
      dostartofweek: this.formatDate(payload.rosterdaterange?.start),
      doendofweek: this.formatDate(payload.rosterdaterange?.end),
    };
  }


  private static formatDate(date: any): string{
    const d = new Date(date);
    return d.toLocaleDateString('en-CA');
  }

}
