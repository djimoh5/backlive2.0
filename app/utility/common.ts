import {Config} from '../config/config';

declare var md5:any;
declare var formatDate:any;
declare var $: any;

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

	    if(datePart.length == 1)
	    	return "0" + datePart;
	    else
	    	return datePart;
	}
	
	static getMonthNameAndYear(date: string) {
		var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		var d = new Date(date);
		return monthNames[d.getMonth()] + " " + d.getFullYear();
	}

	static isNumber (n: any) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	}

	static formattedStringToNumber (n: any): Number {
        if (n) {
            n = n.replace('$', '');
            n = n.replace(',', '');
            return parseFloat(n);
        }
        return null;
	}

	static isDefined (o: any) {
		return typeof(o) != 'undefined';
	}

	static inArray(item: any, arr: any[]) {
		return $.inArray(item, arr) >= 0;
	}

	static isString(data: any) {
		return $.type(data) == 'string';
	}

	static isArray(data: any) {
		return $.type(data) == 'array';
	}

	static isObject(data: any) {
		return $.type(data) == 'object';
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

    static toTitleCase(str: string) {
        if (str) {
            str = str.toLowerCase();
            return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
        }
    }

    static camelCaseToWords(str: string) {
        return str ? str.replace(/([A-Z])/g, ' $1').replace(/^./, function(str){ return str.toUpperCase(); }).replace(' And ', ' and ') : '';
    }

    static dateDiff(startDate: any, endDate: any, period: number = 1) { //period in days
        return (endDate.getTime() - startDate.getTime()) / 86400000 / period;
    }

    static parseDate (str: string, format: number = -1) {
		var date: Date;

        if(!str) {
            return null;
        }

		switch(format) {
			case 1:
				var split = str.split('/');
				if(split[0].substring(0, 1) == '0')
					split[0] = split[0].substring(1,2);
				date = new Date(parseInt(split[2]), parseInt(split[0]) - 1, parseInt(split[1]), 0, 0, 0, 0);
				break;
            case 2:
                str = str + "";
				var monthPart = str.substring(4, 6);
				if(monthPart.substring(0, 1) == '0') {
					monthPart = monthPart.substring(1, 2);
				}
				date = new Date(parseInt(str.substring(0, 4)), parseInt(monthPart) - 1, parseInt(str.substring(6, 8)), 0, 0, 0, 0);
				break;
			default:
                var split = str.split('T');
				var datePart = split[0].split('-');
				var timePart = split[1] ? split[1].split('.')[0] : '';
                date = new Date(datePart[1] + '/' + datePart[2] + '/' + datePart[0] + ' ' + timePart);
		}

		return isNaN(date.getTime()) ? null : date;
	}

    static DateFormat = DateFormat;
    static formatDate(date: Date, format: string, options: {} = null) {
        return formatDate(date, format, options)
    }
    
    static dateToUnixTime(date: Date) {
        return Math.round(date.getTime() / 1000);
    }
	
	static timeAgo(time: any) {
        var originalTime = time;
        switch (typeof time) {
            case 'number': break;
            case 'string': time = +new Date(time); break;
            case 'object': if (time.constructor === Date) time = time.getTime(); break;
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
        while (format = time_formats[i++])
            if (seconds < format[0]) {
                if (typeof format[2] == 'string') {
                    return format[list_choice];
                }
                else {
                    return Math.ceil(seconds / format[2]) + ' ' + format[1] + ' ' + token;
                }
            }
        return null;
    }
    
	static uniqueId() {
		return md5(new Date().getTime() + Math.round(Math.random() * 1000000) + Math.round(Math.random() * 1000000) + "");
	}
	
	static getDateNow() {
		var now = new Date();
		return formatDate(now, DateFormat.date);
	}

	static log (...data: any[]) {
        if(Config.Development) {
		    console.log.apply(console, data);
        }
	}
	
    static emptyGuid: string = "00000000-0000-0000-0000-000000000000";

    static creditCardExpirationDate(expirationMonth, expirationYear) {
        var ccExpYear = "20" + expirationYear;
        var ccExpMonth = expirationMonth;
        var expDate = new Date();
        expDate.setFullYear(Number(ccExpYear), ccExpMonth, 1);
        var today = new Date();
        if (expDate < today) {
            return false;
        }
        else {
            return true;
        }
    }
}