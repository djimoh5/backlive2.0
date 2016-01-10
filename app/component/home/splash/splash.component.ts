import {Component} from 'angular2/core';
import {Path} from 'backlive/config';
import {PageComponent} from 'backlive/component/shared';

import {AppService} from 'backlive/service';

import {AppEvent} from '../../../service/model/app-event';

@Component({
    selector: 'app-splash',
    templateUrl: Path.ComponentView('home/splash')
})
export class SplashComponent extends PageComponent {
    constructor(appService: AppService) {
        super(appService); //add false to show loading on spash screen
        //TODO: add nice graphic for the splash
    }
}