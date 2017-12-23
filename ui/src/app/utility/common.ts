import { Config } from '../config/config';

declare var md5: any;
declare var formatDate: any;
declare var $: any;
declare var _: any;
declare var d3: any;

if(typeof(require) !== 'undefined') {
    if(typeof($) === 'undefined') {
        
    }

    if(typeof(_) === 'undefined') {
        _ = require('underscore');
    }
}

class DateFormat {
    static sqlDate = 'yyyy-MM-dd';
    static sqlDateTime = 'yyyy-MM-dd hh:mm:ss';
    static date = 'MM/dd/yyyy';
    static dateTime = 'MM/dd/yyyy hh:mm tt';
    static time = 'hh:mm tt';
    
    static mediumDate = 'MMM d, yyyy';
    static longDate = 'MMMM d, yyyy';
}
 
export class Common {
    static Color = {
        ChartPrimary: '#12455a'
    };
    
	static objectToArray (obj: Object) {
		var arr: { key: string, value: any }[] = [];

		for(var key in obj) {
			arr.push({ key:key, value:obj[key] });
		}

		return arr;
	}
    
	static formatToCurrency(num:any) {
       var n = num,
        c = 2,
        d = ".",
        t = t == undefined ? "," : t,
        s = n < 0 ? "-" : "",
        i:any = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
        return '$' + s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
    }

    static padDatePart (datePart: any) {
	    datePart = "" + datePart;

	    if(datePart.length == 1) {
	    	return "0" + datePart;
        }
	    else {
	    	return datePart;
        }
	}
	
	static getMonthNameAndYear(date: string) {
		var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		var d = new Date(date);
		return monthNames[d.getMonth()] + " " + d.getFullYear();
	}

	static isNumber (n: any) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	}

	static isDefined (o: any) {
		return typeof(o) != 'undefined';
	}

	static inArray(item: any, arr: any[]) {
		return arr.indexOf(item) > -1;
	}

	static isString(data: any) {
		return _.isString(data);
	}

	static isArray(data: any) {
		return _.isArray(data);
	}

	static isObject(data: any) {
		return _.isObject(data);
    }

    static hasKeys(obj: {}) {
        if(obj) {
            for(var key in obj) {
                if(obj.hasOwnProperty(key)) {
                    return true;
                }
            }
        }

        return false;
    }

    static clone(target: {}, source: {}, deep: boolean = true) {
        return $.extend(deep, target, source);
    }

    static validEmail(email: string) {
        var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    static ucfirst(str: string) {
        if(!str) {
            return "";
        }

        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }

    static camelCaseToWords(str: string) {
        return str ? str.replace(/([A-Z])/g, ' $1').replace(/^./, function(str){ return str.toUpperCase(); }).replace(' And ', ' and ') : '';
    }

    static dateDiff(startDate: any, endDate: any, period: number = 1) { //period in days
        return (endDate.getTime() - startDate.getTime()) / 86400000 / period;
    }

    static parseDate (str: any, format: number = -1) {
		var date: Date;

        if(!str) {
            return null;
        }

		switch(format) {
			case 1:
				var split = str.split('/');
				if(split[0].substring(0, 1) == '0') {
					split[0] = split[0].substring(1,2);
                }
				date = new Date(parseInt(split[2]), parseInt(split[0]) - 1, parseInt(split[1]), 0, 0, 0, 0);
				break;
            case 2:
                var split = str.split('T');
				var datePart = split[0].split('-');
				var timePart = split[1] ? split[1].split('.')[0] : '';
                date = new Date(datePart[1] + '/' + datePart[2] + '/' + datePart[0] + ' ' + timePart);
                break;
			default:
                str = str + "";
				var monthPart = str.substring(4, 6);
				if(monthPart.substring(0, 1) == '0') {
					monthPart = monthPart.substring(1, 2);
				}
				date = new Date(parseInt(str.substring(0, 4)), parseInt(monthPart) - 1, parseInt(str.substring(6, 8)), 0, 0, 0, 0);     
		}

		return isNaN(date.getTime()) ? null : date;
	}

    static DateFormat = DateFormat;
    static formatDate(date: Date, format: string, options: {} = null) {
        return formatDate(date, format, options);
    }
    
    static formatDBDate(date: number, format: string, options: {} = null) {
        return formatDate(date, format, options);
    }
    
    static dbDate(date: Date): number {
        return parseInt(date.getFullYear() + Common.padDatePart(date.getMonth() + 1) + Common.padDatePart(date.getDate()));
    }
    
    static dateToUnixTime(date: Date) {
        return Math.round(date.getTime() / 1000);
    }
	
	static timeAgo(time: any) {
        switch (typeof time) {
            case 'number': break;
            case 'string': time = +new Date(time); break;
            case 'object': if (time.constructor === Date) { time = time.getTime(); } break;
            default: time = +new Date();
        }
        var time_formats = [
            [60, 'seconds', 1], // 60
            [120, '1 minute ago', '1 minute from now'], // 60*2
            [3600, 'minutes', 60], // 60*60, 60
            [7200, '1 hour ago', '1 hour from now'], // 60*60*2
            [86400, 'hours', 3600], // 60*60*24, 60*60
            [172800, 'Yesterday', 'Tomorrow'], // 60*60*24*2
            [604800, 'days', 86400], // 60*60*24*7, 60*60*24
        ];
        var seconds = (+new Date() - time) / 1000,
            token = 'ago', list_choice = 1;
        var i = 0, format;
        while (format = time_formats[i++]) {
            if (seconds < format[0]) {
                if (typeof format[2] == 'string') {
                    return format[list_choice];
                }
                else {
                    return Math.ceil(seconds / format[2]) + ' ' + format[1] + ' ' + token;
                }
            }
        }
        return null;
    }

    static round(num: number, places: number) {
		if(places && places > 0) {
			num = parseFloat(Math.round(num * Math.pow(10, places)) / Math.pow(10, places) + '');
			
			if(!isNaN(num)) {
				return num;
            }
			else {
				return 0;
            }
		}
		else {
			return Math.round(num);
        }
	}

    static sort(values: any[], sortBy: string) {
        var sortAscFlag = 1;

        if (sortBy.substring(0, 1) == '-') {
            sortAscFlag = -1;
            sortBy = sortBy.substring(1);
        }

        values.sort((a, b) => {
            var valA = this.valueFromKeyString(a, sortBy),
                valB = this.valueFromKeyString(b, sortBy);

            if (valB == null) {
                return -1;
            }
            else if (valA == null) {
                return 1;
            }
            else {
                return (valA <= valB ? -1 : 1) * sortAscFlag;
            }
        });

        return values;
    }

    private static valueFromKeyString(obj: any, key: string) {
        var keys = key.split('.');

        for (var i = 0, len = keys.length; i < len; i++) {
            var k = keys[i];

            if (obj[k]) {
                obj = obj[k];
            }
            else {
                return null;
            }
        }

        return obj;
    }

    static getLine(x1: number, y1: number, x2: number, y2: number) {
        var lineData = [
            { x: x1, y: y1 },  
            { x: x2, y: y2 }
        ];
        
        var line = d3.line()
                        .x(function(d) { return d.x; })
                        .y(function(d) { return d.y; })
                        .curve(d3.curveBundle.beta(1));

       return line(lineData);
    }
    
	static uniqueId() {
		return md5(new Date().getTime() + Math.round(Math.random() * 1000000) + Math.round(Math.random() * 1000000) + "");
	}
	
	static log (...data: any[]) {
        if(Config.Development) {
		    console.log.apply(console, data);
        }
	}
}