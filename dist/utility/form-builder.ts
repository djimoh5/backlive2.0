import {Control, ControlGroup} from 'angular2/common';
import {Common} from './common';

export class FormBuilder {
	static build(fields: {}, validators: FormValidators = {}) : ControlGroup {
		var form: ControlGroup = new ControlGroup({});
		
		for(var key in fields) {
			form.addControl(key, new Control(fields[key], validators[key]));
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
	[key: string]: Function;
}