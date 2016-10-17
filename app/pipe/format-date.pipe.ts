import {Pipe, PipeTransform} from '@angular/core';
import {DatePipe} from '@angular/common';
import {Common} from 'backlive/utility';

@Pipe({
    name: 'formatDate',
    pure: true
})
export class FormatDatePipe implements PipeTransform  {
    private datePipe: DatePipe = new DatePipe('en-US');

    transform(value: any, pattern?: string, isTimestamp: boolean = false) : string {
        var date = isTimestamp ? new Date(value) : Common.parseDate(value);
        return this.datePipe.transform(date, pattern);
    }
}