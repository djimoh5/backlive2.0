import {Component} from 'angular2/angular2';
import {AppService} from '../../config/imports/service';

import {Event} from '../../service/model/event';

@Component({})
export class BaseComponent  {
    appService: AppService;
    
    constructor (appService: AppService) {
        this.appService = appService;
    }
}