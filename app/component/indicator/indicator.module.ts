import { NgModule }       from '@angular/core';
import { SharedModule } from 'backlive/module/shared';

import { IndicatorComponent } from './indicator.component';
import { IndicatorEditorComponent } from './editor/editor.component';
import { IndicatorDataMenuComponent } from './data-menu/data-menu.component';
import { IndicatorParamComponent } from './param/param.component';


@NgModule({
    declarations: [
        IndicatorComponent, IndicatorEditorComponent, IndicatorDataMenuComponent, IndicatorParamComponent
    ],
    imports: [SharedModule],
    exports: [IndicatorComponent, IndicatorEditorComponent],
    entryComponents: [IndicatorEditorComponent]
})
export class IndicatorModule {}