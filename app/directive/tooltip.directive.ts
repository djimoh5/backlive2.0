import {Directive, ElementRef, Input, EventEmitter, Output, OnInit} from '@angular/core';
import {PlatformUI} from 'backlive/utility/ui'

@Directive({
    selector: '[tooltip]'
})
export class TooltipDirective implements OnInit {
    @Input('tooltip') title: string;
    @Input() placement: string;
    elementRef: ElementRef;
    platformUI: PlatformUI;

    constructor(elementRef: ElementRef, platformUI: PlatformUI) {
        this.elementRef = elementRef;
        this.platformUI = platformUI;
    }
    
    ngOnInit() {
        if(this.title) {
            var options = { title: this.title, placement: this.placement };
            this.platformUI.query(this.elementRef.nativeElement).tooltip(options);
        }
    }
}