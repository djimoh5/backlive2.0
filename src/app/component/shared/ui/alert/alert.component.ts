import {Component, Input, Output, EventEmitter, OnChanges} from '@angular/core';
import {Type} from './alert.input';

@Component({
    selector: 'ui-alert',
    template: `<div class="{{alertClass}} fade alert-dismissible" [ngClass]="{ hide:!message, in: fadeIn, out:  !fadeIn }">
                   <button type="button" class="close hide" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                   {{message}}
               <div>`
})
export class AlertComponent implements OnChanges {
    @Input() type: string;
    @Input() message: string;
    @Input() timeout: number = 2000;
    @Input() alwaysShow: boolean = false;
    @Output() messageChange: EventEmitter<string> = new EventEmitter();
    
    alertClass: string;
    fadeIn: boolean;
    
    constructor () {}
    
    ngOnChanges () {
        this.alertClass = 'alert ' +  (Type[this.type] ? Type[this.type] : Type.error);
        
        if(this.message) {
            setTimeout(() => {
                this.fadeIn = true;
            });
            
            if(!this.alwaysShow){
                setTimeout(() => {
                    this.fadeIn = false;
                    setTimeout(() => {
                        this.message = null;
                        this.messageChange.emit(null);
                    }, 300);
                }, this.timeout);
            }
        }
    }
}