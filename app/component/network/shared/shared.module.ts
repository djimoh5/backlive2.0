import { NgModule }       from '@angular/core';
import { SharedModule } from 'backlive/module/shared';

import { IndicatorEditorComponent } from '../../indicator/editor/editor.component';
import { IndicatorDataMenuComponent } from '../../indicator/data-menu/data-menu.component';
import { IndicatorParamComponent } from '../../indicator/param/param.component';
import { StrategyEditorComponent } from '../../strategy/editor/editor.component';
import { NetworkListComponent } from './list/list.component';

@NgModule({
    declarations: [
        IndicatorEditorComponent, IndicatorDataMenuComponent, IndicatorParamComponent, StrategyEditorComponent, 
        NetworkListComponent
    ],
    imports: [SharedModule],
    exports: [IndicatorEditorComponent, IndicatorDataMenuComponent, IndicatorParamComponent, StrategyEditorComponent, NetworkListComponent],
    entryComponents: [IndicatorEditorComponent, StrategyEditorComponent, NetworkListComponent]
})
export class NetworkSharedModule {}