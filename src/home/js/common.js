/** init cross client/server compatibility **/
if(typeof(exports) == 'undefined') {
	//exports = {};
	u = window;
}

/*** constants ***/
DAY_IN_MS = 86400000;
NO_VALUE = -99999;
BASE_URL = 'http://localhost/';
HOST_NAME = 'localhost';
SERVER_NAME = '';
BACKTEST_DATE = 0;
LOG_ALL = false;

MANDRILL_API_KEY = 'oweoS4RQJE2pOx2s8MXVhQ';

/*** get dates ***/
function sendEmail(toEmail, subject, header, mainCol, leftCol, rightCol, actionBtn, linkAction) {
    if(header == null) header = '';
    if(mainCol == null) mainCol = '';
    if(leftCol == null) leftCol = '';
    if(rightCol == null) rightCol = '';
    if(actionBtn == null) actionBtn = 'Sign In to BackLive';
    if(linkAction == null) linkAction = '';
    
    $.ajax({ 
	    type: "POST", 
	    url: "https://mandrillapp.com/api/1.0/messages/send-template.json",
    	data: { 
    	    key: MANDRILL_API_KEY,
    	    template_name: "backlive-main-template",
            template_content: [{ name:'header', content:header }, { name:'main', content:mainCol }, { name:'main-left', content:leftCol }, { name:'main-right', content:rightCol }, { name:'action-button', content:actionBtn }],
            message: {
            	to: [{ email: toEmail, type: 'to' }],
                subject: subject,
				merge_vars: [{
                    rcpt: toEmail,
                    vars: [{ name:'LINK_ACTION', content:linkAction }],
    		    }]
    		}
    	}
    })
    .done(function(response) {
        //console.log(response);
    })
    .fail(function(response) {
        console.log(response);
    });
}

function getDates(callback, wk) {
    var dates = [], weeks = [];
    var query = wk == -1 ? {} : (wk ? { wk:wk } : { wk:1 });
    
    db.mongof.collection('file_date', function(err, collection) {
        collection.find(query).sort({ date:1 }).toArray(function(err, results) {
    	    if(err) {
    		    console.log('Error selecting data: ' + err.message);
    		    return;
    	    } else {
                for(var i = 0, cnt = results.length; i < cnt; i++) {
                    if(!results[i].hide) {
        			    dates.push(parseInt(results[i].date.toString()));
                        weeks.push(results[i].wk);
                    }
    			}
    	    }
            
            callback(dates, weeks);
        });
    });
}

/*** functions ***/
function udef(val, def) {
    return val ? val : def;
}

function padMonth(month) {
    var str = "" + month;
	
    if(str.length == 1)
    	return "0" + str;
    else
    	return str;
}

function isNumber(n) {
	 return !isNaN(parseFloat(n)) && isFinite(n);
}

function validValue(val) {
    return typeof(val) != 'undefined' && val != NO_VALUE;
}

function defined(val) {
    return typeof(val) != 'undefined';
}

function date(year, month, day) {
	return new Date(year, month, day, 12, 0, 0, 0);
}

function inArray(val, arr) {
	if (Array.prototype.indexOf) {
		return Array.prototype.indexOf.call(arr, val) >= 0;
	}
	
	for(var i = 0, cnt = arr.length; i < cnt; i++) {
		if(arr[i] == val)
			return true;
	}
	
	return false;
}

function isArray(obj) {
    if(Object.prototype.toString.call(obj) === "[object Array]")
        return true;
    else
        return false;
}

function sortKeysByValue(obj, sortDesc) {
	var sortArr = [];
	var sortDir;

	for(var key in obj) {
		sortArr.push({ 'key':key, 'value':obj[key] });
	}
	
	if(sortDesc)
		sortDir = -1;
	else 
		sortDir = 1;
	
	sort = sortArr.sort(function(a, b) {
		return (a.value - b.value) * sortDir;
	});
	
	var res = []
	
	for(var i = 0, cnt = sort.length; i < cnt; i++) {
		res.push(sort[i].key)
	}
	
	return res;
}

function sortKeys(obj, sortDesc) {
    var sortArr = [];
	var sortDir;

	for(var key in obj) {
		sortArr.push(key);
	}
    
    sortArr.sort();
	
	if(sortDesc)
		sortArr.reverse()

	return sortArr;
}

function round(num, places) {
	if(places && places > 0) {
		num = parseFloat(Math.round(num * Math.pow(10, places)) / Math.pow(10, places));
		
		if(!isNaN(num))
			return num;
		else
			return 0;
	}
	else
		return Math.round(num);
}

function addCommas(nStr) {
	nStr += '';
	var x = nStr.split('.');
	var x1 = x[0];
	var x2 = x.length > 1 ? '.' + x[1] : '';
	
	var rgx = /(\d+)(\d{3})/;
	
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	
	return x1 + x2;
}

function parseDate(str, format) {
	switch(format) {
		case 1: 
			var split = str.split('/');
			if(split[0].substring(0, 1) == '0')
				split[0] = split[0].substring(1,2);
			return new Date(split[2], parseInt(split[0]) - 1, split[1], 0, 0, 0, 0);
		case 2:
			var d = str.substring(0, 10).split('-');
			var day = d[2];
			var month = d[1] - 1;
			var year = d[0].substring(0,4);

			return new Date(year, month, day, 0, 0, 0, 0);
		case 3: 
            str = str + "";
			var month = str.substring(4, 6);
			if(month.substring(0, 1) == '0')
				month = month.substring(1, 2);
                
			return new Date(str.substring(0, 4), parseInt(month) - 1, str.substring(6, 8), 0, 0, 0, 0);
		case 4: 
            str = str + "";
			var month = str.substring(4, 6);
			if(month.substring(0, 1) == '0')
				month = month.substring(1, 2);
                
			return new Date(str.substring(0, 4), parseInt(month) - 1, str.substring(6, 8), 12, 0, 0, 0);
		default:
			var split = str.split('/');
			if(split[0].substring(0, 1) == '0')
				split[0] = split[0].substring(1,2);
			return new Date(split[2], parseInt(split[0]) - 1, split[1], 0, 0, 0, 0);
	}
}

function validEmail(email) {
    var re = /^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+/;
    if(re.test(email))
		return true;
	else {
		return false;
	}
}

function uniqueId() {
	return '' + Math.round(Math.random() * 10000) + (new Date()).getTime() + '' + Math.round(Math.random() * 10000);
}

MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];

var sprintf = (function() {
	function get_type(variable) {
		return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase();
	}
	function str_repeat(input, multiplier) {
		for (var output = []; multiplier > 0; output[--multiplier] = input) {}
		return output.join('');
	}

	var str_format = function() {
		if (!str_format.cache.hasOwnProperty(arguments[0])) {
			str_format.cache[arguments[0]] = str_format.parse(arguments[0]);
		}
		return str_format.format.call(null, str_format.cache[arguments[0]], arguments);
	};

	str_format.format = function(parse_tree, argv) {
		var cursor = 1, tree_length = parse_tree.length, node_type = '', arg, output = [], i, k, match, pad, pad_character, pad_length;
		for (i = 0; i < tree_length; i++) {
			node_type = get_type(parse_tree[i]);
			if (node_type === 'string') {
				output.push(parse_tree[i]);
			}
			else if (node_type === 'array') {
				match = parse_tree[i]; // convenience purposes only
				if (match[2]) { // keyword argument
					arg = argv[cursor];
					for (k = 0; k < match[2].length; k++) {
						if (!arg.hasOwnProperty(match[2][k])) {
							throw(sprintf('[sprintf] property "%s" does not exist', match[2][k]));
						}
						arg = arg[match[2][k]];
					}
				}
				else if (match[1]) { // positional argument (explicit)
					arg = argv[match[1]];
				}
				else { // positional argument (implicit)
					arg = argv[cursor++];
				}

				if (/[^s]/.test(match[8]) && (get_type(arg) != 'number')) {
					throw(sprintf('[sprintf] expecting number but found %s', get_type(arg)));
				}
				switch (match[8]) {
					case 'b': arg = arg.toString(2); break;
					case 'c': arg = String.fromCharCode(arg); break;
					case 'd': arg = parseInt(arg, 10); break;
					case 'e': arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential(); break;
					case 'f': arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg); break;
					case 'o': arg = arg.toString(8); break;
					case 's': arg = ((arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg); break;
					case 'u': arg = Math.abs(arg); break;
					case 'x': arg = arg.toString(16); break;
					case 'X': arg = arg.toString(16).toUpperCase(); break;
				}
				arg = (/[def]/.test(match[8]) && match[3] && arg >= 0 ? '+'+ arg : arg);
				pad_character = match[4] ? match[4] == '0' ? '0' : match[4].charAt(1) : ' ';
				pad_length = match[6] - String(arg).length;
				pad = match[6] ? str_repeat(pad_character, pad_length) : '';
				output.push(match[5] ? arg + pad : pad + arg);
			}
		}
		return output.join('');
	};

	str_format.cache = {};

	str_format.parse = function(fmt) {
		var _fmt = fmt, match = [], parse_tree = [], arg_names = 0;
		while (_fmt) {
			if ((match = /^[^\x25]+/.exec(_fmt)) !== null) {
				parse_tree.push(match[0]);
			}
			else if ((match = /^\x25{2}/.exec(_fmt)) !== null) {
				parse_tree.push('%');
			}
			else if ((match = /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(_fmt)) !== null) {
				if (match[2]) {
					arg_names |= 1;
					var field_list = [], replacement_field = match[2], field_match = [];
					if ((field_match = /^([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
						field_list.push(field_match[1]);
						while ((replacement_field = replacement_field.substring(field_match[0].length)) !== '') {
							if ((field_match = /^\.([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
								field_list.push(field_match[1]);
							}
							else if ((field_match = /^\[(\d+)\]/.exec(replacement_field)) !== null) {
								field_list.push(field_match[1]);
							}
							else {
								throw('[sprintf] huh?');
							}
						}
					}
					else {
						throw('[sprintf] huh?');
					}
					match[2] = field_list;
				}
				else {
					arg_names |= 2;
				}
				if (arg_names === 3) {
					throw('[sprintf] mixing positional and named placeholders is not (yet) supported');
				}
				parse_tree.push(match);
			}
			else {
				throw('[sprintf] huh?');
			}
			_fmt = _fmt.substring(match[0].length);
		}
		return parse_tree;
	};

	return str_format;
})();

var vsprintf = function(fmt, argv) {
	argv.unshift(fmt);
	return sprintf.apply(null, argv);
};

String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g,"");
}
String.prototype.ltrim = function() {
	return this.replace(/^\s+/,"");
}
String.prototype.rtrim = function() {
	return this.replace(/\s+$/,"");
}
String.prototype.ucfirst = function() {
	var chr = this.charAt(0).toUpperCase() || this.charAt(0);
	return chr + this.substr(1);
}
String.prototype.htmlDecode = function() {
	return this.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}
Date.prototype.format = function(format) {
	switch(format) {
		case 1: return parseInt(this.getFullYear() + padMonth(this.getMonth() + 1) + padMonth(this.getDate()));
		case 2: return padMonth(this.getMonth() + 1) + '/' + padMonth(this.getDate()) + '/' + this.getFullYear();
		case 3: 
		    var hour = this.getHours(), meridian = 'AM';
		    if(hour >= 12) {
		        hour -= 12;
		        meridian = 'PM';
		    }
		    if(hour == 0) hour = 12;
		    
		    return padMonth(this.getMonth() + 1) + '/' + padMonth(this.getDate()) + '/' + this.getFullYear() 
		                + ' ' + padMonth(hour) + ':' + padMonth(this.getMinutes()) + ' ' + meridian;
		case 4: return this.getFullYear() + '-' + padMonth(this.getMonth() + 1) + '-' + padMonth(this.getDate());
        default: return parseInt(this.getFullYear() + padMonth(this.getMonth() + 1) + padMonth(this.getDate()));
	}	
}

function dateDiff(date1, date2, period) {
    return (parseDate(date2 + "", 3).getTime() - parseDate(date1 + "", 3).getTime()) / (DAY_IN_MS * period);
}

if(typeof(exports) != 'undefined') {
    exports.getDates = getDates;
    exports.padMonth = padMonth;
    exports.date = date;
    exports.inArray = inArray;
    exports.isArray = isArray;
    exports.sortKeysByValue = sortKeysByValue;
    exports.sprintf = sprintf;
    exports.isNumber = isNumber;
    exports.validValue = validValue;
    exports.defined = defined;
    exports.round = round;
    exports.addCommas = addCommas;
    exports.parseDate = parseDate;
    exports.validEmail = validEmail;
    exports.NO_VALUE = NO_VALUE;
}
