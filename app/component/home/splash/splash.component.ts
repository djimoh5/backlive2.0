import {Component} from 'angular2/core';
import {Path} from '../../../config/config';
import {PageComponent} from 'backlive/component/shared';

import {AppService} from 'backlive/service';

import {Event} from '../../../service/model/event';

@Component({
    selector: 'backlive-splash',
    templateUrl: Path.Component('home/splash/splash.component.html')
})
export class SplashComponent extends PageComponent {
    constructor(appService: AppService) {
        super(appService); //add false to show loading on spash screen
        //TODO: add nice graphic for the splash
    }
}