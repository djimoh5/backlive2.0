import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';

import { PageComponent } from 'backlive/component/shared';
import { ChartComponent, ChartType, ChartOptions, ChartAxisType, ChartSeries } from 'backlive/component/shared/ui';
import { SlidingNavItem } from 'backlive/component/navigation';

import { OrderBookComponent } from './order-book/order-book.component';
import { CryptoOrderComponent } from './crypto-order/crypto-order.component';
import { CryptoNewsComponent } from './crypto-news/crypto-news.component';

import { AppService, CryptoService } from 'backlive/service';
import { CryptoTicker, CryptoColor, LastPrice } from 'backlive/service/model';
import { CryptoProductChangeEvent } from 'backlive/event';

import { PlatformUI } from 'backlive/utility/ui';
import { Common } from 'backlive/utility';

@Component({
    selector: 'crypto-trader',
    templateUrl: 'crypto-trader.component.html',
    styleUrls: ['crypto-trader.component.less']
})
export class CryptoTraderComponent extends PageComponent implements OnInit, OnDestroy {
    navItems: SlidingNavItem[];
    chartOptions: ChartOptions;
    coins: { [key: string]: { series: ChartSeries, seriesLoaded?: boolean, price?: number, pricesLoaded?: boolean } };

    chartHeight: number;
    chartTitle: string;
    chartInitialized: boolean;

    selectedProductId: string;
    orderBookModel: { productId: string; } = { productId: null };

    @ViewChild(ChartComponent) chart: ChartComponent;

    constructor(appService: AppService, private cryptoService: CryptoService, private platformUI: PlatformUI) {
        super(appService);
        
        this.navItems = [
            { icon: 'book', component: OrderBookComponent, model: this.orderBookModel, tooltip: 'Order Book' },
            { icon: 'usd', component: CryptoOrderComponent, tooltip: 'Place Order' },
            { icon: 'horn', component: CryptoNewsComponent, tooltip: 'Cypto News' },
            { icon: 'settings', component: null, tooltip: 'My Settings' }
        ];

        this.platformUI.onResize('backlive-chart', size => {
            this.chartHeight = size.height - 10;
        });
    }

    ngOnInit() {
        this.setSelectedProductId(this.cryptoService.defaultProductId);

        this.cryptoService.getProducts().then(products => {
            this.coins = {};
            var cnt = 0;

            products.data.forEach(product => {
                cnt++;
                this.coins[product.id] = { series: { name: product.ticker, data: [], color: CryptoColor[product.ticker], visible: product.id === this.selectedProductId } };

                this.getPriceHistory(product.id, () => {
                    if(--cnt === 0/*product.id === this.selectedProductId*/) {
                        this.initChart();
                        this.subscribeRealTime();
                    }
                });
            });
        });
    }

    getPriceHistory(productId: string, callback: (points: [number, number][]) => void) {
        this.cryptoService.getPrices(productId, 300).then(prices => {
            if(prices.data['message']) { 
                console.log(prices.data); 
                callback(null);
                return;
            }

            var coin = this.coins[productId];
            var points = prices.data.reverse().map(p => { return <[number, number]>[p[0] * 1000, p[3]]; });
            points = points.concat(<[number, number][]>coin.series.data);

            if(this.chartInitialized) {
                coin.series.data = []; //clear out since we are adding points below
                this.chart.addPoints(coin.series.name, points);
            }
            else {
                coin.series.data = points;
            }
            
            coin.price = points[points.length - 1][1];
            coin.pricesLoaded = true;
            callback(points);
        });
    }

    initChart() {
        var series: ChartSeries[] = [];
        
        for(var productId in this.coins) {
            series.push(this.coins[productId].series);
            if(this.coins[productId].series.visible) {
                this.setChartTitle(productId);
            }
        }

        this.chartOptions = {
            type: ChartType.area,
            series: series,
            xAxis: { type: ChartAxisType.datetime/*, dateFormat: '%b %Y'*/ },
            title: this.chartTitle,
            disable3d: true,
            disableLegend: true,
            yAxis: { allowDecimals: true }
        };

        this.chartInitialized = true;
    }

    subscribeRealTime() {
        this.cryptoService.ticker.subscribe((data: CryptoTicker) => {
            if(this.chart) {
                var coin = this.coins[data.product_id];
                if(coin && data.time) {
                    var seriesData = <[number, number][]>coin.series.data;
                    var time = Date.parse(data.time);

                    coin.price = parseFloat(data.price);
                    //console.log(data.product_id, coin.price);
                    
                    if(this.selectedProductId === data.product_id) {
                        this.setChartTitle(data.product_id);
                    }

                    //update chart every 60s
                    if(seriesData.length === 0 || seriesData[seriesData.length - 1][0] < (time - 30000)) {
                        var point: [number, number] = [time, coin.price];
                                       
                        if(coin.pricesLoaded) {
                            this.chart.addPoint(coin.series.name, point);
                        }
                        else {
                            seriesData.push(point);
                        }
                    }
                }
            }
        });
    }

    setSelectedProductId(productId: string) {
        this.selectedProductId = productId;
        this.orderBookModel.productId = productId;
        this.appService.notify(new CryptoProductChangeEvent(productId));
    }

    setChartTitle(productId: string) {
        this.chartTitle = `${this.cryptoService.getProductName(productId)}  ${Common.formatToCurrency(this.coins[productId].price.toFixed(2))}`;
    }

    onTickerClick(price: LastPrice) {
        this.setSelectedProductId(price.productId);
        this.chart.selectSeries(this.coins[price.productId].series.name);
    }

    onShowSeries(series: ChartSeries) {
        for(var productId in this.coins) {
            var coin = this.coins[productId];
            if(coin.series.name === series.name) {
                this.setChartTitle(productId);
                break;
            }
        }
    }

    ngOnDestroy() {
        this.platformUI.endOnResize('backlive-chart');
    }
}