import {Directive, ElementRef, Input, Output, EventEmitter, HostListener, OnInit} from '@angular/core';
import {PlatformUI} from 'backlive/utility/ui';

@Directive({
    selector: '[searchbox]'
})
export class SearchBoxDirective implements OnInit {
    @Input('searchbox') throttle; //in milleseconds
    @Output() search: EventEmitter<string> = new EventEmitter<string>();
    elementRef: ElementRef;
    platformUI: PlatformUI;
    
    defaultThrottle: number = 300;
    previousKey: string;
    searchKey: string;
    typingInterval: any = null;
    
    constructor(elementRef: ElementRef) {
        this.elementRef = elementRef;
        this.searchKey = "";
    }
    
    ngOnInit() {
        if(!this.throttle) {
            this.throttle = this.defaultThrottle;
        }
    }
    
    @HostListener('keyup', ['$event'])
    onKeyup(_event: Event) {
        this.searchKey = this.elementRef.nativeElement.value;
        
        if (this.typingInterval == null && this.previousKey !== this.searchKey) {
            this.previousKey = this.searchKey;
            this.typingInterval = setInterval(() => this.onStopTyping(), this.throttle);
        }
    }
    
    private onStopTyping() {
        if(this.previousKey == this.searchKey) {
            clearInterval(this.typingInterval);
            this.typingInterval = null;
            
            if(this.searchKey.length > 1 || this.searchKey.length == 0) {
                this.search.emit(this.searchKey);
            }
        }
        else {
            this.previousKey = this.searchKey;
        }
    }
}