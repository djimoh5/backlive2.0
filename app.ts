/// <reference path="./typings/index.d.ts" />

import * as express from 'express';
import * as lessMiddleware from 'less-middleware';
import { routes } from './core/routes';

export class Server {
    app: express.Application;

    constructor() {
        this.app = express();

        //init routes
        routes.forEach(function (route) {
            console.log('Initializing controller at path', route.path);
            this.app.use(route.path, (new route.controller()).getRouter());
        });

        //init static pages - COMMENT OUT WHEN BEHIND NGINX SERVER
        this.app.use('/dist', express.static('dist'));

        this.app.use('/app', lessMiddleware('app', { 
            preprocess: { 
                importPaths: function(paths, req) { return '/'; } 
            }
        }));
        this.app.use('/css', lessMiddleware('css'));

        this.app.use('/app', express.static('app'));
        this.app.use('/network', express.static('network'));
        this.app.use('/app-design', express.static('app-design'));
        this.app.use('/node_modules', express.static('node_modules'));

        this.app.use('/home', express.static('home'));
        this.app.use('/view', express.static('view'));
        this.app.use('/js', express.static('js'));
        this.app.use('/css', express.static('css'));
        this.app.use('/images', express.static('images'));

        // init server
        var server = this.app.listen(8080, function () {
            var host = server.address().address;
            var port = server.address().port;
            console.log('BackLive listening at http://%s:%s', host, port);
        });

        //init socket handler
        var sockethandler = require('./core/sockethandler');
        sockethandler.init(server);

        // init network
        require('child_process').fork('network/main.ts');
    }

    public static bootstrap(): Server {
        return new Server();
    }
}