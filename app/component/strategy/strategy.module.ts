import { NgModule }       from '@angular/core';
import { SharedModule } from 'backlive/module/shared';

import { StrategyComponent } from './strategy.component';
import { StrategyEditorComponent } from './editor/editor.component';

@NgModule({
    declarations: [
        StrategyComponent, StrategyEditorComponent
    ],
    imports: [SharedModule],
    exports: [StrategyComponent, StrategyEditorComponent],
    entryComponents: [StrategyEditorComponent]
})
export class StrategyModule {}