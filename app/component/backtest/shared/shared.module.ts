import { NgModule }       from '@angular/core';
import { SharedModule } from 'backlive/module/shared';

import { IndicatorEditorComponent } from '../../indicator/editor/editor.component';
import { IndicatorDataMenuComponent } from '../../indicator/data-menu/data-menu.component';

@NgModule({
    declarations: [
        IndicatorEditorComponent, IndicatorDataMenuComponent
    ],
    imports: [SharedModule],
    exports: [IndicatorEditorComponent, IndicatorDataMenuComponent],
    entryComponents: [IndicatorEditorComponent]
})
export class BacktestSharedModule {}