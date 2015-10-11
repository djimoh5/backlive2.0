import {Component, View, Injectable, Inject, bootstrap} from 'angular2/angular2';
import {AppService} from '../../service/app';

@Component({
    selector: 'base'
})
@View({
    templateUrl: '/view/shared/base.html'
})
@Injectable()
export class BaseComponent  {
    app: AppService;
    
    constructor (app: AppService) {
        this.app = app;
    }
}
