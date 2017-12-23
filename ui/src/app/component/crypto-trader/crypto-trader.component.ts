import { Component, OnInit, ViewChild } from '@angular/core';

import { PageComponent } from 'backlive/component/shared';
import { SearchBarComponent, ChartComponent, ChartType, ChartOptions, ChartAxisType, ChartSeries } from 'backlive/component/shared/ui';
import { SlidingNavItem } from 'backlive/component/navigation';

import { AppService, CryptoService } from 'backlive/service';
import { CryptoTicker, CryptoColor } from 'backlive/service/model';

import { PlatformUI } from 'backlive/utility/ui';

@Component({
    selector: 'crypto-trader',
    templateUrl: 'crypto-trader.component.html',
    styleUrls: ['crypto-trader.component.less']
})
export class CryptoTraderComponent extends PageComponent implements OnInit {
    navItems: SlidingNavItem[];
    chartOptions: ChartOptions;
    coins: { [key: string]: { series: ChartSeries, initialized?: boolean } };

    chartHeight: number;
    
    @ViewChild(ChartComponent) chart: ChartComponent;

    constructor(appService: AppService, private cryptoService: CryptoService, private platformUI: PlatformUI) {
        super(appService);
        
        this.navItems = [
            { icon: 'search', component: SearchBarComponent },
            { icon: 'video', onClick: null, tooltip:'test' },
            { icon: 'list', onClick: null },
            { icon: 'settings', component: null }
        ];

        this.platformUI.onResize('backlive-chart', size => {
            this.chartHeight = size.height - 100;
        });
    }

    ngOnInit() {
        var defaultTicker = 'BTC';

        this.cryptoService.getProducts().then(products => {
            this.coins = {};
            var cnt = 0;

            products.data.forEach(product => {
                this.coins[product.id] = { series: { name: product.ticker, data: [], color: CryptoColor[product.ticker], visible: product.ticker === defaultTicker } };
            
                setTimeout(() => {
                    this.getPricePoints(product.id, (points: [number, number][]) => {
                        if(points) {
                            this.coins[product.id].series.data = points;
                            this.coins[product.id].initialized = true;
                        }                        

                        if(--cnt === 0) {
                            this.initChart();
                        }
                    });
                }, cnt++ * 500);
            });
        });
    }

    getPricePoints(productId: string, callback: (points: [number, number][]) => void) {
        this.cryptoService.getPrices(productId, 300).then(prices => {
            var points = prices.data['message'] ?
                null : prices.data.reverse().map(p => { return <[number, number]>[p[0] * 1000, p[3]]; });
            callback(points);
        });
    }

    initChart() {
        var series: ChartSeries[] = [];
        
        for(var productId in this.coins) {
            series.push(this.coins[productId].series);
        }

        this.chartOptions = {
            type: ChartType.area,
            series: series,
            xAxis: { type: ChartAxisType.datetime/*, dateFormat: '%b %Y'*/ },
            title: 'Cryptocurrencies',
            disable3d: true,
            yAxis: { allowDecimals: true }
        };

        this.cryptoService.ticker.subscribe((data: CryptoTicker) => {
            if(this.chart) {
                var coin = this.coins[data.product_id];
                if(coin && data.time) {
                    var seriesData = <[number, number][]>coin.series.data;
                    var time = Date.parse(data.time);

                    //update every 30s
                    if(seriesData.length === 0 || seriesData[seriesData.length - 1][0] < (time - 5000)) {
                        var point: [number, number] = [time, parseFloat(data.price)];
                        

                        if(coin.initialized) {
                            this.chart.addPoint(coin.series.name, point);
                        }
                        else {
                            seriesData.push(point);
                        }
                        
                        console.log(data.product_id, point);
                    }
                }
            }
        });
    }

    onShowSeries(series: ChartSeries) {
        for(var productId in this.coins) {
            var coin = this.coins[productId];
            if(coin.series.name === series.name) {
                if(!coin.initialized) {
                    console.log('initializing', productId);
                    this.getPricePoints(productId, (points: [number, number][]) => {
                        var points = points.concat(points, <[number, number][]>this.coins[productId].series.data);
                        this.coins[productId].series.data = [];
                        this.chart.addPoints(coin.series.name, points);
                        this.coins[productId].initialized = true;
                    });
                }

                break;
            }
        }
    }
}