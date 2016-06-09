import {Directive, ElementRef, Input, HostListener} from '@angular/core';
import {PlatformUI} from 'backlive/utility/ui'

import {Common} from 'backlive/utility'

@Directive({
    selector: '[inputFormat]'
})
export class InputFormatDirective {
    @Input('inputFormat') format: string;
    elementRef: ElementRef;
    platformUI: PlatformUI;

    constructor(elementRef: ElementRef, platformUI: PlatformUI) {
        this.elementRef = elementRef;
        this.platformUI = platformUI;
    }
    
    @HostListener('keydown', ['$event'])
    onKeydown(e: any) {
        var additionalValidCodes: number[] = [8, 46, 37, 39, 9, 67, 86, 88];
        var isValid: boolean = true;
        
        var keycode =  e.keyCode ? e.keyCode : e.which;
        if(keycode >= 96 && keycode <= 105) { //number pad, subtract 48 to get corresponding number
            keycode -= 48;
        }
                
        switch(this.format) {
            case InputFormat.numeric:
            case InputFormat.zipcode:
            case InputFormat.phone:
                additionalValidCodes.push(190);
                additionalValidCodes.push(110);
                
                if(this.format === InputFormat.zipcode) {
                    additionalValidCodes.push(189);
                }
                else if(this.format === InputFormat.phone) {
                    additionalValidCodes.push(32);
                    additionalValidCodes.push(48);
                    additionalValidCodes.push(57);
                    additionalValidCodes.push(109);
                    additionalValidCodes.push(173); //dashes in firefox
                    additionalValidCodes.push(189);
                    additionalValidCodes.push(190);
                }
                
                isValid = Common.isNumber(String.fromCharCode(keycode));
                break;
            case InputFormat.alpha:
                var regex = /^[a-z]+$/i;
                isValid = regex.test(String.fromCharCode(keycode));
                break;
            case InputFormat.alphanumeric:
                var regex = /^[a-z0-9]+$/i;
                isValid = regex.test(String.fromCharCode(keycode))
                break;
        }
       
        if(isValid || Common.inArray(keycode, additionalValidCodes)) {
            return true;
        }
        else {
            e.preventDefault();
        }
    }
    
    /*** shouldn't need to add any more functionality to this, use keydown above! */
    @HostListener('keyup', ['$event'])
    onKeyup(e: any) {
        var keycode =  e.keyCode ? e.keyCode : e.which;
        
        switch(this.format) {
            case InputFormat.alphanumeric:
                this.checkSpecialCharacter(keycode);
                break;
            case InputFormat.numeric:
            case InputFormat.zipcode:
                if(!this.checkSpecialCharacter(keycode)) {
                    var copyPasteKeycodes = [67, 86, 88];
                    
                    if(Common.inArray(keycode, copyPasteKeycodes)) {
                        var $elem = this.platformUI.query(this.elementRef.nativeElement);
                        var val = $elem.val();
                        if(!Common.isNumber(val)) {
                            $elem.val(val.substring(0, val.length - 1));
                        }
                    }
                }

                break;
        }
    }
    
    checkSpecialCharacter(keycode: number) {
        //check for special characters on numbers
        if(Common.isNumber(String.fromCharCode(keycode))) {
            var $elem = this.platformUI.query(this.elementRef.nativeElement);
            var val = $elem.val();

            if(!Common.isNumber(val.substring(val.length - 1))) {
                $elem.val(val.substring(0, val.length - 1))
                return true;
            }
        }
        
        return false;
    }
}

class InputFormat {
    static numeric: string = 'numeric';
    static alpha: string = 'alpha';
    static alphanumeric: string = 'alphanumeric';
    static zipcode: string = 'zipcode';
    static phone: string = 'phone';
}