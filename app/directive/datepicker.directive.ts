import {Directive, ElementRef, EventEmitter, Input, Output, OnInit} from '@angular/core';
import {PlatformUI} from 'backlive/utility/ui';

@Directive({
    selector: '[datepicker]'
})
export class DatePickerDirective implements OnInit {
    elementRef: ElementRef;
    platformUI: PlatformUI;
    @Input('datepicker') date: any;
    @Output() datepickerChange: EventEmitter<string> = new EventEmitter();
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
        
        if(!this.date || isNaN(this.date)) {
            if(this.date) {
                if(this.date.indexOf('-') > 0) {
                    this.date = this.sqlDateToDefaultFormat(this.date);
                }
                
                $elem.datepicker('setDate', this.date);
            }
        }
        else {
            $elem.datepicker('setDate', new Date(parseInt(this.date)));
        }
    }
    
    onDateChanged(date: string) {
        this.date = date;
        this.datepickerChange.emit(this.getSqlDate());
    }
    
    onTimeChanged(date: string) {
        this.timeChange.emit(this.platformUI.query(this.elementRef.nativeElement).datepicker('getDate').getTime());
    }
    
    sqlDateToDefaultFormat(sqlDate: string) {
        var split = sqlDate.split('T')[0].split('-');
        return split[1] + '/' + split[2] + '/' + split[0];
    }
    
    getSqlDate() {
        return this.platformUI.query(this.elementRef.nativeElement).datepicker('getDate').format();
    }
}