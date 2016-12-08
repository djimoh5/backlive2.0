import { NgModule }       from '@angular/core';

import { AppService} from './app.service';
import { RouterService } from './router.service';
import { ApiService } from './api.service';
import { UserService } from './user.service';

import { AnalyticsService } from './analytics.service'
import { IndicatorService } from './indicator.service';
import { NewsService } from './news.service';
import { PortfolioService } from './portfolio.service';
import { StrategyService } from './strategy.service';
import { TickerService } from './ticker.service';
import { LookupService } from './lookup.service';


import { ClientSocket } from './client.socket';

@NgModule({
    providers: [
        AppService, 
        RouterService, 
        ApiService,
        IndicatorService,
        NewsService,
        PortfolioService,
        StrategyService,
        TickerService,
        UserService,
        LookupService,
        ClientSocket
    ]
})
export class ServiceModule {}