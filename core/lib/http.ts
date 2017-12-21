var http = require('http');
var https = require('https');

export class Http {
	max: number = 10;
	active: number = 0;
	queue: { 
		hostname: string; 
		path: string; 
		callback: Function;
		extData: any;
		ssl: boolean;
	}[] = [];
    callback: Function;

	get(hostname: string, path: string, callback: Function, port?: number, extData?: any, ssl?: boolean) {
		if(!hostname) {
			var req = this.queue.shift();
            //console.log(whttp.queue.length + " left in queue");
			hostname = req.hostname;
			path = req.path;
			callback = req.callback;
            extData = req.extData;
            ssl = req.ssl;
		}
					
		if(this.active < this.max) {
			this.active++;
			var options = { hostname: hostname, port: ssl ? 443 : 80, path: path };
			var service = ssl ? https : http;
			
			if(port) {
				options.port = port;
			}
			
			service.get(options, (res) => {
				var data = "";
				//console.log('STATUS: ' + res.statusCode);
				//console.log('HEADERS: ' + JSON.stringify(res.headers));
				
				res.setEncoding('utf8');
				res.on('data', (chunk) => {
					data += chunk;
				});
				
				res.on('end', () => {
					this.active--;
                    this.done(data, callback, extData);
				});
			}).on('error', (e) => {
				this.active--;
				console.log("http get error: " + e.message, hostname, path);
				  
				//add back to queue
				//whttp.queue.push({ host:host, path:path, callback:callback, extData:extData });
				//whttp.get();

				this.done('', callback, extData);
			});
			
			//console.log(whttp.active + " active requests");
		}
		else {
			this.queue.push({ hostname: hostname, path: path, callback: callback, extData: extData, ssl: ssl });
		}
	}

	private done(data: any, callback: Function, extData: any) {
		if(callback) {
			callback(data);
		}
		else if(this.callback) {
			this.callback(data, extData);
		}
		
		if(this.queue.length > 0) {
			this.get(null, null, null);
		}
	}
}