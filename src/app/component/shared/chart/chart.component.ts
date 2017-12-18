import { Component, Input, Output, ElementRef, AfterViewInit, EventEmitter, NgZone } from '@angular/core';

import { BaseComponent } from '../base.component';
import { AppService } from 'backlive/service';
import { Common } from 'backlive/utility';
import { PlatformUI } from 'backlive/utility/ui';

declare var Highcharts;

@Component({
    selector: 'backlive-chart',
    template: `<div class="chart"></div>`,
    styles: [`
        .chart {
            width: 100%;
            height: 100%;
        }
    `]
})
export class ChartComponent extends BaseComponent implements AfterViewInit {
    @Input() options: ChartOptions;
    @Output() onSelect: EventEmitter<any> = new EventEmitter<any>();

    chart: any;
    private highChartOptions: any;

    selectedBarCategory: number = 0;
    selectedBarCategoryArray: number[] = [];
    isSliced: boolean = false;
    isRemoved: boolean;
    isArrayEmpty: boolean;

    constructor(appService: AppService, private platformUI: PlatformUI, private elementRef: ElementRef, private ngZone: NgZone) {
        super(appService);

        Highcharts.setOptions({
            lang: { thousandsSep: ',' }
        });

        /*if (Highcharts.getOptions().exporting) {
            let contextButton = Highcharts.getOptions().exporting.buttons.contextButton;
            var includedItems = ['printChart', 'downloadCSV'];
            contextButton.menuItems = contextButton.menuItems.filter((item) => {
                return includedItems.indexOf(item.textKey) > -1;
            });
        }*/
    }

    ngAfterViewInit() {
        this.chart = this.platformUI.query(this.elementRef.nativeElement).find('.chart').highcharts('StockChart', this.buildChartOptions()).highcharts();
    }

    buildChartOptions() {
        var self = this;
        this.highChartOptions = {
            chart: {
                type: this.options.type,
                options3d: { enabled: !this.options.disable3d, alpha: 0, beta: 0, depth: 20, viewDistance: 25 },
                //events: this.chartEventHandlers(),
                borderWidth: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.6)'
            },
            plotOptions: {
                series: {
                    cursor: 'pointer',
                    //point: { events: this.plotEventHandlers() },
                    dataLabels: {
                        enabled: true, formatter: function () {
                            return self.formatValueY(this.y);
                        }
                    },
                    slicedOffset: 30,
                }
            },
            credits: { enabled: false },
            legend: { enabled: true, itemStyle: { color: '#fff' } }
        };

        if (this.options.title) {
            this.highChartOptions.title = { text: this.options.title, style: { color: '#fff' } };
        }
        else {
            this.highChartOptions.title = null;
        }

        if (this.options.subtitle) {
            this.highChartOptions.subtitle = { text: this.options.subtitle };
        }

        if (this.options.colors) {
            this.highChartOptions.colors = this.options.colors;
        }

        if (this.options.type === ChartType.pie || this.options.type === ChartType.donut) {
            this.highChartOptions.legend.enabled = false;
            this.buildPieChart();
        }

        if (this.options.disableExporting) {
            this.highChartOptions.exporting = { enabled: false };
        }
        
        //format data
        if (Common.isObject(this.options.series[0].data)) { //data is in KeyValue pair format, so convert
            if (!this.options.xAxis) {
                this.options.xAxis = {};
            }

            var results = this.dataFromKeyValueSeries(this.options.series);
            this.options.xAxis.categories = results.categories;
            this.options.series = results.series;
        }

        //build axis
        this.highChartOptions.series = this.options.series;
        this.buildAxisOptions('xAxis');
        this.buildAxisOptions('yAxis');

        return this.highChartOptions; 
    }

    buildPieChart() {
        var self = this;
        this.highChartOptions.chart.options3d = { enabled: true, alpha: 30 };
        this.highChartOptions.plotOptions.pie = { cursor: 'pointer', allowPointSelect: true, depth: 45, showInLegend: true };

        if (this.options.type === ChartType.donut) {
            this.highChartOptions.chart.type = ChartType.pie;
            this.highChartOptions.plotOptions.pie.innerSize = 100;           
        }
        if (this.options.disableDatalabels) {
            this.highChartOptions.plotOptions.pie = { allowPointSelect: false };
            this.highChartOptions.plotOptions.pie.dataLabels = { enabled: false };
            this.highChartOptions.plotOptions.pie.innerSize = 100;
        }
       
        this.highChartOptions.plotOptions.series.dataLabels = {
            useHTML: true,
            connectorPadding: 5,
            formatter: function () {
                return `<span style="top:-10px;position:relative;">${self.formatValueY(this.y)} </br><b>${this.series.options.labels && this.series.options.labels[this.point.name] ? this.series.options.labels[this.point.name] : this.point.name}</b></span>`;             
            },
        };
    }

    buildAxisOptions(axis: string) {
        var self = this;
        
        if (!this.options[axis]) {
            this.options[axis] = {};
        }

        this.highChartOptions[axis] = { type: this.options[axis].type, title: this.options[axis].title };

        if (this.options[axis].categories) {
            this.highChartOptions[axis].categories = this.options[axis].categories;
        }

        if (this.options[axis].dateFormat) {
            this.highChartOptions[axis].labels = { format: '{value:' + this.options[axis].dateFormat + '}' };

            if (Highcharts.getOptions().exporting) {
                Highcharts.getOptions().exporting.csv = { dateFormat: this.options[axis].dateFormat };
            }
        }

        if(this.highChartOptions[axis].labels) {
            this.highChartOptions[axis].labels.style = { color: '#fff' };
        }
        else {
            this.highChartOptions[axis].labels = { style: { color: '#fff' } };
        }

        if (axis === 'xAxis') {
            /*this.highChartOptions.tooltip = {
                formatter: function () {
                    if (self.options.disableDatalabels) {
                        return `<span style="font-size:9px">${self.formatValueX(this.x || this.point.name)}</span>`
                            + `<br/><span style="color:${this.series.color || this.point.color}">\u25CF </span><b>${self.formatValueY(this.y)}</b>`;
                    }
                    else {
                        return `<span style="font-size:9px">${self.formatValueX(this.x || this.point.name)}</span>`
                            + `<br/><span style="color:${this.series.color || this.point.color}">\u25CF</span> ${this.series.options.tooltipLabel || this.series.name}: <b>${self.formatValueY(this.y)}</b>`;
                    }
                }
            };*/

            this.highChartOptions.legend.labelFormatter = function () {
                return this.options.labels && this.options.labels[this.name] ? this.options.labels[this.name] : this.name;
            };
        }

        if (axis === 'yAxis' && this.options.type === ChartType.column) {
            this.highChartOptions[axis].allowDecimals = this.options[axis].allowDecimals;
        }
    }

    private dataFromKeyValueSeries(series: ChartSeries[]): { categories: string[], series: ChartSeries[] } {
        var outputSeries: ChartSeries[] = [];
        var categories: string[] = [];

        var usedCategories = {};
        var categoriesIndex = {};
        var iterator = 0;
        var nextIndex = 0;

        for(var i = 0, s: ChartSeries; s = series[i]; i++) {
            var newSeries: ChartSeries = { name: s.name, data: [], tooltipLabel: s.tooltipLabel, labels: s.labels };

            for (var key in s.data) {
                if (this.highChartOptions.chart.type === ChartType.pie) {
                    (<ChartDataPoint[]>newSeries.data).push(
                        {
                            'name': key,
                            'y': s.data[key],
                            'sliced': (this.options.selected && key === this.options.selected[0]) ? true : false,
                            'selected': (this.options.selected && key === this.options.selected[0]) ? true : false
                        });
                }
                else {
                    if (!usedCategories[key]) {
                        categories.push(key);
                        categoriesIndex[key] = nextIndex++;
                        usedCategories[key] = true;
                    }

                    newSeries.data[categoriesIndex[key]] = s.data[key];
                }
            }

            if (this.options.selected && this.options.selected[0] === key) {
                for (var k in newSeries.data) {
                    if (newSeries.data[k].selected) {
                        setTimeout(() => { this.onSelect.emit(newSeries.data[k]); }, 100);
                        this.isSliced = true;
                    }
                }
            }
            else if (this.options.selected && this.options.selected[0] != key) {
                if (iterator === 0) {
                    setTimeout(() => { this.onSelect.emit(null); }, 100);
                    iterator++;
                }
            }

            outputSeries.push(newSeries);
        }

        return { categories: categories, series: outputSeries };
    }

    formatValueX(x: string) {
        return this.options.xAxis && this.options.xAxis.dateFormat ? Highcharts.dateFormat(this.options.xAxis.dateFormat, new Date(parseInt(x))) : x;       
    }

    formatValueY(y: number) {
        return (this.options.yAxis && this.options.yAxis.type === ChartAxisType.currency ? '$' : '') + Highcharts.numberFormat(y, null, null, ',');
    }

    addPoint(seriesName: string, point: [number, number]) {
        if(this.chart && this.chart.series) {
            for(var i = 0, series; series = this.chart.series.length; i++) {
                if(series.name === seriesName) {
                    series.addPoint(point);
                    console.log(series);
                }
            }
        }
    }

    chartEventHandlers() {
        var self = this;
        return {
            click: function () {
                setTimeout(() => {
                    self.ngZone.run(() => {
                        if (self.options.type != ChartType.pie && self.options.type != ChartType.donut) {
                            if (self.selectedBarCategory != 0) {
                                self.onSelect.emit(null);
                            }
                            self.selectedBarCategory = 0;

                            for(var i = 0, series: any; series = self.chart.series[i]; i++) {
                                for(var i = 0, data: any; data = series.data[i]; i++) {
                                    if (data.baseColor) {
                                        data.update({ color: data.baseColor }, true, false);
                                    }
                                }
                            }
                        }
                        else {
                            if(self.isSliced) {
                                self.onSelect.emit(null);
                            }
                        }
                    });
                }, 100);
            }
        };
    }

    plotEventHandlers() {
        var self = this;
        return {
            click: function (event) {
                if (self.options.type != ChartType.pie && self.options.type != ChartType.donut) {
                    if (self.selectedBarCategory != event.point.category && !self.options.multipleSelect) {
                        self.onSelect.emit(this.category);
                        self.selectedBarCategory = event.point.category;

                        for(var i = 0, series: any; series = self.chart.series[i]; i++) {
                            for(var i = 0, data: any; data = series.data[i]; i++) {
                                if (data.category !== self.selectedBarCategory) {
                                    if (!data.baseColor) {
                                        data.baseColor = data.color;
                                    }

                                    data.update({ color: 'rgba(200, 200, 200, 0.25)' }, true, false);
                                }
                                else if (data.baseColor) {
                                    data.update({ color: data.baseColor }, true, false);
                                }
                            }
                        }
                    }
                    else if (self.options.multipleSelect) {
                        self.selectedBarCategory = event.point.category;
                        self.processCategoryArray();

                        for(var i = 0, data: any; series = this.series.data[i]; i++) {
                            if (!self.selectedBarCategoryArray.some(column => { return column === data.category.toString(); })) {
                                if (!data.baseColor) {
                                    data.baseColor = data.color;
                                }

                                data.update({ color: 'rgba(255, 108, 47, 0.40)' }, true, false);
                            }
                        }

                        if (!self.isRemoved && !self.isArrayEmpty && this.baseColor) {
                            this.update({ color: this.baseColor }, true, false);
                        }
                        else if (self.isArrayEmpty) {
                            self.selectedBarCategory = 0;
                            self.onSelect.emit(null);

                            for(var i = 0, data: any; data = this.series.data[i]; i++) {
                                if (data.baseColor) {
                                    data.update({ color: data.baseColor }, true, false);
                                }
                            }
                        }
                        self.onSelect.emit(self.selectedBarCategoryArray);                 
                    }
                    else {
                        self.selectedBarCategory = 0;
                        self.onSelect.emit(null);

                        for(var i = 0, series: any; series = self.chart.series[i]; i++) {
                            for(var i = 0, data: any; data = series.data[i]; i++) {
                                if (data.baseColor) {
                                    data.update({ color: data.baseColor }, true, false);
                                }
                            }
                        }
                    }   
                }
                else {
                    setTimeout(() => {
                        self.ngZone.run(() => {
                            self.onSelect.emit(this.options);
                            self.isSliced = this.options.selected ? true : false;
                        });
                    }, 100);
                }
            }
        };
    }

    processCategoryArray() {
        var index = this.selectedBarCategoryArray.indexOf(this.selectedBarCategory);
        if (index === -1) {
            this.selectedBarCategoryArray.push(this.selectedBarCategory);
            this.isRemoved = false;
        }
        else {
            this.selectedBarCategoryArray.splice(index, 1);
            this.isRemoved = true;
            this.isArrayEmpty = this.selectedBarCategoryArray.length === 0;
        }
    }
}

export interface ChartOptions {
    type: string;
    series: ChartSeries[];
    title?: string;
    subtitle?: string;
    xAxis?: ChartAxis;
    yAxis?: ChartAxis;
    colors?: string[];
    plotOptions?: string[];
    disable3d?: boolean;
    multipleSelect?: boolean;
    selected?: (string | number)[];
    disableDatalabels?: boolean;
    disableExporting?: boolean;
}

export interface ChartAxis {
    title?: string;
    type?: string;
    categories?: string[];
    dateFormat?: string;
    allowDecimals?: boolean;
}

export class ChartAxisType {
    static datetime: string = 'datetime';
    static currency: string = 'currency';
}

export interface ChartSeries {
    name?: string;
    data: ChartData;
    tooltipLabel?: string;
    labels?: { [key: string]: string };
}

declare type ChartData = number[] | [number | string, number][] | ChartDataPoint[] | ChartKeyValueData;

export interface ChartDataPoint {
    name?: string;
    y?: number; 
    color?: string;
    sliced?: boolean;
    selected?: boolean;
}

export interface ChartKeyValueData {
    [key: string]: number;
}

export class ChartType {
    static column: string = 'column';
    static line: string = 'line';
    static area: string = 'area';
    static pie: string = 'pie';
    static donut: string = 'donut';
}