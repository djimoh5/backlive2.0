import {Control} from '@angular/common';

export function ExpirationMonthValidator(control: Control) {
    if (control && control.value) {
        if (control.value < 1 || control.value > 12) {
            return { 'expirationMonthValid': true };
        }
        else {
            return null;
        }
    }
    else {
        return { 'expirationMonthValid': true };
    }
}