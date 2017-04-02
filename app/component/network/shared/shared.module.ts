import { NgModule }       from '@angular/core';
import { SharedModule } from 'backlive/module/shared';

import { NetworkListComponent } from './list/list.component';

@NgModule({
    declarations: [
        NetworkListComponent
    ],
    imports: [SharedModule],
    exports: [NetworkListComponent],
    entryComponents: [NetworkListComponent]
})
export class NetworkSharedModule {}