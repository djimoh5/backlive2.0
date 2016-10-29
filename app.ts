/// <reference path="./typings/index.d.ts" />

require('./network/globals.js');

import { Server } from './core/server';
import { Database } from './core/lib/database';

Database.open(() => {
    Server.bootstrap();
});