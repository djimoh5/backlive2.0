import {Component} from 'angular2/core';
import {Path} from 'backlive/config';
import {BaseComponent} from 'backlive/component/shared';

import {AppService} from 'backlive/service';

import {Event} from '../../../service/model/event';

@Component({
    selector: 'search-bar',
    templateUrl: Path.ComponentView('shared/search-bar'),
    directives: []
})
export class SearchBarComponent extends BaseComponent {
    previousKey: string;
    searchKey: string;
    typingInterval: any = null;
    
    constructor (appService: AppService) {
        super(appService);
        this.searchKey = "";
        this.appService.notify(Event.SearchKeyUp, this.searchKey);
    }
    
    search() {
        if(this.typingInterval == null) {
            this.previousKey = this.searchKey;
            this.typingInterval = setInterval(() => this.onStopTyping(), 200);
        }
    }
    
    private onStopTyping() {
        if(this.previousKey == this.searchKey) {
            clearInterval(this.typingInterval);
            this.typingInterval = null;
            this.appService.notify(Event.SearchKeyUp, this.searchKey);
        }
        else {
            this.previousKey = this.searchKey;
        }
    }
}