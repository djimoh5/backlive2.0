import {Directive, ElementRef, EventEmitter, Output} from 'angular2/angular2';

@Directive({
    selector: '[datepicker]',
    inputs: [
        'date: datepicker'
    ],
    host: {
        '[value]': 'date'
    }
})
export class DatePicker {
    date:string;
    @Output() dateChange:EventEmitter = new EventEmitter();
    
    constructor(elementRef: ElementRef) {
        var $elem = $(elementRef.nativeElement);
        $elem.datepicker({
            dateFormat: "mm/dd/yy",
            changeMonth: true,
			changeYear: true,
            onSelect: (dateText: string) => this.onDateChanged(dateText)
        });
    }
    
    onDateChanged(date: string) {
        this.date = date;
        this.dateChange.next(this.date);
    }
}