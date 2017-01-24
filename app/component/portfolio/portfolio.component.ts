import { Component, OnInit, Input } from '@angular/core';
import { Path } from 'backlive/config';
import { Common } from 'backlive/utility';

import { NodeComponent } from 'backlive/component/shared';
import { PageComponent } from 'backlive/component/shared';

import { AppService, UserService, PortfolioService } from 'backlive/service';
import { Portfolio, Strategy } from 'backlive/service/model';

@Component({
    selector: 'backlive-portfolio',
    templateUrl: Path.ComponentView('portfolio'),
    styleUrls: [Path.ComponentStyle('portfolio')],
    outputs: NodeComponent.outputs //inherited, workaround until angular fix
})
export class PortfolioComponent extends NodeComponent<Portfolio> implements OnInit {
    @Input() portfolio: Portfolio;
    
    constructor(appService: AppService, private userService: UserService, private portfolioService: PortfolioService) {
        super(appService, portfolioService);
    }
    
    ngOnInit() {
        if(!this.portfolio._id) {
            this.update();
        }
        else if(!this.portfolio.inputs) {
            this.addStrategy();
        }

        this.subscribeNodeEvents(this.portfolio);
    }

    update() {
        console.log('updating portfolio');
        this.portfolioService.update(this.portfolio).then(portfolio => {
            if(portfolio._id) {
                if(!this.portfolio._id) { //new portfolio
                    this.addStrategy();
                }

                this.portfolio._id = portfolio._id;
                this.nodeChange.emit(this.portfolio);
            }
        });
    }

    addStrategy() {
        this.addInput.emit(new Strategy(''));
    }

    onEdit() {

    }

    onRemove() {

    }
}