import {AbstractControl} from '@angular/common';

export function CompareValidator(control1: AbstractControl, control2: AbstractControl) { 

    if(control1 && control2 && control1.value !== control2.value) {
        return { 'compare': true };
    }
    
    return null;
}