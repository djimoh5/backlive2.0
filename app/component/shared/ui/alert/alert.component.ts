import {Component, Input, OnChanges} from 'angular2/core';
import {Type} from './alert.input';

@Component({
    selector: 'app-alert',
    template: `<div class="{{alertClass}} fade in alert-dismissible" [ngClass]="{ hide:!message }">
                   <button type="button" class="close hide" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                   {{message}}
               <div>`,
    directives: []
})
export class AlertComponent implements OnChanges {
    @Input() type: string;
    @Input() message: string;
    
    alertClass: string;
    
    constructor () {}
    
    ngOnChanges () {
        this.alertClass = 'alert ' +  (Type[this.type] ? Type[this.type] : Type.error);
    }
}