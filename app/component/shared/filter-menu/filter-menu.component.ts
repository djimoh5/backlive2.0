import {Component, Input, Output, OnChanges, EventEmitter} from '@angular/core';
import {Path} from 'backlive/config';

import {BaseComponent} from 'backlive/component/shared';

import {SearchBoxDirective} from 'backlive/directive';

import {AppService} from 'backlive/service';

@Component({
    selector: 'filter-menu',
    templateUrl: Path.ComponentView('shared/filter-menu'),
    styleUrls: [Path.ComponentStyle('shared/filter-menu')]
})
export class FilterMenuComponent extends BaseComponent implements OnChanges {
    @Input() filters: Filter[];
    @Output() change: EventEmitter<FilterOption[]> = new EventEmitter();
    
    activeFilter: Filter;
    
    constructor (appService: AppService) {
        super(appService);
    }
    
    ngOnChanges() {
        if(this.filters) {
            this.filters.forEach(filter => {
                if(filter.active) {
                    this.selectFilter(filter);
                }
                
                filter.activeCount = 0;
                filter.options.forEach(option => {
                    if(option.active) {
                        filter.activeCount++;
                    }
                });
            });
        }
    }
    
    selectFilter(filter: Filter) {
        this.filters.forEach(filter => {
            filter.active = false;
        });
        
        filter.active = true;
        this.activeFilter = filter;
    } 
    
    searchFilterOptions(searchKey: string) {
        if(this.activeFilter) {
            if(searchKey.length == 0) {
                this.activeFilter.options.forEach(option => {
                    option.hidden = false;    
                });
            }
            else {
                searchKey = searchKey.toLowerCase();
                this.activeFilter.options.forEach(option => {
                    if(option.name.toLowerCase().indexOf(searchKey) >= 0) {
                        option.hidden = false;
                    }
                    else {
                        option.hidden = true;
                    }
                });
            }
        }
    }
    
    filterChanged(option: FilterOption) {
        var filterOptions: FilterOption[] = [];
        
        this.filters.forEach(filter => {
            filter.activeCount = 0;
            filter.options.forEach(option => {
                if(option.active) {
                    option.filterId = filter.id;
                    filterOptions.push(option);
                    filter.activeCount++;
                }
            });
        });
        
        this.change.emit(filterOptions);
    }
}

export interface Filter {
    name: string;
    options: FilterOption[];
    id?: any;
    active?: boolean;
    activeCount?: number;
}

export interface FilterOption {
    name: string;
    id?: any;
    active?: boolean;
    hidden?: boolean;
    filterId?: any;
}