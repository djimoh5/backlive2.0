import {Component, View, bootstrap} from 'angular2/angular2';

@Component({
    selector: 'chart'
})
@View({
    templateUrl: '/view/chart.html'
})
export class ChartComponent {
    currRegime: string = null;
    indicators: Object;
    firstChart: boolean = true;
    lowerAxis: number = 10;
    loading: boolean = true;
    
    constructor () {
        
    }
    
    init (callback, startDate, endDate) {
        this.chart = null;
        this.maxDate = new Date();
        this.series = {};
        this.seriesName = {};
        this.index = 0;
        this.ticker = 0;
    
        $('.chart_use_perc').click(function() {
            if($('.chart_use_perc').hasClass('active'))
                $('.chart_use_perc').removeClass('active')
            else
                $('.chart_use_perc').addClass('active')
            
            this.reloadChart();
        });
        
        $('.chart_use_perc').tooltip({ title:"Turn on to view % changes vs beginning of time range", placement:"bottom" });
        $('.chart_allow_mult').tooltip({ title:"Turn on to enable charting and comparison of multiple series", placement:"bottom" });
        
        $('.btn_chart_clear').tooltip({ title:"Clear chart", placement:"bottom" });
        $('.btn_chart_corr').click(this.showCorrelationMatrix).tooltip({ title:"View correlation matrix for selected stocks", placement:"right" });
        
        //technicals
        $('.btn_show_technicals').tooltip({ title:"Add technical indicators on your chart", placement:"bottom" });
        $('.btn_show_technicals').click(function() { this.showChartBtns('.btn_show_technicals', '.btn-technicals'); });
        
        $('.btn-technicals button').each(function() {
            $(this).tooltip({ title:$(this).attr('data-title'), placement:"bottom", container:"body" });
        });
        
        //regime
        $('.btn_show_regime').tooltip({ title:"Highlight periods of outperformance by specific segments of the market", placement:"bottom" });
        $('.btn_show_regime').click(function() { this.showChartBtns('.btn_show_regime', '.btn-regime'); });
        $('#bt_regime_toggle button').click(this.showRegimeBand);
        
        $('.btn-regime button').each(function() {
            $(this).tooltip({ title:$(this).attr('data-title'), placement:"bottom", container:"body" });
        });
        
        /*$('.chart_tech .btn').click(function() {
            this.loadTechIndicator($(this).val());
        });*/
        
        $('#rangeSelector button').click(function() {
            this.rangeSelect(parseInt($(this).val()));
        });
        
        this.initChart(true, callback, startDate, endDate);
    }
    
    showChartBtns(btn, btnGroup) {
        var active = btn && $(btn).hasClass('active');
        $('.graph-controls .btn-hide').removeClass('active');
        $('.graph-controls .btn-group-hide').hide();
        
        if(btn) {
            if(active)
                $(btn).removeClass('active');
            else {
                $(btn).addClass('active');
                if(btnGroup) {
                    $(btnGroup).show();
                    $('.btn-group-hide-container').show();
                }
            }
        }

    }
    
    allowMult() {
        return true; //$('.chart_allow_mult').hasClass('active');
    }
    
    allowMultOff() {
        $('.chart_allow_mult').removeClass('active');    
    }
    
    allowMultOn() {
        $('.chart_allow_mult').addClass('active');    
    }
    
    isRelative() {
        return $('.chart_use_perc').hasClass('active');
    }
    
    relativeOff() {
        $('.chart_use_perc').removeClass('active')
    }
    
    relativeOn() {
        $('.chart_use_perc').addClass('active');
    }
	
	create(tkr, id) {
        if(!this.indicators[tkr])
            this.indicators[tkr] = {};
        
        return '<a class="btn btn_chart btn-primary" onclick="RM.Charter.slideGraph(this); RM.Charter.addChartSeries(\'' + tkr + '\', \'' + id + '\', null, this);">graph</a>';
	}
    
    clear(relative, callback) {
        this.firstChart = false;
        this.index = 0;
        //this.ticker = 0;
        this.series = {};
        
        $('.chart_tech .btn').removeClass('active');
        $('.btn-technicals .btn').removeClass('active');
        $('.tbl_picks td.highlight').removeClass('highlight');
        $('.tbl_picks td .btn_chart').html('graph');
        
        while(this.chart.series.length > 0) {
            if(this.chart.series[0].name != 'Navigator')
                this.chart.series[0].remove(false);
            else if(this.chart.series.length > 1)
                this.chart.series[1].remove(false);
            else
                break;
        }
            
        //finish
        if(relative && !this.isRelative()) {
            this.relativeOn();
            this.initChart(false, callback);
        }
        else if(!relative && this.isRelative()) {
            this.relativeOff();
    	    this.initChart(false, callback);
        }
        else {
            //clear and rebuild y-axis
            while(this.chart.yAxis.length > 0) {
                this.chart.yAxis[0].remove();
            }
            
            var yAxis = this.createAxis();
            
            for(var i = 0, len = yAxis.length; i < len; i++) {
                this.chart.addAxis(yAxis[i]);
            }

            if(callback)
                callback();
        }
        
        //$('#news_ratios .chart_on').removeClass('chart_on');
    }
    
    removeIndicator(id) {
        for(var tkr in this.indicators) {
            delete this.indicators[tkr][id];
        }
    }
    
    addSearchChartSeries(span) {
        var data = JSON.parse($(span).next().html().htmlDecode());
        var id = (new Date()).getTime();
        
        RM.indicators[id] = { indicator:data, name:$(span).html().htmlDecode(), tmp:true };
                        
        $('.search_ratio_inp').val('');
        this.addChartSeries(this.ticker, id);
    }
    
    addChartSeries(tkr, id, callback, btn) { 
        //this.chart.showLoading();
        RM.ui.showMainView(false);
        RM.ui.closeIntroPopup();
        
        $('#news_ratios .popover').hide();
        
        if(!this.ticker || this.ticker == tkr || !this.firstChart)
            chart();
        else {
            this.firstChart = false;
            this.loading = false;
            this.ticker = tkr;
            this.clear(false, chart);
        }
        
        /*if(!this.allowMult()) {
            $('.tbl_picks td.highlight').removeClass('highlight');
            $('.tbl_picks td .btn_chart').html('graph');
            this.clear(false, chart);
        }
        else
            chart();*/
        
        function chart() {
            this.ticker = tkr;
            
            if(this.exists(tkr, id)) {
                if(btn) {
                    this.remove(tkr, id);
                    $(btn).parent().removeClass('highlight');
                    $(btn).html('graph');
                }
            }
            else {
                $(btn).parent().addClass('highlight');
                $(btn).html('remove');
                
                if(!this.indicators[tkr])
                    this.indicators[tkr] = {};
   
                if(this.indicators[tkr][id]) {
                    if(tkr == RM.defaultTicker)
                        this.loadChartSeries(tkr, id, this.getSeriesName("S&P500", id), RM.ui.activeTab() == 'backtest');
                    else {
                        this.loadChartSeries(tkr, id);
                        //if(id == 1) RM.sec.xbrl(tkr, true);
                    }
                }
                else {
                    RM.modal.loading(true);
                    var tmpInd = {}; tmpInd[id] = RM.indicators[id];
                    var query = { "ticker":tkr, "indicators":tmpInd };
                    var data = [];
                    
                    if(id != 1) {
                        RM.api(query, 'data/indicators', function(results) {
                            var ticker = results.tickers[BACKTEST_DATE];
                            results = results[id];
        
                            var keys = sortKeys(results);
                            var indicator = RM.indicators[id];
                            
                            if(indicator.indicator.aggrType && indicator.indicator.aggrType != 'val') {
                                var aggrYrs = { '01':[], '02':[], '03':[], '04':[], '05':[], '06':[], '07':[], '08':[], '09':[], '10':[], '11':[], '12':[] };
                                var prevMonth = '00', month;
                                var span = indicator.indicator.aggrSpan;
                                
                                for(var i = 0, cnt = keys.length; i < cnt; i++) {
                                    var month = keys[i].substring(4, 6);
                                    
                                    if(month != prevMonth) {
                                        aggrYrs[month].push(results[keys[i]]);
                                    }
                                    else
                                        aggrYrs[aggrYrs[month].length - 1] = results[keys[i]]; //replace current month value with latest date
                                        
                                    if(aggrYrs[month].length >= span) {
                                        var val = Aggregator(aggrYrs[month], indicator.indicator.aggrType, indicator.indicator.aggrSpan);
                                        data.push({ date:keys[i], val:val });
                                    }
                                    
                                    prevMonth = month;
                                }
                            }
                            else {
                                for(var i = 0, cnt = keys.length; i < cnt; i++) {
                                    data.push({ date:keys[i], val:results[keys[i]] });
                                }
                            }
                            
                            this.indicators[tkr][id] = data;
                            this.loadChartSeries(tkr, id);
                            
                            RM.modal.loading(false);
                            
                            if(callback)
                                callback(data);
                        }, true);
                    }
                    else {
                        RM.api({ "ticker":tkr, years:10 }, 'data/prices', function(results) {
                            for(var i = 0, cnt = results.length; i < cnt; i++) {
                                data.push({ date:results[i].date, val:results[i].adjClose, close:results[i].close, high:results[i].high, low:results[i].low, volume:results[i].volume });
                            }
                          
                            this.indicators[tkr][id] = data;
                            
                            if(tkr == "SP500") {             
                                this.nextColor = '#12455a';
                                this.loadChartSeries(tkr, id, this.getSeriesName("S&P500", id));
                            }
                            else {
                                this.loadChartSeries(tkr, id);
                            }
                            
                            RM.modal.loading(false);

                            if(callback)
                                callback(data);
                        });
                    }
                }
            }
        }
    }
    
    getSeriesName(name, id) {
        if(name && name.substring(0, 4) == 'SCT_')
            name = RM.getSectorName(name.substring(4, 6));
            
        return (RM.indicators[id].category == 'Macro' ? '' : (name + " ")) + (id == 1 ? '' : RM.indicators[id].name);
    }
    
    loadTechIndicator(ti) {
        RM.ui.showMainView(false);
        
        var tkr = this.ticker;
        var data = this.indicators[tkr][1];
        var key = '1_' + ti;
        
        if(this.exists(tkr, key)) {
            this.series[tkr][key].remove(true);
            delete this.series[tkr][key];
            
            if(key == '1_boll') {
                this.series[tkr][key + 'u'].remove(true);
                delete this.series[tkr][key + 'u'];
                this.series[tkr][key + 'l'].remove(true);
                delete this.series[tkr][key + 'l'];
            }
            else if((key == '1_macd')) {
                this.series[tkr][key + 's'].remove(true);
                delete this.series[tkr][key + 's'];
            }
            else if((key == '1_donch')) {
                this.series[tkr][key + 'u'].remove(true);
                delete this.series[tkr][key + 'u'];
                this.series[tkr][key + 'l'].remove(true);
                delete this.series[tkr][key + 'l'];
            }
        }
        else {
            RM.modal.loading(true);
            
            switch(ti) {
                case 'vol':
                    if(!this.indicators[tkr][key])
                        this.indicators[tkr][key] = data.percentChange().volatility(20, 252);
                    this.loadChartSeries(tkr, key, 'Volatility', true, this.lowerAxis);
                    break;
                case 'rsi':
                    if(!this.indicators[tkr][key])
                        this.indicators[tkr][key] = data.rsi(14, 252);
                    this.loadChartSeries(tkr, key, 'RSI 14', true, this.lowerAxis);
                    break;
                case 'boll':
                    if(!this.indicators[tkr][key]) {
                        var boll = data.bollinger(20);
                        this.indicators[tkr][key] = boll.middle;
                        this.indicators[tkr][key + 'u'] = boll.upper;
                        this.indicators[tkr][key + 'l'] = boll.lower;
                    }
                    
                    this.nextColor = '#12455a'; this.loadChartSeries(tkr, key, 'Boll Mid', true, 0);
                    this.nextColor = '#FF6633'; this.loadChartSeries(tkr, key + 'u', 'Boll Up', true, 0);
                    this.nextColor = '#FF6633'; this.loadChartSeries(tkr, key + 'l', 'Boll Low', true, 0);
                    break;
                case 'sma50':
                    if(!this.indicators[tkr][key])
                        this.indicators[tkr][key] = data.sma(50);
                    this.loadChartSeries(tkr, key, '50 Day SMA', true, 0);
                    break;
                case 'sma100':
                    if(!this.indicators[tkr][key])
                        this.indicators[tkr][key] = data.sma(100);
                    this.loadChartSeries(tkr, key, '100 Day SMA', true, 0);
                    break;
                case 'sma200':
                    if(!this.indicators[tkr][key])
                        this.indicators[tkr][key] = data.sma(200);
                    this.loadChartSeries(tkr, key, '200 Day SMA', true, 0);
                    break;
                case 'atr':
                    if(!this.indicators[tkr][key])
                        this.indicators[tkr][key] = data.atr(14, 20);
                    this.loadChartSeries(tkr, key, 'ATR 20 Days', true, this.lowerAxis);
                    break;
                case 'volume':
                    if(!this.indicators[tkr][key])
                        this.indicators[tkr][key] = data.volume();
                    this.loadChartSeries(tkr, key, 'volume', true, this.lowerAxis);
                    break;
                case 'mf':
                    if(!this.indicators[tkr][key])
                        this.indicators[tkr][key] = data.moneyFlow(20);
                    this.loadChartSeries(tkr, key, 'Money Flow 20 Days', true, this.lowerAxis);
                    break;
                case 'macd':
                    if(!this.indicators[tkr][key]) {
                        var macd = data.macd();
                        this.indicators[tkr][key] = macd;
                        this.indicators[tkr][key + 's'] = macd.sma(9);
                    }
                    
                    this.loadChartSeries(tkr, key, 'MACD', true, 2);
                    this.loadChartSeries(tkr, key + 's', 'MACD Signal', true, this.lowerAxis);
                    break;
                case 'ema50':
                    if(!this.indicators[tkr][key])
                        this.indicators[tkr][key] = data.ema(50);
                    this.loadChartSeries(tkr, key, '50 Day EMA', true, 0);
                    break;
                 case 'donch':
                    if(!this.indicators[tkr][key]) {
                        var donch = data.donchian(20);
                        this.indicators[tkr][key] = donch.middle;
                        this.indicators[tkr][key + 'u'] = donch.upper;
                        this.indicators[tkr][key + 'l'] = donch.lower;
                    }
                    
                    this.loadChartSeries(tkr, key, 'Donchian', true, 0);
                    this.nextColor = '#4791a7'; this.loadChartSeries(tkr, key + 'u', 'Donchian High', true, 0);
                    this.nextColor = '#4791a7'; this.loadChartSeries(tkr, key + 'l', 'Donchian Low', true, 0);
                    break;
            }
            
            RM.modal.loading(false);
        }
    }
    
    loadChartSeries(tkr, id, name, forceMultSeries, yAxis, navigator) {
        var numSeries = 0, hasLowerY = false;
        
        for(var key in this.series) {
            for(var key2 in this.series[key]) {
                if(this.series[key][key2].yAxisIndex == this.lowerAxis)
                    hasLowerY = true;
                else
                    numSeries++; //only count series on main yAxis
            }
        }
        
        if(this.isRelative()) {
            this.loadChartSeriesHelper(tkr, id, name, yAxis, hasLowerY);
        }   
        else {
            if(numSeries == 0 || forceMultSeries || yAxis)
                this.loadChartSeriesHelper(tkr, id, name, yAxis, hasLowerY);
            else {
                if(numSeries < this.lowerAxis) {
                    yAxis = numSeries;
                    this.loadChartSeriesHelper(tkr, id, name, yAxis, hasLowerY);
                }
                else {
                    //more than max series (as determined by this.lowerAxis value), so switch to relative mode
                    this.relativeOn();
                    this.reloadChart(function() { this.loadChartSeriesHelper(tkr, id, name, yAxis, hasLowerY); });
                }
            }
        }
    }
    
    loadChartSeriesHelper(tkr, id, name, yAxis, hasLowerY) {
        this.index = id;
        var name = name ? name : this.getSeriesName(tkr, id);
        var data = this.getChartData(this.indicators[tkr][id], id != 1 && yAxis != this.lowerAxis);
        var series = { name:name, id:(tkr + '_' + id), yAxis:yAxis ? yAxis : 0, data:data.data };
        
        if(yAxis && yAxis == this.lowerAxis) {
            for(var i = 0; i < this.lowerAxis; i++) {
                this.chart.yAxis[i].options.height = '65%';
            }
        }
        else if(!hasLowerY) {
            for(var i = 0; i < this.lowerAxis; i++) {
                this.chart.yAxis[i].options.height = '100%';
            }
        }

        if(this.nextColor) {
            series.color = this.nextColor;
            this.nextColor = null;
        }
        
        this.chart.addSeries(series, true);
        
        if(!this.series[tkr]) {
            this.series[tkr] = {};
            this.seriesName[tkr] = {};
        }

        this.series[tkr][id] = this.chart.series[this.chart.series.length - 1];
        this.series[tkr][id].yAxisIndex = yAxis ? yAxis : 0;
        this.seriesName[tkr][id] = name;
        
        //make labels same color as series
        this.chart.yAxis[yAxis ? yAxis : 0].update({ labels: { style: { color:this.series[tkr][id].color, fontWeight:'bold' } } });

        if(tkr == 'backtest') {
            this.chart.xAxis[0].setExtremes(parseDate(RM.Backtest.test.startYr.toString(), 3).getTime(), parseDate(RM.Backtest.test.endYr.toString(), 3).getTime());                    
        }
        else {
            this.chart.xAxis[0].setExtremes($('#chart_min_date').datepicker("getDate").getTime(), $('#chart_max_date').datepicker("getDate").getTime());
        }
        
        this.updateChartRange();
        
        if(tkr != RM.defaultTicker) {
            mixpanel.track('chart', { ticker:tkr, id:id, name:name });
		    mixpanel.people.increment('chart');
        }
    }
    
    getChartData(points, notDaily) {
        var start, end;
        
        start = $('#chart_min_date').datepicker("getDate").format(1);
        end = $('#chart_max_date').datepicker("getDate").format(1);
        
        if(start == end) {
            start = parseDate(RM.Backtest.test.startYr.toString(), 3).format(1);
            end = parseDate(RM.Backtest.test.endYr.toString(), 3).format(1);
        }
            
        var data = [];
    	var yMin, yMax;

		//normalize to 100,000
		var scale = 1; //100000 / data[0].val;
        var first = null;
        var isRelative = this.isRelative();
        
        var allDays = this.indicators[RM.defaultTicker][1], daysIndex = 0;
        var prevPoint;
        
		for(var i = 0, cnt = points.length; i < cnt; i++) {
			var point = points[i];
			
			if(point.date != null && point.val != null && point.val != NO_VALUE) {   
				point.date = point.date.toString();
				var price = point.val * scale;
                var dateInt = parseInt(point.date);

                if(notDaily) {
    				//first fill in any missing days
    				var currDay = parseInt(allDays[daysIndex++].date.toString());
    				while(currDay < dateInt) {
    				    if(prevPoint)
    				        data.push([parseDate(currDay, 3).getTime(), prevPoint.val]);
    				        
    				    currDay = parseInt(allDays[daysIndex++].date.toString());
    				}
                }
				
				//set current day
				data.push([parseDate(dateInt, 3).getTime(), point.val]);// ? point.val : .0001]);
                
                if(dateInt >= start && dateInt < end) {
                    if(isRelative) {
                        if(first == null)
                            first = price;
                        price = (price / first - 1) * 100;
        		    }
                    
    				if(!yMin || price < yMin)
    					yMin = price;                                      
                    else if(!yMax || price > yMax)
                        yMax = price;
                }
                
                prevPoint = point;
			}
		}
		
		//transform if negative logarithmic
		/*if(isRelative) {
		    var adj = yMin <= 0 ? ((yMin * -1) + 1) : 0;
		    
		    for(var i = 0, cnt = data.length; i < cnt; i++) {
		       data[i][1] = (data[i][1] / first - 1) * 100 + adj;
		    }
		}
		
		console.log(yMin, data);*/

        //console.log({ data:data, yMin:yMin, yMax:yMax });
        return { data:data, yMin:yMin, yMax:yMax };
    }
    
    rangeSelect(range) {
        var start;
        
        if(range > 0) {
            start = new Date();
            start.setDate(start.getDate() - range);
        }
        else if(range == 0) {
            start = new Date();
            start = new Date(start.getFullYear(), 0, 1);
        }
        else
            start = this.minDate;
        
        this.setDateRange(start, this.maxDate);
    }
    
    setDateRange(start, end) {
        $('#chart_min_date').val(start.format(2));
        $('#chart_max_date').val(end.format(2));
        
        this.chart.xAxis[0].setExtremes(start.getTime(), end.getTime());
        this.updateChartRange();
    }

    reloadChart(callback) {
        this.initChart(false, callback);
    }
    
    exists(tkr, id) {
        if(this.series[tkr] && this.series[tkr][id])
            return true;
        else
            return false;
    }
    
    remove(tkr, id) {
        this.series[tkr][id].remove(true);
        delete this.series[tkr][id];
    }
    
    updateChartRange() {
        var axis = [];
        for(var i = 0; i <= this.lowerAxis; i++) {
            axis.push({ yMin:9999999, yMax:0 });
        }
        
        setTimeout(function() {
            var data;
            
            for(var tkr in this.series) {
                for(var id in this.series[tkr]) {
                    if(this.series[tkr][id].visible && this.indicators[tkr][id]) {
                        data = this.getChartData(this.indicators[tkr][id]);
                        var y = this.series[tkr][id].yAxisIndex;
                        
                        if(data.yMin < axis[y].yMin)
                            axis[y].yMin = data.yMin;
                        
                        if(data.yMax > axis[y].yMax)
                            axis[y].yMax = data.yMax;
                    }
                }
            }
            
            for(y = 0; y < this.lowerAxis; y++) {
                if(axis[y].yMin < axis[y].yMax) {
                    var minMax = this.chart.yAxis[y].getExtremes();
        
                    if(axis[y].yMin != minMax.min || axis[y].yMax != minMax.max) {
                        this.chart.yAxis[y].setExtremes(axis[y].yMin, axis[y].yMax);
                    }
                }
            }
        }, 500);
	}
    
    selectDate() {
        var xMin = $('#chart_min_date').datepicker("getDate").getTime();
        var xMax = $('#chart_max_date').datepicker("getDate").getTime();
        
        //reset date textboxes to their date value in case user clicked enter
        $('#chart_min_date').val($('#chart_min_date').datepicker("getDate").format(2));
        $('#chart_max_date').val($('#chart_max_date').datepicker("getDate").format(2));

        $('#chart_min_date').blur().datepicker("hide");
        $('#chart_max_date').blur().datepicker("hide");

    	this.chart.xAxis[0].setExtremes(xMin, xMax);
        this.updateChartRange();
	}
    
    getDataInRange(data) {
        var subData = [], startFound = false;
        var startDate = (new Date(this.chart.xAxis[0].getExtremes().min)).format();
        var endDate = (new Date(this.chart.xAxis[0].getExtremes().max)).format();

        for(var i = 0, len = data.length; i < len; i++) {
            if(parseInt(data[i].date) >= endDate) {
                subData.push({ date:data[i].date, val:data[i].val });
                break;
            }
            else if(startFound) {
                subData.push({ date:data[i].date, val:data[i].val });
            }
            else if(parseInt(data[i].date) >= startDate) {
                subData.push({ date:data[i].date, val:data[i].val });
                startFound = true;
            }  
        }
        
        return subData;
    }
    
    showRegimeBand() {
        //remove existing bands
        var bandIds = [];
        $.each(this.chart.xAxis[0].plotLinesAndBands, function(i, band) { bandIds.push(band.id); });//array gets spliced so need to store ids first
        $.each(bandIds, function(i, id) { this.chart.xAxis[0].removePlotBand(id); });
        
        var regime = $(this).val();
        var bands = [], band;
        
        if(regime == 'hv' || regime == 'lv') {
            //plot high volatility bands
            var useHVol = regime == 'hv';
            var data = this.indicators[RM.defaultTicker][1].percentChange().volatility(20, 252);
            
            var avg = data.averagex();
            var stdDev = data.stdDevx();
            var threshH = avg + (stdDev / 2);
            var threshL = avg - (stdDev / 2);
            
            console.log(avg, stdDev, threshH, threshL);
            var len = data.length;
                       
            $.each(data, function(i, vol) {
                if(band) {
                    if((useHVol && vol.val < threshH) || (!useHVol && vol.val > threshL) || i + 1 >= len) {
                        band.to = parseDate(data[i].date, 3) //set previous date as being end date
                        bands.push(band);
                        this.chart.xAxis[0].addPlotBand(band);
                        band = null;
                    }
                }
                else if((useHVol && vol.val > threshH) || (!useHVol && vol.val < threshL)) { //open band
                    //console.log(vol.date);
                    band = { from:parseDate(vol.date, 3), color:'rgba(68, 170, 213, .2)', id:('band' + vol.date) }
                }
            });
            
            this.currRegime = bands;
        }
        else if(regime != 'a') {
            var tkrs = [];
            if(regime == 'sc' || regime == 'lc') {
                tkrs = ['IWM', RM.defaultTicker];
            }
            else if(regime == 'v' || regime == 'g') {
                tkrs = ['IVE', 'IVW'];
            }
            
            if(this.indicators[tkrs[0]] && this.indicators[tkrs[1]])
                plotBands();
            else {
                var numTkrs = 2;
                $.each(tkrs, function(i, tkr) {
                    var data = [];
                    
                    RM.api({ "ticker":tkr }, 'data/prices', function(results) {
                        for(var j = 0, cnt = results.length; j < cnt; j++) {
                            data.push({ date:results[j].date, val:results[j].adjClose });
                        }
                        
                        if(!this.indicators[tkr])
                            this.indicators[tkr] = {};
                        this.indicators[tkr][1] = data;
                        
                        if(--numTkrs == 0)
                            plotBands();
                    });
                });
            }
            
            function plotBands() {
    			var series = this.alignSeries(this.indicators[tkrs[0]][1], this.indicators[tkrs[1]][1]);
    			var start = 0, end = series[0].length, next;
    			var period = 63; //trading days in one quarter
    			var ret1, ret2;
    			var firstRet = regime == 'sc' || regime == 'v';
    			
    			while(start < end) {
    				if(start + period < end)
    					next = start + period;
    				else
    					next = end - 1;
    				
    				ret1 = series[0][next].val / series[0][start].val;
    				ret2 = series[1][next].val / series[1][start].val;
    				
    				if(band) {
    					if((firstRet && ret1 < ret2) || (!firstRet && ret2 < ret1) || next == end - 1) {
    						band.to = parseDate(series[0][start].date, 3) //set previous date as being end date
    	                    bands.push(band);
    	                    this.chart.xAxis[0].addPlotBand(band);
    	                    band = null;
    					}
    				}
    				else if((firstRet && ret1 > ret2) || (!firstRet && ret2 > ret1)) { //open band
    				    var date = series[0][start].date;
    					band = { from:parseDate(date, 3), color:'rgba(68, 170, 213, .2)', id:('band' + date) };
    				}
    				
    				start = next + 1;
    			}
    
    			this.currRegime = bands;
            }
        }
        else
            this.currRegime = null;
    }
    
    alignSeries(series1, series2) {
    	var s1, s2, ns1 = [], ns2 = [];
    	var flipped; //whether or not we had to flip the series
    	
    	if(series1.length < series2.length) {
    		s1 = series1;
    		s2 = series2;
    		flipped = false;
    	}
    	else {
    		s1 = series2;
    		s2 = series1;
    		flipped = true;
    	}
    	
    	var j = 0;
    	var jlen = s2.length;
    	
    	for(var i = 0, len = s1.length; i < len; i++) {
    		while(j < jlen) {
    			if(s1[i].date == s2[j].date) { //match, store dates
    				ns1.push(s1[i]);
    				ns2.push(s2[j]);
    				j++;
    				break;
    			}
    			else if(s2[j].date > s1[i].date) { //s2 is ahead so break out and go to next s1
    				break;
    			}
    			else
    			    j++;
    		}
    	}
    	
    	return flipped ? [ns2, ns1] : [ns1, ns2];
    }
    
    showCorrelationMatrix() {
        $('#corr_matrix table').empty();
        var row = $('<tr></tr>').append('<th></th>');

        //add header row
        for(var tkr in this.series) {
            for(var id in this.series[tkr]) {
                row.append('<th>' + this.seriesName[tkr][id] + '</th>');
            }
        }
        
        $('#corr_matrix table').append(row);
        
        //build correlation matrix
        for(var tkr1 in this.series) {
            for(var id1 in this.series[tkr1]) {
                var row = $('<tr></tr>').append('<th>' + this.seriesName[tkr1][id1] + '</th>');
                var data1 = this.getDataInRange(this.indicators[tkr1][id1]).percentChange();

                for(var tkr2 in this.series) {
                    for(var id2 in this.series[tkr2]) {
                        var corr;
                        if(tkr1 != tkr2 || id1 != id2) {
                            var data2 = this.getDataInRange(this.indicators[tkr2][id2]).percentChange();
                            var data = [data1, data2];
                            corr = data.correlationx();
                        }
                        else
                            corr = 1;
                    
                        row.append('<td>' + RM.round(corr, 2) + '</td>');
                    }
                }
                
                $('#corr_matrix table').append(row);
            }
        }
        
        RM.modal.open('#corr_matrix', 'Correlation Matrix');
    }
    
    addNewsFlags(news) {
        var data = [];
        
        if(this.flagSeries) {
            try {
                this.flagSeries.remove(); //if series it was on is gone, will get error when removed
            } catch(ex) {};
        }
        
        for(var i = news.length - 1; i >= 0; i--) {
            if(news[i].date != null || news[i].time != null) {
                //if(news[i].txt)
                data.push({x:(news[i].date ? Date.parse(news[i].date) : news[i].time), title:'<a href="' + news[i].link + '">' + news[i].title + '</a>', text:'<a href="javascript:this.clickNewsFlag(\'' + news[i].link + '\')">' + (news[i].txt ? news[i].txt : 'view') + '</a>' }); //('<a href="' + news[i].link + '" target="_blank">' + news[i].txt + '</a>') });
            }
        }
        
        if(data.length > 0) {
            this.chart.addSeries({ type:'flags', name:this.ticker + " filings", data:data, onSeries:(this.ticker + '_1'), shape:'squarepin' }, true);
            this.flagSeries = this.chart.series[this.chart.series.length - 1];
        }
    }
    
    clickNewsFlag(lnk) {

    }
    
    initChart(init, callback, startDate, endDate) {
        //if(init || RM.Backtest.test.startYr) {
            if(this.chart != null)
                this.chart.destroy();
            
            var today, start;
            
            if(startDate && endDate) {
                today = endDate;
                start = startDate;
            }
            else {
                today = new Date();
                start = new Date();
                start.setDate(start.getDate() - (365 * 3));
            }
            
            
            this.flagSeries = null;
            var yAxis = this.createAxis();
            
        	this.chart = new Highcharts.StockChart({
    		     chart: { renderTo: 'backtest_chart', type:"areaspline", backgroundColor: null, spacingBottom:55, animation: { duration:5000, easing:'swing' },
    		    	 zoomType:'x',
    		    	 resetZoomButton: { theme:{ display: 'none' }, position: { x:-20, y:40 } },
    		    	 events: {
                         addSeries: function(event) {
                            this.chart.hideLoading();    
                         },
                         selection: function(event) {
                             setTimeout(function() {
                                var minMax = event.target.xAxis[0].getExtremes();

                                if(minMax.min) {
                                    $('#chart_min_date').val((new Date(minMax.min)).format(2));
                        	        $('#chart_max_date').val((new Date(minMax.max)).format(2));
                                    this.updateChartRange();
                                }
                             }, 1000);
                         },
    		             load: function() {	
                             //$('#backtest_chart').append('<i id="btn_exp_chart" class="' + ($('#backtest_chart').height() == 250 ? 'icon-resize-full' : 'icon-resize-small') + '" onclick="this.expandChart(this)"></i>');
                             
                             if(init) {
                                 $('#chart_min_date').datepicker({ onSelect:this.selectDate, minDate:new Date(2003, 0, 1), maxDate:'today' });
                             	 $('#chart_max_date').datepicker({ onSelect:this.selectDate, minDate:new Date(2003, 0, 1), maxDate:'today' });                    
        
            	         	     // Set the datepicker's date format
            	         		 $.datepicker.setDefaults({
            	         		    changeYear:true,
                                    changeMonth:true 
            	         		 });
                             }
                             
    	         		     //init chart date
    	         		     setTimeout(function() {
    	         		         //this.chart.showLoading();
                                 
                                 if(this.chart.series.length > 0)
                                    this.chart.series[0].remove(false);
     
    	         		    	 if(init) {
                                    this.minDate = new Date(2003, 1, 1);
                                    
                                    $('#chart_min_date').val(start.format(2));
                        		    $('#chart_max_date').val(today.format(2));
                        		    
                        		    this.addChartSeries(RM.defaultTicker, 1);
    	         		    	 }
    	         		    	 else {
                                    for(var tkr in this.series) {
                                        for(var id in this.series[tkr]) {
                                            //RM.log('Redrawing Chart Series: ' + tkr + ' - ' + id);
                                            var yAxisIndex = this.series[tkr][id].yAxisIndex;
                                            delete this.series[tkr][id];
                                            
                                            this.loadChartSeries(tkr, id, this.seriesName[tkr][id], true, yAxisIndex);
                                        }
                                    }

     	         		    		this.updateChartRange();
    	         		    	 }
                                  
                                 if(callback)
                                    callback();
                             });
    		             }
    		         }
    		     },
    		     /*colors:['#12455a'],*/
    	         title: { text: '' },
    	         rangeSelector: { selected:5, enabled:false },
    	         navigator: { enabled:false, height:12,
                    handles: {
                		backgroundColor: '#eee',
        	    		borderColor: '#bbb'
        	    	},
                    outlineColor:'#fff',
                    xAxis: { gridLineWidth:0 }
                 },
    	         xAxis: { 
    	            min: parseDate(20030101, 3).getTime(),
                    type: 'datetime', maxZoom: 14 * 24 * 3600  * 1000,
                    dateTimeLabelFormats:{ day:"%b %e '%y", week:"%b %e '%y" },
                    plotBands: this.currRegime ? this.currRegime : []
                 }, //,tickInterval: 24 * 3600 * 1000 }, THIS BROKE THE CHART!!!
    	         yAxis: yAxis,
    	         series: [{ name:"BackLive", yAxis:0, data:[[start.getTime(), 1], [today.getTime(), 1]] }],
    			 credits:{ enabled: false },
    			 legend: { enabled:true, verticalAlign:'bottom', align:'center', floating:true, x:165, y:-24 },
    			 tooltip: { 
                     pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b>' + (this.isRelative() ? ' ({point.change}%)<br/>' : '<br/>'),
                     changeDecimals: 2,
                     valueDecimals: 3,
                     shared:true
                 },
                 scrollbar: { enabled:false, barBorderRadius:7, barBorderColor:'#bbb', buttonBorderRadius:7, buttonBorderColor:'#bbb', buttonArrowColor:'#bbb', 
                                rifleColor:'#bbb', trackBackgroundColor:'#fff', trackBorderColor:'#fff' },
    			 plotOptions: {
    	            series:
    	                {
                            lineWidth:3,
                            /*shadow: { color:'#888888', offsetX:2, offsetY:2, opacity:.2, width:3 },*/
                            compare: this.isRelative() ? 'percent' : undefined,
    	                    animation: {
    	                        duration: 4000,
    	                        easing: 'swing'
    	                    }
    	                },
                    areaspline: {
                        fillOpacity: 0.1
                    } 
    	        }
    	    });
    		
    	    if(init)
    	        RM.ui.toggleWindow({ flyout:true });
    	    	//RM.searchNews(false);
        //}
	}
	
	createAxis() {
	    //build number of yAxis allowed
        var yAxis = [{ gridLineColor:'#f3f3f3', /*tickPixelInterval:20,*/ opposite:false, startOnTick:false, endOnTick:false /*, type:'logarithmic'*/ }];
        
        for(var i = 1; i < RM.Charter.lowerAxis; i++) {
            yAxis.push({ gridLineColor:'#f3f3f3', opposite:true, startOnTick:false, endOnTick:false, showEmpty:false });  
        }
        
        //create lower axis
        yAxis.push({ gridLineColor:'#f3f3f3', opposite:true, startOnTick:false, endOnTick:false, height:'30%', top:'65%', showEmpty:false });
        
        return yAxis;
	}
}