import {Component, Input, Output, EventEmitter} from 'angular2/core';
import {ButtonComponent} from './button.component';
import {AppService} from 'backlive/service';

@Component({
    selector: 'file-button',
    template: `<button type="button" [class]="btnClass" [disabled]="disabled">
                    <vn-icon type="upload"></vn-icon><ng-content></ng-content>{{title}}
                    <input type="file" (change)="select.next($event)" />
               </button>`
})
export class FileButtonComponent extends ButtonComponent {
    @Input() title: string;
    @Input() type: string;
    @Input() size: string;
    @Input() disabled: boolean;
    
    @Output() select: EventEmitter<any> = new EventEmitter();
    
    constructor (appService: AppService) {
        super(appService);
    }
}