import {Component, View, bootstrap} from 'angular2/angular2';
import { ROUTER_DIRECTIVES } from 'angular2/router';

@Component({
    selector: 'header-nav'
})
@View({
    templateUrl: '/view/shared/header-nav.html',
    directives: [ROUTER_DIRECTIVES]
})
export class HeaderNavComponent {
    constructor () {

    }
}