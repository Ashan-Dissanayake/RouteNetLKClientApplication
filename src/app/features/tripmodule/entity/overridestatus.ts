/**
 * Represents the override status entity with an ID and name.
 * This class is used to manage and encapsulate the properties
 * related to an override status in the application.
 */
export class OVerRideStatus {
    id!: number;
    name!: string;

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }
}
