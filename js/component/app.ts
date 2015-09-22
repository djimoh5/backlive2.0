import {Component, View, bootstrap} from 'angular2/angular2';
import {HeaderNavComponent} from './header-nav'
import {HeaderControlComponent} from './header-control'
import {FooterNavComponent} from './footer-nav'

@Component({
    selector: 'backlive-app'
})
@View({
    templateUrl: '/view/app.html',
    directives: [HeaderNavComponent, HeaderControlComponent, FooterNavComponent]
})
class AppComponent {
    name: string;
    test;
    
    constructor() {
        this.name = 'BackLive'
        this.test = function () { alert(1); }
    }
}

bootstrap(AppComponent);