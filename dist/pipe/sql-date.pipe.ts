import {Pipe, PipeTransform} from 'angular2/core';
import {DatePipe} from 'angular2/common';

@Pipe({
    name: 'sqlDate',
    pure: true
})
export class SqlDatePipe extends DatePipe  implements PipeTransform  {
    transform(value: any, args: any[]) : string {
        var date = new Date(value);
        return super.transform(date, args);
    }
}