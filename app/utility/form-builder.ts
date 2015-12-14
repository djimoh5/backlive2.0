import {Control, ControlGroup} from 'angular2/angular2';
import {Common, Object} from './common';

export class FormBuilder {
	static build(fields: Object, validators: FormValidators = {}) : ControlGroup {
		var form: ControlGroup = new ControlGroup({});
		
		for(var key in fields) {
			form.addControl(key, new Control(fields[key], validators[key]));
		}
		
		return form;
	}
}

export interface FormValidators {
	[key: string]: Function;
}