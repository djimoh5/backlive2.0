import {Component, NgClass} from 'angular2/angular2';
import {Path} from '../../../config/config';

@Component({
    selector: 'app-alert',
    templateUrl: Path.Component('shared/alert/alert.html'),
    inputs: [
        'type: type',
        'message: message'
    ],
    directives: [NgClass]
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