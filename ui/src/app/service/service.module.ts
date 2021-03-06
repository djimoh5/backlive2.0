import { NgModule }       from '@angular/core';

import { AppService} from './app.service';
import { RouterService } from './router.service';
import { ApiService } from './api.service';
import { UserService } from './user.service';

//import { AnalyticsService } from './analytics.service'
import { BasicNodeService } from './basic-node.service';
import { NetworkService } from './network.service';
import { IndicatorService } from './indicator.service';
import { NewsService } from './news.service';
import { PortfolioService } from './portfolio.service';
import { StrategyService } from './strategy.service';
import { TickerService } from './ticker.service';
import { LookupService } from './lookup.service';
import { CryptoService } from './crypto.service';

import { ClientSocket } from './client.socket';

@NgModule({
    providers: [
        AppService, 
        RouterService, 
        ApiService,
        BasicNodeService,
        NetworkService,
        IndicatorService,
        NewsService,
        PortfolioService,
        StrategyService,
        TickerService,
        UserService,
        LookupService,
        CryptoService,
        ClientSocket
    ]
})
export class ServiceModule {}