import {Directive, ElementRef, Input, HostListener} from '@angular/core';
import {PlatformUI} from 'backlive/utility/ui'

@Directive({
    selector: '[scrollTop]',
    inputs: ['scrollTop']
})
export class ScrollTopDirective {
    elementRef: ElementRef;
    platformUI: PlatformUI;

    constructor(elementRef: ElementRef, platformUI: PlatformUI) {
        this.elementRef = elementRef;
        this.platformUI = platformUI;
    }
    
    @HostListener('click', ['$event.target'])
    onClick(event: any) {
        this.platformUI.scrollToTop();
    }
}