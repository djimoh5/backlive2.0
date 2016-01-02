import {Component, Input, Output, EventEmitter, OnChanges} from 'angular2/core';
import {AppService} from 'backlive/service';

import {Type, Size} from './button.input';

@Component({
    selector: 'app-button',
    template: `<button type="{{type =='submit' ? 'submit' : 'button' }}" [class]="btnClass" [disabled]="disabled">
	               <vn-icon *ngIf="icon" [type]="icon"></vn-icon><ng-content></ng-content>{{title}}
               </button>`
})
export class ButtonComponent implements OnChanges {
    @Input() title: string;
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
        this.btnClass = 'btn ' + (this.type && Type[this.type] ? Type[this.type] : Type.default);
        
        if(this.size && Size[this.size]) {
            this.btnClass += ' ' + Size[this.size];
        }
    }
}