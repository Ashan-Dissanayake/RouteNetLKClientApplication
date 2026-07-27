/**
 * Represents an operational calendar entity with an ID and name.
 */
export class OpCalender {
    id!: number;
    name!: string;

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }
}
