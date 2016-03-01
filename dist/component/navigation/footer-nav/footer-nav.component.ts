import {Component} from 'angular2/core';
import {Path} from 'backlive/config';
import {BaseComponent} from 'backlive/component/shared';

import {AppService} from 'backlive/service';

@Component({
    selector: 'footer-nav',
    template: `
      <div class="container">
      	<div class="inner-container">
              <div class="market-news research_container">
                  <div class="add-quick-news search_container input-append hide">
                      <h5 style="margin-top:0px">
                          Locate the URL of your favorite financial website RSS feed, and give it a short name which will appear in the footer menu.<br/>
                          Not sure what an RSS feed is? Here are some examples to get you started:<br/>
                          <p style="color:#666; margin:5px 0 0 45px;">
                              Quartz - http://qz.com/feed/<br/>
                              The Economist - http://www.economist.com/feeds/print-sections/77/business.xml<br/>
                              Pragmatic Capitalism - http://feeds.feedburner.com/pragcap/PFxE
                          </p>
                      </h5>
                      <div class="clearfix">
                          <input type="text" placeholder="short name" autocomplete="off" class="first" maxlength="20">
                          <input type="text" placeholder="enter rss feed url" autocomplete="off" class="ac_input" maxlength="500">
                          <button class="btn btn-primary"><i class="icon-plus icon-white" style=""></i></button>
                      </div>
                  </div>
                  <div class="hidden"></div>
                  <ul class="clearfix">
                      <li class="footer_subnav ticker on" data-tkr="SP500">
                          <a href="javascript:void(0)" onclick="RM.loadStockTicker('SP500')">Market</a>
                      </li>
                      <li class="first rsrch_subnav">
                          <a href="javascript:void(0)" onclick="RM.researchSubNav(this, 'news')">News</a>
                      </li>
                      <li class="rsrch_subnav">
                          <a href="javascript:void(0)" onclick="RM.researchSubNav(this, 'financials', 'a')">Financials</a>
                      </li>
                      <li class="rsrch_subnav">
                          <a href="javascript:void(0)" onclick="RM.researchSubNav(this, 'sec')">SEC Filings</a>
                      </li>
                      <li class="news_subnav show icon-plus">
                          <icon class="icon-plus-sign icon-white cursor_hand" onclick="RM.addRSSFeed()"></icon>
                      </li>
                      <li class="first news_subnav show">
                          <a href="javascript:void(0)" onclick="RM.newsSubNav(this, 'economist')">Economist</a>
                      </li>
                      <li class="news_subnav show">
                          <a href="javascript:void(0)" onclick="RM.newsSubNav(this, 'bloomberg')">Bloomberg Radio</a>
                      </li>
                      <li class=" news_subnav show">
                          <a href="javascript:void(0)" onclick="RM.newsSubNav(this, 'cnbc')">CNBC</a>
                      </li>
                      <li class="footer_subnav back" style="display:none;">
                          <a href="javascript:void(0)" onclick="RM.showAllTickers()" class="italic">Back To Remove/Select Stocks</a>
                      </li>
                  </ul>
                  <!-- // btn-group -->
              </div>
        
              <div class="test-years backtest-container hide">
                  <ul class="clearfix">
                      <li class="year-tab-clone">
                          <a href="javascript:void(0)"></a>
                      </li>
                  </ul>
              </div>
        
              <div id="stockTicker" class="hide"></div>
        
              <button class="btn-toggle-ticker btn btn-primary" aria-label="toggle footer navigation">
                  <span class="glyphicon glyphicon-signal" aria-hidden="true"></span>
              </button>
          </div>
      </div>
    `
})
export class FooterNavComponent extends BaseComponent {
    constructor (appService:AppService) {
        super(appService);
    }
}