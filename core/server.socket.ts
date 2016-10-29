import * as io from 'socket.io';

var TickerService = require("./service/TickerService.js");

export class ServerSocket {
    socketEventQueue: string = 'socketEventQueue';
    io: SocketIO.Server;
    tickerService: any;

    constructor(server) {
        this.io = io(server);
        this.tickerService = new TickerService({});
        
        //initialize sockets
        this.io.on('connection', (socket) => {
            console.log('connected socket');

            socket.on(this.socketEventQueue, (event) => {
                console.log(event);
                this.emit(socket, 'Event.StrategyUpdate', 'hi, my name is server!');
                console.log('sent message');
            });

            /*socket.on('autocomplete', function(txt) {
                request(socket, 'autocomplete', 'autocomplete', { type:2, q:txt, limit:50 });
            });
            
            socket.on('disconnect', function() {
                //io.sockets.emit('user disconnected');
            });*/

            this.emitTickerLastPrice(socket);
        });
        
        this.initBroadcasts();
    }

    initBroadcasts() {
        setInterval(() => {
            //send S&P, Dow, Nasdaq market price
            var date = new Date();
            var day = date.getDay();
            var hour = date.getUTCHours();
                    
            if(day == 0 || day == 6 || hour < 13 || hour > 20)
                return;
            else {
                this.emitTickerLastPrice(this.io.sockets);
                console.log('broadcasting stock ticker');
            }
        }, 60000);
    }

    emitTickerLastPrice(socket: SocketIO.Socket | SocketIO.Namespace, ticker?: string) {
        this.tickerService.getLastPrice().done((price) => {
            this.emit(socket, 'Event.TickerLastPrice', price);
        }); 
    }

    emit(socket: SocketIO.Socket | SocketIO.Namespace, eventName: string, data: any) {
        socket.emit(this.socketEventQueue, { eventName: eventName, data: data });
    }

    getSocket(id: string) {
        return this.io.sockets.sockets[id];
    }
}