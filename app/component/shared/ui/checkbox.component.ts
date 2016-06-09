import {Component, Input, Output, HostListener, EventEmitter} from '@angular/core';

@Component({
    selector: 'check-box',
    template: `<span [class.active]="checked" [class.readonly]="readonly"><ui-icon type="checkmark"></ui-icon></span> <ng-content></ng-content>`
})
export class CheckboxComponent {
    @Input() checked: boolean;
    @Input() readonly: boolean = false;
    @Output() checkedChange: EventEmitter<boolean> = new EventEmitter();
    
    constructor () {}
    
    @HostListener('click', ['$event'])
    onClick(event: Event) {
        if(!this.readonly) {
            this.checked = !this.checked;
            this.checkedChange.emit(this.checked);
        }
    }
}