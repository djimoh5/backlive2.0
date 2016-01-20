var BaseService = require("./BaseService.js");
var Common = require("../utility/Common.js");
var urlParser = require("url");
var whttp = require("../lib/whttp.js");

function SECService(session) {
	BaseService.call(this, session);
    
    var self = this,
        user = session.user;
        
    this.getDocument = function(path) {
        whttp.get('ftp://ftp.sec.gov/', '/' + path, function(data) {
            self.done(data);
        });
        
        return self.promise;
    }
}

SECService.inherits(BaseService);
module.exports = SECService;