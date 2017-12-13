import { Component } from '@angular/core';


import { PageComponent } from 'backlive/component/shared';
import { SearchBarComponent } from 'backlive/component/shared/ui';
import { RadioButtonOption } from 'backlive/component/shared/ui';
import { SlidingNavItem } from 'backlive/component/navigation';

import { AppService, CryptoService } from 'backlive/service';

import { Common } from 'backlive/utility';

@Component({
    selector: 'crypto-trader',
    templateUrl: 'crypto-trader.component.html',
    styleUrls: ['crypto-trader.component.less']
})
export class CryptoTraderComponent extends PageComponent {
    navItems: SlidingNavItem[];


    constructor(appService: AppService, private cryptoService: CryptoService) {
        super(appService);
        
        this.navItems = [
            { icon: 'search', component: SearchBarComponent },
            { icon: 'video', onClick: () => this.test(), tooltip:'test' },
            { icon: 'list', onClick: () => this.test() },
            { icon: 'settings', component: null }
        ];
    }

    test() {

    }
}