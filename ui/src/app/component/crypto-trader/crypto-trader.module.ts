import { NgModule }       from '@angular/core';
import { SharedModule } from 'backlive/module/shared';
import { NavigationSharedModule } from '../navigation/shared/shared.module';

import { CryptoTraderComponent } from './crypto-trader.component';
import { OrderBookComponent } from './order-book/order-book.component';
import { CryptoOrderComponent } from './crypto-order/crypto-order.component';
import { CryptoNewsComponent } from './crypto-news/crypto-news.component';

import { cryptoTraderRouting } from './crypto-trader.routing';

@NgModule({
    declarations: [
        CryptoTraderComponent,
        OrderBookComponent,
        CryptoOrderComponent,
        CryptoNewsComponent
    ],
    imports: [SharedModule, NavigationSharedModule, cryptoTraderRouting],
    entryComponents: [OrderBookComponent, CryptoOrderComponent, CryptoNewsComponent]
})
export class CryptoTraderModule {}