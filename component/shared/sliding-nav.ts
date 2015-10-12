import {Component, View, NgClass, bootstrap} from 'angular2/angular2';
import {SearchBarComponent} from './search-bar';

@Component({
    selector: 'sliding-nav'
})
@View({
    templateUrl: '/view/shared/sliding-nav.html',
    directives: [NgClass, SearchBarComponent]
})
export class SlidingNavComponent {
    isActive: boolean = false;
    
    constructor () {
       
    }
    
    showSideBar() {
        this.isActive = !this.isActive;
    }
}