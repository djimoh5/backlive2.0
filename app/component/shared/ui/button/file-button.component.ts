import {Component, Input, Output, EventEmitter} from 'angular2/core';
import {Path} from '../../../../config/config';

import {ButtonComponent} from './button.component';
import {AppService} from '../../../../config/imports/service';

@Component({
    selector: 'file-button',
    template: `<button type="button" [class]="btnClass" [disabled]="disabled">
                    <vn-icon *ngIf="icon" [type]="icon"></vn-icon><ng-content></ng-content>
                    <input type="file" (change)="select.next($event)" />
               </button>`
})
export class FileButtonComponent extends ButtonComponent {
    @Input() type: string;
    @Input() size: string;
    @Input() disabled: boolean;
    @Input() icon: string;
    
    @Output() select: EventEmitter<any> = new EventEmitter();
    
    constructor (appService: AppService) {
        super(appService);
    }
}