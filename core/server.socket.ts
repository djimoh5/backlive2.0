import * as io from 'socket.io';
import { BaseEvent } from '../network/event/base.event';
import { TickerLastPriceEvent } from '../ui/src/app/event/server.event';
import { ChildProcess } from 'child_process';

import { TickerService } from './service/ticker.service';

export class ServerSocket {
    clientEventQueueId: string = 'clientEventQueue';
    serverEventQueueId: string = 'serverEventQueue';
    private io: SocketIO.Server;
    private tickerService: TickerService;

    processes: ChildProcess[] = [];

    constructor(server) {
        this.io = io(server);
        var mockSession: any = {};
        this.tickerService = new TickerService(mockSession);
        
        //initialize sockets
        this.io.on('connection', (socket) => {
            console.log('connected socket');

            socket.on(this.clientEventQueueId, (event: BaseEvent<any>) => {
                //console.log('socket - from web:', event);
                this.notify(event);
            });

            /*socket.on('autocomplete', function(txt) {
                request(socket, 'autocomplete', 'autocomplete', { type:2, q:txt, limit:50 });
            });
            
            socket.on('disconnect', function() {
                //io.sockets.emit('user disconnected');
            });*/

            //this.emitTickerLastPrice(socket);
        });
        
        this.initBroadcasts();
    }

    private initBroadcasts() {
        setInterval(() => {
            //send S&P, Dow, Nasdaq market price
            var date = new Date();
            var day = date.getDay();
            var hour = date.getUTCHours();
                    
            if(day == 0 || day == 6 || hour < 13 || hour > 20) {
                return;
            }
            else {
                //this.emitTickerLastPrice(this.io.sockets);
                //console.log('broadcasting stock ticker');
            }
        }, 60000);
    }

    private emitTickerLastPrice(socket: SocketIO.Socket | SocketIO.Namespace, ticker?: string) {
        this.tickerService.getLastPrice().then(price => {
            this.emit(socket, new TickerLastPriceEvent(price));
        }); 
    }

    emit(socket: SocketIO.Socket | SocketIO.Namespace, event: BaseEvent<any>) {
        socket.emit(this.serverEventQueueId, event);
    }

    getSocket(id: string) {
        return this.io.sockets.sockets[id];
    }

    registerProcess(childProcess: ChildProcess) {
        childProcess.on('message', (event: BaseEvent<any>) => {
            //console.log('socket - from child process:', event);
            this.emit(this.io.sockets, event);
        });
        
        var index = this.processes.length;
        childProcess.on('close', (code, signal) => {
            console.log('child process terminated');
            this.processes.splice(index, 1);
        });

        this.processes.push(childProcess);
        console.log(`process ${this.processes.length} registered`);
    }

    private notify(event: BaseEvent<any>) {
        this.processes.forEach(process => {
            process.send(event);
        });
    }
}