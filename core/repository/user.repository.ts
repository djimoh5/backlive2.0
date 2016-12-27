import { BaseRepository, Operations } from './base.repository';

export class UserRepository extends BaseRepository {
    constructor() {
        super('user');
    } 
}