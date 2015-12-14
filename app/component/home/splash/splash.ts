import {Component} from 'angular2/angular2';
import {Path} from '../../../config/config';
import {PageComponent} from '../../../config/imports/shared';

import {AppService} from '../../../config/imports/service';

import {Event} from '../../../service/model/event';

@Component({
    selector: 'backlive-splash',
    templateUrl: Path.Component('home/splash/splash.html')
})
export class SplashComponent extends PageComponent {
    constructor(appService: AppService) {
        super(appService); //add false to show loading on spash screen
        //TODO: add nice graphic for the splash
    }
}