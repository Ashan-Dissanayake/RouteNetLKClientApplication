/**
 * Represents a type of trip with an identifier and a name.
 */
export class TripType {
    id!: number;
    name!: string;

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }
}
