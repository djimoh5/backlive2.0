import {Control, ControlGroup} from '@angular/common';
import {Common} from './common';

export class FormBuilder {
	static build(fields: {}, validators: FormValidators = {}) : ControlGroup {
		var form: ControlGroup = new ControlGroup({});
		return FormBuilder.buildForm(form, fields, validators);
	}
    
    private static buildForm(form: ControlGroup, fields: {}, validators: FormValidators = {}) {
        for(var key in fields) {
            if(Common.isObject(fields[key])) {
                 FormBuilder.buildForm(form, fields[key], validators);
            }
            else {
			     form.addControl(key, new Control(fields[key], validators[key]));
            }
		}

		return form;
    } 
	
	static clear(form: ControlGroup) {
		for(var key in form.controls) {
            var control: Control = <Control> form.controls[key];
			control.touched = false;
        }
	}
}

export interface FormValidators {
	[key: string]: Function | any;
}