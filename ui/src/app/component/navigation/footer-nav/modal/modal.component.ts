import { Component, Type, ComponentRef, ComponentFactoryResolver, EventEmitter, ViewChild, ViewContainerRef, NgZone, AfterViewInit, OnDestroy } from '@angular/core';

import { Common } from 'backlive/utility';
import { PlatformUI } from 'backlive/utility/ui';

import { BaseComponent } from 'backlive/component/shared';

import { AppService } from 'backlive/service';

import { OpenFooterModalEvent, CloseFooterModalEvent } from 'backlive/event';

@Component({
    selector: 'backlive-footer-modal',
    templateUrl: 'modal.component.html',
    styleUrls: ['modal.component.less']
})
export class FooterModalComponent extends BaseComponent implements AfterViewInit, OnDestroy {
    private static modalComponentIds: string[] = [];

    id: string;
    options: ModalOptions;

    componentRefs: ComponentRef<any>[] = [];
    
    @ViewChild('modalbody', {read: ViewContainerRef}) modalbodyRef: ViewContainerRef;
    @ViewChild('modalfooter', {read: ViewContainerRef}) modalfooterRef: ViewContainerRef;

    isOpen: boolean;

    constructor(appService: AppService, private componentResolver: ComponentFactoryResolver, private platformUI: PlatformUI, private ngZone: NgZone) {
        super(appService);

        this.options = { title: "BackLive" };

        this.subscribeEvent(OpenFooterModalEvent, event => this.open(event.data));
        this.subscribeEvent(CloseFooterModalEvent, () => this.close());

        this.id = Common.uniqueId();
        FooterModalComponent.modalComponentIds.push(this.id);
    }

    ngAfterViewInit() {
        this.platformUI.query(`#${this.id}`).on('hide.bs.modal', () => {
            this.ngZone.run(() => {
                if(this.options.eventHandlers && this.options.eventHandlers['closeModal']) {
                    this.options.eventHandlers['closeModal']();
                }
            });
        });
    }

    open (options: ModalOptions) {
        if (this.id !== FooterModalComponent.modalComponentIds[FooterModalComponent.modalComponentIds.length - 1]) { //only open the most recent vn-modal created
            return;
        }

        this.options = options;

        if(!this.options.title) {
            this.options.title = 'BackLive';
        }

        this.componentRefs.forEach(componentRef => {
            componentRef.destroy();
        });

        this.platformUI.query('#' + this.id).animate({ height: this.platformUI.query(window).height() - 100 }, 100, () => {
            this.isOpen = true;
        });

        if(options.body && !this.isString(options.body)) {
            this.loadComponent(<Type<any>> options.body, this.modalbodyRef, options.model);
        }

        if(options.footer && !this.isString(options.footer)) {
            this.loadComponent(<Type<any>> options.footer, this.modalfooterRef, options.model);
        }  
    }

    close () {
        this.componentRefs.forEach(componentRef => {
            componentRef.destroy();
        });

        this.platformUI.query('#' + this.id).animate({ height: 0 }, 100, () => {
            this.isOpen = false;
        });

        if(this.options.onModalClose) {
            this.options.onModalClose();
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
        for (var i = FooterModalComponent.modalComponentIds.length - 1; i >= 0; i--) {
            if (FooterModalComponent.modalComponentIds[i] === this.id) {
                FooterModalComponent.modalComponentIds.splice(i, 1);
                break;
            }
        }

        super.ngOnDestroy();
    }
}

export interface ModalOptions {
    title: string;
    icon?: string;
    body?: string | Type<any>;
    footer?: string | Type<any>;
    nameEditor?: { model: any, field: string };
    centerText?: boolean;
    model?: {};
    onSubmit?: Function;
    eventHandlers?: { [key:string]: Function };
    onBodyClick?: Function;
    onModalClose?: Function;
    size?: string;  // large, full
}
