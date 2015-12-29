import {Component} from 'angular2/core';
import {Path} from '../../../config/config';

@Component({
    selector: 'vn-alert',
    templateUrl: Path.Component('shared/alert/alert.component.html'),
    inputs: [
        'type: type',
        'message: message'
    ],
    directives: []
})
export class AlertComponent {
    type: AlertType;
    message: string;
    
    constructor () {}
    
    alertClass () {
        switch(this.type) {
            case AlertType.ERROR: return 'alert-danger';
            case AlertType.WARNING: return 'alert-warning';
            case AlertType.SUCCESS: return 'alert-success';
            default: return 'alert-danger'; 
        }
    }
}

export enum AlertType {
    ERROR,
    WARNING,
    SUCCESS
}