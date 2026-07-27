/**
 * Represents the status of a trip with an identifier and a name.
 */
export class TripStatus {
  id!: number;
  name!: string;

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }
}
