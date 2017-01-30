import { Component, Type, ComponentRef, ComponentFactoryResolver, EventEmitter, NgZone, ViewChild, ViewContainerRef, ElementRef, OnDestroy } from '@angular/core';
import { Path } from 'backlive/config';
import { Common } from 'backlive/utility';
import { PlatformUI } from 'backlive/utility/ui';

import { BaseComponent } from '../base.component';

import { AppService } from 'backlive/service';

import { OpenModalEvent, CloseModalEvent } from 'backlive/event';

@Component({
    selector: 'backlive-modal',
    templateUrl: Path.ComponentView('shared/modal'),
    styleUrls: [Path.ComponentStyle('shared/modal')]
})
export class ModalComponent extends BaseComponent implements OnDestroy {
    private static modalComponentIds: string[] = [];

    id: string;
    options: ModalOptions;
    componentResolver: ComponentFactoryResolver;
    platformUI: PlatformUI;

    componentRefs: ComponentRef<any>[] = [];
    
    @ViewChild('modalbody', {read: ViewContainerRef}) modalbodyRef: ViewContainerRef;
    @ViewChild('modalfooter', {read: ViewContainerRef}) modalfooterRef: ViewContainerRef;

    constructor(appService: AppService, componentResolver: ComponentFactoryResolver, platformUI: PlatformUI, private elementRef: ElementRef, private ngZone: NgZone) {
        super(appService);
        this.componentResolver = componentResolver;
        this.platformUI = platformUI;

        this.options = { title: 'Envoy' };

        this.subscribeEvent(OpenModalEvent, event => this.open(event.data));
        this.subscribeEvent(CloseModalEvent, () => this.close());

        this.id = Common.uniqueId();
        ModalComponent.modalComponentIds.push(this.id);
    }

    ngAfterViewInit() {
        var $elem = this.platformUI.query(`#${this.id}`);
        $elem.on('hidden.bs.modal', (res) => {
            this.ngZone.run(() => {
                this.appService.notify(new CloseModalEvent(null));
            });
        });
    }

    open(options: ModalOptions) {
        if (this.id !== ModalComponent.modalComponentIds[ModalComponent.modalComponentIds.length - 1]) { //only open the most recent vn-modal created
            return;
        }

        this.options = options;

        this.componentRefs.forEach(componentRef => {
            componentRef.destroy();
        });

        if(options.body && !this.isString(options.body)) {
            this.loadComponent(<Type<any>> options.body, this.modalbodyRef, options.model);
        }

        if(options.footer && !this.isString(options.footer)) {
            this.loadComponent(<Type<any>> options.footer, this.modalfooterRef, options.model);
        }

        this.platformUI.query(`#${this.id}`).modal('show');
    }

    close () {
        var $elem = this.platformUI.query(`#${this.id}`);

        if ($elem.is(':visible')) {
            $elem.modal('hide');

            if (this.options.onCancel) {
                this.options.onCancel();
            }
        }  
    }

    loadComponent(component: Type<any>, viewContainerRef: ViewContainerRef, model: {}) {
        var componentRef = viewContainerRef.createComponent(this.componentResolver.resolveComponentFactory(component));

        if (model) {
            for (var key in model) {
                componentRef.instance[key] = model[key];
            }
        }

        for (var key in componentRef.instance) {
            if (componentRef.instance[key] instanceof EventEmitter) {
                componentRef.instance[key].subscribe(this.fireEvent(key));
            }
        }

        if (componentRef.instance.ngOnChanges) {
            componentRef.instance.ngOnChanges({});
        }

        this.componentRefs.push(componentRef);
    }

    submit () {
        if(this.options.onSubmit) {
            this.options.onSubmit();
            this.close();
        }
    }
    
    fireEvent(eventKey: string) {
        return ($event) => {
            if(this.options.eventHandlers && this.options.eventHandlers[eventKey]) {
                this.options.eventHandlers[eventKey]($event);
            }
        };
    }
    
    isString(str: any) {
        return Common.isString(str);
    }
    
    onBodyClick(event: Event) {
        if(this.options.onBodyClick) {
            this.options.onBodyClick(event);
            this.close();
        }
    }

    ngOnDestroy() {
        for (var i = ModalComponent.modalComponentIds.length - 1; i >= 0; i--) {
            if (ModalComponent.modalComponentIds[i] === this.id) {
                ModalComponent.modalComponentIds.splice(i, 1);
                break;
            }
        }

        super.ngOnDestroy();
    }
}

export interface ModalOptions {
    title?: string;
    icon?: string;
    body?: string | Type<any>;
    footer?: string | Type<any>;
    centerText?: boolean;
    model?: {};
    onSubmit?: Function;
    onCancel?: Function;
    eventHandlers?: { [key:string]: Function };
    onBodyClick?: Function;
    size?: string;  // large, full
    customStyle?: boolean;
}