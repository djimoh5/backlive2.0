import {Directive, ElementRef, Input, EventEmitter, OnInit, AfterViewInit} from '@angular/core';
import {PlatformUI} from 'backlive/utility/ui'

@Directive({
    selector: '[readmore]'
})
export class ReadMoreDirective implements AfterViewInit {
    @Input('readmore') height: string;
    elementRef: ElementRef;
    platformUI: PlatformUI;
    
    constructor(elementRef: ElementRef, platformUI: PlatformUI) {
        this.elementRef = elementRef;
        this.platformUI = platformUI;
    }
    
    ngAfterViewInit() {
        this.platformUI.query(this.elementRef.nativeElement).readmore({
            speed: 300,
            collapsedHeight: parseInt(this.height),
            moreLink: '<a href="javascript: void(0)">read more</a>',
            lessLink: '<a href="javascript: void(0)">read less</a>'
        });
    }
}