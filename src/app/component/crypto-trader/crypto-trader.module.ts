import { NgModule }       from '@angular/core';
import { SharedModule } from 'backlive/module/shared';
import { NavigationSharedModule } from '../navigation/shared/shared.module';

import { CryptoTraderComponent } from './crypto-trader.component';

import { cryptoTraderRouting } from './crypto-trader.routing';

@NgModule({
    declarations: [
        CryptoTraderComponent
    ],
    imports: [SharedModule, NavigationSharedModule, cryptoTraderRouting]
})
export class CryptoTraderModule {}