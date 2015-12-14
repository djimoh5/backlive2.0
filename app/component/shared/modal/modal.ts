import {Component, NgIf} from 'angular2/angular2';
import {Path} from '../../../config/config';
import {BaseComponent, AlertComponent} from '../../../config/imports/shared';

import {AppService, UserService} from '../../../config/imports/service';

import {Event} from '../../../service/model/event';

@Component({
    selector: 'backlive-modal',
    templateUrl: Path.Component('shared/modal/modal.html'),
    directives: [NgIf]
})
export class ModalComponent extends BaseComponent {
    id: string = 'backliveModal';
    options: ModalOptions;
    
    constructor (appService:AppService) {
        super(appService);
        
        this.options = new ModalOptions();
        
        this.appService.subscribe(Event.OpenModal, (options: ModalOptions) => this.open(options));
        this.appService.subscribe(Event.CloseModal, () => this.close());
    }
    
    open (options: ModalOptions) {
        this.options = options;
        $('#' + this.id).modal('show');
    }
    
    close () {
        $('#' + this.id).modal('hide');
    }
}

export class ModalOptions {
    title: string;
    body: string;
    footerVisible: boolean = false;
}