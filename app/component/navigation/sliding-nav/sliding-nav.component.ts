import {Component, ElementRef, Type, ComponentRef, ComponentFactoryResolver, ViewChild, ViewContainerRef} from '@angular/core';
import {Path} from 'backlive/config';
import {BaseComponent} from 'backlive/component/shared';
import {TooltipDirective} from 'backlive/directive';

import {AppService} from 'backlive/service';

import {AppEvent} from 'backlive/service/model';

@Component({
    selector: 'sliding-nav',
    templateUrl: Path.ComponentView('navigation/sliding-nav'),
    styleUrls: [Path.ComponentStyle('navigation/sliding-nav')]
})
export class SlidingNavComponent extends BaseComponent {
    items: NavItem[];
    
    @ViewChild('component', {read: ViewContainerRef}) componentRef: ViewContainerRef;
    
    activeComponent: ComponentRef<any>;
    isActive: boolean = false;
    isVisible: boolean = false;
    
    constructor(appService:AppService, private componentResolver: ComponentFactoryResolver, private elementRef: ElementRef) {
        super(appService);
        this.items = [];
        
        this.subscribeEvent(AppEvent.SlidingNavItems, (items: NavItem[]) => this.updateItems(items));
    }
    
    updateItems(items: NavItem[]) {
        //this.items = items
        this.isActive = false;
        this.appService.notify(AppEvent.SlidingNavVisible, true);
        
        //angular bug exists where classes from previous items do not get removed, so instead update each item one by one
        //TODO: remove if this bug gets fixed in later versions
        items.forEach((item, i) => {
            if(this.items[i]) {
                delete this.items[i].component;
                delete this.items[i].onClick;
                delete this.items[i].isActive;
                
                for(var key in item) {
                    this.items[i][key] = item[key];
                }
            }
            else {
                this.items.push(item);
            }
        });
        
        if(this.items.length > items.length) {
            this.items.splice(items.length, this.items.length - items.length);
        }
    }
    
    showSideBar(navItem: NavItem) {
        var isActive = !navItem.isActive;

        this.items.forEach(item => {
            item.isActive = false;
        });

        if(this.activeComponent != null) {
            this.activeComponent.destroy();
        }
        
        navItem.isActive = isActive;
        
        if(navItem.component) {
            this.isActive = isActive;
            
            if(isActive) {
                this.activeComponent = this.componentRef.createComponent(this.componentResolver.resolveComponentFactory(navItem.component));
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
}

interface NavItem {
    icon: string;
    isActive: boolean;
    component: any; //either component or onClick should be set, component takes precendence
    onClick: Function;
    tooltip: string;
}