import { NgModule }       from '@angular/core';
import { SharedModule } from 'backlive/module/shared';

import { ResearchComponent } from './research.component';

import { researchRouting } from './research.routing';

@NgModule({
    declarations: [
        ResearchComponent
    ],
    imports: [SharedModule, researchRouting]
})
export class ResearchModule {}