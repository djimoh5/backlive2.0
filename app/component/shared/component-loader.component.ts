import {Component, ElementRef, ComponentRef, DynamicComponentLoader, Type, AfterViewInit, Output, Input, EventEmitter, Reflector, ViewChild, ViewContainerRef} from '@angular/core'

@Component({
    selector: 'component-loader',
    template: `<div #componentloader></div>`
})
export class ComponentLoader implements AfterViewInit {
    @Input() component: Type;
    @Input() model: {};
    @Output() events: EventEmitter<ComponentLoaderEvent> = new EventEmitter();
    componentLoader: DynamicComponentLoader;
    viewContainerRef: ViewContainerRef;
    
    componentRef: ComponentRef<any>;
    
    constructor (componentLoader: DynamicComponentLoader, viewContainerRef: ViewContainerRef) {
        this.componentLoader = componentLoader;
        this.viewContainerRef = viewContainerRef;
    }
    
    ngAfterViewInit() {
        this.loadComponent();
    }
    
    loadComponent() {
        var self = this;
        
        this.componentLoader.loadNextToLocation(this.component, this.viewContainerRef).then(componentRef => {
            if(this.model) {
                for(var key in this.model) {
                    componentRef.instance[key] = this.model[key];
                }
            }
            
            for(var key in componentRef.instance) {
                if(componentRef.instance[key] instanceof EventEmitter) {
                    componentRef.instance[key].subscribe(this.fireEvent(key));
                }
            }
            
            if(componentRef.instance.ngOnInit) {
                componentRef.instance.ngOnInit();
            }
            else if(componentRef.instance.ngOnChanges) {
                componentRef.instance.ngOnChanges();
            }
        });
    }
    
    fireEvent(eventKey: string) {
        return ($event) => {
            this.events.emit({ key: eventKey, data: $event });
        }
    }
}

export interface ComponentLoaderEvent {
    key: string;
    data: any;
}