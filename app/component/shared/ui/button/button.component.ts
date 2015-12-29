import {Component, Input, Output, EventEmitter, OnChanges} from 'angular2/core';
import {AppService} from '../../../../config/imports/service';

import {Type, Size} from './button.input';

@Component({
    selector: 'vn-button',
    template: `<button type="{{type =='submit' ? 'submit' : 'button' }}" [class]="btnClass" [disabled]="disabled">
	               <vn-icon *ngIf="icon" [type]="icon"></vn-icon><ng-content></ng-content>
               </button>`
})
export class ButtonComponent implements OnChanges {
    @Input() type: string;
    @Input() size: string;
    @Input() disabled: boolean;
    @Input() icon: string;

    btnClass: string;
    appService: AppService;
    
    constructor (appService: AppService) {
        this.appService = appService;
    }

    ngOnChanges () {
        this.btnClass = 'btn ' +(this.type && Type[this.type] ? Type[this.type] : Type.default);
        
        if(this.size && Size[this.size]) {
            this.btnClass += ' ' + Size[this.size];
        }
    }
}