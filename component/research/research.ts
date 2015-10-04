import {Component, View, Injectable, bootstrap} from 'angular2/angular2';
import {BaseComponent} from '../shared/base';
import {AppService} from '../../service/app';

@Component({
    selector: 'research'
})
@View({
    templateUrl: '/view/research/research.html'
})
export class ResearchComponent extends BaseComponent {
    constructor (app:AppService) {
        super(app);
        app.notify("alert");
    }
}