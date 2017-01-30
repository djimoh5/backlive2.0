import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ButtonComponent } from './button.component';
import { AppService } from 'backlive/service';

@Component({
    selector: 'checkbox-button',
    template: `<div [class.split]="split" class="btn-group" data-toggle="buttons" [style.width]="width">
                    <label *ngFor="let option of options" [class]="btnClass" [class.active]="value.indexOf(option.value) >= 0" (click)="onSelect(option)">
                        <input type="checkbox" autocomplete="off"><ui-icon *ngIf="option.icon" [type]="option.icon" [class.btn-icon-left]="option.title"></ui-icon>{{option.title}}
                    </label>
               </div>`,
    inputs: ButtonComponent.inputs
})
export class CheckboxButtonComponent extends ButtonComponent implements OnInit {
    @Input() options: RadioButtonOption[];
    @Input() value: any[];
    @Input() split: boolean;
    @Output() valueChange: EventEmitter<any[]> = new EventEmitter();
        
    @Output() select: EventEmitter<RadioButtonOption> = new EventEmitter();
    
    constructor (appService: AppService) {
        super(appService);
    }

    ngOnInit() {
        if(!this.value) {
            this.value = [];
        }
    }
    
    onSelect(option: RadioButtonOption) {
        setTimeout(() => {
            var index = this.value.indexOf(option.value);
            if(index >= 0) {
                this.value.splice(index, 1);
            }
            else {
                this.value.push(option.value);
            }

            this.valueChange.emit(this.value);
            this.select.emit(option);
            
            if(option.onSelect) {
                option.onSelect();
            }
        });
    }
}

export interface RadioButtonOption {
    title?: string;
    value: any;
    icon?: string;
    onSelect?: Function;
}