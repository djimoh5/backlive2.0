import {Component} from 'angular2/angular2';
import {BaseComponent} from '../shared/base';

import {AppService} from '../../service/app';

@Component({
    selector: 'about-us',
    templateUrl: ''
})
export class AboutUsComponent extends BaseComponent {
    constructor (appService:AppService) {
        super(appService);
    }
}