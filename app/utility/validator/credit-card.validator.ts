import {Control} from '@angular/common';

export function CreditCardValidator(control: Control) 
{
    if(control && control.value) {
        var cc = control.value.replace(/-/g, '').replace(/ /g, '');
        var sum = 0;
        var numdigits = cc.length;
        var parity = numdigits % 2;
        for(var i=0; i < numdigits; i++) {
            var digit = parseInt(cc.charAt(i))
            if(i % 2 == parity) digit *= 2;
            if(digit > 9) digit -= 9;
            sum += digit;
        }
        
        if((sum % 10) == 0) {
            return null;
        }
        else {
            return { 'creditCardValid': true };
        }
    }
    else {
        return { 'creditCardValid': true };
    }
}