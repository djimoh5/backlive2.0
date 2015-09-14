var DIR_ROOT = './../.';
var fs = require('fs');
var uglify = require('uglify-js');
var compressed = 0;

function run(dir) {
    var exclude = ['all.js','common.js','bootstrap.min.js','bootstrap.js','classyJSON.js','jquery-1.7.1.js','jquery.mobile.custom.js','less.js','calculation.js','facebook.js','adapters','modules','themes','highcharts','socket.io'];
    console.log('uglifying directory ' + dir);
    var files;
    
    if(dir) {
        files = fs.readdirSync(dir);
        exclude.push('jquery-1.7.1.min.js', 'jquery.isotope.min.js', 'jquery.mobile.custom.min.js');
    }
    else {
        files = ['plugins/jquery-1.7.1.min.js','plugins/jquery.isotope.min.js','plugins/jquery.mobile.custom.min.js','include','lib','runmarkets.js', 'ui.js', 'ib.js', 'backtest.js',
                 'analytics.js', 'charter.js', 'portfolio.js', 'trader.js', 'sec.js', 'voice.js', 'stats.js', 'plugins'];
        dir = './js/';
    }

    for(var i = 0, cnt = files.length; i < cnt; i++) {
        if(!u.inArray(files[i], exclude)) {
            if(files[i].indexOf('.js') < 0) {
                run(dir + files[i] + '/');
            }
            else {
                var result = uglify.minify(dir + files[i]);
                //console.log(result.code);
               
                if(compressed) {
                    var fd = fs.openSync(DIR_JS + 'all.js', 'a');
                    fs.writeSync(fd, ';\n');
                    fs.writeSync(fd, result.code);
                }
                else
                    fs.writeFileSync(DIR_JS + 'all.js', result.code, 'utf8');
                
                console.log(dir + files[i] + ' uglified');
                
                compressed++;
            }
        }
    };
    
    console.log('Number of Files Uglified: ' + compressed);
}

exports.run = run;
