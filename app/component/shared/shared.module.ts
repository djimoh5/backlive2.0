import { NgModule }       from '@angular/core';

/* imported modules */
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

var importedModules: any[] = [CommonModule, FormsModule, ReactiveFormsModule];

/* shared components */
import { BaseComponent } from './base.component';
import { PageComponent } from './page.component';
import { ModalComponent } from './modal/modal.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { AccordionComponent, AccordionGroupComponent } from './accordion/accordion.component';
import { TabComponent, TabContentComponent, TabViewComponent } from './tab-view/tab-view.component';
import { FilterMenuComponent } from './filter-menu/filter-menu.component';
import { TableComponent } from './table/table.component';
import { SplitViewComponent } from './split-view/split-view.component';
import { AudioComponent } from './audio/audio.component';

var sharedComponents = [BaseComponent, PageComponent, ModalComponent, SearchBarComponent, AccordionComponent, AccordionGroupComponent,
    TabComponent, TabContentComponent, TabViewComponent, FilterMenuComponent, TableComponent, SplitViewComponent, AudioComponent]

/* UI components */
import {AlertComponent} from './ui/alert/alert.component';
import {ProgressBarComponent} from './ui/progress-bar.component';
import {AjaxLoaderComponent} from './ui/ajax-loader.component';
import {SearchBoxComponent} from './ui/search-box.component';

import {SelectOptionComponent, SelectCategoryComponent, SelectComponent} from './ui/select.component';

//Buttons
import {RadioButtonComponent} from './ui/button/radio-button.component';
import {ButtonComponent} from './ui/button/button.component';
import {DropdownButtonComponent} from './ui/button/dropdown-button.component';
import {DropdownMenuComponent} from './ui/button/dropdown-menu.component';
import {FileButtonComponent} from './ui/button/file-button.component';
import {CheckboxComponent} from './ui/checkbox.component';

//Icons
import {IconComponent} from './ui/icon/icon.component';

var uiComponents = [
    AlertComponent, ProgressBarComponent, AjaxLoaderComponent, SearchBoxComponent,
    SelectComponent, SelectOptionComponent, SelectCategoryComponent,
    RadioButtonComponent, ButtonComponent, DropdownButtonComponent, DropdownMenuComponent, FileButtonComponent, 
    CheckboxComponent, IconComponent
];

/* directives */
import { AnimateDirective, JIsotopeDirective, DatePickerDirective, AutoCompleterDirective, FileUploaderDirective, TooltipDirective, ReadMoreDirective, SearchBoxDirective,
    InputFormatDirective, FocusDirective} from 'backlive/directive';

var directives = [AnimateDirective, JIsotopeDirective, DatePickerDirective, AutoCompleterDirective, FileUploaderDirective, TooltipDirective, ReadMoreDirective, SearchBoxDirective,
        InputFormatDirective, FocusDirective];

/* pipes */
import { FormatDatePipe, SortByPipe } from 'backlive/pipe';
var pipes = [FormatDatePipe, SortByPipe];

@NgModule({
    declarations: [...pipes, ...directives, ...uiComponents, ...sharedComponents],
    imports: importedModules,
    exports: [...importedModules, ...pipes, ...directives, ...uiComponents, ...sharedComponents],
    entryComponents: [SearchBarComponent]
})
export class SharedModule {}