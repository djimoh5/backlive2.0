import { BaseModel } from './base.model';

export interface User {
    uid: string;
    token?: string;
    sessId? : string;
    username?: string;
    email?: string;
    
    //braintree payments fields
    btuid?: string;
    btpid?: string;
    btsid?: string;
    btpt?: string;
    
    created?: number;
    error?: string;
}