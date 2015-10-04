import {Component, View, Injectable, bootstrap} from 'angular2/angular2';
import {BaseComponent} from '../shared/base';
import {AppService} from '../../service/app';

@Component({
    selector: 'portfolio'
})
@View({
    templateUrl: '/view/portfolio/portfolio.html'
})
export class PortfolioComponent extends BaseComponent {
    constructor (app: AppService) {
        super(app);
    }
}