import {Component, View, Injectable, bootstrap} from 'angular2/angular2';
import {BaseComponent} from '../shared/base';
import {AppService} from '../../service/app';

@Component({
    selector: 'backtest'
})
@View({
    templateUrl: '/view/backtest/backtest.html'
})
export class BacktestComponent extends BaseComponent {
    constructor (app: AppService) {
        super(app);
    }
}