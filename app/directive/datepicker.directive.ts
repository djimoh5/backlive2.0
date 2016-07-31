import {Directive, ElementRef, EventEmitter, Input, Output, OnInit} from '@angular/core';
import {PlatformUI} from 'backlive/utility/ui';
import {Common} from 'backlive/utility';

@Directive({
    selector: '[datepicker]'
})
export class DatePickerDirective implements OnInit {
    elementRef: ElementRef;
    platformUI: PlatformUI;
    @Input('datepicker') date: any;
    @Output() datepickerChange: EventEmitter<number> = new EventEmitter();
    @Output() timeChange: EventEmitter<number> = new EventEmitter();
    
    constructor(elementRef: ElementRef, platformUI: PlatformUI) {
        this.elementRef = elementRef;
        this.platformUI = platformUI;
    }
    
    ngOnInit() {
        var $elem = this.platformUI.query(this.elementRef.nativeElement);
        
        $elem.datepicker({
            dateFormat: "mm/dd/yy",
            changeMonth: true,
			changeYear: true,
            onSelect: (dateText: string) => {
                this.onTimeChanged(dateText);
                this.onDateChanged(dateText);
            }
        });
        
        if(this.date) {
            this.date = Common.parseDate(this.date);
        }
    }
    
    onDateChanged(date: string) {
        this.date = date;
        this.datepickerChange.emit(Common.dbDate(this.platformUI.query(this.elementRef.nativeElement).datepicker('getDate')));
    }
    
    onTimeChanged(date: string) {
        this.timeChange.emit(this.platformUI.query(this.elementRef.nativeElement).datepicker('getDate').getTime());
    }
}