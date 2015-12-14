import {Directive, ElementRef, EventEmitter, Output, OnInit} from 'angular2/angular2';

@Directive({
    selector: '[tooltip]',
    inputs: [
        'title: tooltip'
    ]
})
export class Tooltip implements OnInit {
    title: string;
    elementRef: ElementRef;
    @Output() onSelect:EventEmitter = new EventEmitter();
    
    constructor(elementRef: ElementRef) {
        this.elementRef = elementRef;
    }
    
    onInit() {
        $(this.elementRef.nativeElement).tooltip(this.title ? { title: this.title } : null);
    }
}