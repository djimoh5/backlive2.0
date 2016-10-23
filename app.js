var express = require('express');
var lessMiddleware = require('less-middleware');
var app = express();

ENV = 'dev';
BASE_DIR = __dirname;
require('./core/config');

db.open(function () {
    require(DIR_LIB + 'Session');
    console.log('database connected');
});

//init routes
var routes = require('./core/routes');
routes.forEach(function (route) {
    console.log('Initializing controller at path', route.path);
    app.use(route.path, (new route.controller()).getRouter());
});

//init static pages - COMMENT OUT WHEN BEHIND NGINX SERVER

app.use('/dist', express.static('dist'));

app.use('/app', lessMiddleware('app', { 
    preprocess: { 
        importPaths: function(paths, req) { return '/'; } 
    }
}));
app.use('/css', lessMiddleware('css'));

app.use('/app', express.static('app'));
app.use('/network', express.static('network'));
app.use('/app-design', express.static('app-design'));
app.use('/node_modules', express.static('node_modules'));

app.use('/home', express.static('home'));
app.use('/view', express.static('view'));
app.use('/js', express.static('js'));
app.use('/css', express.static('css'));
app.use('/images', express.static('images'));

// init server
var server = app.listen(8080, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('BackLive listening at http://%s:%s', host, port);
});

//init socket handler
//var sockethandler = require('./core/sockethandler');
//sockethandler.init(server);

// init network
require('child_process').fork('network/main.ts');