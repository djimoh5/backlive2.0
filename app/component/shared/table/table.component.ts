import { Component, Input, Output, OnChanges, OnDestroy, EventEmitter, ElementRef, AfterViewInit, AfterViewChecked, OnInit, SimpleChanges, ViewEncapsulation, ViewChild } from '@angular/core';
import { Path } from 'backlive/config';

import { Filter, FilterOption } from 'backlive/component/shared';

import { Common } from 'backlive/utility';
import { PlatformUI } from 'backlive/utility/ui';

import { RouterService, RouteInfo } from 'backlive/service';

@Component({
    selector: 'ui-table',
    templateUrl: Path.ComponentView('shared/table'),
    styleUrls: [Path.ComponentStyle('shared/table')],
    encapsulation: ViewEncapsulation.None
})
export class TableComponent implements AfterViewChecked, OnInit, OnChanges, OnDestroy, AfterViewInit {
    @Input() tableRows: TableRow[];
    @Input() hiddenColumns: number[];
    @Input() showSearch: boolean = false;
    @Input() sortable: boolean = true;
    @Input() align: string = TableAlign.left;
    @Input() searchBoxStyle: Object = {};
    @Input() isScrollable: boolean = false;

    defaultSearchBoxStyle: Object = {};

    @Output() columnClick: EventEmitter<TableClickData> = new EventEmitter<TableClickData>();
    @Output() inputChange: EventEmitter<TableClickData> = new EventEmitter<TableClickData>();
    @Output() toggleChange: EventEmitter<TableClickData> = new EventEmitter<TableClickData>();
    @Output() selectedTableColumn: EventEmitter<TableColumn> = new EventEmitter<TableColumn>();
    
    TableColumnType = TableColumnType;

    pluginsApplied: boolean;
    selectedRow: TableRow;
    selectedTableColumnName: string;

    isMobileView: boolean = false;

    filters: Filter[] = [];
    filterOptions: FilterOption[];
    hasActiveFilterFlag: boolean = false;

    @ViewChild('table') table: ElementRef;
    customMarkup: boolean;

    constructor(
        private elementRef: ElementRef,
        private platformUI: PlatformUI,
        private routerService: RouterService) {
    }

    ngOnInit() {
        this.defaultSearchBoxStyle = this.searchBoxStyle;
        this.platformUI.onResize('tablecomponent', (size: { width: number, height: number }) => {
            this.checkForMobile(size.width);
            if (this.isScrollable) {
                this.setBodyHeight();
            }
        });
    }

    ngOnChanges(simpleChanges: SimpleChanges) {
        if (simpleChanges['tableRows'] && this.tableRows) {
            this.createDataFilter();
            this.pluginsApplied = false;
        }
    }

    ngAfterViewChecked() {
        if (!this.pluginsApplied) {
            this.initPlugins();
        }
    }

    ngAfterViewInit() {
        if (this.isScrollable) {
            setTimeout(() => {
                this.setBodyHeight();
            });
        }

        this.checkForMobile(this.platformUI.query(window).width());
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

    initPlugins() {
        var $table = this.platformUI.query(this.table.nativeElement);
        if ($table.children().length) {
            if (this.sortable) {
                setTimeout(() => {
                    $table.tablesorter();
                });
            }

            this.pluginsApplied = true;
            this.customMarkup = this.customMarkup || !this.tableRows;

            if (this.customMarkup) {
                setTimeout(() => { this.buildTableRowsFromMarkup(); });
            }
        }
    }

    buildTableRowsFromMarkup() {
        this.tableRows = [];
        var self = this;
        self.platformUI.query(this.table.nativeElement).find('tbody tr').each(function () {
            var row: TableRow = { columns: [], model: null };
            self.platformUI.query(this).find('td').each(function () {
                var $td = self.platformUI.query(this);
                row.columns.push(new TableColumn('', $td.text().trim()));
            });

            self.tableRows.push(row);
        });
    }

    searchRows(searchKey: string) {
        if (searchKey.length > 0) {
            searchKey = searchKey.toLowerCase();
            this.tableRows.forEach((tableRow, index) => {
                this.showHideRow(tableRow, index, true);
                for (var i = tableRow.columns.length - 1; i >= 0; i--) {
                    var val = (tableRow.columns[i].value.text || tableRow.columns[i].value) + '';
                    if (val.toLowerCase().indexOf(searchKey) >= 0) {
                        this.showHideRow(tableRow, index, false);
                        break;
                    }
                }
            });
        }
        else {
            this.tableRows.forEach((tableRow, index) => this.showHideRow(tableRow, index, false));
        }
    }

    showHideRow(row: TableRow, index: number, hidden: boolean) {
        row.hidden = hidden;
        if (this.customMarkup) {
            var $row = this.platformUI.query(this.table.nativeElement).find('tbody tr:eq(' + index + ')');
            if (hidden) { $row.hide(); }
            else { $row.show(); }
        }
    }

    open(route: RouteInfo, params: any) {
        this.routerService.open(route, params);
    }

    getText(column: TableColumn) {
        if (column.type === TableColumnType.Icon) {
            return column.value.text ? column.value.text : '';
        }

        return column.value;
    }

    isDataTable() {
        return this.tableRows && this.tableRows.length > 0 && !this.customMarkup;
    }

    isActive(tableRow: TableRow) {
        return this.selectedRow === tableRow;
    }

    isColumnHidden(columnIndex: number) {
        return this.hiddenColumns ? Common.inArray(columnIndex, this.hiddenColumns) : false;
    }

    checkForMobile(width: number) {
        this.isMobileView = width <= 768;

        if (this.isMobileView) {
            this.searchBoxStyle = {};
        }
        else {
            this.searchBoxStyle = this.defaultSearchBoxStyle;
        }
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

    setBodyHeight() {
        var table = this.platformUI.query(this.elementRef.nativeElement).find("table");
        if (table.length) {
            var th_cells = table.find("th");
            var windowHeight = this.platformUI.query(window).height();
            var tableOffset = table.offset().top;
            var headerHeight = table.find("thead").height();
            var rows = table.find('tr');
            var padding = 40;
            var bodyHeight = windowHeight - (tableOffset + headerHeight + padding);
            bodyHeight = (Common.isNumber(bodyHeight)) ? bodyHeight : 500;

            table.find("tbody").height(bodyHeight);

            var maxValueLengths: ColumnValueLength[] = this.getMaxLengthsPerColumn();

            for (var i = 0; i < rows.length; i++) {
                var td_cells = this.platformUI.query(rows[i]).children();
                if (maxValueLengths.length == td_cells.length) {
                    for (var j = 0; j < td_cells.length; j++) {
                        if (td_cells[j] && th_cells[j]) {
                            if (maxValueLengths[j].colName && maxValueLengths[j].maxLength > 14) {
                                td_cells[j].style.width = (maxValueLengths[j].maxLength * 8) + "px";
                                th_cells[j].style.width = (maxValueLengths[j].maxLength * 8) + "px";
                            } else {
                                td_cells[j].style.width = "120px";
                                th_cells[j].style.width = "120px";
                            }
                        }
                    }
                }
            }
        }
    }

    getMaxLengthsPerColumn() {
        var maxValueLengths: ColumnValueLength[] = [];

        if (this.tableRows.length > 0) {
            var colIndex = 0;
            this.tableRows[0].columns.forEach(column => {
                var maxValue = -1;
                this.tableRows.forEach(row => {
                    var value = this.getText(row.columns[colIndex]);
                    if (value != undefined && value != 'undefined') {
                        if (value.length > maxValue) {
                            maxValue = value.length;
                        }
                    }
                });

                maxValueLengths.push({ colName: column.name, maxLength: maxValue });
                maxValue = -1;
                colIndex++;
            });
        }

        return maxValueLengths;
    }

    forEachRow(fn) {
        if (this.tableRows) {
            this.tableRows.forEach(tableRow => {
                fn(tableRow);
            });
        }
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

        csv = header.substring(1) + "\n" + csv;
        var encodedUri = encodeURI(csv);

        var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, "organizer.csv");
        }
        else {
            var link = document.createElement("a");
            link.setAttribute("href", "data:text/csv;charset=utf-8," + encodedUri);
            link.setAttribute("download", "organizer.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    isInactive(row: TableRow) {
        if (row.model && typeof(row.model.isActive) !== 'undefined') {
            return !row.model.isActive;
        }
        return false;
    }

    ngOnDestroy() {
        this.platformUI.endOnResize('tablecomponent');
    }
}

export interface ColumnValueLength {
    colName: string;
    maxLength: number;
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

    constructor(name: string, value: any, optional?: { type?: TableColumnType, typeParam?: string, clickable?: boolean, class?: string, filterable?: boolean }) {
        this.name = name;
        this.value = value;

        if (optional) {
            for (var key in optional) {
                this[key] = optional[key];
            }
        }
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
    Input,
    Toggle,
    ProfilePhoto,
    Link,
    ExternalLink
}

export class TableAlign {
    static left: string = "left";
    static center: string = "center";
    static right: string = "right";
}