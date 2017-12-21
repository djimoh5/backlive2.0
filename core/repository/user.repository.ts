import { BaseRepository } from './base.repository';

export class UserRepository extends BaseRepository {
    constructor() {
        super('user');
    } 
}