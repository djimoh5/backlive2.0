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
            { icon: 'video', onClick: () => this.test(), tooltip:'test' },
            { icon: 'list', onClick: () => this.test() },
            { icon: 'settings', component: null }
        ];

        this.coins = {
            'BTC-USD': {  series: { name: 'BTC', data: [] } },
            'ETH-USD': { series: {  name: 'ETH', data: [], visible: false } },
            'LTC-USD': { series: {  name: 'LTC', data: [], visible: false } }
        }
    }

    ngOnInit() {
        var series: ChartSeries[] = [];

        for(var productId in this.coins) {
            series.push(this.coins[productId].series);
        }

        this.chartOptions = {
            type: ChartType.area,
            series: series,
            xAxis: { type: ChartAxisType.datetime/*, dateFormat: '%b %Y'*/ },
            title: 'Cryptocurrencies',
            colors: [CryptoColor.BTC, CryptoColor.ETH, CryptoColor.LTC],
            disable3d: true,
            yAxis: { allowDecimals: true }
        };

        this.cryptoService.ticker.subscribe((data: CryptoTicker) => {
            if(this.chart) {
                var coin = this.coins[data.product_id];
                //console.log(data);
                if(coin && data.time) {
                    var price = parseFloat(data.price);
                    this.chart.addPoint(coin.series.name, [new Date(data.time).getTime(), parseFloat(data.price)]);
                    (<[number, number][]>coin.series.data).push([new Date(data.time).getTime(), price]);

                    //TODO: for all other coins, add the last value again for this time
                }
            }
        });
    }

    test() {

    }
}