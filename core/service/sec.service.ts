import { BaseService } from './base.service';

import { Session } from '../lib/session';

//var urlParser = require("url");
import { Http } from '../lib/http';

export class SECService extends BaseService {
    constructor(session: Session) {
        super(session);
    }
   
    getDocument(path) {
        new Http().get('ftp://ftp.sec.gov/', '/' + path, (data) => {
            this.done(data);
        });
        
        return this.promise;
    }
}