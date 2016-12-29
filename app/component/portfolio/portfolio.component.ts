import { Component, OnInit, Input } from '@angular/core';
import { Path } from 'backlive/config';
import { NodeComponent } from 'backlive/component/shared';
import { PageComponent } from 'backlive/component/shared';

import { AppService, UserService, PortfolioService } from 'backlive/service';
import { Portfolio } from 'backlive/service/model';

import { Route } from 'backlive/routes';

@Component({
    selector: 'backlive-portfolio',
    templateUrl: Path.ComponentView('portfolio'),
    styleUrls: [Path.ComponentStyle('portfolio')]
})
export class PortfolioComponent extends NodeComponent<Portfolio> implements OnInit {
    @Input() portfolio: Portfolio;
    
    constructor(appService: AppService, private userService: UserService, private portfolioService: PortfolioService) {
        super(appService, portfolioService);
    }
    
    ngOnInit() {
        this.subscribeNodeEvents(this.portfolio);
    }

    update() {
        console.log('updating portfolio');
        if(this.portfolio.name) {
            this.portfolioService.update(this.portfolio).then(portfolio => {
                if(portfolio._id) {
                    this.portfolio._id = portfolio._id;
                    this.nodeChange.emit(this.portfolio);
                }
            });
        }
    }
}