import {Component} from 'angular2/angular2';
import {PageComponent} from '../shared/page';
import {AppService} from '../../service/app';

import {Event} from '../../model/event';

@Component({
    selector: 'backlive-splash',
    templateUrl: '/view/home/splash.html',
})
export class SplashComponent extends PageComponent {
    constructor(appService: AppService) {
        super(appService); //add false to show loading on spash screen
        //TODO: add nice graphic for the splash
    }
}