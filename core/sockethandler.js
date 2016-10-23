var io = require('socket.io');

function init(server) {
    io = io.listen(server);
    
    //initialize sockets
    io.set('log level', 1);
    io.sockets.on('connection', function(socket) {
        socket.on('realtimeprice', function(tkr) {
            request(socket, 'realtimeprice', 'yahoo/realtimeprice/' + tkr);
        });
        socket.on('autocomplete', function(txt) {
            request(socket, 'autocomplete', 'autocomplete', { type:2, q:txt, limit:50 });
        });
        
        socket.on('disconnect', function() {
            //io.sockets.emit('user disconnected');
        });
        
        //send initial stock ticker update
        request(socket, 'realtimeprice', 'yahoo/realtimeprice/');
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
    	    request(io.sockets, 'realtimeprice', 'yahoo/realtimeprice/');
            //console.log('broadcasting stock ticker');
		}
    }, 60000);
}

function request(socket, socketEvent, path, data) {
    controller.init(('api/' + path).split('/'), data ? { data:JSON.stringify(data) } : {}, null, null, socket, socketEvent);
}

function getSocket(id) {
    return io.sockets.sockets[id];
}

exports.init = init;
exports.getSocket = getSocket;