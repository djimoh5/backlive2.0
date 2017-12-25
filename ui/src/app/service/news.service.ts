import {Injectable} from '@angular/core';
import {BaseService} from './base.service';
import {ApiService} from './api.service';
import {AppService} from './app.service';

import { RssFeed } from './model/news.model';

declare var window;
declare var ActiveXObject;

@Injectable()
export class NewsService extends BaseService {
    constructor(apiService: ApiService, appService: AppService) {
        super(apiService, appService, 'news');
    }

    getCustomFeed(rss: string): Promise<XMLDocument> {
        return this.get('custom', { rss: rss }, true).then(xmlString => {
            return this.convertToXmlDoc(xmlString);
        });
    }

    getCoinDesk(): Promise<RssFeed> {
        return this.get('coindesk', null, true);
    }
    
    getMarketNews(): Promise<XMLDocument> {
        return this.get('market', null, true).then(xmlString => {
            return this.convertToXmlDoc(xmlString);
        });
    }
    
    getCNBC(): Promise<XMLDocument> {
        return this.get('cnbc', null, true).then(xmlString => {
            return this.convertToXmlDoc(xmlString);
        });
    }
    
    getBloombergRadio(): Promise<XMLDocument> {
        return this.get('bloombergradio', null, true).then(xmlString => {
            return this.convertToXmlDoc(xmlString);
        });
    }
    
    getEconomist(): Promise<XMLDocument> {
        return this.get('economist', null, true).then(xmlString => {
            return this.convertToXmlDoc(xmlString);
        });
    }

    private convertToXmlDoc(xmlString: string): XMLDocument {
        var xmlDoc: any;
        
        if (window.DOMParser) {
            xmlDoc = new DOMParser().parseFromString(xmlString,"text/xml");
        }
        else {
            xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = false;
            xmlDoc.loadXML(xmlString);
        }

        return xmlDoc;
    }
}