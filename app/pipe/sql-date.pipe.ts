import {Pipe, PipeTransform} from '@angular/core';
import {DatePipe} from '@angular/common';

import {Common} from 'backlive/utility';

@Pipe({
    name: 'sqlDate',
    pure: true
})
export class SqlDatePipe implements PipeTransform  {
    private datePipe: DatePipe = new DatePipe();

    transform(value: any, pattern?: string) : string {
        var date = Common.parseDate(value);
        return this.datePipe.transform(date, pattern);
    }
}