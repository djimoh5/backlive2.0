import {Component, View, bootstrap} from 'angular2/angular2';
import {SearchBarComponent} from './search-bar';

@Component({
    selector: 'header-control'
})
@View({
    templateUrl: '/view/shared/header-control.html',
    directives: [SearchBarComponent]
})
export class HeaderControlComponent {
    constructor () {

    }
}