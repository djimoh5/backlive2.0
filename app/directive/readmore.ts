import {Directive, ElementRef, EventEmitter, OnInit, AfterViewInit} from 'angular2/angular2';

@Directive({
    selector: '[readmore]',
    inputs: [
        'height: readmore'
    ]
})
export class ReadMore implements AfterViewInit {
    height: string;
    elementRef: ElementRef;
    
    constructor(elementRef: ElementRef) {
        this.elementRef = elementRef;
    }
    
    afterViewInit() {
        console.log(this.height)
        $(this.elementRef.nativeElement).readmore({
            speed: 300,
            collapsedHeight: parseInt(this.height),
            moreLink: '<a href="javascript: void(0)">read more</a>',
            lessLink: '<a href="javascript: void(0)">read less</a>'
        });
    }
}