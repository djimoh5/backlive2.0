import {Component, Input, Output, EventEmitter} from '@angular/core';
import {ButtonComponent} from './button.component';
import {AppService} from 'backlive/service';

@Component({
    selector: 'file-button',
    template: `<button type="button" [class]="btnClass" [disabled]="disabled" [style.width]="width">
                    <ui-icon type="upload" class="btn-icon-left"></ui-icon><ng-content></ng-content>{{title}}
                    <input type="file" (change)="onSelect($event)" />
               </button>`,
    inputs: ButtonComponent.inputs
})
export class FileButtonComponent extends ButtonComponent {
    @Output() select: EventEmitter<Event> = new EventEmitter();
    
    constructor (appService: AppService) {
        super(appService);
    }
    
    onSelect(evt: Event) {
        this.select.emit(evt);
    }
}