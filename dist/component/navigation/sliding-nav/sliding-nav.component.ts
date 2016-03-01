import {Component, ElementRef, ComponentRef, DynamicComponentLoader} from 'angular2/core';
import {Path} from 'backlive/config';
import {BaseComponent} from 'backlive/component/shared';
import {Tooltip} from 'backlive/directive';

import {AppService} from 'backlive/service';

import {AppEvent} from '../../../service/model/app-event';

@Component({
    selector: 'sliding-nav',
    template: `
      <div class="sidebar" [ngClass]="{ active: isActive }">
          <div class="icons">
              <a href="#" *ngFor="#item of items" (click)="showSideBar(item)" [tooltip]="item.tooltip" placement="right">
                  <ui-icon [type]="item.icon" [ngClass]="{ active: item.isActive }" aria-hidden="true"></ui-icon>
              </a>
          </div>
          <div class="component">
              <div #component></div>
          </div>
      </div>
    `,
    styles: [`
      .clearfix{*zoom:1}.clearfix:before,.clearfix:after{display:table;content:"";line-height:0}.clearfix:after{clear:both}.hide-text{font:0/0 a;color:transparent;text-shadow:none;background-color:transparent;border:0}.input-block-level{display:block;width:100%;min-height:30px;-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box}.pod{background:#FFF;border:1px #c8c8c8 solid;-webkit-border-radius:4px;-moz-border-radius:4px;border-radius:4px;margin:0 0 20px 0;-webkit-box-shadow:2px 2px 2px rgba(0,0,0,0.09),-1px -1px 2px rgba(0,0,0,0.09);-moz-box-shadow:2px 2px 2px rgba(0,0,0,0.09),-1px -1px 2px rgba(0,0,0,0.09);box-shadow:2px 2px 2px rgba(0,0,0,0.09),-1px -1px 2px rgba(0,0,0,0.09)}.pod .hd{padding:15px 20px 15px 20px;border-bottom:1px #EEE solid}.pod .hd h5{padding:0;margin:0}.pod .bd{padding:15px}.sidebar{z-index:97;-webkit-transition:width .25s ease-out;-moz-transition:width .25s ease-out;-o-transition:width .25s ease-out;transition:width .25s ease-out;background:#23527c;color:#c5dbec;width:40px;height:100%;position:fixed;top:50px}.sidebar .icons{float:left}.sidebar .icons a{cursor:pointer;margin:5px 0 10px 0;display:block;padding:9px;font-size:1.4em}.sidebar .icons a ui-icon{cursor:pointer;color:#ebf3f9}.sidebar .icons a ui-icon:hover{color:#8bb7d9}.sidebar .icons a ui-icon.active{color:#78abd3}.sidebar .component{float:right;width:0;visibility:hidden;opacity:0}.sidebar.active{width:300px}.sidebar.active .component{visibility:visible;opacity:1}
    `],
    directives: [Tooltip]
})
export class SlidingNavComponent extends BaseComponent {
    items: NavItem[];
    componentLoader: DynamicComponentLoader;
    elementRef: ElementRef;
    
    activeComponent: ComponentRef;
    isActive: boolean = false;
    isVisible: boolean = false;
    
    constructor(appService:AppService, componentLoader: DynamicComponentLoader, elementRef: ElementRef) {
        super(appService);
        this.componentLoader = componentLoader;
        this.elementRef = elementRef;
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
            this.activeComponent.dispose();
        }
        
        navItem.isActive = isActive;
        
        if(navItem.component) {
            this.isActive = isActive;
            
            if(isActive) {
                this.componentLoader.loadIntoLocation(navItem.component, this.elementRef, 'component').then(componentRef => {
                    this.activeComponent = componentRef;
                });
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
}