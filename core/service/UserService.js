var BaseService = require("./BaseService.js");

function UserService(session) {
	BaseService.call(this, session);
    
    var self = this,
        user = session.user;
    //console.log(user);

    this.register = function(params) {
    	session.register(params.username, params.password, params.email, self.done);
        return self.promise;
	}
    
    this.login = function(params) {
        session.login(params.username, params.password, self.done);
        return self.promise;
	}
    
    this.logout = function(params) {
        session.logout(function() {
            self.done({ success:1 });
        });
        return self.promise;
    }
    
    this.password = function(params) {
        session.changePassword(params[0].opword, params[0].npword, self.done);
        return self.promise;
    }
    
    this.forgotpassword = function(params) {
        session.forgotPassword(params.username, self.done);
        return self.promise;
    }
}

UserService.inherits(BaseService);
module.exports = UserService;