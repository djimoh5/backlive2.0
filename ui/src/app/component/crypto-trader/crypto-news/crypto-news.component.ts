import { Component, OnInit } from '@angular/core';

import { PageComponent } from 'backlive/component/shared';

import { AppService, NewsService } from 'backlive/service';
import { RssFeed, RssItem } from 'backlive/service/model';

import { Common } from 'backlive/utility';

@Component({
    selector: 'crypto-news',
    templateUrl: 'crypto-news.component.html',
    styleUrls: ['crypto-news.component.less']
})
export class CryptoNewsComponent extends PageComponent implements OnInit {
	title: string;
	rssFeed: RssFeed;
	items: RssItem[];

    constructor(appService: AppService, private newsService: NewsService) {
        super(appService);
    }

    ngOnInit() {
        this.newsService.getCoinDesk().then(feed => this.rssFeed = feed);
	}
	
	getItemDate(item: RssItem) {
		Common.dynamicProperty(item, 'date', () => {
			return new Date(item.created);
		});
	}

    loadNews(xmlDoc: XMLDocument) {
		var nodes = xmlDoc.documentElement.childNodes;
		this.items = [];
		
		if(nodes.length > 0) {
		    try {
				var title = xmlDoc.getElementsByTagName("title")[0].childNodes[0];
				if(title) {
					this.title = title.nodeValue;
				}
    			
    			var items = xmlDoc.getElementsByTagName('item');

    			for(var i = 0; i < items.length; i++) {
    				title = items[i].getElementsByTagName("title")[0].childNodes[0];

    				if(title) {
						var rssItem: RssItem = { title: title.nodeValue };
    					var link = items[i].getElementsByTagName("link");
    					
    					if(link.length > 0) {
    						rssItem.link = link[0].childNodes[0].nodeValue;
    						var pubdate = items[i].getElementsByTagName("pubDate");
    						var desc = items[i].getElementsByTagName("description");	
    						
    						if(pubdate.length > 0 && pubdate[0].childNodes.length > 0) {
    							rssItem.created = Date.parse(pubdate[0].childNodes[0].nodeValue);//.substring(0, 16);
    						}
    						    
    						if(desc.length > 0 && desc[0].childNodes.length > 0) {
    							rssItem.description = desc[0].childNodes[0].nodeValue;
							}
							
    					    this.items.push(rssItem);
						}
    				}
    			}
		    } catch(ex) {
		        console.log('rss parsing error', ex);
		    }
        }
    }
}

