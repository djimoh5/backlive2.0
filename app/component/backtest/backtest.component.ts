import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Path } from 'backlive/config';
import { PageComponent, SearchBarComponent } from 'backlive/component/shared';
import { StrategyComponent } from '../strategy/strategy.component';

import { AppService, UserService, StrategyService } from 'backlive/service';

import { Route } from 'backlive/routes';
import { Strategy, Indicator, Node, NodeType } from 'backlive/service/model';
import { SlidingNavItemsEvent, NodeChangeEvent } from 'backlive/event';

import { PlatformUI } from 'backlive/utility/ui';

declare var d3;

@Component({
    selector: 'backlive-backtest',
    templateUrl: Path.ComponentView('backtest'),
    styleUrls: [Path.ComponentStyle('backtest')]
})
export class BacktestComponent extends PageComponent implements OnInit, OnDestroy {
    eventLoop: any;
    life: { numLoops: number };
    
    errMessage: string;
    strategy: Strategy;
    indicators: Indicator[] = [];
    indicatorSize = { width: 36, height: 32 };

    tmpInputMap: { [key: string]: { node: Node, input: Node } } = {};
    
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
        this.strategyService.list().then(strategies => {
            //console.log('strategies', strategies);
            if(strategies.length > 0) {
                this.loadStrategy(strategies[0]);
            }
            else {
                this.strategy = new Strategy('');
            }

            this.startEventLoop();
        });
    }

    loadStrategy(strategy: Strategy) {
        this.strategy = strategy;
        this.strategyService.getInputs(strategy._id).then(nodes => {
            this.indicators = <Indicator[]> nodes;
        });
    }

    onAddInput(node: Node, inputNode: Node) {
        if(!node.inputs) {
            node.inputs = [];
        }

        switch(inputNode.ntype) {
            case NodeType.Indicator:
                this.indicators.push(<Indicator>inputNode);
                break;
        }

        this.tmpInputMap[node._id] = { node: node, input: inputNode };
    }

    onNodeChange(node: Node, index: number = null) {
        for(var key in this.tmpInputMap) {
            if(this.tmpInputMap[key].input === node) {
                this.tmpInputMap[key].node.inputs.push(node._id);
                this.appService.notify(new NodeChangeEvent(this.tmpInputMap[key].node));
                delete this.tmpInputMap[key];
            }
        }
    }

    startEventLoop() {
        var radius = 250, radiusPercent = 40, angleOffset = 10, startAngle = 180;

        this.eventLoop = setInterval(() => {
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
        }, 200);
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

    ngOnDestroy() {
        super.ngOnDestroy();
        clearInterval(this.eventLoop);
    }
}