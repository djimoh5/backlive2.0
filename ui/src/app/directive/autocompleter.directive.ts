import {Directive, ElementRef, EventEmitter, Input, Output, OnChanges, SimpleChanges} from '@angular/core';
import {ApiService} from 'backlive/service';

import {Common} from 'backlive/utility';
import {PlatformUI} from 'backlive/utility/ui';

@Directive({
    selector: '[autocompleter]'
})
export class AutoCompleterDirective implements OnChanges {
    @Input('autocompleter') data: any;
    @Input() paramName: string;
    @Input() transformResult: Function;
    @Output() optionSelect: EventEmitter<any> = new EventEmitter<any>();
    @Output() cancel: EventEmitter<any> = new EventEmitter<any>();

    blurDisabled: boolean = false;
    
    constructor(
        private elementRef: ElementRef,
        private platformUI: PlatformUI,
        private apiService: ApiService) {
    }

    ngOnChanges(_simpleChanges: SimpleChanges) {
        var $elem = this.platformUI.query(this.elementRef.nativeElement);
        var options: Options = {
            ajaxSettings: { headers: this.apiService.AuthorizationHeader },
            deferRequestBy: 300,
            minChars: 2,
            dataType: 'json',
            onSelect: (suggestion: any) => this.selected(suggestion),
            onHide: () => this.hidden(),
            beforeRender: () => this.beforeRender()
        };
        if (Common.isString(this.data)) {
            options.serviceUrl = this.data;
        }
        else {
            options.lookup = this.data;
        }

        if (this.paramName) {
            options.paramName = this.paramName;
        }

        if (this.transformResult) {
            options.transformResult = this.transformResult;
        }

        $elem.autocomplete('dispose');
        $elem.autocomplete(options);

        $elem.blur((event) => {
            if (this.blurDisabled) {
                event.preventDefault();
            }
            else {
                this.cancel.emit();
            }
        });
    }

    beforeRender() {
        this.blurDisabled = true;
    }

    hidden() {
        this.cancel.emit();
    }

    selected(suggestion: any) {
        this.optionSelect.emit(suggestion);
    }
}

interface Options {
    ajaxSettings: {};
    deferRequestBy: number; //in milliseconds
    minChars: number;
    dataType: string;
    onSelect: Function;
    onHide: Function; 
    beforeRender: Function;
    serviceUrl?: string;
    lookup?: {}[];
    paramName?: string;
    transformResult?: Function;
}

export interface AutoCompleteSuggestion {
    value: string;
    data: any;
}