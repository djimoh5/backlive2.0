import {Component, Input, Output, EventEmitter, OnChanges} from '@angular/core';
import {AppService} from 'backlive/service';

import {Type, Size} from './button.input';

@Component({
    selector: 'ui-button',
    template: `<button type="{{type =='submit' || type =='commit' ? 'submit' : 'button' }}" [class]="btnClass" [class.btn-block]="full" [disabled]="disabled" [style.width]="width">
	               <ui-icon *ngIf="icon" [type]="icon" class="btn-icon-left"></ui-icon><ng-content></ng-content>{{title}}<ui-icon *ngIf="iconRight" [type]="iconRight" class="btn-icon-right"></ui-icon>
               </button>`,
    styles: []
})
export class ButtonComponent implements OnChanges {
    @Input() title: string;
    @Input() type: string;
    @Input() size: string;
    @Input() width: string;
    @Input() full: boolean = false;
    
    @Input() disabled: boolean;
    @Input() icon: string;
    @Input() iconRight: string;
    
    btnClass: string;
    appService: AppService;
    
    constructor (appService: AppService) {
        this.appService = appService;
        this.btnClass = 'btn ' + Type.default + ' ' + Size.default;
    }

    ngOnChanges () {
        this.btnClass = "btn";
        this.btnClass += ' ' + (this.type && Type[this.type] ? Type[this.type] : Type.default);
        this.btnClass += ' ' + (this.size && Size[this.size] ? Size[this.size] : Size.default);
    }
}