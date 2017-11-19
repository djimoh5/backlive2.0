import {Directive, ElementRef, Input, AfterViewInit} from '@angular/core';
import {PlatformUI} from 'backlive/utility/ui';

@Directive({
    selector: '[passwordStrength]'
})
export class  PasswordStrengthDirective implements AfterViewInit {
    @Input('passwordStrength') minStrength: number = 3;
    elementRef: ElementRef;
    platformUI: PlatformUI;
    
    constructor(elementRef: ElementRef, platformUI: PlatformUI) {
        this.elementRef = elementRef;
        this.platformUI = platformUI;
    }
    
    ngAfterViewInit() {
        this.platformUI.query(this.elementRef.nativeElement).passwordstrength({
            minStrength: this.minStrength
        });
    }
}