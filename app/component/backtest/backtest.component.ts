import {Component, OnInit, ViewChild} from '@angular/core';
import {Path} from 'backlive/config';
import {PageComponent, SearchBarComponent} from 'backlive/component/shared';
import { StrategyComponent } from './strategy/strategy.component';

import {AppService, UserService} from 'backlive/service';

import {Route} from 'backlive/routes';
import {AppEvent, Strategy, Indicator} from 'backlive/service/model';

import {PlatformUI} from 'backlive/utility/ui';

declare var d3;

@Component({
    selector: 'backlive-backtest',
    templateUrl: Path.ComponentView('backtest'),
    styleUrls: [Path.ComponentStyle('backtest')]
})
export class BacktestComponent extends PageComponent implements OnInit {
    errMessage: string;
    strategy: Strategy;
    indicators: Indicator[] = [];
    indicatorSize = { width: 36, height: 32 };
    
    @ViewChild('strategyComponent') strategyComponent: StrategyComponent;
    
    constructor(appService: AppService, private userService: UserService, private platformUI: PlatformUI) {
        super(appService);
        
        var items = [
            { icon: "search", component: SearchBarComponent },
            { icon: "video", onClick: () => {}, tooltip:'test' },
            { icon: "list", onClick: () => {} },
            { icon: "settings", component: null }
        ];
        
        appService.notify(AppEvent.SlidingNavItems, items);
    }
    
    ngOnInit() {
        
    }
    
    addIndicator() {
        var indicator = new Indicator();
        this.indicators.push(indicator);
        this.positionIndicators();
    }
    
    positionIndicators() {
        var lastIndex = this.indicators.length - 1;
        var radius = 250, radiusPercent = 40, angleOffset = 10, 
            startAngle = 180 - (lastIndex * angleOffset / 2);
        
        this.indicators.forEach((indicator, index) => {
            var angle = ((lastIndex - index) * angleOffset) + startAngle;
            indicator.position.x = radiusPercent * Math.cos(angle / 180 * Math.PI);
            indicator.position.y = radius * Math.sin(angle / 180 * Math.PI) - (this.indicatorSize.height / 2) - 30; //extra 30 for amount strategy pod is off center;
        
            clearInterval(indicator.interval);
            indicator.interval = setInterval(() => {
                angle += .2;
                indicator.position.x = radiusPercent * Math.cos(angle / 180 * Math.PI);
                indicator.position.y = radius * Math.sin(angle / 180 * Math.PI) - (this.indicatorSize.height / 2) - 30;
            }, 10);
        });
    }
    
    getLine(indicator: Indicator) {
        var $strat = this.platformUI.query(this.strategyComponent.getElement());
        var centerX = this.platformUI.query(window).width() / 2;
        var centerY = this.platformUI.query(window).height() / 2;
        
        var lineData = [
           { 
             x: centerX + (centerX * 2 * indicator.position.x / 100), 
             y: centerY + indicator.position.y + (this.indicatorSize.height / 2)
           },  
           { x: centerX, y: centerY - 30 }
        ];
        
       //console.log(lineData);
        
        var line = d3.line()
                        .x(function(d) { return d.x; })
                        .y(function(d) { return d.y; })
                        .curve(d3.curveBundle.beta(1));

       //console.log(lineFunction(lineData));
       return line(lineData);
    }
}