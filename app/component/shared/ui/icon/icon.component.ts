import {Component, Input, Output, EventEmitter, OnChanges} from '@angular/core';
import {Type} from './icon.input';

@Component({
    selector: 'ui-icon',
    template: `<span [class]="iconClass"></span>`
})
export class IconComponent implements OnChanges {
    @Input() type: string;
    @Input() size: string;

    iconClass: string;
    
    ngOnChanges () {
        this.iconClass = 'glyphicon ';

        if(this.type && Type[this.type]) {
            this.iconClass += Type[this.type]
        }
        
        /*if(this.size && Size[this.size]) {
            this.iconClass += ' ' + Size[this.size]
        }*/
    }
}