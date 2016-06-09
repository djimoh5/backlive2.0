import {Directive, ElementRef, Input, OnChanges, HostBinding} from '@angular/core';
//import {CssAnimationBuilder, CssAnimationOptions, Animation, BrowserDetails} from 'angular2/animate';
import {Common} from 'backlive/utility';
import {PlatformUI} from 'backlive/utility/ui';

@Directive({
    selector: '[animate]'
})
export class AnimateDirective implements OnChanges {
    @Input('animate') animationType: string;
    @Input() duration: number;
    @Input() infinite: boolean;
    
    elementRef: ElementRef; 
    platformUI: PlatformUI;
    //animationBuilder: CssAnimationBuilder;
    animationMap: AnimationMap = {};
    
    hideElement: boolean;
    
    constructor(elementRef: ElementRef, platformUI: PlatformUI) {
        this.elementRef = elementRef;
        this.platformUI = platformUI;
        //this.animationBuilder = new CssAnimationBuilder(new BrowserDetails());
        
        //build animation type mapping
        this.animationMap[AnimationType.FadeIn] = () => this.fadeIn();
        this.animationMap[AnimationType.FadeOut] = () => this.fadeOut();
        this.animationMap[AnimationType.SlideDown] = () => this.slideDown();
        this.animationMap[AnimationType.SlideUp] = () => this.slideUp();
        this.animationMap[AnimationType.SlideInLeft] = () => this.slideInLeft();
        this.animationMap[AnimationType.SlideInRight] = () => this.slideInRight();
        
        this.animationMap[AnimationType.RotateOut] = () => this.rotateOut();
        this.animationMap[AnimationType.PuffIn] = () => this.puffIn();
        this.animationMap[AnimationType.BoingIn] = () => this.boingIn();
    }
    
    @HostBinding('class.hide') get hide() {
        return this.hideElement;
    }
    
    ngOnChanges() {
        if(this.animationType == AnimationType.Hide) {
            this.hideElement = true;
        }
        else if(this.animationMap[this.animationType]) {
            if(!this.duration) {
                this.duration = 500;
            }
            
            this.animationMap[this.animationType]();
            
            /*this.animationBuilder.setDuration(this.duration ? this.duration : 500);
            
            var callback: Function = this.animationMap[this.animationType]();
            var animation = this.animationBuilder.start(this.elementRef.nativeElement);
            
            if(callback) {
                animation.onComplete(callback);
            }*/
        }
    }
    
    fadeIn() {
        //this.hideElement = false;
        
        var $elem = this.platformUI.query(this.elementRef.nativeElement);
        $elem.css('opacity', 0);
        $elem.removeClass('hide');
        $elem.animate({ 'opacity': 1 }, this.duration);
        
        //this.platformUI.query(this.elementRef.nativeElement).fadeIn(this.duration);
        
        /*this.animationBuilder.setFromStyles({ opacity: 0 });
        this.animationBuilder.setToStyles({ opacity: 100 });*/
    }
    
    fadeOut() {
        this.platformUI.query(this.elementRef.nativeElement).fadeOut();
        
        /*this.animationBuilder.setFromStyles({ opacity: 100 });
        this.animationBuilder.setToStyles({ opacity: 0 });*/
    }
    
    slideDown() {
        this.platformUI.query(this.elementRef.nativeElement).removeClass('hide').removeClass('hidden');
        this.platformUI.query(this.elementRef.nativeElement).slideDown();
        
        //need to get real height first
        /*var position = this.platformUI.query(this.elementRef.nativeElement).css('position');
        this.platformUI.query(this.elementRef.nativeElement).css({ position: 'absolute', visibility: 'hidden', height: 'auto' });
        var height = this.platformUI.query(this.elementRef.nativeElement).height();
        
        this.animationBuilder.setFromStyles({ position: position, visibility: 'visible', overflow: 'hidden', height: 0 });
        this.animationBuilder.setToStyles({ height: height + 'px' });
        
        return () => {
            this.platformUI.query(this.elementRef.nativeElement).css({ height: 'auto' })
        }*/
    }
    
    slideUp() {
        this.platformUI.query(this.elementRef.nativeElement).slideUp();
        
        /*var height = this.platformUI.query(this.elementRef.nativeElement).height();
        this.animationBuilder.setFromStyles({ overflow: 'hidden', height: height + 'px' });
        this.animationBuilder.setToStyles({ height: 0 });*/
    }
    
    slideInLeft() {
        this.platformUI.query(this.elementRef.nativeElement).css({ position: 'relative', left: 2000 }, this.duration);
        this.platformUI.query(this.elementRef.nativeElement).animate({ position: 'relative', left: 0 }, this.duration);
    }
    
    slideInRight() {
        this.platformUI.query(this.elementRef.nativeElement).css({ position: 'relative', left: -2000 }, this.duration);
        this.platformUI.query(this.elementRef.nativeElement).animate({ position: 'relative', left: 0 }, this.duration);
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