var TickerService = require("./service/TickerService.js");

var socketEventQueue = 'socketEventQueue';
var io, tickerService;

function init(server) {
    io = require('socket.io')(server);
    tickerService = new TickerService({});
    
    //initialize sockets
    io.on('connection', function(socket) {
        console.log('connected socket');

        socket.on(socketEventQueue, function(event) {
            console.log(event);
            emit(socket, { eventName: 'Event.StrategyUpdate', data: 'hi, my name is server!' });
            console.log('sent message');
        });

        /*socket.on('autocomplete', function(txt) {
            request(socket, 'autocomplete', 'autocomplete', { type:2, q:txt, limit:50 });
        });
        
        socket.on('disconnect', function() {
            //io.sockets.emit('user disconnected');
        });*/

        emitTickerLastPrice(socket);
    });
    
    initBroadcasts();
}

function initBroadcasts() {
    setInterval(function() {
        //send S&P, Dow, Nasdaq market price
        var date = new Date();
        var day = date.getDay();
    	var hour = date.getUTCHours();
    			
    	if(day == 0 || day == 6 || hour < 13 || hour > 20)
    		return;
		else {
            emitTickerLastPrice(io.sockets);
            console.log('broadcasting stock ticker');
		}
    }, 60000);
}

function emitTickerLastPrice(socket, ticker) {
    tickerService.getLastPrice().done(function(price) {
        emit(socket, 'Event.TickerLastPrice', price);
    }); 
}

function emit(socket, eventName, data) {
    socket.emit(socketEventQueue, { eventName: eventName, data: data });
}

function getSocket(id) {
    return io.sockets.sockets[id];
}

exports.init = init;
exports.getSocket = getSocket;