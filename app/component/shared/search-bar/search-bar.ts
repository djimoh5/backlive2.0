import {Component, FORM_DIRECTIVES} from 'angular2/angular2';
import {BaseComponent} from '../shared/base';

import {AppService} from '../../service/app';
import {Event} from '../../model/event';

@Component({
    selector: 'search-bar',
    templateUrl: '/view/shared/search-bar.html',
    directives: [FORM_DIRECTIVES]
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