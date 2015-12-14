import {Component, CORE_DIRECTIVES, Input} from 'angular2/angular2';
import {Path} from '../../../config/config';

@Component({
    selector: 'progress-bar',
    templateUrl: Path.Component('shared/progress-bar/progress-bar.html'),
    directives: [CORE_DIRECTIVES]
})
export class ProgressBarComponent {
    @Input() progress: number;
    constructor () {}
}