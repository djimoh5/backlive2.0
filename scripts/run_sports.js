sys = require('util');
var fs = require('fs');
var ejs = require('ejs');

DIR_ROOT = "."
require(DIR_ROOT + './core/config_sports');
require(DIR_ROOT + DIR_LIB + "model.js");

ENV = 'sports';
DB_USER = "rewind";
DB_PWORD = "joyfriday5";
DB_IP = "50.19.254.126";
DB_WRITE_CONCERN = 1;

u = require(DIR_ROOT + DIR_JS_LIB + "common");

var script = parseInt(process.argv[2]);
var files = ['cache_sports'];
require('./' + files[script] + '.js');

switch(script) {
    case 0: script = Cache;
        break;
}

db = require(DIR_ROOT + DIR_LIB + "db");
db.open(function() {
	var method = process.argv[3];
	script[method]();
}, true);