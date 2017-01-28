import {Directive, ElementRef, Input, OnChanges, HostBinding, Output, EventEmitter, SimpleChanges} from '@angular/core';
import {PlatformUI} from 'backlive/utility/ui';

@Directive({
    selector: '[animate]'
})
export class AnimateDirective implements OnChanges {
    @Input('animate') animationType: string;
    @Output('animateChange') animationTypeChange: EventEmitter<string> = new EventEmitter<string>();

    @Input() duration: number;
    @Input() infinite: boolean;
    @Input() options: any = {};
    
    elementRef: ElementRef; 
    platformUI: PlatformUI;
    animationMap: AnimationMap = {};
    
    hideElement: boolean;
    
    constructor(elementRef: ElementRef, platformUI: PlatformUI) {
        this.elementRef = elementRef;
        this.platformUI = platformUI;
        
        //build animation type mapping
        this.animationMap[AnimationType.FadeIn] = () => this.fadeIn();
        this.animationMap[AnimationType.FadeOut] = () => this.fadeOut();
        this.animationMap[AnimationType.FadeIn3D] = () => this.fadeIn3D();
        this.animationMap[AnimationType.FadeOut3D] = () => this.fadeOut3D();
        this.animationMap[AnimationType.SlideDown] = () => this.slideDown();
        this.animationMap[AnimationType.SlideUp] = () => this.slideUp();
        this.animationMap[AnimationType.SlideInLeft] = () => this.slideInLeft();
        this.animationMap[AnimationType.SlideInRight] = () => this.slideInRight();
        
        this.animationMap[AnimationType.RotateOut] = () => this.rotateOut();
        this.animationMap[AnimationType.PuffIn] = () => this.puffIn();
        this.animationMap[AnimationType.BoingIn] = () => this.boingIn();
    }
    
    @HostBinding('class.vn-animate-hidden') get hide() {
        return this.hideElement;
    }
    
    ngOnChanges(simpleChanges: SimpleChanges) {
        if(this.animationType == AnimationType.Hide) {
            this.hideElement = true;
        }
        else if(this.animationMap[this.animationType]) {
            if(!this.duration) {
                this.duration = 500;
            }
            
            this.animationMap[this.animationType]();
        }
    }
    
    fadeIn() {
        var $elem = this.platformUI.query(this.elementRef.nativeElement);
        $elem.css('opacity', 0);
        $elem.removeClass('hide').removeClass('vn-animate-hidden');
        $elem.animate({ 'opacity': 1 }, this.duration);
    }
    
    fadeOut() {
        var $elem = this.platformUI.query(this.elementRef.nativeElement);
        $elem.animate({ 'opacity': 0 }, this.duration);
    }

    fadeIn3D() {
        this.platformUI.query(this.elementRef.nativeElement).addClass('vn-animate-rotate3d').removeClass('hide');
        setTimeout(() => {
            this.platformUI.query(this.elementRef.nativeElement).removeClass('vn-animate-hide');
        });
    }

    fadeOut3D() {
        var elem = this.platformUI.query(this.elementRef.nativeElement).addClass('vn-animate-hide');
        setTimeout(() => { elem.addClass('hide').addClass('vn-animate-rotate3d'); }, 700);
    }
    
    slideDown() {
        this.platformUI.query(this.elementRef.nativeElement).removeClass('hide').removeClass('hidden');
        this.platformUI.query(this.elementRef.nativeElement).slideDown();
    }
    
    slideUp() {
        this.platformUI.query(this.elementRef.nativeElement).slideUp();
    }
    
    slideInLeft() {
        var startOffset = this.options.startOffset ? this.options.startOffset : 2000;
        this.platformUI.query(this.elementRef.nativeElement).css({ position: 'relative', left: startOffset }, this.duration);
        this.platformUI.query(this.elementRef.nativeElement).animate({ position: 'relative', left: 0 }, this.duration, () => {
            this.animationTypeChange.emit(null);
        });
    }
    
    slideInRight() {
        var startOffset = this.options.startOffset ? (Math.abs(this.options.startOffset) * -1) : -2000;
        this.platformUI.query(this.elementRef.nativeElement).css({ position: 'relative', left: startOffset }, this.duration);
        this.platformUI.query(this.elementRef.nativeElement).animate({ position: 'relative', left: 0 }, this.duration, () => {
            this.animationTypeChange.emit(null);
        });
    }
    
    rotateOut() {
        this.magicAnimation('rotateRight');
    }
    
    puffIn() {
        this.magicAnimation('puffIn');
    }

    boingIn() {
        this.magicAnimation('boingInUp');
    }

    private magicAnimation(magicName: string) {
        if (this.infinite) {
            setInterval(() => {
                this.platformUI.query(this.elementRef.nativeElement).toggleClass('magictime ' + magicName);
            }, 1000);
        }
        else {
            this.platformUI.query(this.elementRef.nativeElement).addClass('magictime ' + magicName);
        }
    }
}

export class AnimationType {
    static FadeIn = 'fadeIn';
    static FadeOut = 'fadeOut';
    static FadeIn3D = 'fadeIn3D';
    static FadeOut3D = 'fadeOut3D';
    static SlideDown = 'slideDown';
    static SlideUp = 'slideUp';
    static SlideInLeft= 'slideInLeft';
    static SlideInRight = 'slideInRight';
    
    static RotateOut = 'rotateOut';
    static PuffIn = 'puffIn';
    static BoingIn = 'boingIn';
    
    static Hide = 'hide';
}

class AnimationMap {
    [key: string]: Function
}