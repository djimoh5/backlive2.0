import { Component, OnInit, ViewChild } from '@angular/core';
import { Path } from 'backlive/config';
import { PageComponent, SearchBarComponent } from 'backlive/component/shared';
import { StrategyComponent } from '../strategy/strategy.component';

import { AppService, UserService, StrategyService } from 'backlive/service';

import { Route } from 'backlive/routes';
import { Strategy, Indicator } from 'backlive/service/model';
import { SlidingNavItemsEvent } from 'backlive/event';

import {PlatformUI} from 'backlive/utility/ui';

declare var d3;

@Component({
    selector: 'backlive-backtest',
    templateUrl: Path.ComponentView('backtest'),
    styleUrls: [Path.ComponentStyle('backtest')]
})
export class BacktestComponent extends PageComponent implements OnInit {
    life: { numLoops: number };
    errMessage: string;
    strategy: Strategy;
    indicators: Indicator[] = [];
    indicatorSize = { width: 36, height: 32 };
    
    @ViewChild('strategyComponent') strategyComponent: StrategyComponent;
    
    constructor(appService: AppService, private userService: UserService, private strategyService: StrategyService, private platformUI: PlatformUI) {
        super(appService);
        
        var items = [
            { icon: "search", component: SearchBarComponent },
            { icon: "video", onClick: () => {}, tooltip:'test' },
            { icon: "list", onClick: () => {} },
            { icon: "settings", component: null }
        ];
        
        appService.notify(new SlidingNavItemsEvent(items));

        this.life = { numLoops: 0 };
    }
    
    ngOnInit() {
        this.strategyService.getStrategies().then(strategies => {
            console.log(strategies);
            var radius = 250, radiusPercent = 40, angleOffset = 10, startAngle = 180;

            var eventLoop = setInterval(() => {
                var numInds = this.indicators.length;

                if(numInds > 0) {
                    this.indicators.forEach((indicator, index) => {
                        if(index === 0) {
                            indicator.position.angle = startAngle + (.2 * this.life.numLoops);
                        }
                        else {
                            indicator.position.angle = this.indicators[index - 1].position.angle - angleOffset;
                        }

                        indicator.position.x = radiusPercent * Math.cos(indicator.position.angle / 180 * Math.PI);
                        indicator.position.y = radius * Math.sin(indicator.position.angle / 180 * Math.PI) - (this.indicatorSize.height / 2) - 30; //extra 30 for amount strategy pod is off center;
                    });

                    this.life.numLoops++;
                }
            }, 100);
        });
    }
    
    addIndicator() {
        var indicator = new Indicator();
        this.indicators.push(indicator);
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
        
        var line = d3.line()
                        .x(function(d) { return d.x; })
                        .y(function(d) { return d.y; })
                        .curve(d3.curveBundle.beta(1));

        return line(lineData);
    }
}