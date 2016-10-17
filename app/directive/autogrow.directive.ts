import {Directive, ElementRef, Input, EventEmitter, Output, AfterViewInit} from '@angular/core';
import {PlatformUI} from 'backlive/utility/ui'

@Directive({
    selector: '[autogrow]'
})
export class AutogrowDirective implements AfterViewInit {
    @Input() autogrow;
    elementRef: ElementRef;
    platformUI: PlatformUI;

    constructor(elementRef: ElementRef, platformUI: PlatformUI) {
        this.elementRef = elementRef;
        this.platformUI = platformUI;
    }
    
    ngAfterViewInit() {
        var $elem = this.platformUI.query(this.elementRef.nativeElement);
        $elem.autogrow();
    }
}