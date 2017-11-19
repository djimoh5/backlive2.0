import {Input, Directive, ElementRef, OnChanges, AfterViewInit, SimpleChanges} from '@angular/core';

import {ApiService} from 'backlive/service';

import {PlatformUI} from 'backlive/utility/ui';


@Directive({
    selector: '[ellipsis]'
})
export class EllipsisDirective implements OnChanges, AfterViewInit {
    @Input('ellipsis') text: any;

    apiService: ApiService;
    platformUI: PlatformUI;

    private _element: HTMLElement;

    constructor(elementRef: ElementRef, platformUI: PlatformUI, apiService: ApiService) {
        this.platformUI = platformUI;
        this.apiService = apiService;

        this._element = this.platformUI.query(elementRef)[0].nativeElement;
    }

    ngAfterViewInit() {
        this.buildEllipsis();
    }

    ngOnChanges(simpleChanges: SimpleChanges) {
        this.buildEllipsis();
    }


    buildEllipsis() {
        const element = this.platformUI.query(this._element);
        const bindArray = this.text.split(' ');

        const ellipsisSymbol = ' \u2026';
        const appendString = ellipsisSymbol;

        element.html(this.text);

        // If text has overflow
        if (this.isOverflowed(this._element)) {
            const initialMaxHeight = this._element.clientHeight;

            element.html(this.text + appendString);

            let isTruncated = false;
            // Set complete text and remove one word at a time, until there is no overflow
            while (!isTruncated) {
                bindArray.pop();
                element.text(bindArray.join(' ') + appendString);

                if (this._element.scrollHeight < initialMaxHeight || this.isOverflowed(this._element) === false) {
                    isTruncated = true;
                }
            }
        }
    }

    isOverflowed(thisElement) {
        return thisElement.scrollHeight > thisElement.clientHeight;
    }
}