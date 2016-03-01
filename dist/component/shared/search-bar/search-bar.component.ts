import {Component} from 'angular2/core';
import {Path} from 'backlive/config';
import {BaseComponent} from 'backlive/component/shared';

import {AppService} from 'backlive/service';

import {AppEvent} from '../../../service/model/app-event';

@Component({
    selector: 'search-bar',
    template: `
      <form role="search">
      	<div class="form-group">
      		<input type="text" class="form-control" placeholder="Search" [(ngModel)]="searchKey" (keyup)="search()">
      		<vn-button type="submit" icon="add" aria-label="submit search"></vn-button>
      	</div>
      </form>
    `,
    directives: []
})
export class SearchBarComponent extends BaseComponent {
    previousKey: string;
    searchKey: string;
    typingInterval: any = null;
    
    constructor (appService: AppService) {
        super(appService);
        this.searchKey = "";
        this.appService.notify(AppEvent.SearchKeyUp, this.searchKey);
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
            this.appService.notify(AppEvent.SearchKeyUp, this.searchKey);
        }
        else {
            this.previousKey = this.searchKey;
        }
    }
}