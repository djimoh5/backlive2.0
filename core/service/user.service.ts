import { BaseService } from './base.service';
import { Session } from '../lib/session';

export class UserService extends BaseService {
    constructor(session: Session) {
        super(session);
    }

   register(params) {
    	this.session.register(params.username, params.password, params.email, (data) => this.done(data));
        return this.promise;
	}
    
    login(params) {
        this.session.login(params.username, params.password, (data) => this.done(data));
        return this.promise;
	}
    
    logout(params) {
        this.session.logout(() => {
            this.done({ success:1 });
        });
        return this.promise;
    }
    
    password(params) {
        this.session.changePassword(params[0].opword, params[0].npword, (data) => this.done(data));
        return this.promise;
    }
    
    forgotpassword(params) {
        this.session.forgotPassword(params.username, (data) => this.done(data));
        return this.promise;
    }
}