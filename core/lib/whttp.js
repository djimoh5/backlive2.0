var http = require('http');

whttp = {
	max:10,
	active:0,
	queue:[],
    callback:null,

	get: function(host, path, callback, port, extData, ssl) {
		if(!host) {
			var req = whttp.queue.shift();
            //console.log(whttp.queue.length + " left in queue");
			host = req.host;
			path = req.path;
			callback = req.callback;
            extData = req.extData;
            ssl = req.ssl;
		}
					
		if(whttp.active < whttp.max) {
			whttp.active++;
			var options = { host: host, port: ssl ? 443 : 80, path: path };
			var service = ssl ? https : http;
			
			if(port)
				options.port = port;
			
			var req = service.get(options, function(res) {
				var data = "";
				//console.log('STATUS: ' + res.statusCode);
				//console.log('HEADERS: ' + JSON.stringify(res.headers));
				
				res.setEncoding('utf8');
				res.on('data', function (chunk) {
					data += chunk;
				});
				
				res.on('end', function () {
					whttp.active--;
                    
                    if(callback)
					    callback(data);
                    else if(whttp.callback)
                        whttp.callback(data, extData);
					
					if(whttp.queue.length > 0)
						whttp.get();
				});
			}).on('error', function(e) {
				whttp.active--;
				console.log("http get error: " + e.message, host, path);
				  
				//add back to queue
				//whttp.queue.push({ host:host, path:path, callback:callback, extData:extData });
				//whttp.get();
                
                if(callback)
    				callback("");
                else if(whttp.callback)
                    whttp.callback("", extData);
					
				if(whttp.queue.length > 0)
					whttp.get();
			});
			
			//console.log(whttp.active + " active requests");
		}
		else {
			whttp.queue.push({ host:host, path:path, callback:callback, extData:extData, ssl:ssl });
		}
	}
}