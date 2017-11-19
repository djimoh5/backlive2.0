import * as express from 'express';
import { routes } from './routes';
import { Session } from './lib/session';

var lessMiddleware = require('less-middleware');

export class Server {
    private app: express.Application;
    private server: any;
    
    constructor() {
        this.app = express();

        this.initLess();
        this.initStatic();
        this.initRoutes();   

        // init server
        var server = this.app.listen(8080, function () {
            var host = server.address().address;
            var port = server.address().port;
            console.log('BackLive listening at http://%s:%s', host, port);

            Session.load();
        });

        this.server = server;
    }
    
    private initRoutes() {
        routes.forEach((route) => {
            console.log('Initializing controller at path', route.path);
            this.app.use(route.path, (new route.controller()).getRouter());
        });
    }

    private initLess() {
        this.app.use('/app', lessMiddleware('app', { 
            preprocess: { 
                importPaths: function(paths, req) { return '/'; } 
            }
        }));
        this.app.use('/css', lessMiddleware('css'));
    }

    private initStatic() {
        this.app.use('/dist', express.static('dist'));
        this.app.use('/app', express.static('app'));
        this.app.use('/network', express.static('network'));
        this.app.use('/core/service/model', express.static('core/service/model'));
        this.app.use('/app-design', express.static('app-design'));
        this.app.use('/node_modules', express.static('node_modules'));

        this.app.use('/home', express.static('home'));
        //this.app.use('/images', express.static('images'));
    }

    getServer() {
        return this.server;
    }

    public static bootstrap(): Server {
        return new Server();
    }
}