import {Pipe, PipeTransform} from '@angular/core';
import {DatePipe} from '@angular/common';

@Pipe({
    name: 'formatNumber',
    pure: true
})
export class FormatNumberPipe implements PipeTransform  {
    transform(value: any, format: string) : string {
        switch(format) {
            case 'commas': return this.addCommas(value);
            case 'duration': return this.durationFormat(value);
        }
        
        return value;
    }
    
    addCommas(nStr) {
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
    
    durationFormat(timeSpanInDays) {
        if (timeSpanInDays > 729)
            return Math.floor(timeSpanInDays / 365) + ' Years';
        
        if (timeSpanInDays > 90)
            return Math.floor(timeSpanInDays / 30) + ' Months';
        
        return timeSpanInDays + ' Days';
    }
}