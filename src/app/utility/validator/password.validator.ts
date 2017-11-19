import { FormControl } from '@angular/forms';

export function PasswordValidator(control: FormControl, passwordStrength: number = 4) { 
    var strength = calculatePasswordStrength(control.value);
    
    if(strength < passwordStrength) {
        return { 'passwordStrength': true };
    }
    
    return null;
}

function calculatePasswordStrength(password) {
    if (password.length < 1) {
        return 0;
    }

    if (password.length <= 6) {
        return 1;
    }

    if (password.length < 8) {
        return 2;
    }

    var complexity = 0;

    if (password.length >= 10) {
        complexity++;
    }

    if (password.length >= 12) {
        complexity++;
    }

    if (/\d+/.test(password) && /[a-zA-Z]+/.test(password)) {
        complexity++;
    }

    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
        complexity++;
    }

    if (/.[!,@,#,$,%,^,&,*,?,_,~,-,£,(,),\s]/.test(password)) {
        complexity++;
    }

    if (complexity == 5) {
        return 5;
    }

    if (complexity == 4) {
        return 4;
    }

    if (complexity == 3 || complexity == 2) {
        return 3;
    }

    return 2;
} 