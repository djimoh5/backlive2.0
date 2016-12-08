import { NgModule }       from '@angular/core';
import { SharedModule } from 'backlive/module/shared';

import { IndicatorEditorComponent } from '../../indicator/editor/editor.component';
import { IndicatorDataMenuComponent } from '../../indicator/data-menu/data-menu.component';
import { IndicatorParamComponent } from '../../indicator/param/param.component';

@NgModule({
    declarations: [
        IndicatorEditorComponent, IndicatorDataMenuComponent, IndicatorParamComponent
    ],
    imports: [SharedModule],
    exports: [IndicatorEditorComponent, IndicatorDataMenuComponent, IndicatorParamComponent],
    entryComponents: [IndicatorEditorComponent]
})
export class NetworkSharedModule {}