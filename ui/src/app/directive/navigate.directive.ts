import { Directive, Input, OnChanges, SimpleChanges, HostBinding, HostListener } from '@angular/core';

import { AppService, RouteInfo } from 'backlive/service';
import { Common } from 'backlive/utility';

@Directive({
    selector: 'a[navigate]'
})
export class NavigateDirective implements OnChanges {
    @Input('navigate') routerLink: [RouteInfo, { [key: string]: any }] | RouteInfo | string;
    @Input() params: { [key: string]: any };
    @Input() target: string;

    @HostBinding('attr.href') href: string;

    @HostBinding('attr.target') get targetLink(): string { return this.target; };

    constructor(private appService: AppService) {
    }

    ngOnChanges(simpleChanges: SimpleChanges) {
        if (this.routerLink) {
            if (Common.isString(this.routerLink)) {
                this.href = <string> this.routerLink;
            }
            else if (Common.isArray(this.routerLink)) {
                if (this.routerLink[0]){
                    this.href = this.appService.getLinkUrl(this.routerLink[0], this.routerLink[1]);
                }
            }
            else {
                this.href = this.appService.getLinkUrl(<RouteInfo> this.routerLink, this.params);
            }
        }
    }

    @HostListener('click', ['$event'])
    onClick(event: MouseEvent) {
        if (this.routerLink) {
            if (event.shiftKey || event.ctrlKey
                || (Common.isString(this.target) && this.target != '_self')
                || Common.isString(this.routerLink)) {
                return true;
            }

            var routeInfo: RouteInfo;
            var params: { [key: string]: any };

            if (Common.isArray(this.routerLink)) {
                routeInfo = this.routerLink[0];
                params = this.routerLink[1];
            }
            else {
                routeInfo = <RouteInfo>this.routerLink;
                params = this.params;
            }

            this.appService.navigate(routeInfo, params);

            return false;
        }
    }
}