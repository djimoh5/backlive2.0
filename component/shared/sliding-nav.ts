import {Component, View, NgClass, bootstrap} from 'angular2/angular2';

@Component({
    selector: 'sliding-nav'
})
@View({
    templateUrl: '/view/shared/sliding-nav.html',
    directives: [NgClass]
})
export class SlidingNavComponent {
    isActive: boolean = false;
    
    constructor () {
       
    }
    
    showSideBar() {
        this.isActive = !this.isActive;
    }
}