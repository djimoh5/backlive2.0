import { Component, OnInit, OnChanges, Input, ViewChild, ElementRef, OnDestroy } from '@angular/core';

import { PageComponent } from 'backlive/component/shared';

import { AppService, CryptoService } from 'backlive/service';
import { CryptoOrderBook } from 'backlive/service/model';

import { CryptoProductChangeEvent } from 'backlive/event';
import { PlatformUI } from 'backlive/utility/ui';

@Component({
    selector: 'order-book',
    templateUrl: 'order-book.component.html',
    styleUrls: ['order-book.component.less']
})
export class OrderBookComponent extends PageComponent implements OnInit, OnChanges, OnDestroy {
    @Input() productId: string;
    orderBook: CryptoOrderBook;

    @ViewChild('scrollView') scrollView: ElementRef;
    scrollViewHeight: number;

    initialized: boolean;
    interval: any;

    constructor(appService: AppService, private cryptoService: CryptoService, private platformUI: PlatformUI) {
        super(appService);

        this.subscribeEvent(CryptoProductChangeEvent, event => {
            this.productId = event.data;
            this.getOrderBook();
        });

        this.platformUI.onResize('order-book', size => {
            this.scrollViewHeight = size.height - 140;
        });
    }

    ngOnInit() {
        this.interval = setInterval(() => this.getOrderBook(), 5000);
    }

    ngOnChanges() {
        this.getOrderBook();
    }

    getOrderBook() {
        this.cryptoService.getOrderBook(this.productId).then(orderBook => {
            this.orderBook = orderBook.data;
            this.orderBook.asks = this.orderBook.asks.reverse();

            if(!this.initialized) {
                this.initialized = true;
                setTimeout(() => {
                    var $elem = this.platformUI.query(this.scrollView.nativeElement);
                    var scrollHeight = $elem[0].scrollHeight;
                    $elem.scrollTop((scrollHeight / 2) - (this.scrollViewHeight / 2) + 25);
                });
            }
        });
    }

    ngOnDestroy() {
        this.platformUI.endOnResize('order-book');
        clearInterval(this.interval);
    }
}