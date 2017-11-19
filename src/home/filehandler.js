var fs = require('fs');

function init(file, response) {
    var len = file.length;
    var ext4 = file.substring(len - 4, len);
    var ext5 = file.substring(len - 5, len);
    
	if(ext4 == '.css') {
        process(file, response, "text/css", true);
	} else if(ext5 == '.less') {
        process(file, response, "text/css", true);
	} else if(file.substring(len - 3, len) == '.js' && (file.substring(0,2) == 'js' || file.substring(0,7) == 'home/js')) {
        process(file, response, "text/javascript", true);
	} else if(ext4 == '.png') {
        process(file, response, "image/png");
	} else if(ext4 == '.ico') {
        process(file, response, "image/png");
	} else if(ext4 == '.gif') {
		process(file, response, "image/gif");
	} else if(ext4 == '.jpg') {
		process(file, response, "image/jpeg");
	} else if(ext4 == '.otf') {
    	process(file, response, "font/opentype");
	} else if(ext4 == '.ttf') {
        process(file, response, "font/opentype");
	} else if(ext5 == '.woff') {
        process(file, response, "font/opentype");
    } else if(ext4 == '.eot') {
        process(file, response, "font/opentype");
    } else if(ext4 == '.svg') {
        process(file, response, "font/opentype");
    }
	else {
		console.log("Invalid request: " + file);
		response.writeHead(404, {"Content-Type": "text/plain"});
		response.write("404 Not found");
		response.end();
	}
}

function process(file, response, contentType, noCache) {
    var s = fs.createReadStream('./' + file);
    var headers;
    
    if(noCache)
        headers = { "Cache-Control":"no-cache, no-store, must-revalidate", "Pragma":"no-cache", "Expires":"0" }
    else
        headers = {};
        
    headers["Content-Type"] = contentType;
    response.writeHead(200, headers);
    
    s.on('error', function(err) {
        console.log("error reading file: " + file);
        response.end('', 'utf-8');
    });
    s.on('open', function() {
        s.pipe(response);
    });
}

exports.init = init;