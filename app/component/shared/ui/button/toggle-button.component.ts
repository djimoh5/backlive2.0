import {Component, Input, Output, EventEmitter} from '@angular/core';
import {ButtonComponent} from './button.component';
import {AppService} from 'backlive/service';

@Component({
    selector: 'toggle-button',
    template: `<button data-toggle="button" type="{{type =='submit' || type =='commit' ? 'submit' : 'button' }}" [class]="btnClass" [class.active]="value" [disabled]="disabled" [style.width]="width" (click)="onSelect()">
	               <ng-content></ng-content>{{title}}
               </button>`,
    inputs: ButtonComponent.inputs
})
export class ToggleButtonComponent extends ButtonComponent {
    @Input() value: 1 | 0 | boolean;
    @Output() valueChange: EventEmitter<1 | 0 | boolean> = new EventEmitter();
        
    constructor (appService: AppService) {
        super(appService);
    }
    
    onSelect() {
        if(this.value === true || this.value === false) {
            this.value = !this.value;
        }
        else if(this.value === 1) {
            this.value = 0;
        }
        else if(this.value === 0) {
            this.value = 1;
        }

        this.valueChange.emit(this.value);
    }
}