/**
 * Represents an Origin Terminal entity with an ID and a name.
 * This class is used to model the origin terminal data in the application.
 */
export class OriginTerminal {
    id!: number;
    name!: string;

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }
}
