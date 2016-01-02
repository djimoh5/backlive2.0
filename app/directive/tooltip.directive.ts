import {Directive, ElementRef, Input, EventEmitter, Output, OnInit} from 'angular2/core';

@Directive({
    selector: '[tooltip]'
})
export class Tooltip implements OnInit {
    @Input('tooltip') title: string;
    @Input() placement: string;
    elementRef: ElementRef;

    constructor(elementRef: ElementRef) {
        this.elementRef = elementRef;
    }
    
    ngOnInit() {
        if(this.title) {
            var options = { title: this.title, placement: this.placement };
            $(this.elementRef.nativeElement).tooltip(options);
        }
    }
}