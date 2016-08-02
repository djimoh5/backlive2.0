import {Common} from 'backlive/utility';

export class Base {
    objectId: string;
    constructor() {
        this.objectId = Common.uniqueId();
    }
}