import {Component, Type, ElementRef, ComponentRef, DynamicComponentLoader} from 'angular2/core';
import {Path} from '../../../config/config';
import {BaseComponent} from '../base.component';

import {AppService} from '../../../config/imports/service';

import {Event} from '../../../service/model/event';

@Component({
    selector: 'vn-modal',
    templateUrl: Path.Component('shared/modal/modal.component.html'),
    directives: []
})
export class ModalComponent extends BaseComponent {
    id: string = 'vnModal';
    options: ModalOptions;
    componentLoader: DynamicComponentLoader;
    elementRef: ElementRef;
    activeComponent: ComponentRef;
    
    constructor (appService:AppService, componentLoader: DynamicComponentLoader, elementRef: ElementRef) {
        super(appService);
        this.componentLoader = componentLoader;
        this.elementRef = elementRef;
        
        this.options = new ModalOptions();
        
        this.subscribeEvent(Event.OpenModal, (options: ModalOptions) => this.open(options));
        this.subscribeEvent(Event.CloseModal, () => this.close());
    }
    
    open (options: ModalOptions) {
        var self = this;
        this.options = options;
        
        if(this.activeComponent != null) {
            this.activeComponent.dispose();
        }
        
        if(options.body) {
            $('#' + self.id).modal('show');
        }
        else {
            this.componentLoader.loadIntoLocation(options.component, this.elementRef, 'modalbody').then(function (componentRef) {
                if(options.model) {
                    componentRef.instance.model = options.model;
                }
                
                self.activeComponent = componentRef;
                
                $('#' + self.id).modal('show');
            });
        }
    }
    
    close () {
        if(this.activeComponent != null) {
            this.activeComponent.dispose();
        }
        
        $('#' + this.id).modal('hide');
    }
}

export class ModalOptions {
    title: string;
    body: string;
    component: Type;
    model: any;
    footerVisible: boolean = false;
}