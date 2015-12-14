import {Directive, ElementRef, EventEmitter, Output, OnInit} from 'angular2/angular2';

@Directive({
    selector: '[datepicker]',
    inputs: [
        'date: datepicker'
    ]
})
export class DatePicker implements OnInit {
    date:any;
    elementRef: ElementRef;
    @Output() dateChange:EventEmitter = new EventEmitter();
    @Output() timeChange:EventEmitter = new EventEmitter();
    
    constructor(elementRef: ElementRef) {
        this.elementRef = elementRef;
    }
    
    onInit() {
        var $elem = $(this.elementRef.nativeElement);
        
        $elem.datepicker({
            dateFormat: "mm/dd/yy",
            changeMonth: true,
			changeYear: true,
            onSelect: (dateText: string) => {
                this.onTimeChanged(dateText);
                this.onDateChanged(dateText);
            }
        });
        
        if(!this.date || isNaN(this.date)) {
            if(this.date) {
                $elem.datepicker('setDate', this.date);
            }
        }
        else {
            $elem.datepicker('setDate', new Date(parseInt(this.date)));
        }
    }
    
    onDateChanged(date: string) {
        this.date = date;
        this.dateChange.next(this.date);
    }
    
    onTimeChanged(date: string) {
        this.timeChange.next($(this.elementRef.nativeElement).datepicker('getDate').getTime());
    }
}