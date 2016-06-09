import {Component, Input, Output, OnChanges, EventEmitter, ElementRef, AfterViewInit, AfterViewChecked, OnInit} from '@angular/core';
import {Path} from 'backlive/config';

import {BaseComponent, FilterMenuComponent, Filter, FilterOption} from 'backlive/component/shared';

import {DatePickerDirective, InputFormatDirective, TooltipDirective} from 'backlive/directive';
import {Common} from 'backlive/utility';
import {PlatformUI} from 'backlive/utility/ui';

@Component({
    selector: 'ui-table',
    templateUrl: Path.ComponentView('shared/table'),
    styleUrls: [Path.ComponentStyle('shared/table')],
    directives: [DatePickerDirective, InputFormatDirective, FilterMenuComponent, TooltipDirective]
})
export class TableComponent implements AfterViewChecked, OnChanges {
    @Input() tableRows: TableRow[];
    @Input() hiddenColumns: number[];
    @Input() showSearch: boolean = false;
    @Input() sortable: boolean = true;
    @Input() align: string = TableAlign.left;
    @Input() toolTip: string = "";
    @Input() searchBoxStyle: Object = {};

    @Output() columnClick: EventEmitter<TableClickData> = new EventEmitter();
    @Output() inputChange: EventEmitter<TableClickData> = new EventEmitter();
    @Output() toggleChange: EventEmitter<TableClickData> = new EventEmitter();
    @Output() selectedTableColumn: EventEmitter<TableColumn> = new EventEmitter();

    elementRef: ElementRef;
    platformUI: PlatformUI;

    sorterApplied: boolean;
    selectedRow: TableRow;

    TableColumnType = TableColumnType;

    isMobileView: boolean = false;

    filters: Filter[] = [];

    selectedTableColumnName: string;

    filterOptions: FilterOption[];

    hasActiveFilterFlag: boolean = false;


    constructor(elementRef: ElementRef, platformUI: PlatformUI) {
        this.elementRef = elementRef;
        this.platformUI = platformUI;

        this.platformUI.onResize('tablecomponent', (width: number) => this.checkForMobile(width));
    }

    ngOnChanges() {
        if (this.tableRows) {
            this.createDataFilter();
        }
    }

    ngAfterViewChecked() {
        this.initSort();
    }

    initSort() {
        if (this.sortable && this.tableRows && this.tableRows.length > 0) {
            var $elem = this.platformUI.query(this.elementRef.nativeElement).find("table");

            if (!this.sorterApplied) {
                $elem.tablesorter();
                this.sorterApplied = true;
            }
        }
    }

    filterClick(event, columnName: string) {
        this.selectedTableColumnName = columnName;
    }

    cellClicked(row: TableRow, column: TableColumn, rowNumber: number, columnNumber: number, event: MouseEvent) {
        if (column.clickable) {
            this.columnClick.emit({ row: row, column: column, rowNumber: rowNumber, columnNumber: columnNumber, mouseEvent: event });
            this.selectedRow = row;
        }
    }

    cellChanged(row: TableRow, column: TableColumn, rowNumber: number, columnNumber: number) {
        this.inputChange.emit({ row: row, column: column, rowNumber: rowNumber, columnNumber: columnNumber });
    }

    toggleChanged(row: TableRow, column: TableColumn, rowNumber: number, columnNumber: number) {
        this.toggleChange.emit({ row: row, column: column, rowNumber: rowNumber, columnNumber: columnNumber });
    }

    searchRows(searchKey: string) {
        if (searchKey.length > 0) {
            searchKey = searchKey.toLowerCase();
            this.tableRows.forEach(tableRow => {
                tableRow.hidden = true;
                for (var i = tableRow.columns.length - 1; i >= 0; i--) {
                    var val = tableRow.columns[i].value + '';
                    if (val.toLowerCase().indexOf(searchKey) >= 0) {
                        tableRow.hidden = false;
                        break;
                    }
                }
            })
        }
        else {
            this.tableRows.forEach(tableRow => { tableRow.hidden = false; });
        }
    }

    getText(column: TableColumn) {
        if (column.type === TableColumnType.Icon) {
            return column.value.text ? column.value.text : '';
        }

        return column.value;
    }

    isTextColumn(columnType: TableColumnType) {
        return (!columnType && columnType != 0) || columnType === TableColumnType.Icon;
    }

    isActive(tableRow: TableRow) {
        return this.selectedRow === tableRow;
    }

    isColumnHidden(columnIndex: number) {
        return this.hiddenColumns ? Common.inArray(columnIndex, this.hiddenColumns) : false;
    }

    checkForMobile(width: number) {
        this.isMobileView = width <= 768;
    }

    isActiveFilter(columnName: string) {
        if (this.filterOptions) {
            for (var i = this.filterOptions.length - 1; i >= 0; i--) {
                if (columnName == this.filterOptions[i].filterId) {
                    return true;
                }
            }
        }
        return false;
    }

    isPopulatedFilter(columnName: string) {
        if (this.filters) {
            for (var i = this.filters.length - 1; i >= 0; i--) {
                if (columnName == this.filters[i].name) {
                    return true;
                }
            }
        }
        return false;
    }

    // *** data filter methods ***

    filterData(filterOptions: FilterOption[]) {
        this.hasActiveFilterFlag = false;
        this.filterOptions = filterOptions;

        if (filterOptions.length === 0) {
            this.tableRows.forEach(row => row.hidden = false);
        }
        else {
            this.hasActiveFilterFlag = true;
            this.tableRows.forEach(row => {
                row.hidden = true;
                for (var i = row.columns.length - 1; i >= 0; i--) {
                    var column = row.columns[i];

                    for (var j = filterOptions.length - 1; j >= 0; j--) {
                        var filterOption = filterOptions[j];
                        if (column.name == filterOption.filterId && this.getText(column) === filterOption.name) {
                            row.hidden = false;
                            break;
                        }
                    }

                    if (!row.hidden) {
                        break;
                    }
                };
            });
        }
    }

    createDataFilter() {
        if (this.tableRows.length > 0) {
            var colIndex = 0;
            this.tableRows[0].columns.forEach(column => {
                if (column && column.filterable && column.name) {
                    var options: FilterOption[] = [];
                    var filter: Filter = { name: column.name, options: options, id: column.name };

                    //add values
                    var valueMap = {};

                    this.tableRows.forEach(row => {
                        var value = this.getText(row.columns[colIndex]);

                        if (!valueMap[value] && value != undefined && value != 'undefined') {
                            options.push({ filterId: column.name, name: value });
                            valueMap[value] = true;
                        }
                    });

                    if (options.length > 0) {
                        this.filters.push(filter);
                    }
                }

                colIndex++;
            });
        }
    }

    exportToCsv() {
        var addHeader = true;
        var csv = "", header = "";

        this.tableRows.forEach(tableRow => {
            if (!tableRow.hidden) {
                var row = "";

                tableRow.columns.forEach(tableColumn => {
                    if (tableColumn.name != '') {
                        if (addHeader) {
                            header += "," + tableColumn.name;
                        }

                        row += "," + (tableColumn.type === TableColumnType.Icon ?
                            (tableColumn.value.text ? tableColumn.value.text : '') :
                            tableColumn.value);
                    }
                });

                csv += row.substring(1) + "\n";
                addHeader = false;
            }
        });

        csv = header.substring(1) + "\n" + csv.substring(1);
        var encodedUri = encodeURI(csv);

        var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, "organizer.csv")
        }
        else {
            var link = document.createElement("a");
            link.setAttribute("href", "data:text/csv;charset=utf-8," + encodedUri);
            link.setAttribute("download", "organizer.csv")
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

    }
}

export interface TableRow {
    columns: TableColumn[];
    model: any;
    hidden?: boolean;
    footerColumns?: TableFooterColumn[];
}

export class TableColumn {
    name: string;
    value: any;
    type: TableColumnType = null;
    typeParam: string = null;
    clickable: boolean = false;
    class: string = null;
    filterable: boolean = false;

    constructor(name: string, value: any) {
        this.name = name;
        this.value = value;
    }
}

export interface TableFooterColumn {
    name: string;
    value: any;
    type?: TableColumnType;
    clickable?: boolean;
}

export interface TableClickData {
    row: TableRow;
    column: TableColumn;
    rowNumber: number;
    columnNumber: number;
    mouseEvent?: MouseEvent;
}

export enum TableColumnType {
    Date,
    Checkbox,
    Icon,
    Button,
    Input
}

export class TableAlign {
    static left: string = "left";
    static center: string = "center";
    static right: string = "right";
}