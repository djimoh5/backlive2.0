import {Pipe, PipeTransform} from '@angular/core';
import {DatePipe} from '@angular/common';

@Pipe({
    name: 'parseDate',
    pure: true
})
export class ParseDatePipe implements PipeTransform  {
    private datePipe: DatePipe = new DatePipe();

    transform(value: any, pattern?: string) : string {
        var date = new Date(value);
        return this.datePipe.transform(date, pattern);
    }
}