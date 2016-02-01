import {Pipe, PipeTransform} from 'angular2/core';
import {DatePipe} from 'angular2/common';

@Pipe({
    name: 'parseDate',
    pure: true
})
export class ParseDate extends DatePipe  implements PipeTransform  {
    transform(value: any, args: any[]) : string {
        var date = new Date(value);
        return super.transform(date, args);
    }
}