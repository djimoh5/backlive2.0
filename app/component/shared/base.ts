import {Component} from 'angular2/angular2';
import {AppService} from '../../service/app';

import {Event} from '../../model/event';

@Component({})
export class BaseComponent  {
    appService: AppService;
    
    constructor (appService: AppService) {
        this.appService = appService;
    }
}