import { Component, Input, OnInit, OnChanges, SimpleChanges, HostListener, HostBinding } from '@angular/core';
import { AppService } from 'backlive/service';

import { Type, Size } from './button.input';

import { BaseComponent } from 'backlive/component/shared';

import { PageLoadingEvent } from 'backlive/event';

@Component({
    selector: 'ui-button',
    template: `<button type="{{type =='submit' || type =='commit' ? 'submit' : 'button' }}" [class]="btnClass" [class.btn-block]="full" [disabled]="disabled" [style.width]="width">
	               <ui-icon *ngIf="icon" [type]="icon" class="btn-icon-left"></ui-icon><ng-content></ng-content>{{title}}<ui-icon *ngIf="iconRight" [type]="iconRight" class="btn-icon-right"></ui-icon>
               </button>`,
    styles: []
})
export class ButtonComponent extends BaseComponent implements OnInit, OnChanges {
    @Input() title: string;
    @Input() type: string;
    @Input() size: string;
    @Input() width: string;
    @Input() full: boolean = false;
    
    @Input() disabled: boolean;
    @Input() icon: string;
    @Input() iconRight: string;
    
    appService: AppService;

    btnClass: string;
    hasBeenClicked: boolean;

    static inputs = ['title', 'type', 'size', 'width', 'disabled'];

    constructor(appService: AppService) {
        super(appService);

        this.appService = appService;
        this.btnClass = 'btn ' + Type.default + ' ' + Size.default;
    }

    ngOnInit() {
        if (this.isSubmitType()) {
            this.subscribeEvent(PageLoadingEvent, event => this.onApiPost(event.data));
        }
    }

    ngOnChanges(simpleChanges: SimpleChanges) {
        this.btnClass = "btn";
        this.btnClass += ' ' + (this.type && Type[this.type] ? Type[this.type] : Type.default);
        this.btnClass += ' ' + (this.size && Size[this.size] ? Size[this.size] : Size.default);
    }

    @HostListener('click', ['$event'])
    onButtonClickListener(event: MouseEvent) {
        this.hasBeenClicked = true;
    }

    onApiPost(loading: boolean) {
        if (this.hasBeenClicked) {
            if (loading) {
                this.disabled = true;
            }
            else {
                this.disabled = false;
                this.hasBeenClicked = false;
            }
        }
    }

    isSubmitType() {
        return this.type === 'submit';
    }

    @HostBinding('class.click-disabled') get isDisabled() {
        return this.disabled;
    }
}