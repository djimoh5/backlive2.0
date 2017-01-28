import {Component, Input, Output, EventEmitter} from '@angular/core';
import {ButtonComponent} from './button.component';
import {AppService} from 'backlive/service';

@Component({
    selector: 'radio-button',
    template: `<div *ngIf="toggle" class="btn-group" data-toggle="buttons" [class.collapsible]="collapsible" [class.split-button]="split" [style.width]="width">
                    <label *ngFor="let option of options" [class]="btnClass" [class.active]="option.value == value" (click)="onSelect(option)">
                        <input type="checkbox"><ui-icon *ngIf="option.icon" [type]="option.icon" [class.btn-icon-left]="option.title"></ui-icon>{{option.title}}
                    </label>
               </div>
               <div *ngIf="!toggle" class="check-options">
                    <div *ngFor="let option of options" class="check-option">
                        <span class="check-option-target" (click)="onSelect(option)">
                            <span class="check-box">
                                <span [class.active]="option.value == value"><ui-icon type="checkmark"></ui-icon></span>
                            </span>
                            <span class="text" [innerHtml]="option.title"></span>
                        </span>
                    </div>
               </div>`,
    inputs: ButtonComponent.inputs
})
export class RadioButtonComponent extends ButtonComponent {
    @Input() options: RadioButtonOption[];
    @Input() toggle: boolean = true;
    @Input() split: boolean = false;
    @Input() collapsible: boolean = false;
    
    @Input() value: any;
    @Output() valueChange: EventEmitter<boolean> = new EventEmitter();
        
    @Output() select: EventEmitter<RadioButtonOption> = new EventEmitter();
    
    constructor (appService: AppService) {
        super(appService);
    }
    
    onSelect(option: RadioButtonOption) {
        this.value = option.value;
        this.valueChange.emit(this.value);
        this.select.emit(option);
        
        if(option.onSelect) {
            option.onSelect();
        }
    }
}

export interface RadioButtonOption {
    title?: string;
    value: any;
    icon?: string;
    onSelect?: Function;
}