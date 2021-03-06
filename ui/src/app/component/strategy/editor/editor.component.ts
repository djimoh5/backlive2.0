import { Component, Input, OnInit } from '@angular/core';


import { BaseComponent } from 'backlive/component/shared';
import { RadioButtonOption } from 'backlive/component/shared/ui';

import { AppService } from 'backlive/service';
import { Strategy, StrategySettings, StrategyFilter, PortfolioWeighting, FrictionType, TradingFrequency } from 'backlive/service/model';

@Component({
    selector: 'backlive-strategy-editor',
    templateUrl: 'editor.component.html',
    styleUrls: ['editor.component.less'],
})
export class StrategyEditorComponent extends BaseComponent implements OnInit {
    @Input() strategy: Strategy;
    sectors: RadioButtonOption[];

    PortfolioWeighting = PortfolioWeighting;
    FrictionType = FrictionType;
    TradingFrequency = TradingFrequency;
      
    constructor(appService: AppService) {
        super(appService);
    }
    
    ngOnInit() {
        if(!this.strategy.settings) {
            this.strategy.settings = new StrategySettings();
        }

        if(!this.strategy.filter) {
            this.strategy.filter = new StrategyFilter();
        }

        this.sectors = [
            { value: '01', title: 'Basic Materials' },
            { value: '02', title: 'Capital Goods' },
            { value: '03', title: 'Conglomerates' },
            { value: '04', title: 'Consumer Cyclical' },
            { value: '05', title: 'Consumer Non-Cyclical' },
            { value: '06', title: 'Energy' },
            { value: '07', title: 'Financial' },
            { value: '08', title: 'Health Care' },
            { value: '09', title: 'Services' },
            { value: '10', title: 'Technology' },
            { value: '11', title: 'Transportation' },
            { value: '12', title: 'Utilities' }
        ];
    }

    excludeAllSectors() {
        this.strategy.filter.exclSectors = [];
        this.sectors.forEach(sector => {
            this.strategy.filter.exclSectors.push(sector.value);
        });
    }
}