import {Directive, ElementRef, EventEmitter, Input, Output, OnChanges, SimpleChanges} from '@angular/core';
import {Common} from 'backlive/utility';
import {PlatformUI} from 'backlive/utility/ui';

@Directive({
    selector: '[datepicker]'
})
export class DatePickerDirective implements OnChanges {
    elementRef: ElementRef;
    platformUI: PlatformUI;
    @Input('datepicker') date: any;
    @Input('datepicker-format') format: string = 'MM/dd/yy';
    @Input() monthPicker: boolean;
    @Input() maxDate: boolean;
    @Input() minDate: boolean;
    
    @Output() datepickerChange: EventEmitter<string> = new EventEmitter<string>();
    @Output() monthYearChange: EventEmitter<string> = new EventEmitter<string>();
    @Output() timeChange: EventEmitter<number> = new EventEmitter<number>();
    
    constructor(elementRef: ElementRef, platformUI: PlatformUI) {
        this.elementRef = elementRef;
        this.platformUI = platformUI;
    }

    ngOnChanges(simpleChanges: SimpleChanges) {
        var $elem = this.platformUI.query(this.elementRef.nativeElement);

        if (!$elem.datepicker.initialized) {
            this.setup();
        }

        if (simpleChanges['datepicker']) {
            if (!this.date || isNaN(this.date)) {
                if (this.date) {
                    this.date = this.defaultFormattedDate(this.date);
                    $elem.datepicker('setDate', this.date);
                }
            }
            else {
                $elem.datepicker('setDate', new Date(parseInt(this.date)));
            }
            $elem.val(this.formattedDate(this.date));
        }
    }

    private setup() {

        var $elem = this.platformUI.query(this.elementRef.nativeElement);

        $elem.datepicker({
            changeMonth: true,
            changeYear: true,
            showButtonPanel: (this.monthPicker),
            onSelect: (dateText: string) => {
                this.onTimeChanged(dateText);
                this.onDateChanged(dateText);
            },
            onClose: (event: any, date: any) => {
                if (this.monthPicker) {
                    var month = date.selectedMonth + 1;
                    var year = date.selectedYear;
                    this.onChangeMonthYearChanged(month + '/1/' + year);
                }
            },
            beforeShow: function (input, inst) {
                if (inst.input.hasClass('month-only')) {
                    inst.dpDiv.addClass('hide-calendar');


                } else {
                    inst.dpDiv.removeClass('hide-calendar');
                }
            },
            yearRange: "-150:+150",
            maxDate: this.maxDate ? new Date() : null,
            minDate: this.minDate ? 0 : null,

        });

        if (!this.date || isNaN(this.date)) {
            if (this.date) {
                this.date = this.defaultFormattedDate(this.date);
                $elem.datepicker('setDate', this.date);
            }
        }
        else {
            $elem.datepicker('setDate', new Date(parseInt(this.date)));
        }

        $elem.val(this.formattedDate(this.date));
    }
    
    onChangeMonthYearChanged(date: string) {
        var calendarDate = Common.formatDate(new Date(date), Common.DateFormat.monthYear);
        this.date = this.defaultFormattedDate(date);

        var $elem = this.platformUI.query(this.elementRef.nativeElement);
        $elem.val(calendarDate);

        this.monthYearChange.emit(this.date);
    }
    
    onDateChanged(date: string) {
        this.date = this.defaultFormattedDate(date);
       
        var $elem = this.platformUI.query(this.elementRef.nativeElement);
        $elem.val(this.formattedDate(this.date));

        this.datepickerChange.emit(this.date);
    }
    
    onTimeChanged(date: string) {
        this.timeChange.emit(this.platformUI.query(this.elementRef.nativeElement).datepicker('getDate').getTime());
    }
    
    isDate(dateString: string) {        
        var date = Date.parse(dateString);        
        return !isNaN(date);
    }
    
    defaultFormattedDate(dateString: string) {
        if (!this.isDate(dateString)) {
            return '';
        }
        
        var dateObj = Common.parseDate(dateString);
        return Common.formatDate(dateObj ? dateObj : new Date(dateString), 'MM/dd/yyyy');
    }
    
    formattedDate(date: any) {
        
        if (!date) return '';

        if (this.format) {
            var dateObj = Common.parseDate(date);
            return Common.formatDate(dateObj ? dateObj : new Date(date), this.format);
        } else {
            return date;
        }
    }
}
