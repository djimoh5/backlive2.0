import {FormControl, FormGroup} from '@angular/forms';
import {Common} from './common';

export class FormFactory {
    static build(fields: {}, validators: FormValidators = {}): FormGroup {
        return FormFactory.buildForm(fields, validators);
    }

    private static buildForm(fields: {}, validators: FormValidators = {}) {
        var form: FormGroup = new FormGroup({});

        for (var key in fields) {
            if (Common.isObject(fields[key])) {
                form.addControl(key, FormFactory.buildForm(fields[key], validators));
            }
            else {
                form.addControl(key, new FormControl(fields[key], validators[key]));
            }
        }

        return form;
    }

    static buildFlat(fields: {}, validators: FormValidators = {}): FormGroup {
        var form: FormGroup = new FormGroup({});
        return FormFactory.buildFlatForm(form, fields, validators);
    }

    private static buildFlatForm(form: FormGroup, fields: {}, validators: FormValidators = {}) {
        for (var key in fields) {
            if (Common.isObject(fields[key])) {
                FormFactory.buildFlatForm(form, fields[key], validators);
            }
            else {
                form.addControl(key, new FormControl(fields[key], validators[key]));
            }
        }

        return form;
    } 

    static clear(form: FormGroup) {
        for (var key in form.controls) {
            var control: FormControl = <FormControl>form.controls[key];
            control.markAsUntouched();
        }
    }
}

export interface FormValidators {
    [key: string]: Function | any;
}