import {Component, Input, Output, EventEmitter} from 'angular2/core';
import {Path} from '../../../../config/config';

import {ButtonComponent} from './button.component';
import {AppService} from '../../../../config/imports/service';

@Component({
    selector: 'radio-button',
    template: `<div class="btn-group" data-toggle="buttons">
                    <label *ngFor="#option of options" [class]="btnClass" [class.active]="option.active" (click)="onSelect(option)">
                        <input type="radio"><vn-icon *ngIf="option.icon" [type]="option.icon"></vn-icon>{{option.title}}
                    </label>
               </div>`
})
export class RadioButtonComponent extends ButtonComponent {
    @Input() options: RadioButtonOption;
    @Input() type: string;
    @Input() size: string;
        
    @Output() select: EventEmitter<RadioButtonOption> = new EventEmitter();
    
    constructor (appService: AppService) {
        super(appService);
    }
    
    onSelect(option: RadioButtonOption) {
        this.select.next(option);
        
        if(option.onSelect) {
            option.onSelect();
        }
    }
}

export interface RadioButtonOption {
    title?: string;
    icon?: string;
    active?: boolean;
    onSelect?: Function;
}