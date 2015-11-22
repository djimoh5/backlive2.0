export interface Object {
    [key: string]: any;
}

export class Common {
	static objectToArray (obj: Object) {
		var arr: Object[] = [];
		
		for(var key in obj) {
			arr.push({ key:key, value:obj[key] });
		}
		
		return arr;
	}
	
    static padDatePart (datePart: any) {
	    datePart = "" + datePart;
		
	    if(datePart.length == 1)
	    	return "0" + datePart;
	    else
	    	return datePart;
	}
	
	static isNumber (n: any) {
		return !isNaN(parseFloat(n)) && isFinite(n);
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
    
    static parseDate (str: string, format: number) {
		var date: Date;
		
		switch(format) {
			case 1: 
				var split = str.split('/');
				if(split[0].substring(0, 1) == '0')
					split[0] = split[0].substring(1,2);
				date = new Date(parseInt(split[2]), parseInt(split[0]) - 1, parseInt(split[1]), 0, 0, 0, 0);
				break;
			case 2:
				var d = str.substring(0, 10).split('-');
				var day = parseInt(d[2]);
				var month = parseInt(d[1]) - 1;
				var year = parseInt(d[0].substring(0,4));
	
				date = new Date(year, month, day, 0, 0, 0, 0);
				break;
			default:
				str = str + "";
				var monthPart = str.substring(4, 6);
				if(monthPart.substring(0, 1) == '0')
					monthPart = monthPart.substring(1, 2);
	                
				date = new Date(parseInt(str.substring(0, 4)), parseInt(monthPart) - 1, parseInt(str.substring(6, 8)), 0, 0, 0, 0);
				break;
		}
		
		return isNaN(date.getTime()) ? null : date;
	}
	
	static log (...data: any[]) {
		console.log.apply(console, data);
	}
}