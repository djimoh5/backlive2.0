import {Directive, ElementRef, EventEmitter, Input, Output, OnInit} from 'angular2/core';

@Directive({
    selector: '[datepicker]'
})
export class DatePicker implements OnInit {
    elementRef: ElementRef;
    @Input('datepicker') date: any;
    @Output() dateChange: EventEmitter<string> = new EventEmitter();
    @Output() timeChange: EventEmitter<number> = new EventEmitter();
    
    constructor(elementRef: ElementRef) {
        this.elementRef = elementRef;
    }
    
    ngOnInit() {
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