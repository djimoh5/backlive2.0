import { Component, OnInit, ViewChild } from '@angular/core';

import { PageComponent } from 'backlive/component/shared';
import { SearchBarComponent, ChartComponent, ChartType, ChartOptions, ChartAxisType, ChartSeries } from 'backlive/component/shared/ui';
import { SlidingNavItem } from 'backlive/component/navigation';

import { AppService, CryptoService } from 'backlive/service';
import { CryptoTicker, CryptoColor, LastPrice } from 'backlive/service/model';

import { PlatformUI } from 'backlive/utility/ui';
import { Common } from 'backlive/utility';

@Component({
    selector: 'crypto-trader',
    templateUrl: 'crypto-trader.component.html',
    styleUrls: ['crypto-trader.component.less']
})
export class CryptoTraderComponent extends PageComponent implements OnInit {
    navItems: SlidingNavItem[];
    chartOptions: ChartOptions;
    coins: { [key: string]: { series: ChartSeries, initialized?: boolean, price?: number } };

    chartHeight: number;
    chartTitle: string;
    selectedProductId: string;

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
            this.chartHeight = size.height - 10;
        });
    }

    ngOnInit() {
        this.selectedProductId = this.cryptoService.defaultProductId;

        this.cryptoService.getProducts().then(products => {
            this.coins = {};
            var cnt = 0;

            products.data.forEach(product => {
                this.coins[product.id] = { series: { name: product.ticker, data: [], color: CryptoColor[product.ticker], visible: product.id === this.selectedProductId } };

                this.getPriceHistory(product.id, (points: [number, number][]) => {
                    if(points) {
                        this.setProductPricePoints(product.id, points);
                    }                        

                    if(product.id === this.selectedProductId) {
                        this.initChart();
                        this.subscribeRealTime();
                    }
                });
            });
        });
    }

    getPriceHistory(productId: string, callback: (points: [number, number][]) => void) {
        this.cryptoService.getPrices(productId, 300).then(prices => {
            if(prices.data['message']) { console.log(prices.data); }    
            var points = prices.data['message'] ?
                null : prices.data.reverse().map(p => { return <[number, number]>[p[0] * 1000, p[3]]; });
            callback(points);
        });
    }

    setProductPricePoints(productId: string, points: [number, number][]) {
        this.coins[productId].series.data = points;
        this.coins[productId].price = points[points.length - 1][1];
        this.coins[productId].initialized = true;
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
    }

    subscribeRealTime() {
        this.cryptoService.ticker.subscribe((data: CryptoTicker) => {
            if(this.chart) {
                var coin = this.coins[data.product_id];
                if(coin && data.time) {
                    var seriesData = <[number, number][]>coin.series.data;
                    var time = Date.parse(data.time);

                    coin.price = parseFloat(data.price);
                    console.log(data.product_id, coin.price);
                    
                    if(this.selectedProductId === data.product_id) {
                        this.setChartTitle(data.product_id);
                    }

                    //update chart every 60s
                    if(seriesData.length === 0 || seriesData[seriesData.length - 1][0] < (time - 30000)) {
                        var point: [number, number] = [time, coin.price];
                                       
                        if(coin.initialized) {
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

    setChartTitle(productId: string) {
        this.chartTitle = `${this.cryptoService.getProductName(productId)}  ${Common.formatToCurrency(this.coins[productId].price.toFixed(2))}`;
    }

    onTickerClick(price: LastPrice) {
        this.selectedProductId = price.productId;
        this.chart.selectSeries(this.coins[price.productId].series.name);
    }

    onShowSeries(series: ChartSeries) {
        for(var productId in this.coins) {
            var coin = this.coins[productId];
            if(coin.series.name === series.name) {
                if(!coin.initialized) {
                    console.log('initializing', productId);
                    this.getPriceHistory(productId, (points: [number, number][]) => {
                        var points = points.concat(points, <[number, number][]>this.coins[productId].series.data);
                        this.setProductPricePoints(productId, points);
                        this.coins[productId].series.data = []; //clear out since we are adding points below

                        this.chart.addPoints(coin.series.name, points);
                        this.setChartTitle(productId);
                    });
                }
                else {
                    this.setChartTitle(productId);
                }

                break;
            }
        }
    }
}