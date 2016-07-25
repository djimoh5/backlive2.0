var DIR_JS = '../js/';

u = require(DIR_JS + 'lib/common');
var fs = require('fs');
var uglify = require('uglify-js');
var compressed = 0;

function run(dir) { 
    var exclude = ['all.js','common.js', 'jquery-1.7.1.min.js', 'jquery.isotope.min.js', 'jquery.mobile.custom.min.js', 'jquery-ui-1.8.17.custom.min.js', 'bootstrap.min.js','bootstrap.js','classyJSON.js','jquery-1.7.1.js','jquery.mobile.custom.js','less.js', 'rjson.js', 'fixedcolumns.min.js', 'jquery.dataTables.min.js', 'jquery.fixedheadertable.js','jquery.browser.mobile.js', 'md5.js', 'ejs_fulljslint.js', 'calculation.js','facebook.js','adapters','modules','themes','highcharts','socket.io'];
    console.log('uglifying directory ' + dir);
    var files;
    
    if(dir) {
        files = fs.readdirSync(dir);
        exclude.push('jquery-1.7.1.min.js', 'jquery.isotope.min.js', 'jquery.mobile.custom.min.js');
    }
    else {
        files = ['include','lib','modules','runmarkets.js', 'ui.js', 'ib.js', 'backtest.js',
                 'analytics.js', 'charter.js', 'portfolio.js', 'trader.js', 'sec.js', 'account.js', 'community.js', 'voice.js', 'stats.js', 'plugins'];
        dir = '../js/';
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

run();