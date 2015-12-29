import {Component, Input} from 'angular2/core';
import {Path} from '../../../../config/config';

@Component({
    selector: 'progress-bar',
    template: `<div class="progress" *ngIf="progress">
                   <div class="progress-bar progress-bar-success progress-bar-striped" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" [style.width.px]="progress"></div>
               </div>`
})
export class ProgressBarComponent {
    @Input() progress: number;
    constructor () {}
}