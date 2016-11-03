import * as express from 'express';
import { routes } from './routes';

var lessMiddleware = require('less-middleware');

export class Server {
    private app: express.Application;
    private server: any;
    
    constructor() {
        this.app = express();

        this.initRoutes();
        this.initLess();
        this.initStatic();        

        // init server
        var server = this.app.listen(8080, function () {
            var host = server.address().address;
            var port = server.address().port;
            console.log('BackLive listening at http://%s:%s', host, port);
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
        this.app.use('/app-design', express.static('app-design'));
        this.app.use('/node_modules', express.static('node_modules'));

        this.app.use('/home', express.static('home'));
        this.app.use('/view', express.static('view'));
        this.app.use('/js', express.static('js'));
        this.app.use('/css', express.static('css'));
        this.app.use('/images', express.static('images'));
    }

    getServer() {
        return this.server;
    }

    public static bootstrap(): Server {
        return new Server();
    }
}