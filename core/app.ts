require('../network/globals.js');

import { Server } from './server';
import { ServerSocket } from './server.socket';
import { Database } from './lib/database';
import { ChildProcess } from 'child_process';

Database.open(() => {
    var server: Server = Server.bootstrap();
    var serverSocket =  new ServerSocket(server.getServer());

    // init network
    var proc: ChildProcess = require('child_process').fork('../network/main.ts');
    serverSocket.registerProcess(proc);
});