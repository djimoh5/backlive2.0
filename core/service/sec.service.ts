import { BaseService } from './base.service';

import { Session } from '../lib/session';
import { Common } from '../../app//utility/common';

var urlParser = require("url");
var whttp = require("../lib/whttp.js");

export class SECService extends BaseService {
    constructor(session: Session) {
        super(session);
    }
   
    getDocument(path) {
        whttp.get('ftp://ftp.sec.gov/', '/' + path, (data) => {
            this.done(data);
        });
        
        return this.promise;
    }
}