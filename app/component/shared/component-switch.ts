import {Component, ElementRef, ComponentRef, DynamicComponentLoader, Type, Input, OnInit} from 'angular2/angular2'

@Component({
    selector: 'component-switch',
    template: `<div #componentswitcher></div>`
})
export class ComponentSwitch implements OnInit {
    @Input() components: Object[];
    @Input() activeIndex: number = 0;
    activeComponent: ComponentRef;
    componentLoader: DynamicComponentLoader;
    elementRef: ElementRef;
    
    constructor (componentLoader: DynamicComponentLoader, elementRef: ElementRef) {
        this.componentLoader = componentLoader;
        this.elementRef = elementRef;
    }
    
    onInit() {
        this.setComponent(this.components[this.activeIndex].component);
    }
    
    setComponent(component: Type) {
        var self = this;
        
        if(self.activeComponent) {
            self.activeComponent.dispose();
        }
        
        this.componentLoader.loadIntoLocation(component, this.elementRef, 'componentswitcher').then(function (componentRef) {
            componentRef.instance.model = this.components[this.activeIndex].model;
            self.activeComponent = componentRef;
        });
    }
}