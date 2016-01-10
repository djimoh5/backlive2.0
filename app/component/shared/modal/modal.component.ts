import {Component, Type, ElementRef, ComponentRef, DynamicComponentLoader} from 'angular2/core';
import {Path} from 'backlive/config';
import {BaseComponent} from '../base.component';

import {AppService} from 'backlive/service';

import {AppEvent} from '../../../service/model/app-event';

@Component({
    selector: 'app-modal',
    templateUrl: Path.ComponentView('shared/modal'),
    directives: []
})
export class ModalComponent extends BaseComponent {
    id: string = 'uiModal';
    options: ModalOptions;
    componentLoader: DynamicComponentLoader;
    elementRef: ElementRef;
    activeComponent: ComponentRef;
    
    constructor (appService:AppService, componentLoader: DynamicComponentLoader, elementRef: ElementRef) {
        super(appService);
        this.componentLoader = componentLoader;
        this.elementRef = elementRef;
        
        this.options = { title: "VISANOW" };
        
        this.subscribeEvent(AppEvent.OpenModal, (options: ModalOptions) => this.open(options));
        this.subscribeEvent(AppEvent.CloseModal, () => this.close());
    }
    
    open (options: ModalOptions) {
        this.options = options;
        console.log(this.options)
        
        if(this.activeComponent != null) {
            this.activeComponent.dispose();
        }
        
        if(options.body) {
            $('#' + this.id).modal('show');
        }
        else {
            this.componentLoader.loadIntoLocation(options.component, this.elementRef, 'modalbody').then(componentRef => {
                if(options.model) {
                    componentRef.instance.model = options.model;
                }
                
                this.activeComponent = componentRef;
                
                $('#' + this.id).modal('show');
            });
        }
    }
    
    close () {
        if(this.activeComponent != null) {
            this.activeComponent.dispose();
        }
        
        $('#' + this.id).modal('hide');
    }
    
    submit () {
        if(this.options.onSubmit) {
            this.options.onSubmit();
            this.close();
        }
    }
}

export interface ModalOptions {
    title: string;
    body?: string;
    component?: Type;
    model?: any;
    onSubmit?: Function;
}