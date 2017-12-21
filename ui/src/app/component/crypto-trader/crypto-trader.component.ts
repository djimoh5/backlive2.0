import { Component, OnInit, ViewChild } from '@angular/core';

import { PageComponent } from 'backlive/component/shared';
import { SearchBarComponent, RadioButtonOption, ChartComponent, ChartType, ChartOptions, ChartAxisType, ChartKeyValueData, ChartSeries } from 'backlive/component/shared/ui';
import { SlidingNavItem } from 'backlive/component/navigation';

import { AppService, CryptoService } from 'backlive/service';
import { CryptoTicker, CryptoColor } from 'backlive/service/model';

import { Common } from 'backlive/utility';

@Component({
    selector: 'crypto-trader',
    templateUrl: 'crypto-trader.component.html',
    styleUrls: ['crypto-trader.component.less']
})
export class CryptoTraderComponent extends PageComponent implements OnInit {
    navItems: SlidingNavItem[];
    chartOptions: ChartOptions;
    coins: { [key: string]: { series: ChartSeries } };
    
    @ViewChild(ChartComponent) chart: ChartComponent;

    constructor(appService: AppService, private cryptoService: CryptoService) {
        super(appService);
        
        this.navItems = [
            { icon: 'search', component: SearchBarComponent },
            { icon: 'video', onClick: null, tooltip:'test' },
            { icon: 'list', onClick: null },
            { icon: 'settings', component: null }
        ];
    }

    ngOnInit() {
        this.cryptoService.getProducts().then(products => {
            this.coins = {};
            products.data.forEach(product => {
                this.coins[product.id] = { series: { name: product.ticker, data: [], color: CryptoColor[product.ticker], visible: product.ticker === 'BTC' } };
            
                if(this.coins[product.id].series.visible) {
                    this.cryptoService.getPrices(product.id, 300).then(prices => {
                        prices.data.reverse().forEach(price => {
                            (<[number, number][]>this.coins[product.id].series.data).push([price[0] * 1000, price[3]]);
                        });

                        //console.log(product.id, prices.data);
                        this.initChart();
                    });
                }
            });
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
                //console.log(data);
                if(coin && data.time) {
                    var seriesData = <[number, number][]>coin.series.data;
                    var time = Date.parse(data.time);

                    //update every 30s
                    if(seriesData.length === 0 || seriesData[seriesData.length - 1][0] < (time - 1000)) {
                        var point: [number, number] = [time, parseFloat(data.price)];
                        this.chart.addPoint(coin.series.name, point);
                        seriesData.push(point);
                        console.log(data.product_id, point);
                    }
                }
            }
        });
    }
}