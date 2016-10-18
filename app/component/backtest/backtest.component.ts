import {Component, OnInit} from '@angular/core';
import {Path} from 'backlive/config';
import {PageComponent, SearchBarComponent} from 'backlive/component/shared';

import {AppService, UserService} from 'backlive/service';

import {Route} from 'backlive/routes';
import {AppEvent, Strategy, Indicator} from 'backlive/service/model';

@Component({
    selector: 'backlive-backtest',
    templateUrl: Path.ComponentView('backtest'),
    styleUrls: [Path.ComponentStyle('backtest')]
})
export class BacktestComponent extends PageComponent implements OnInit {
    errMessage: string;
    strategy: Strategy;
    indicators: Indicator[] = [];
    
    constructor(appService: AppService, private userService: UserService) {
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
        var indicatorSize = { width: 36, height: 32 }, lastIndex = this.indicators.length - 1;
        var radius = 300, angleOffset = 10, 
            startAngle = 180 - (lastIndex * angleOffset / 2);
        
        console.log(startAngle);
        
        this.indicators.forEach((indicator, index) => {
            var angle = ((lastIndex - index) * angleOffset) + startAngle;
            indicator.position.x = radius * Math.cos(angle / 180 * Math.PI) - (indicatorSize.width / 2);
            indicator.position.y = radius * Math.sin(angle / 180 * Math.PI) - (indicatorSize.height / 2) - 30 //extra 30 for amount strategy pod is off center;
        });
    }
}