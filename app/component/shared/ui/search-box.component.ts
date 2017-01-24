import {Component, Input, Output, EventEmitter} from '@angular/core';
import {SearchBoxDirective} from 'backlive/directive';

@Component({
    selector: 'search-box',
    template: `<ui-icon type="search"></ui-icon><input searchbox (search)="onSearch($event)" class="form-control" placeholder="{{placeholder}}">`
})
export class SearchBoxComponent {
    @Input() placeholder: string;
    @Output() search: EventEmitter<string> = new EventEmitter();
    constructor () {}
    
    onSearch(searchKey: string) {
        this.search.emit(searchKey);
    }
}