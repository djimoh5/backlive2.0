import { Component, ElementRef, ComponentRef, ComponentFactoryResolver, EventEmitter, ViewChild, ViewContainerRef, Input, OnChanges, OnDestroy } from '@angular/core';
import { Path } from 'backlive/config';
import { BaseComponent } from 'backlive/component/shared';

import { AppService } from 'backlive/service';

import { SlidingNavVisibleEvent } from 'backlive/event';

@Component({
    selector: 'sliding-nav',
    templateUrl: Path.ComponentView('navigation/sliding-nav'),
    styleUrls: [Path.ComponentStyle('navigation/sliding-nav')]
})
export class SlidingNavComponent extends BaseComponent implements OnChanges, OnDestroy {
    @Input() items: SlidingNavItem[];
    
    @ViewChild('component', {read: ViewContainerRef}) componentRef: ViewContainerRef;
    
    activeComponent: ComponentRef<any>;
    isActive: boolean = false;
    isVisible: boolean = false;
    activeItem: SlidingNavItem;
    
    constructor(appService:AppService, private componentResolver: ComponentFactoryResolver, private elementRef: ElementRef) {
        super(appService);
        this.items = [];
    }

    ngOnChanges() {
        this.updateItems(this.items);
    }

    updateItems(items: SlidingNavItem[]) {
        this.items = items;
        this.isActive = false;
        this.appService.notify(new SlidingNavVisibleEvent(true));
    }
    
    showSideBar(navItem: SlidingNavItem) {
        var isActive = !navItem.isActive;

        this.items.forEach(item => {
            item.isActive = false;
        });

        if(this.activeComponent != null) {
            this.activeComponent.destroy();
        }
        
        navItem.isActive = isActive;
        this.activeItem = navItem;
        
        if(navItem.component) {
            this.isActive = isActive;
            
            if(isActive) {
                setTimeout(() => {
                    this.activeComponent = this.componentRef.createComponent(this.componentResolver.resolveComponentFactory(navItem.component));
                    for (var key in this.activeComponent.instance) {
                        if (this.activeComponent.instance[key] instanceof EventEmitter) {
                            this.activeComponent.instance[key].subscribe(this.fireEvent(key));
                        }
                    }

                    /*if (this.activeComponent.instance.ngOnChanges) {
                        this.activeComponent.instance.ngOnChanges({});
                    }*/
                }, 500);
            }
        }
        else {
            navItem.isActive = true;
            this.isActive = false;
            
            if(navItem.onClick) {
                navItem.onClick();
            }
        }
    }

    fireEvent(eventKey: string) {
        return ($event) => {
            if(this.activeItem.eventHandlers && this.activeItem.eventHandlers[eventKey]) {
                this.activeItem.eventHandlers[eventKey]($event);
            }
        };
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.appService.notify(new SlidingNavVisibleEvent(false));
    }
}

export interface SlidingNavItem {
    icon: string;
    isActive?: boolean;
    component?: any; //either component or onClick should be set, component takes precendence
    eventHandlers?: { [key:string]: Function };
    onClick?: Function;
    tooltip?: string;
}