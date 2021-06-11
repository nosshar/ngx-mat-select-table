import * as tslib_1 from "tslib";
var MatSelectTableComponent_1;
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, forwardRef, Input, OnChanges, OnDestroy, OnInit, Output, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { merge, Subject } from 'rxjs';
import { MatOption, MatSelect, MatSort, MatTable } from '@angular/material';
import { isArray, isNullOrUndefined, isNumber, isString } from 'util';
import { _isNumberValue } from '@angular/cdk/coercion';
import { debounceTime, take, takeUntil } from 'rxjs/operators';
import { MatSelectSearchComponent } from 'ngx-mat-select-search';
const MAX_SAFE_INTEGER = 9007199254740991;
let MatSelectTableComponent = MatSelectTableComponent_1 = class MatSelectTableComponent {
    constructor(cd) {
        this.cd = cd;
        this.nullRow = { id: null };
        this.close = new EventEmitter();
        this.completeRowList = [];
        this.completeValueList = [];
        this.controlValueAccessorKeys = [
            'formControl',
            'formControlName',
            'formGroup',
            'formGroupName',
            'formArray',
            'formArrayName'
        ];
        /** Subject that emits when the component has been destroyed. */
        this._onDestroy = new Subject();
        this._onSelectOpen = new Subject();
        this._onOptionsChange = new Subject();
        this.tableColumnsMap = new Map();
        this.filterControls = new FormGroup({});
        this.overallFilterControl = new FormControl('');
    }
    ngOnInit() {
        this.multiple = this.multiple || false;
        this.matSelect.openedChange
            .pipe(takeUntil(this._onDestroy))
            .subscribe(opened => {
            if (this.resetFiltersOnOpen !== false || !this.matOptions.length) {
                this.resetFilters();
            }
            this.overallSearchVisibleState = this.overallSearchVisible;
            if (this.resetSortOnOpen !== false) {
                this.sort.sort({ id: '', start: 'asc', disableClear: false });
            }
            if (!opened) {
                this.close.emit(!opened);
                return;
            }
            if (this.overallSearchEnabled) {
                this.proxyMatSelectSearchConfiguration(this.matSelectSearchConfigurator);
            }
            // ToDo: get rid of this workaround (updates header row [otherwise sort mechanism produces glitches])
            this.table._headerRowDefChanged = true;
            // Disable sort buttons to prevent sorting change on SPACE key pressed in filter field
            setTimeout(() => [].forEach.call(this.tableRef.nativeElement.querySelectorAll('button.mat-sort-header-button'), (e) => e.disabled = true));
            // Patch the height of the panel to include the height of the header and footer
            const panelElement = this.matSelect.panel.nativeElement;
            const panelHeight = panelElement.getBoundingClientRect().height;
            let tableAdditionalHeight = 0;
            this.table
                ._getRenderedRows(this.table._headerRowOutlet)
                .concat(this.table._getRenderedRows(this.table._footerRowOutlet))
                .forEach(row => tableAdditionalHeight += row.getBoundingClientRect().height);
            if (!isNaN(panelHeight)) {
                panelElement.style.maxHeight = `${panelHeight + tableAdditionalHeight}px`;
            }
            if (!this.matSelectSearchConfigurator.disableScrollToActiveOnOptionsChanged
                && !isNullOrUndefined(this.matSelect._keyManager) && this.completeRowList.length > 0) {
                this._onSelectOpen.pipe(takeUntil(this._onDestroy), debounceTime(1), take(1)).subscribe(() => {
                    const firstValue = `${this.completeRowList[0].id}`;
                    for (let i = 0; i < this.tableDataSource.length; i++) {
                        if (`${this.tableDataSource[i].id}` === firstValue) {
                            this.matSelect._keyManager.setActiveItem(i);
                            try {
                                this.cd.detectChanges();
                            }
                            catch (ignored) {
                            }
                            break;
                        }
                    }
                });
            }
        });
        this.matSelect.valueChange
            .pipe(takeUntil(this._onDestroy))
            .subscribe((value) => {
            if (!this.multiple) {
                return;
            }
            if (isArray(value) && value.length > 1 && value.some(v => v === '')) {
                this.writeValue(value.filter(v => v !== ''));
                try {
                    this.cd.detectChanges();
                }
                catch (ignored) {
                }
            }
            if (isArray(value) && value.length === 0) {
                this.checkAndResetSelection();
            }
        });
    }
    ngAfterViewInit() {
        merge(...[
            this._onOptionsChange,
            this.sort.sortChange,
            this.filterControls.valueChanges,
            this.overallFilterControl.valueChanges
        ])
            .pipe(takeUntil(this._onDestroy), debounceTime(100))
            .subscribe(() => {
            const dataClone = [...((this.dataSource || { data: [] }).data || [])];
            if (this.addNullRow()) {
                dataClone.unshift(this.nullRow);
            }
            // Apply filtering
            if (this.overallSearchEnabled && this.overallSearchVisibleState) {
                this.applyOverallFilter(dataClone);
            }
            else {
                this.applyColumnLevelFilters(dataClone);
            }
            // Inherit default sorting options if sort not specified
            if (!this.sort.active && !isNullOrUndefined(this.defaultSort) && this.defaultSort.active) {
                this.sort.active = this.defaultSort.active;
                this.sort.direction = this.defaultSort.direction;
            }
            // Apply default or manual sorting
            this.tableDataSource = !this.sort.active ?
                dataClone : this.sortData(dataClone, this.sort.active, this.sort.direction);
            try {
                this.cd.detectChanges();
            }
            catch (ignored) {
            }
            this._onSelectOpen.next();
        });
        // Manually sort data for this.matSelect.options (QueryList<MatOption>) and notify matSelect.options of changes
        // It's important to keep this.matSelect.options order synchronized with data in the table
        //     because this.matSelect.options (QueryList<MatOption>) doesn't update it's state after table data is changed
        this.matOptions.changes.subscribe(() => {
            const options = {};
            this.matOptions.toArray()
                .filter(option => !isNullOrUndefined(option))
                .forEach(option => options[`${option.value}`] = option);
            this.matSelect.options.reset(this.tableDataSource
                .filter(row => !isNullOrUndefined(options[`${row.id}`]))
                .map(row => options[`${row.id}`]));
            this.matSelect.options.notifyOnChanges();
        });
        if (!isNullOrUndefined(this.matSelect._keyManager)) {
            // Subscribe on KeyManager changes to highlight the table rows accordingly
            this.matSelect._keyManager.change
                .pipe(takeUntil(this._onDestroy))
                .subscribe(activeRow => this.tableActiveRow = activeRow);
        }
    }
    ngOnDestroy() {
        this._onSelectOpen.complete();
        this._onDestroy.next();
        this._onDestroy.complete();
    }
    registerOnChange(fn) {
        const proxyFn = (value) => {
            // ToDo: refactor - comparison mechanism isn't optimized. filteredOutRows is a map but completeValueList is an array
            if (this.multiple === true) {
                for (let i = this.completeValueList.length - 1; i >= 0; i--) {
                    if (this.filteredOutRows[`${this.completeValueList[i]}`] === undefined && value.indexOf(this.completeValueList[i]) === -1) {
                        this.completeValueList.splice(i, 1);
                    }
                }
                value
                    .filter(choice => this.completeValueList.indexOf(choice) === -1)
                    .forEach(choice => this.completeValueList.push(choice));
                this.matSelect.value = this.completeValueList;
                fn(this.completeValueList);
                this.completeRowList.splice(0);
                ((this.dataSource || { data: [] }).data || [])
                    .filter(row => this.completeValueList.indexOf(row.id) !== -1)
                    .forEach(row => this.completeRowList.push(row));
            }
            else {
                fn(value);
                this.completeRowList.splice(0);
                ((this.dataSource || { data: [] }).data || [])
                    .filter(row => row.id === value)
                    .forEach(row => this.completeRowList.push(row));
            }
        };
        this.matSelect.registerOnChange(proxyFn);
    }
    registerOnTouched(fn) {
        this.matSelect.registerOnTouched(fn);
    }
    setDisabledState(isDisabled) {
        this.matSelect.setDisabledState(isDisabled);
    }
    writeValue(value) {
        this.updateCompleteRowList(value);
        this.matSelect.writeValue(value);
        if (this.matSelect.value !== value) {
            this.matSelect.value = value;
        }
    }
    ngOnChanges(changes) {
        if (!isNullOrUndefined(changes.resetFiltersOnOpen) && changes.resetFiltersOnOpen.currentValue !== false) {
            this.resetFilters();
        }
        if (!isNullOrUndefined(changes.dataSource)) {
            this.updateCompleteRowList(this.completeRowList.map(row => row.id));
        }
        // Proxy @Input bindings to MatSelect
        if (!isNullOrUndefined(changes.matSelectConfigurator)) {
            const configuration = changes.matSelectConfigurator.currentValue;
            Object.keys(configuration)
                .filter(key => !['multiple', 'panelClass'].includes(key) && !this.controlValueAccessorKeys.includes(key))
                .forEach(key => this.matSelect[key] = configuration[key]);
            const panelClass = [];
            panelClass.push('mat-select-search-table-panel');
            if (!isNullOrUndefined(configuration.panelClass)) {
                panelClass.push(configuration.panelClass);
            }
            if (this.overallSearchEnabled) {
                panelClass.push('mat-select-search-panel');
            }
            this.matSelect.panelClass = panelClass;
        }
        if (!isNullOrUndefined(changes.matSelectSearchConfigurator)) {
            this.proxyMatSelectSearchConfiguration(changes.matSelectSearchConfigurator.currentValue);
        }
        if (!isNullOrUndefined(changes.dataSource)
            && !isNullOrUndefined(changes.dataSource.currentValue)
            && isArray(changes.dataSource.currentValue.data)) {
            this.tableDataSource = [...changes.dataSource.currentValue.data];
            if (this.addNullRow()) {
                this.tableDataSource.unshift(this.nullRow);
            }
            this.tableColumns = ['_selection', ...changes.dataSource.currentValue.columns.map(column => column.key)];
            this.tableColumnsMap.clear();
            changes.dataSource.currentValue.columns.forEach(column => this.tableColumnsMap.set(column.key, column));
            this.applyProxyToArray(changes.dataSource.currentValue.data, () => {
                this._onOptionsChange.next();
            });
            this._onOptionsChange.next();
        }
    }
    emulateMatOptionClick(event) {
        if (event.composedPath()
            .filter(et => et instanceof HTMLElement)
            .some((et) => et.tagName.toLowerCase() === 'mat-option')) {
            return;
        }
        if (!(event.target instanceof HTMLElement)) {
            return;
        }
        let rowElement = event.target;
        while (rowElement != null && rowElement instanceof HTMLElement && rowElement.tagName.toLowerCase() !== 'tr') {
            rowElement = rowElement.parentElement;
        }
        if (rowElement === null) {
            return;
        }
        const childOption = rowElement.querySelector('mat-option');
        if (!childOption) {
            return;
        }
        childOption.click();
    }
    filterFormControl(key) {
        if (!this.filterControls.contains(key)) {
            this.filterControls.registerControl(key, new FormControl(''));
        }
        return this.filterControls.get(key);
    }
    simpleTriggerLabelFn(value) {
        if (!isNullOrUndefined(this.triggerLabelSort)) {
            this.sortData(value, this.triggerLabelSort.active, this.triggerLabelSort.direction);
        }
        return value.map(row => {
            if (isNullOrUndefined(row)) {
                return '';
            }
            if (isNullOrUndefined(this.customTriggerLabelTemplate)
                || typeof this.customTriggerLabelTemplate !== 'string'
                || this.customTriggerLabelTemplate.trim().length === 0) {
                return `${row.id}`;
            }
            let atLeastPartialSubstitution = false;
            const substitution = this.customTriggerLabelTemplate.replace(/[$]{1}[{]{1}([^}]+)[}]{1}?/g, (_, key) => !isNullOrUndefined(row[key]) && (atLeastPartialSubstitution = true) ? row[key] : '');
            if (atLeastPartialSubstitution === false) {
                return `${row.id}`;
            }
            return substitution.trim();
        }).join(', ');
    }
    toggleOverallSearch() {
        this.overallSearchVisibleState = !this.overallSearchVisibleState;
        this.resetFilters();
        if (this.overallSearchVisibleState) {
            setTimeout(() => this.matSelectSearch._focus());
        }
    }
    updateCompleteRowList(value) {
        this.completeRowList.splice(0);
        this.completeValueList.splice(0);
        if (isNullOrUndefined(value)) {
            return;
        }
        const valueArray = !isArray(value) ? [value] : value;
        valueArray
            .filter(valueId => !isNullOrUndefined(valueId))
            .forEach(valueId => {
            ((this.dataSource || { data: [] }).data || [])
                .filter(row => !isNullOrUndefined(row) && !isNullOrUndefined(row.id) && row.id === valueId)
                .forEach(row => {
                this.completeRowList.push(row);
                this.completeValueList.push(row.id);
            });
        });
    }
    proxyMatSelectSearchConfiguration(configuration) {
        if (isNullOrUndefined(this.matSelectSearch)) {
            return;
        }
        // Proxy @Input bindings to NgxMatSelectSearch
        Object.keys(configuration)
            .filter(key => !['clearSearchInput'].includes(key) && !this.controlValueAccessorKeys.includes(key))
            .forEach(key => this.matSelectSearch[key] = configuration[key]);
    }
    applyColumnLevelFilters(data) {
        this.filteredOutRows = {};
        const filters = {};
        Object.keys(this.filterControls.controls)
            .filter(key => this.tableColumnsMap.has(key)
            && !isNullOrUndefined(this.tableColumnsMap.get(key).filter)
            // If filter is enabled
            && this.tableColumnsMap.get(key).filter.enabled !== false)
            .filter(key => {
            const value = this.filterControls.get(key).value;
            return !isNullOrUndefined(value)
                // If an array - check it's not empty
                && ((isArray(value) && value.length > 0)
                    // If string - check that not blank
                    || (typeof value === 'string' && value.trim().length > 0)
                    // If number - check that toString() is not blank
                    || (typeof value === 'number' && `${value}`.trim().length > 0));
        })
            .forEach(key => filters[key] = {
            filter: this.tableColumnsMap.get(key).filter,
            value: this.filterControls.get(key).value
        });
        const filterKeys = Object.keys(filters);
        for (let i = data.length - 1; i >= 0; i--) {
            for (let k = 0; k < filterKeys.length; k++) {
                const filterKey = filterKeys[k];
                const row = data[i];
                if (isNullOrUndefined(row)) {
                    continue;
                }
                const cellValue = row[filterKey];
                if (isNullOrUndefined(cellValue)) {
                    data.splice(i, 1).forEach(item => this.filteredOutRows[`${item.id}`] = item);
                    continue;
                }
                const filter = filters[filterKey];
                const comparator = filter.filter.comparator;
                if (typeof filter.filter.comparatorFn === 'function') {
                    if (!filter.filter.comparatorFn.call(null, cellValue, filter.value, row)) {
                        data.splice(i, 1).forEach(item => this.filteredOutRows[`${item.id}`] = item);
                        break;
                    }
                }
                else if (isNullOrUndefined(comparator) || comparator === 'equals') {
                    if (filter.value !== cellValue) {
                        data.splice(i, 1).forEach(item => this.filteredOutRows[`${item.id}`] = item);
                        break;
                    }
                }
                else if (typeof cellValue === 'string' && typeof filter.value === 'string') {
                    const cellValueLC = `${cellValue}`.toLowerCase();
                    const filterValueLC = filter.value.toLowerCase();
                    if (isNullOrUndefined(comparator) || comparator === 'equalsIgnoreCase') {
                        if (filterValueLC !== cellValueLC) {
                            data.splice(i, 1).forEach(item => this.filteredOutRows[`${item.id}`] = item);
                            break;
                        }
                    }
                    else if (comparator === 'contains') {
                        if (cellValue.indexOf(filter.value) === -1) {
                            data.splice(i, 1).forEach(item => this.filteredOutRows[`${item.id}`] = item);
                            break;
                        }
                    }
                    else if (comparator === 'containsIgnoreCase') {
                        if (cellValueLC.indexOf(filterValueLC) === -1) {
                            data.splice(i, 1).forEach(item => this.filteredOutRows[`${item.id}`] = item);
                            break;
                        }
                    }
                    else if (comparator === 'startsWith') {
                        if (!cellValue.startsWith(filter.value)) {
                            data.splice(i, 1).forEach(item => this.filteredOutRows[`${item.id}`] = item);
                            break;
                        }
                    }
                    else if (comparator === 'startsWithIgnoreCase') {
                        if (!cellValueLC.startsWith(filterValueLC)) {
                            data.splice(i, 1).forEach(item => this.filteredOutRows[`${item.id}`] = item);
                            break;
                        }
                    }
                }
            }
        }
    }
    applyOverallFilter(data) {
        this.filteredOutRows = {};
        if (isNullOrUndefined(this.overallFilterControl.value)) {
            return;
        }
        const filterValueLC = this.overallFilterControl.value.toLowerCase();
        if (filterValueLC.trim().length === 0) {
            return;
        }
        for (let i = data.length - 1; i >= 0; i--) {
            const row = data[i];
            let rowShouldBeFiltered = true;
            for (let j = this.dataSource.columns.length - 1; j >= 0; j--) {
                const key = this.dataSource.columns[j].key;
                const cellValue = row[key];
                if (isNullOrUndefined(cellValue)) {
                    continue;
                }
                const cellValueLC = `${cellValue}`.toLowerCase();
                if (cellValueLC.indexOf(filterValueLC) !== -1) {
                    rowShouldBeFiltered = false;
                    break;
                }
            }
            if (rowShouldBeFiltered) {
                data.splice(i, 1).forEach(item => this.filteredOutRows[`${item.id}`] = item);
            }
        }
    }
    applyProxyToArray(array, callback) {
        ['pop', 'push', 'reverse', 'shift', 'unshift', 'splice', 'sort'].forEach((methodName) => {
            array[methodName] = function () {
                const res = Array.prototype[methodName].apply(array, arguments); // call normal behaviour
                callback.apply(array, arguments); // finally call the callback supplied
                return res;
            };
        });
    }
    resetFilters() {
        this.overallFilterControl.setValue('');
        Object.keys(this.filterControls.controls)
            .forEach(key => this.filterControls.get(key).setValue(''));
    }
    /**
     * Taken from {@see MatTableDataSource#sortingDataAccessor}
     *
     * @param data
     * @param sortHeaderId
     */
    sortingDataAccessor(data, active) {
        const value = data[active];
        if (_isNumberValue(value)) {
            const numberValue = Number(value);
            // Numbers beyond `MAX_SAFE_INTEGER` can't be compared reliably so we
            // leave them as strings. For more info: https://goo.gl/y5vbSg
            return numberValue < MAX_SAFE_INTEGER ? numberValue : value;
        }
        return value;
    }
    sortData(data, active, direction) {
        if (!active || direction === '') {
            return data;
        }
        return data.sort((a, b) => {
            let aValue = this.sortingDataAccessor(a, active);
            let bValue = this.sortingDataAccessor(b, active);
            if (a.id === null) {
                return -1;
            }
            else if (b.id === null) {
                return 1;
            }
            // Both null/undefined/equal value check
            if (aValue === bValue) {
                return 0;
            }
            // One null value check
            if (isNullOrUndefined(aValue) && !isNullOrUndefined(bValue)) {
                return -1;
            }
            else if (!isNullOrUndefined(aValue) && isNullOrUndefined(bValue)) {
                return 1;
            }
            if (aValue instanceof Date) {
                aValue = aValue.getTime();
            }
            if (bValue instanceof Date) {
                bValue = bValue.getTime();
            }
            // User localeCompare for strings
            if (isString(aValue) && isString(bValue)) {
                return aValue.localeCompare(bValue) * (direction === 'asc' ? 1 : -1);
            }
            // Try to convert to a Number type
            aValue = isNaN(aValue) ? `${aValue}` : +aValue;
            bValue = isNaN(bValue) ? `${bValue}` : +bValue;
            // if one is number and other is String
            if (isString(aValue) && isNumber(bValue)) {
                return (1) * (direction === 'asc' ? 1 : -1);
            }
            if (isNumber(aValue) && isString(bValue)) {
                return (-1) * (direction === 'asc' ? 1 : -1);
            }
            // Compare as Numbers otherwise
            return (aValue > bValue ? 1 : -1) * (direction === 'asc' ? 1 : -1);
        });
    }
    addNullRow() {
        return !this.multiple && !isNullOrUndefined(this.labelForNullValue);
    }
    checkAndResetSelection() {
        if (this.matSelect.value && isArray(this.matSelect.value) && this.matSelect.value.length < 1
            && !isNullOrUndefined(this.resetOptionAction)) {
            this.resetOptionAction();
        }
    }
};
MatSelectTableComponent.ctorParameters = () => [
    { type: ChangeDetectorRef }
];
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Object)
], MatSelectTableComponent.prototype, "dataSource", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Boolean)
], MatSelectTableComponent.prototype, "multiple", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Boolean)
], MatSelectTableComponent.prototype, "overallSearchEnabled", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Boolean)
], MatSelectTableComponent.prototype, "overallSearchVisible", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Boolean)
], MatSelectTableComponent.prototype, "resetSortOnOpen", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Boolean)
], MatSelectTableComponent.prototype, "resetFiltersOnOpen", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Function)
], MatSelectTableComponent.prototype, "customTriggerLabelFn", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Object)
], MatSelectTableComponent.prototype, "triggerLabelSort", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", String)
], MatSelectTableComponent.prototype, "customTriggerLabelTemplate", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", String)
], MatSelectTableComponent.prototype, "labelForNullValue", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Object)
], MatSelectTableComponent.prototype, "matSelectConfigurator", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Object)
], MatSelectTableComponent.prototype, "matSelectSearchConfigurator", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Object)
], MatSelectTableComponent.prototype, "defaultSort", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Function)
], MatSelectTableComponent.prototype, "resetOptionAction", void 0);
tslib_1.__decorate([
    Output(),
    tslib_1.__metadata("design:type", EventEmitter)
], MatSelectTableComponent.prototype, "close", void 0);
tslib_1.__decorate([
    ViewChild('componentSelect'),
    tslib_1.__metadata("design:type", MatSelect)
], MatSelectTableComponent.prototype, "matSelect", void 0);
tslib_1.__decorate([
    ViewChild(MatSelectSearchComponent),
    tslib_1.__metadata("design:type", MatSelectSearchComponent)
], MatSelectTableComponent.prototype, "matSelectSearch", void 0);
tslib_1.__decorate([
    ViewChild(MatSort),
    tslib_1.__metadata("design:type", MatSort)
], MatSelectTableComponent.prototype, "sort", void 0);
tslib_1.__decorate([
    ViewChild(MatTable),
    tslib_1.__metadata("design:type", MatTable)
], MatSelectTableComponent.prototype, "table", void 0);
tslib_1.__decorate([
    ViewChild('table', { read: ElementRef }),
    tslib_1.__metadata("design:type", ElementRef)
], MatSelectTableComponent.prototype, "tableRef", void 0);
tslib_1.__decorate([
    ViewChildren(MatOption),
    tslib_1.__metadata("design:type", QueryList)
], MatSelectTableComponent.prototype, "matOptions", void 0);
MatSelectTableComponent = MatSelectTableComponent_1 = tslib_1.__decorate([
    Component({
        selector: 'ngx-mat-select-table',
        template: "<mat-form-field>\r\n  <mat-select #componentSelect\r\n              [multiple]=\"multiple\"\r\n              disableRipple>\r\n\r\n    <mat-select-trigger>\r\n      <ng-container *ngIf=\"!customTriggerLabelFn\">{{simpleTriggerLabelFn(completeRowList)}}</ng-container>\r\n      <ng-container *ngIf=\"customTriggerLabelFn\">{{customTriggerLabelFn(completeRowList)}}</ng-container>\r\n    </mat-select-trigger>\r\n\r\n    <ngx-mat-select-search *ngIf=\"overallSearchEnabled\"\r\n                           [formControl]=\"overallFilterControl\"\r\n                           [clearSearchInput]=\"resetFiltersOnOpen\"\r\n                           [ngClass]=\"{hidden: overallSearchVisibleState !== true}\">\r\n      <mat-icon *ngIf=\"matSelectSearchConfigurator?.clearIcon\"\r\n                ngxMatSelectSearchClear\r\n                color=\"primary\">{{matSelectSearchConfigurator.clearIcon}}</mat-icon>\r\n    </ngx-mat-select-search>\r\n    <mat-icon *ngIf=\"overallSearchEnabled\"\r\n              (click)=\"toggleOverallSearch()\"\r\n              class=\"overall-search-toggle\"\r\n              color=\"primary\">{{overallSearchVisibleState ? 'arrow_back' : 'search'}}</mat-icon>\r\n\r\n    <table #table\r\n           mat-table\r\n           matSort\r\n           [dataSource]=\"tableDataSource\">\r\n\r\n      <ng-container *ngFor=\"let columnKey of tableColumns; let i = index\"\r\n                    [matColumnDef]=\"columnKey\"\r\n                    [ngSwitch]=\"columnKey\">\r\n\r\n        <ng-container *ngSwitchCase=\"'_selection'\">\r\n          <th mat-header-cell *matHeaderCellDef [ngClass]=\"{selection: true, hidden: !multiple}\"></th>\r\n          <td mat-cell *matCellDef=\"let row\" [ngClass]=\"{selection: true, hidden: !multiple}\">\r\n            <mat-option [value]=\"row.id\" (click)=\"row.id === '' && resetOptionAction ? resetOptionAction() : null\"></mat-option>\r\n          </td>\r\n        </ng-container>\r\n\r\n        <ng-container *ngSwitchDefault>\r\n          <th mat-header-cell\r\n              mat-sort-header\r\n              [disabled]=\"!tableColumnsMap.get(columnKey).sortable\"\r\n              *matHeaderCellDef>\r\n            <!-- Header cell -->\r\n            <ng-container [ngSwitch]=\"tableColumnsMap.get(columnKey).filter?.type\">\r\n              <ng-container *ngSwitchCase=\"'string'\"\r\n                            [ngTemplateOutlet]=\"filterTypeString\"\r\n                            [ngTemplateOutletContext]=\"{column: tableColumnsMap.get(columnKey)}\"></ng-container>\r\n              <ng-container *ngSwitchCase=\"'number'\"\r\n                            [ngTemplateOutlet]=\"filterTypeNumber\"\r\n                            [ngTemplateOutletContext]=\"{column: tableColumnsMap.get(columnKey)}\"></ng-container>\r\n              <div *ngSwitchDefault>{{tableColumnsMap.get(columnKey).name}}</div>\r\n            </ng-container>\r\n          </th>\r\n          <td mat-cell *matCellDef=\"let row\"\r\n              [colSpan]=\"addNullRow() && row.id === null && i === 1 ? tableColumns.length : 1\"\r\n              [ngStyle]=\"{display: addNullRow() && row.id === null && i !== 1 ? 'none' : ''}\"\r\n          >\r\n            {{addNullRow() && row.id === null && i === 1 ? labelForNullValue : row[columnKey]}}\r\n          </td>\r\n        </ng-container>\r\n\r\n      </ng-container>\r\n\r\n      <tr mat-header-row *matHeaderRowDef=\"tableColumns; sticky: true\"></tr>\r\n      <tr mat-row *matRowDef=\"let row; columns: tableColumns; let i = index\"\r\n          (click)=\"emulateMatOptionClick($event)\"\r\n          [ngClass]=\"{active: i === tableActiveRow}\"></tr>\r\n    </table>\r\n\r\n  </mat-select>\r\n</mat-form-field>\r\n\r\n<ng-template #filterTypeString\r\n             let-column='column'>\r\n  <mat-form-field\r\n    (click)=\"$event.stopPropagation()\"\r\n    class=\"filter\">\r\n    <input matInput\r\n           [formControl]=\"filterFormControl(column.key)\"\r\n           (keydown)=\"$event.stopPropagation()\"\r\n           (keyup)=\"$event.stopPropagation()\"\r\n           (keypress)=\"$event.stopPropagation()\"\r\n           [placeholder]=\"column.name\"/>\r\n  </mat-form-field>\r\n</ng-template>\r\n\r\n<ng-template #filterTypeNumber\r\n             let-column='column'>\r\n  <mat-form-field\r\n    (click)=\"$event.stopPropagation()\"\r\n    class=\"filter\">\r\n    <input matInput\r\n           [formControl]=\"filterFormControl(column.key)\"\r\n           (keydown)=\"$event.stopPropagation()\"\r\n           (keyup)=\"$event.stopPropagation()\"\r\n           (keypress)=\"$event.stopPropagation()\"\r\n           [placeholder]=\"column.name\"\r\n           type=\"number\"\r\n           appInputRestriction=\"integer\"/>\r\n  </mat-form-field>\r\n</ng-template>\r\n",
        exportAs: 'ngx-mat-select-table',
        changeDetection: ChangeDetectionStrategy.OnPush,
        providers: [
            {
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => MatSelectTableComponent_1),
                multi: true
            }
        ],
        styles: [":host{display:block}:host mat-form-field{width:100%}::ng-deep .mat-select-panel.mat-select-search-table-panel{overflow-x:auto!important}::ng-deep .mat-select-panel.mat-select-search-table-panel .overall-search-toggle{z-index:102;position:absolute;left:13px;top:17px;cursor:pointer}::ng-deep .mat-select-panel.mat-select-search-table-panel ngx-mat-select-search{position:absolute;z-index:101}::ng-deep .mat-select-panel.mat-select-search-table-panel ngx-mat-select-search.hidden{display:none}::ng-deep .mat-select-panel.mat-select-search-table-panel ngx-mat-select-search .mat-select-search-inner{height:56px}::ng-deep .mat-select-panel.mat-select-search-table-panel ngx-mat-select-search .mat-select-search-inner .mat-select-search-input{margin-left:26px;width:calc(100% - 26px)}::ng-deep .mat-select-panel.mat-select-search-table-panel table{width:100%}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr{cursor:pointer;height:48px;max-height:48px}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr mat-option{height:48px;max-height:48px}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr.active{background:rgba(0,0,0,.04)}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr td{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;border-bottom:0!important;box-shadow:inset 0 -1px 0 0 rgba(0,0,0,.12)}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th ::ng-deep .mat-sort-header-container{height:55px}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th ::ng-deep .mat-sort-header-container mat-form-field .mat-form-field-infix{width:initial}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th[aria-sort] ::ng-deep .mat-sort-header-arrow{opacity:1!important}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr td mat-option,::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th mat-option{background:0 0!important}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr td.selection,::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th.selection{width:56px;padding:0;margin:0}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr td.selection.hidden mat-option,::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th.selection.hidden mat-option{visibility:hidden}"]
    }),
    tslib_1.__metadata("design:paramtypes", [ChangeDetectorRef])
], MatSelectTableComponent);
export { MatSelectTableComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0LXNlbGVjdC10YWJsZS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9uZ3gtbWF0LXNlbGVjdC10YWJsZS8iLCJzb3VyY2VzIjpbIm1hdC1zZWxlY3QtdGFibGUuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsT0FBTyxFQUNMLGFBQWEsRUFDYix1QkFBdUIsRUFDdkIsaUJBQWlCLEVBQ2pCLFNBQVMsRUFDVCxVQUFVLEVBQ1YsWUFBWSxFQUNaLFVBQVUsRUFDVixLQUFLLEVBQ0wsU0FBUyxFQUNULFNBQVMsRUFDVCxNQUFNLEVBQ04sTUFBTSxFQUNOLFNBQVMsRUFDVCxhQUFhLEVBQ2IsU0FBUyxFQUNULFlBQVksRUFDYixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQXVCLFdBQVcsRUFBRSxTQUFTLEVBQUUsaUJBQWlCLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUMvRixPQUFPLEVBQUMsS0FBSyxFQUFFLE9BQU8sRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUNwQyxPQUFPLEVBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUEwQyxNQUFNLG1CQUFtQixDQUFDO0FBQ25ILE9BQU8sRUFBQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUdwRSxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDckQsT0FBTyxFQUFDLFlBQVksRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFHN0QsT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFFL0QsTUFBTSxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQztBQWdCMUMsSUFBYSx1QkFBdUIsK0JBQXBDLE1BQWEsdUJBQXVCO0lBb0hsQyxZQUFvQixFQUFxQjtRQUFyQixPQUFFLEdBQUYsRUFBRSxDQUFtQjtRQTNFakMsWUFBTyxHQUFzQixFQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUMsQ0FBQztRQXlCdEMsVUFBSyxHQUEwQixJQUFJLFlBQVksRUFBRSxDQUFDO1FBd0I1RCxvQkFBZSxHQUF3QixFQUFFLENBQUM7UUFRbEMsc0JBQWlCLEdBQVUsRUFBRSxDQUFDO1FBRTlCLDZCQUF3QixHQUFhO1lBQzNDLGFBQWE7WUFDYixpQkFBaUI7WUFDakIsV0FBVztZQUNYLGVBQWU7WUFDZixXQUFXO1lBQ1gsZUFBZTtTQUNoQixDQUFDO1FBRUYsZ0VBQWdFO1FBQ3hELGVBQVUsR0FBRyxJQUFJLE9BQU8sRUFBUSxDQUFDO1FBRWpDLGtCQUFhLEdBQUcsSUFBSSxPQUFPLEVBQVEsQ0FBQztRQUVwQyxxQkFBZ0IsR0FBRyxJQUFJLE9BQU8sRUFBUSxDQUFDO1FBRzdDLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNqQyxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRUQsUUFBUTtRQUNOLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsSUFBSSxLQUFLLENBQUM7UUFDdkMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZO2FBQ3hCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQ2hDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUNsQixJQUFJLElBQUksQ0FBQyxrQkFBa0IsS0FBSyxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRTtnQkFDaEUsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO2FBQ3JCO1lBQ0QsSUFBSSxDQUFDLHlCQUF5QixHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQztZQUMzRCxJQUFJLElBQUksQ0FBQyxlQUFlLEtBQUssS0FBSyxFQUFFO2dCQUNsQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQzthQUM3RDtZQUNELElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ1gsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDekIsT0FBTzthQUNSO1lBQ0QsSUFBSSxJQUFJLENBQUMsb0JBQW9CLEVBQUU7Z0JBQzdCLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsQ0FBQzthQUMxRTtZQUNELHFHQUFxRztZQUNwRyxJQUFJLENBQUMsS0FBYSxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQztZQUNoRCxzRkFBc0Y7WUFDdEYsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUM5QixJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQywrQkFBK0IsQ0FBQyxFQUM3RSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsQ0FDMUIsQ0FBQztZQUVGLCtFQUErRTtZQUMvRSxNQUFNLFlBQVksR0FBbUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDO1lBQ3hFLE1BQU0sV0FBVyxHQUFHLFlBQVksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLE1BQU0sQ0FBQztZQUNoRSxJQUFJLHFCQUFxQixHQUFHLENBQUMsQ0FBQztZQUM5QixJQUFJLENBQUMsS0FBSztpQkFDUCxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDO2lCQUM3QyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7aUJBQ2hFLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLHFCQUFxQixJQUFJLEdBQUcsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQy9FLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEVBQUU7Z0JBQ3ZCLFlBQVksQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLEdBQUcsV0FBVyxHQUFHLHFCQUFxQixJQUFJLENBQUM7YUFDM0U7WUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLDJCQUEyQixDQUFDLHFDQUFxQzttQkFDdEUsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDdEYsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRTtvQkFDM0YsTUFBTSxVQUFVLEdBQUcsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUNuRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7d0JBQ3BELElBQUksR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxLQUFLLFVBQVUsRUFBRTs0QkFDbEQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUM1QyxJQUFJO2dDQUNGLElBQUksQ0FBQyxFQUFFLENBQUMsYUFBYSxFQUFFLENBQUM7NkJBQ3pCOzRCQUFDLE9BQU8sT0FBTyxFQUFFOzZCQUNqQjs0QkFDRCxNQUFNO3lCQUNQO3FCQUNGO2dCQUNILENBQUMsQ0FBQyxDQUFDO2FBQ0o7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVOLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVzthQUN0QixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUNoQyxTQUFTLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUNuQixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDbEIsT0FBTzthQUNSO1lBQ0QsSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRTtnQkFDbkUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQzdDLElBQUk7b0JBQ0YsSUFBSSxDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsQ0FBQztpQkFDekI7Z0JBQUMsT0FBTyxPQUFPLEVBQUU7aUJBQ2pCO2FBQ0Y7WUFDRCxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDeEMsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7YUFDL0I7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxlQUFlO1FBQ2IsS0FBSyxDQUFDLEdBQUc7WUFDUCxJQUFJLENBQUMsZ0JBQWdCO1lBQ3JCLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVTtZQUNwQixJQUFJLENBQUMsY0FBYyxDQUFDLFlBQVk7WUFDaEMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFlBQVk7U0FDdkMsQ0FBQzthQUNDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUNuRCxTQUFTLENBQUMsR0FBRyxFQUFFO1lBQ2QsTUFBTSxTQUFTLEdBQXdCLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxFQUFDLElBQUksRUFBRSxFQUFFLEVBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3pGLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFO2dCQUNyQixTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUNqQztZQUVELGtCQUFrQjtZQUNsQixJQUFJLElBQUksQ0FBQyxvQkFBb0IsSUFBSSxJQUFJLENBQUMseUJBQXlCLEVBQUU7Z0JBQy9ELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQzthQUNwQztpQkFBTTtnQkFDTCxJQUFJLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDekM7WUFFRCx3REFBd0Q7WUFDeEQsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFO2dCQUN4RixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQztnQkFDM0MsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUM7YUFDbEQ7WUFFRCxrQ0FBa0M7WUFDbEMsSUFBSSxDQUFDLGVBQWUsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3hDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUU5RSxJQUFJO2dCQUNGLElBQUksQ0FBQyxFQUFFLENBQUMsYUFBYSxFQUFFLENBQUM7YUFDekI7WUFBQyxPQUFPLE9BQU8sRUFBRTthQUNqQjtZQUVELElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDNUIsQ0FBQyxDQUFDLENBQUM7UUFFTCwrR0FBK0c7UUFDL0csMEZBQTBGO1FBQzFGLGtIQUFrSDtRQUNsSCxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFO1lBQ3JDLE1BQU0sT0FBTyxHQUFpQyxFQUFFLENBQUM7WUFDakQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUU7aUJBQ3RCLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUM7aUJBQzVDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDO1lBQzFELElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsZUFBZTtpQkFDOUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUN2RCxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDM0MsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUNsRCwwRUFBMEU7WUFDMUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsTUFBTTtpQkFDOUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7aUJBQ2hDLFNBQVMsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLEdBQUcsU0FBUyxDQUFDLENBQUM7U0FDNUQ7SUFDSCxDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDOUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN2QixJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFFRCxnQkFBZ0IsQ0FBQyxFQUF3QjtRQUN2QyxNQUFNLE9BQU8sR0FBeUIsQ0FBQyxLQUFVLEVBQUUsRUFBRTtZQUNuRCxvSEFBb0g7WUFDcEgsSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLElBQUksRUFBRTtnQkFDMUIsS0FBSyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO29CQUMzRCxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLFNBQVMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO3dCQUN6SCxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztxQkFDckM7aUJBQ0Y7Z0JBQ0QsS0FBSztxQkFDRixNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO3FCQUMvRCxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQzFELElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztnQkFDOUMsRUFBRSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2dCQUMzQixJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDL0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksRUFBQyxJQUFJLEVBQUUsRUFBRSxFQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDO3FCQUN6QyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztxQkFDNUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzthQUNuRDtpQkFBTTtnQkFDTCxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ1YsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQy9CLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLEVBQUMsSUFBSSxFQUFFLEVBQUUsRUFBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztxQkFDekMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxLQUFLLENBQUM7cUJBQy9CLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7YUFDbkQ7UUFDSCxDQUFDLENBQUM7UUFDRixJQUFJLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFFRCxpQkFBaUIsQ0FBQyxFQUFZO1FBQzVCLElBQUksQ0FBQyxTQUFTLENBQUMsaUJBQWlCLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVELGdCQUFnQixDQUFDLFVBQW1CO1FBQ2xDLElBQUksQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUVELFVBQVUsQ0FBQyxLQUFVO1FBQ25CLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNsQyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNqQyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxLQUFLLEtBQUssRUFBRTtZQUNsQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7U0FDOUI7SUFDSCxDQUFDO0lBRUQsV0FBVyxDQUFDLE9BQXNCO1FBRWhDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsSUFBSSxPQUFPLENBQUMsa0JBQWtCLENBQUMsWUFBWSxLQUFLLEtBQUssRUFBRTtZQUN2RyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7U0FDckI7UUFFRCxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQzFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ3JFO1FBRUQscUNBQXFDO1FBQ3JDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMscUJBQXFCLENBQUMsRUFBRTtZQUNyRCxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMscUJBQXFCLENBQUMsWUFBWSxDQUFDO1lBQ2pFLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDO2lCQUN2QixNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQ3hHLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDNUQsTUFBTSxVQUFVLEdBQWEsRUFBRSxDQUFDO1lBQ2hDLFVBQVUsQ0FBQyxJQUFJLENBQUMsK0JBQStCLENBQUMsQ0FBQztZQUNqRCxJQUFJLENBQUMsaUJBQWlCLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUNoRCxVQUFVLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUMzQztZQUNELElBQUksSUFBSSxDQUFDLG9CQUFvQixFQUFFO2dCQUM3QixVQUFVLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQUM7YUFDNUM7WUFDRCxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7U0FDeEM7UUFFRCxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLDJCQUEyQixDQUFDLEVBQUU7WUFDM0QsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLE9BQU8sQ0FBQywyQkFBMkIsQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUMxRjtRQUVELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDO2VBQ3JDLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUM7ZUFDbkQsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ2xELElBQUksQ0FBQyxlQUFlLEdBQUcsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2pFLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFO2dCQUNyQixJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDNUM7WUFDRCxJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsWUFBWSxFQUFFLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3pHLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDN0IsT0FBTyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUN4RyxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRTtnQkFDaEUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxDQUFDO1lBQy9CLENBQUMsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxDQUFDO1NBQzlCO0lBQ0gsQ0FBQztJQUVELHFCQUFxQixDQUFDLEtBQWlCO1FBQ3JDLElBQUksS0FBSyxDQUFDLFlBQVksRUFBRTthQUNyQixNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLFlBQVksV0FBVyxDQUFDO2FBQ3ZDLElBQUksQ0FBQyxDQUFDLEVBQWUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsS0FBSyxZQUFZLENBQUMsRUFBRTtZQUN2RSxPQUFPO1NBQ1I7UUFDRCxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxZQUFZLFdBQVcsQ0FBQyxFQUFFO1lBQzFDLE9BQU87U0FDUjtRQUNELElBQUksVUFBVSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7UUFDOUIsT0FBTyxVQUFVLElBQUksSUFBSSxJQUFJLFVBQVUsWUFBWSxXQUFXLElBQUksVUFBVSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDM0csVUFBVSxHQUFHLFVBQVUsQ0FBQyxhQUFhLENBQUM7U0FDdkM7UUFDRCxJQUFJLFVBQVUsS0FBSyxJQUFJLEVBQUU7WUFDdkIsT0FBTztTQUNSO1FBQ0QsTUFBTSxXQUFXLEdBQWdCLFVBQVUsQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDeEUsSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNoQixPQUFPO1NBQ1I7UUFDRCxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDdEIsQ0FBQztJQUdELGlCQUFpQixDQUFDLEdBQVc7UUFDM0IsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ3RDLElBQUksQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDLEdBQUcsRUFBRSxJQUFJLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQy9EO1FBQ0QsT0FBb0IsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUVELG9CQUFvQixDQUFDLEtBQTBCO1FBQzdDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtZQUM3QyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUNyRjtRQUNELE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNyQixJQUFJLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUMxQixPQUFPLEVBQUUsQ0FBQzthQUNYO1lBQ0QsSUFBSSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUM7bUJBQ2pELE9BQU8sSUFBSSxDQUFDLDBCQUEwQixLQUFLLFFBQVE7bUJBQ25ELElBQUksQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUN4RCxPQUFPLEdBQUcsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDO2FBQ3BCO1lBQ0QsSUFBSSwwQkFBMEIsR0FBRyxLQUFLLENBQUM7WUFDdkMsTUFBTSxZQUFZLEdBQVcsSUFBSSxDQUFDLDBCQUEwQixDQUFDLE9BQU8sQ0FBQyw2QkFBNkIsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUM3RyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsMEJBQTBCLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDdkYsSUFBSSwwQkFBMEIsS0FBSyxLQUFLLEVBQUU7Z0JBQ3hDLE9BQU8sR0FBRyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUM7YUFDcEI7WUFDRCxPQUFPLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUM3QixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDaEIsQ0FBQztJQUVELG1CQUFtQjtRQUNqQixJQUFJLENBQUMseUJBQXlCLEdBQUcsQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUM7UUFDakUsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3BCLElBQUksSUFBSSxDQUFDLHlCQUF5QixFQUFFO1lBQ2xDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7U0FDakQ7SUFDSCxDQUFDO0lBRU8scUJBQXFCLENBQUMsS0FBWTtRQUN4QyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMvQixJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLElBQUksaUJBQWlCLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDNUIsT0FBTztTQUNSO1FBQ0QsTUFBTSxVQUFVLEdBQVUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUM1RCxVQUFVO2FBQ1AsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUM5QyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDakIsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksRUFBQyxJQUFJLEVBQUUsRUFBRSxFQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDO2lCQUN6QyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFLEtBQUssT0FBTyxDQUFDO2lCQUMxRixPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ2IsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQy9CLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3RDLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU8saUNBQWlDLENBQUMsYUFBcUM7UUFDN0UsSUFBSSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEVBQUU7WUFDM0MsT0FBTztTQUNSO1FBRUQsOENBQThDO1FBQzlDLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDO2FBQ3ZCLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDbEcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsR0FBRyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNwRSxDQUFDO0lBRU8sdUJBQXVCLENBQUMsSUFBeUI7UUFDdkQsSUFBSSxDQUFDLGVBQWUsR0FBRyxFQUFFLENBQUM7UUFDMUIsTUFBTSxPQUFPLEdBQW9FLEVBQUUsQ0FBQztRQUNwRixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDO2FBQ3RDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQztlQUN2QyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQztZQUMzRCx1QkFBdUI7ZUFDcEIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sS0FBSyxLQUFLLENBQUM7YUFDM0QsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ1osTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDO1lBQ2pELE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUM7Z0JBQzlCLHFDQUFxQzttQkFDbEMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztvQkFDdEMsbUNBQW1DO3VCQUNoQyxDQUFDLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztvQkFDekQsaURBQWlEO3VCQUM5QyxDQUFDLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxHQUFHLEtBQUssRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RFLENBQUMsQ0FBQzthQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRztZQUM3QixNQUFNLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTTtZQUM1QyxLQUFLLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSztTQUMxQyxDQUFDLENBQUM7UUFDTCxNQUFNLFVBQVUsR0FBYSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2xELEtBQUssSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN6QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDMUMsTUFBTSxTQUFTLEdBQVcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN4QyxNQUFNLEdBQUcsR0FBc0IsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN2QyxJQUFJLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxFQUFFO29CQUMxQixTQUFTO2lCQUNWO2dCQUNELE1BQU0sU0FBUyxHQUFRLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDdEMsSUFBSSxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsRUFBRTtvQkFDaEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO29CQUM3RSxTQUFTO2lCQUNWO2dCQUNELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDbEMsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUM7Z0JBQzVDLElBQUksT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLFlBQVksS0FBSyxVQUFVLEVBQUU7b0JBQ3BELElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxFQUFFO3dCQUN4RSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7d0JBQzdFLE1BQU07cUJBQ1A7aUJBQ0Y7cUJBQU0sSUFBSSxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsSUFBSSxVQUFVLEtBQUssUUFBUSxFQUFFO29CQUNuRSxJQUFJLE1BQU0sQ0FBQyxLQUFLLEtBQUssU0FBUyxFQUFFO3dCQUM5QixJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7d0JBQzdFLE1BQU07cUJBQ1A7aUJBQ0Y7cUJBQU0sSUFBSSxPQUFPLFNBQVMsS0FBSyxRQUFRLElBQUksT0FBTyxNQUFNLENBQUMsS0FBSyxLQUFLLFFBQVEsRUFBRTtvQkFDNUUsTUFBTSxXQUFXLEdBQVcsR0FBRyxTQUFTLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztvQkFDekQsTUFBTSxhQUFhLEdBQVcsTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztvQkFDekQsSUFBSSxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsSUFBSSxVQUFVLEtBQUssa0JBQWtCLEVBQUU7d0JBQ3RFLElBQUksYUFBYSxLQUFLLFdBQVcsRUFBRTs0QkFDakMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDOzRCQUM3RSxNQUFNO3lCQUNQO3FCQUNGO3lCQUFNLElBQUksVUFBVSxLQUFLLFVBQVUsRUFBRTt3QkFDcEMsSUFBSSxTQUFTLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTs0QkFDMUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDOzRCQUM3RSxNQUFNO3lCQUNQO3FCQUNGO3lCQUFNLElBQUksVUFBVSxLQUFLLG9CQUFvQixFQUFFO3dCQUM5QyxJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7NEJBQzdDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQzs0QkFDN0UsTUFBTTt5QkFDUDtxQkFDRjt5QkFBTSxJQUFJLFVBQVUsS0FBSyxZQUFZLEVBQUU7d0JBQ3RDLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRTs0QkFDdkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDOzRCQUM3RSxNQUFNO3lCQUNQO3FCQUNGO3lCQUFNLElBQUksVUFBVSxLQUFLLHNCQUFzQixFQUFFO3dCQUNoRCxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsRUFBRTs0QkFDMUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDOzRCQUM3RSxNQUFNO3lCQUNQO3FCQUNGO2lCQUNGO2FBQ0Y7U0FDRjtJQUNILENBQUM7SUFFTyxrQkFBa0IsQ0FBQyxJQUF5QjtRQUNsRCxJQUFJLENBQUMsZUFBZSxHQUFHLEVBQUUsQ0FBQztRQUMxQixJQUFJLGlCQUFpQixDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUN0RCxPQUFPO1NBQ1I7UUFDRCxNQUFNLGFBQWEsR0FBVyxJQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzVFLElBQUksYUFBYSxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDckMsT0FBTztTQUNSO1FBQ0QsS0FBSyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3pDLE1BQU0sR0FBRyxHQUFzQixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkMsSUFBSSxtQkFBbUIsR0FBRyxJQUFJLENBQUM7WUFDL0IsS0FBSyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzVELE1BQU0sR0FBRyxHQUFXLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztnQkFDbkQsTUFBTSxTQUFTLEdBQVEsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNoQyxJQUFJLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxFQUFFO29CQUNoQyxTQUFTO2lCQUNWO2dCQUNELE1BQU0sV0FBVyxHQUFXLEdBQUcsU0FBUyxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQ3pELElBQUksV0FBVyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtvQkFDN0MsbUJBQW1CLEdBQUcsS0FBSyxDQUFDO29CQUM1QixNQUFNO2lCQUNQO2FBQ0Y7WUFDRCxJQUFJLG1CQUFtQixFQUFFO2dCQUN2QixJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7YUFDOUU7U0FDRjtJQUNILENBQUM7SUFFTyxpQkFBaUIsQ0FBQyxLQUFZLEVBQUUsUUFBb0I7UUFDMUQsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxVQUFVLEVBQUUsRUFBRTtZQUN0RixLQUFLLENBQUMsVUFBVSxDQUFDLEdBQUc7Z0JBQ2xCLE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLHdCQUF3QjtnQkFDekYsUUFBUSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxxQ0FBcUM7Z0JBQ3ZFLE9BQU8sR0FBRyxDQUFDO1lBQ2IsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRU8sWUFBWTtRQUNsQixJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUM7YUFDdEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ssbUJBQW1CLENBQUMsSUFBdUIsRUFBRSxNQUFjO1FBRWpFLE1BQU0sS0FBSyxHQUFJLElBQStCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFdkQsSUFBSSxjQUFjLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDekIsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRWxDLHFFQUFxRTtZQUNyRSw4REFBOEQ7WUFDOUQsT0FBTyxXQUFXLEdBQUcsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1NBQzdEO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBR08sUUFBUSxDQUFDLElBQXlCLEVBQUUsTUFBYyxFQUFFLFNBQXdCO1FBQ2xGLElBQUksQ0FBQyxNQUFNLElBQUksU0FBUyxLQUFLLEVBQUUsRUFBRTtZQUMvQixPQUFPLElBQUksQ0FBQztTQUNiO1FBRUQsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3hCLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDakQsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUVqRCxJQUFJLENBQUMsQ0FBQyxFQUFFLEtBQUssSUFBSSxFQUFFO2dCQUNqQixPQUFPLENBQUMsQ0FBQyxDQUFDO2FBQ1g7aUJBQU0sSUFBSSxDQUFDLENBQUMsRUFBRSxLQUFLLElBQUksRUFBRTtnQkFDeEIsT0FBTyxDQUFDLENBQUM7YUFDVjtZQUVELHdDQUF3QztZQUN4QyxJQUFJLE1BQU0sS0FBSyxNQUFNLEVBQUU7Z0JBQ3JCLE9BQU8sQ0FBQyxDQUFDO2FBQ1Y7WUFFRCx1QkFBdUI7WUFDdkIsSUFBSSxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUMzRCxPQUFPLENBQUMsQ0FBQyxDQUFDO2FBQ1g7aUJBQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxJQUFJLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUNsRSxPQUFPLENBQUMsQ0FBQzthQUNWO1lBRUQsSUFBSSxNQUFNLFlBQVksSUFBSSxFQUFFO2dCQUMxQixNQUFNLEdBQUcsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO2FBQzNCO1lBQ0QsSUFBSSxNQUFNLFlBQVksSUFBSSxFQUFFO2dCQUMxQixNQUFNLEdBQUcsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO2FBQzNCO1lBRUQsaUNBQWlDO1lBQ2pDLElBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDeEMsT0FBZ0IsTUFBTyxDQUFDLGFBQWEsQ0FBUyxNQUFNLENBQUMsR0FBRyxDQUFDLFNBQVMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUN4RjtZQUVELGtDQUFrQztZQUNsQyxNQUFNLEdBQUcsS0FBSyxDQUFTLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztZQUN2RCxNQUFNLEdBQUcsS0FBSyxDQUFTLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztZQUV2RCx1Q0FBdUM7WUFDdkMsSUFBSSxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUN4QyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDN0M7WUFDRCxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ3hDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQzlDO1lBRUQsK0JBQStCO1lBQy9CLE9BQU8sQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckUsQ0FBQyxDQUFDLENBQUM7SUFFTCxDQUFDO0lBRUQsVUFBVTtRQUNSLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDdEUsQ0FBQztJQUVPLHNCQUFzQjtRQUM1QixJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDO2VBQ3ZGLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEVBQUU7WUFDL0MsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7U0FDMUI7SUFDSCxDQUFDO0NBQ0YsQ0FBQTs7WUF0aUJ5QixpQkFBaUI7O0FBakhoQztJQUFSLEtBQUssRUFBRTs7MkRBQXlEO0FBTXhEO0lBQVIsS0FBSyxFQUFFOzt5REFBbUI7QUFHbEI7SUFBUixLQUFLLEVBQUU7O3FFQUErQjtBQUc5QjtJQUFSLEtBQUssRUFBRTs7cUVBQStCO0FBRzlCO0lBQVIsS0FBSyxFQUFFOztnRUFBMEI7QUFHekI7SUFBUixLQUFLLEVBQUU7O21FQUE2QjtBQUs1QjtJQUFSLEtBQUssRUFBRTs7cUVBQThEO0FBSzdEO0lBQVIsS0FBSyxFQUFFOztpRUFBd0I7QUFPdkI7SUFBUixLQUFLLEVBQUU7OzJFQUFvQztBQUVuQztJQUFSLEtBQUssRUFBRTs7a0VBQTJCO0FBTzFCO0lBQVIsS0FBSyxFQUFFOztzRUFBK0M7QUFPOUM7SUFBUixLQUFLLEVBQUU7OzRFQUFxRDtBQUtwRDtJQUFSLEtBQUssRUFBRTs7NERBQW1CO0FBS2xCO0lBQVIsS0FBSyxFQUFFOztrRUFBK0I7QUFFN0I7SUFBVCxNQUFNLEVBQUU7c0NBQVEsWUFBWTtzREFBK0I7QUFFOUI7SUFBN0IsU0FBUyxDQUFDLGlCQUFpQixDQUFDO3NDQUFvQixTQUFTOzBEQUFDO0FBRXRCO0lBQXBDLFNBQVMsQ0FBQyx3QkFBd0IsQ0FBQztzQ0FBMEIsd0JBQXdCO2dFQUFDO0FBRW5FO0lBQW5CLFNBQVMsQ0FBQyxPQUFPLENBQUM7c0NBQWUsT0FBTztxREFBQztBQUVyQjtJQUFwQixTQUFTLENBQUMsUUFBUSxDQUFDO3NDQUFnQixRQUFRO3NEQUFvQjtBQUV4QjtJQUF2QyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUMsSUFBSSxFQUFFLFVBQVUsRUFBQyxDQUFDO3NDQUFtQixVQUFVO3lEQUFDO0FBRTVDO0lBQXhCLFlBQVksQ0FBQyxTQUFTLENBQUM7c0NBQXFCLFNBQVM7MkRBQVk7QUE5RXZELHVCQUF1QjtJQWRuQyxTQUFTLENBQUM7UUFDVCxRQUFRLEVBQUUsc0JBQXNCO1FBQ2hDLGlySkFBZ0Q7UUFFaEQsUUFBUSxFQUFFLHNCQUFzQjtRQUNoQyxlQUFlLEVBQUUsdUJBQXVCLENBQUMsTUFBTTtRQUMvQyxTQUFTLEVBQUU7WUFDVDtnQkFDRSxPQUFPLEVBQUUsaUJBQWlCO2dCQUMxQixXQUFXLEVBQUUsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLHlCQUF1QixDQUFDO2dCQUN0RCxLQUFLLEVBQUUsSUFBSTthQUNaO1NBQ0Y7O0tBQ0YsQ0FBQzs2Q0FxSHdCLGlCQUFpQjtHQXBIOUIsdUJBQXVCLENBMHBCbkM7U0ExcEJZLHVCQUF1QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XHJcbiAgQWZ0ZXJWaWV3SW5pdCxcclxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcclxuICBDaGFuZ2VEZXRlY3RvclJlZixcclxuICBDb21wb25lbnQsXHJcbiAgRWxlbWVudFJlZixcclxuICBFdmVudEVtaXR0ZXIsXHJcbiAgZm9yd2FyZFJlZixcclxuICBJbnB1dCxcclxuICBPbkNoYW5nZXMsXHJcbiAgT25EZXN0cm95LFxyXG4gIE9uSW5pdCxcclxuICBPdXRwdXQsXHJcbiAgUXVlcnlMaXN0LFxyXG4gIFNpbXBsZUNoYW5nZXMsXHJcbiAgVmlld0NoaWxkLFxyXG4gIFZpZXdDaGlsZHJlblxyXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQge0NvbnRyb2xWYWx1ZUFjY2Vzc29yLCBGb3JtQ29udHJvbCwgRm9ybUdyb3VwLCBOR19WQUxVRV9BQ0NFU1NPUn0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xyXG5pbXBvcnQge21lcmdlLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHtNYXRPcHRpb24sIE1hdFNlbGVjdCwgTWF0U29ydCwgTWF0VGFibGUsIE1hdFRhYmxlRGF0YVNvdXJjZSwgU29ydCwgU29ydERpcmVjdGlvbn0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwnO1xyXG5pbXBvcnQge2lzQXJyYXksIGlzTnVsbE9yVW5kZWZpbmVkLCBpc051bWJlciwgaXNTdHJpbmd9IGZyb20gJ3V0aWwnO1xyXG5pbXBvcnQge01hdFNlbGVjdFRhYmxlRGF0YVNvdXJjZX0gZnJvbSAnLi9NYXRTZWxlY3RUYWJsZURhdGFTb3VyY2UnO1xyXG5pbXBvcnQge01hdFNlbGVjdFRhYmxlUm93fSBmcm9tICcuL01hdFNlbGVjdFRhYmxlUm93JztcclxuaW1wb3J0IHtfaXNOdW1iZXJWYWx1ZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcclxuaW1wb3J0IHtkZWJvdW5jZVRpbWUsIHRha2UsIHRha2VVbnRpbH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG5pbXBvcnQge01hdFNlbGVjdFRhYmxlQ29sdW1ufSBmcm9tICcuL01hdFNlbGVjdFRhYmxlQ29sdW1uJztcclxuaW1wb3J0IHtNYXRTZWxlY3RUYWJsZUZpbHRlcn0gZnJvbSAnLi9NYXRTZWxlY3RUYWJsZUZpbHRlcic7XHJcbmltcG9ydCB7TWF0U2VsZWN0U2VhcmNoQ29tcG9uZW50fSBmcm9tICduZ3gtbWF0LXNlbGVjdC1zZWFyY2gnO1xyXG5cclxuY29uc3QgTUFYX1NBRkVfSU5URUdFUiA9IDkwMDcxOTkyNTQ3NDA5OTE7XHJcblxyXG5AQ29tcG9uZW50KHtcclxuICBzZWxlY3RvcjogJ25neC1tYXQtc2VsZWN0LXRhYmxlJyxcclxuICB0ZW1wbGF0ZVVybDogJy4vbWF0LXNlbGVjdC10YWJsZS5jb21wb25lbnQuaHRtbCcsXHJcbiAgc3R5bGVVcmxzOiBbJy4vbWF0LXNlbGVjdC10YWJsZS5jb21wb25lbnQuc2NzcyddLFxyXG4gIGV4cG9ydEFzOiAnbmd4LW1hdC1zZWxlY3QtdGFibGUnLFxyXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxyXG4gIHByb3ZpZGVyczogW1xyXG4gICAge1xyXG4gICAgICBwcm92aWRlOiBOR19WQUxVRV9BQ0NFU1NPUixcclxuICAgICAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gTWF0U2VsZWN0VGFibGVDb21wb25lbnQpLFxyXG4gICAgICBtdWx0aTogdHJ1ZVxyXG4gICAgfVxyXG4gIF1cclxufSlcclxuZXhwb3J0IGNsYXNzIE1hdFNlbGVjdFRhYmxlQ29tcG9uZW50IGltcGxlbWVudHMgQ29udHJvbFZhbHVlQWNjZXNzb3IsIE9uSW5pdCwgQWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95LCBPbkNoYW5nZXMge1xyXG5cclxuICAvKiogRGF0YSBTb3VyY2UgZm9yIHRoZSB0YWJsZSAqL1xyXG4gIEBJbnB1dCgpIGRhdGFTb3VyY2U6IE1hdFNlbGVjdFRhYmxlRGF0YVNvdXJjZTxNYXRTZWxlY3RUYWJsZVJvdz47XHJcblxyXG4gIC8qKlxyXG4gICAqIE11bHRpcGxlL1NpbmdsZSBtb2RlIGZvciB7QHNlZSBNYXRTZWxlY3QjbXVsdGlwbGV9IHRvIGluaXRpYWxpemUuXHJcbiAgICogTkI6IHN3aXRjaGluZyBiZXR3ZWVuIG1vZGVzIGluIHJ1bnRpbWUgaXMgbm90IHN1cHBvcnRlZCBieSB7QHNlZSBNYXRTZWxlY3R9XHJcbiAgICovXHJcbiAgQElucHV0KCkgbXVsdGlwbGU6IGJvb2xlYW47XHJcblxyXG4gIC8qKiBXaGV0aGVyIG9yIG5vdCBvdmVyYWxsIHNlYXJjaCBtb2RlIGVuYWJsZWQuIFNlZSB7QHNlZSBNYXRTZWxlY3RUYWJsZUNvbXBvbmVudH0gKi9cclxuICBASW5wdXQoKSBvdmVyYWxsU2VhcmNoRW5hYmxlZDogYm9vbGVhbjtcclxuXHJcbiAgLyoqIERlZmF1bHQgaXMgdHJ1ZSAqL1xyXG4gIEBJbnB1dCgpIG92ZXJhbGxTZWFyY2hWaXNpYmxlOiBib29sZWFuO1xyXG5cclxuICAvKiogV2hldGhlciBvciBub3Qgc2hvdWxkIHtAc2VlIE1hdFNlbGVjdFRhYmxlQ29tcG9uZW50fSBiZSB2aXNpYmxlIG9uIG9wZW4uIERlZmF1bHQgaXMgdHJ1ZSAqL1xyXG4gIEBJbnB1dCgpIHJlc2V0U29ydE9uT3BlbjogYm9vbGVhbjtcclxuXHJcbiAgLyoqIFdoZXRoZXIgb3Igbm90IHByZXZpb3VzIHNlYXJjaCBzaG91bGQgYmUgY2xlYXJlZCBvbiBvcGVuLiBEZWZhdWx0IGlzIHRydWUgKi9cclxuICBASW5wdXQoKSByZXNldEZpbHRlcnNPbk9wZW46IGJvb2xlYW47XHJcblxyXG4gIC8qKlxyXG4gICAqIEZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSB0aGUgZGVmYXVsdCBsYWJlbFxyXG4gICAqL1xyXG4gIEBJbnB1dCgpIGN1c3RvbVRyaWdnZXJMYWJlbEZuOiAodmFsdWU6IE1hdFNlbGVjdFRhYmxlUm93W10pID0+IHN0cmluZztcclxuXHJcbiAgLyoqXHJcbiAgICogU29ydCBvcHRpb24gZm9yIHZhbHVlcyBpbiB0aGUgY3VzdG9tVHJpZ2dlckxhYmVsRm4gaW4gTXVsdGlwbGUgbW9kZS5cclxuICAgKi9cclxuICBASW5wdXQoKSB0cmlnZ2VyTGFiZWxTb3J0OiBTb3J0O1xyXG5cclxuICAvKipcclxuICAgKiBUZW1wbGF0ZSB0byBjdXN0b21pemUgdGhlIGRlZmF1bHQgdHJpZ2dlciBsYWJlbC4gSGFzIGxlc3NlciBwcmlvcml0eSB0aGFuIHtAc2VlIE1hdFNlbGVjdFRhYmxlQ29tcG9uZW50I2N1c3RvbVRyaWdnZXJMYWJlbEZufS5cclxuICAgKiBTdWJzdGl0dXRpb24gaXMgY2FzZSBzZW5zaXRpdmUuXHJcbiAgICogRXhhbXBsZTogJHtuYW1lfSAke2lkfSAtICR7YWRkcmVzc31cclxuICAgKi9cclxuICBASW5wdXQoKSBjdXN0b21UcmlnZ2VyTGFiZWxUZW1wbGF0ZTogc3RyaW5nO1xyXG5cclxuICBASW5wdXQoKSBsYWJlbEZvck51bGxWYWx1ZTogc3RyaW5nO1xyXG4gIHByaXZhdGUgbnVsbFJvdzogTWF0U2VsZWN0VGFibGVSb3cgPSB7aWQ6IG51bGx9O1xyXG5cclxuICAvKipcclxuICAgKiB7QHNlZSBNYXRTZWxlY3R9IHByb3h5IGlucHV0cyBjb25maWd1cmF0b3JcclxuICAgKiB7QHNlZSBNYXRTZWxlY3QjbXVsdGlwbGV9IGdldHMgdmFsdWUgZnJvbSB7QHNlZSBNYXRTZWxlY3RUYWJsZUNvbXBvbmVudCNtdWx0aXBsZX1cclxuICAgKi9cclxuICBASW5wdXQoKSBtYXRTZWxlY3RDb25maWd1cmF0b3I6IHsgW2tleTogc3RyaW5nXTogYW55IH07XHJcblxyXG4gIC8qKlxyXG4gICAqIHtAc2VlIE1hdFNlbGVjdFNlYXJjaENvbXBvbmVudH0gcHJveHkgaW5wdXRzIGNvbmZpZ3VyYXRvclxyXG4gICAqIHtAc2VlIE1hdFNlbGVjdFNlYXJjaENvbXBvbmVudCNjbGVhclNlYXJjaElucHV0fSBnZXRzIHZhbHVlIGZyb20ge0BzZWUgTWF0U2VsZWN0VGFibGVDb21wb25lbnQjcmVzZXRGaWx0ZXJzT25PcGVufVxyXG4gICAqIHtAc2VlIE1hdFNlbGVjdFNlYXJjaENvbXBvbmVudH0ge0BzZWUgQ29udHJvbFZhbHVlQWNjZXNzb3J9IGdldHMgdmFsdWUgZnJvbSB7QHNlZSBNYXRTZWxlY3RUYWJsZUNvbXBvbmVudCNvdmVyYWxsRmlsdGVyQ29udHJvbH1cclxuICAgKi9cclxuICBASW5wdXQoKSBtYXRTZWxlY3RTZWFyY2hDb25maWd1cmF0b3I6IHsgW2tleTogc3RyaW5nXTogYW55IH07XHJcblxyXG4gIC8qKlxyXG4gICAqIEFwcGx5IGRlZmF1bHQgc29ydGluZ1xyXG4gICAqL1xyXG4gIEBJbnB1dCgpIGRlZmF1bHRTb3J0OiBTb3J0O1xyXG4gIFxyXG4gIC8qKlxyXG4gICAqIEFjdGlvbiBmb3IgJ0FsbCcgb3B0aW9uLlxyXG4gICAqL1xyXG4gIEBJbnB1dCgpIHJlc2V0T3B0aW9uQWN0aW9uOiAoKSA9PiB2b2lkO1xyXG5cclxuICBAT3V0cHV0KCkgY2xvc2U6IEV2ZW50RW1pdHRlcjxib29sZWFuPiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuXHJcbiAgQFZpZXdDaGlsZCgnY29tcG9uZW50U2VsZWN0JykgcHJpdmF0ZSBtYXRTZWxlY3Q6IE1hdFNlbGVjdDtcclxuXHJcbiAgQFZpZXdDaGlsZChNYXRTZWxlY3RTZWFyY2hDb21wb25lbnQpIHByaXZhdGUgbWF0U2VsZWN0U2VhcmNoOiBNYXRTZWxlY3RTZWFyY2hDb21wb25lbnQ7XHJcblxyXG4gIEBWaWV3Q2hpbGQoTWF0U29ydCkgcHJpdmF0ZSBzb3J0OiBNYXRTb3J0O1xyXG5cclxuICBAVmlld0NoaWxkKE1hdFRhYmxlKSBwcml2YXRlIHRhYmxlOiBNYXRUYWJsZTxNYXRTZWxlY3RUYWJsZVJvdz47XHJcblxyXG4gIEBWaWV3Q2hpbGQoJ3RhYmxlJywge3JlYWQ6IEVsZW1lbnRSZWZ9KSBwcml2YXRlIHRhYmxlUmVmOiBFbGVtZW50UmVmO1xyXG5cclxuICBAVmlld0NoaWxkcmVuKE1hdE9wdGlvbikgcHJpdmF0ZSBtYXRPcHRpb25zOiBRdWVyeUxpc3Q8TWF0T3B0aW9uPjtcclxuXHJcbiAgdGFibGVEYXRhU291cmNlOiBNYXRTZWxlY3RUYWJsZVJvd1tdO1xyXG5cclxuICB0YWJsZUNvbHVtbnM6IHN0cmluZ1tdO1xyXG5cclxuICB0YWJsZUNvbHVtbnNNYXA6IE1hcDxzdHJpbmcsIE1hdFNlbGVjdFRhYmxlQ29sdW1uPjtcclxuXHJcbiAgdGFibGVBY3RpdmVSb3c6IG51bWJlcjtcclxuXHJcbiAgZmlsdGVyZWRPdXRSb3dzOiB7IFtrZXk6IHN0cmluZ106IE1hdFNlbGVjdFRhYmxlUm93IH07XHJcblxyXG4gIGNvbXBsZXRlUm93TGlzdDogTWF0U2VsZWN0VGFibGVSb3dbXSA9IFtdO1xyXG5cclxuICBvdmVyYWxsU2VhcmNoVmlzaWJsZVN0YXRlOiBib29sZWFuO1xyXG5cclxuICBvdmVyYWxsRmlsdGVyQ29udHJvbDogRm9ybUNvbnRyb2w7XHJcblxyXG4gIHByaXZhdGUgZmlsdGVyQ29udHJvbHM6IEZvcm1Hcm91cDtcclxuXHJcbiAgcHJpdmF0ZSBjb21wbGV0ZVZhbHVlTGlzdDogYW55W10gPSBbXTtcclxuXHJcbiAgcHJpdmF0ZSBjb250cm9sVmFsdWVBY2Nlc3NvcktleXM6IHN0cmluZ1tdID0gW1xyXG4gICAgJ2Zvcm1Db250cm9sJyxcclxuICAgICdmb3JtQ29udHJvbE5hbWUnLFxyXG4gICAgJ2Zvcm1Hcm91cCcsXHJcbiAgICAnZm9ybUdyb3VwTmFtZScsXHJcbiAgICAnZm9ybUFycmF5JyxcclxuICAgICdmb3JtQXJyYXlOYW1lJ1xyXG4gIF07XHJcblxyXG4gIC8qKiBTdWJqZWN0IHRoYXQgZW1pdHMgd2hlbiB0aGUgY29tcG9uZW50IGhhcyBiZWVuIGRlc3Ryb3llZC4gKi9cclxuICBwcml2YXRlIF9vbkRlc3Ryb3kgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xyXG5cclxuICBwcml2YXRlIF9vblNlbGVjdE9wZW4gPSBuZXcgU3ViamVjdDx2b2lkPigpO1xyXG5cclxuICBwcml2YXRlIF9vbk9wdGlvbnNDaGFuZ2UgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xyXG5cclxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGNkOiBDaGFuZ2VEZXRlY3RvclJlZikge1xyXG4gICAgdGhpcy50YWJsZUNvbHVtbnNNYXAgPSBuZXcgTWFwKCk7XHJcbiAgICB0aGlzLmZpbHRlckNvbnRyb2xzID0gbmV3IEZvcm1Hcm91cCh7fSk7XHJcbiAgICB0aGlzLm92ZXJhbGxGaWx0ZXJDb250cm9sID0gbmV3IEZvcm1Db250cm9sKCcnKTtcclxuICB9XHJcblxyXG4gIG5nT25Jbml0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5tdWx0aXBsZSA9IHRoaXMubXVsdGlwbGUgfHwgZmFsc2U7XHJcbiAgICB0aGlzLm1hdFNlbGVjdC5vcGVuZWRDaGFuZ2VcclxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX29uRGVzdHJveSkpXHJcbiAgICAgIC5zdWJzY3JpYmUob3BlbmVkID0+IHtcclxuICAgICAgICBpZiAodGhpcy5yZXNldEZpbHRlcnNPbk9wZW4gIT09IGZhbHNlIHx8ICF0aGlzLm1hdE9wdGlvbnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICB0aGlzLnJlc2V0RmlsdGVycygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLm92ZXJhbGxTZWFyY2hWaXNpYmxlU3RhdGUgPSB0aGlzLm92ZXJhbGxTZWFyY2hWaXNpYmxlO1xyXG4gICAgICAgIGlmICh0aGlzLnJlc2V0U29ydE9uT3BlbiAhPT0gZmFsc2UpIHtcclxuICAgICAgICAgIHRoaXMuc29ydC5zb3J0KHtpZDogJycsIHN0YXJ0OiAnYXNjJywgZGlzYWJsZUNsZWFyOiBmYWxzZX0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIW9wZW5lZCkge1xyXG4gICAgICAgICAgdGhpcy5jbG9zZS5lbWl0KCFvcGVuZWQpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5vdmVyYWxsU2VhcmNoRW5hYmxlZCkge1xyXG4gICAgICAgICAgdGhpcy5wcm94eU1hdFNlbGVjdFNlYXJjaENvbmZpZ3VyYXRpb24odGhpcy5tYXRTZWxlY3RTZWFyY2hDb25maWd1cmF0b3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBUb0RvOiBnZXQgcmlkIG9mIHRoaXMgd29ya2Fyb3VuZCAodXBkYXRlcyBoZWFkZXIgcm93IFtvdGhlcndpc2Ugc29ydCBtZWNoYW5pc20gcHJvZHVjZXMgZ2xpdGNoZXNdKVxyXG4gICAgICAgICh0aGlzLnRhYmxlIGFzIGFueSkuX2hlYWRlclJvd0RlZkNoYW5nZWQgPSB0cnVlO1xyXG4gICAgICAgIC8vIERpc2FibGUgc29ydCBidXR0b25zIHRvIHByZXZlbnQgc29ydGluZyBjaGFuZ2Ugb24gU1BBQ0Uga2V5IHByZXNzZWQgaW4gZmlsdGVyIGZpZWxkXHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiBbXS5mb3JFYWNoLmNhbGwoXHJcbiAgICAgICAgICB0aGlzLnRhYmxlUmVmLm5hdGl2ZUVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnYnV0dG9uLm1hdC1zb3J0LWhlYWRlci1idXR0b24nKSxcclxuICAgICAgICAgIChlKSA9PiBlLmRpc2FibGVkID0gdHJ1ZSlcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICAvLyBQYXRjaCB0aGUgaGVpZ2h0IG9mIHRoZSBwYW5lbCB0byBpbmNsdWRlIHRoZSBoZWlnaHQgb2YgdGhlIGhlYWRlciBhbmQgZm9vdGVyXHJcbiAgICAgICAgY29uc3QgcGFuZWxFbGVtZW50OiBIVE1MRGl2RWxlbWVudCA9IHRoaXMubWF0U2VsZWN0LnBhbmVsLm5hdGl2ZUVsZW1lbnQ7XHJcbiAgICAgICAgY29uc3QgcGFuZWxIZWlnaHQgPSBwYW5lbEVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xyXG4gICAgICAgIGxldCB0YWJsZUFkZGl0aW9uYWxIZWlnaHQgPSAwO1xyXG4gICAgICAgIHRoaXMudGFibGVcclxuICAgICAgICAgIC5fZ2V0UmVuZGVyZWRSb3dzKHRoaXMudGFibGUuX2hlYWRlclJvd091dGxldClcclxuICAgICAgICAgIC5jb25jYXQodGhpcy50YWJsZS5fZ2V0UmVuZGVyZWRSb3dzKHRoaXMudGFibGUuX2Zvb3RlclJvd091dGxldCkpXHJcbiAgICAgICAgICAuZm9yRWFjaChyb3cgPT4gdGFibGVBZGRpdGlvbmFsSGVpZ2h0ICs9IHJvdy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQpO1xyXG4gICAgICAgIGlmICghaXNOYU4ocGFuZWxIZWlnaHQpKSB7XHJcbiAgICAgICAgICBwYW5lbEVsZW1lbnQuc3R5bGUubWF4SGVpZ2h0ID0gYCR7cGFuZWxIZWlnaHQgKyB0YWJsZUFkZGl0aW9uYWxIZWlnaHR9cHhgO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLm1hdFNlbGVjdFNlYXJjaENvbmZpZ3VyYXRvci5kaXNhYmxlU2Nyb2xsVG9BY3RpdmVPbk9wdGlvbnNDaGFuZ2VkXHJcbiAgICAgICAgICAmJiAhaXNOdWxsT3JVbmRlZmluZWQodGhpcy5tYXRTZWxlY3QuX2tleU1hbmFnZXIpICYmIHRoaXMuY29tcGxldGVSb3dMaXN0Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgIHRoaXMuX29uU2VsZWN0T3Blbi5waXBlKHRha2VVbnRpbCh0aGlzLl9vbkRlc3Ryb3kpLCBkZWJvdW5jZVRpbWUoMSksIHRha2UoMSkpLnN1YnNjcmliZSgoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGZpcnN0VmFsdWUgPSBgJHt0aGlzLmNvbXBsZXRlUm93TGlzdFswXS5pZH1gO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMudGFibGVEYXRhU291cmNlLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGAke3RoaXMudGFibGVEYXRhU291cmNlW2ldLmlkfWAgPT09IGZpcnN0VmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubWF0U2VsZWN0Ll9rZXlNYW5hZ2VyLnNldEFjdGl2ZUl0ZW0oaSk7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICB0aGlzLmNkLmRldGVjdENoYW5nZXMoKTtcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGlnbm9yZWQpIHtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHQgIFxyXG5cdCAgdGhpcy5tYXRTZWxlY3QudmFsdWVDaGFuZ2VcdFxyXG4gICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5fb25EZXN0cm95KSlcdFxyXG4gICAgICAuc3Vic2NyaWJlKCh2YWx1ZSkgPT4ge1x0XHJcbiAgICAgICAgaWYgKCF0aGlzLm11bHRpcGxlKSB7XHRcclxuICAgICAgICAgIHJldHVybjtcdFxyXG4gICAgICAgIH1cdFxyXG4gICAgICAgIGlmIChpc0FycmF5KHZhbHVlKSAmJiB2YWx1ZS5sZW5ndGggPiAxICYmIHZhbHVlLnNvbWUodiA9PiB2ID09PSAnJykpIHtcdFxyXG4gICAgICAgICAgdGhpcy53cml0ZVZhbHVlKHZhbHVlLmZpbHRlcih2ID0+IHYgIT09ICcnKSk7XHRcclxuICAgICAgICAgIHRyeSB7XHRcclxuICAgICAgICAgICAgdGhpcy5jZC5kZXRlY3RDaGFuZ2VzKCk7XHRcclxuICAgICAgICAgIH0gY2F0Y2ggKGlnbm9yZWQpIHtcdFxyXG4gICAgICAgICAgfVx0XHJcbiAgICAgICAgfVx0XHJcbiAgICAgICAgaWYgKGlzQXJyYXkodmFsdWUpICYmIHZhbHVlLmxlbmd0aCA9PT0gMCkge1x0XHJcbiAgICAgICAgICB0aGlzLmNoZWNrQW5kUmVzZXRTZWxlY3Rpb24oKTtcdFxyXG4gICAgICAgIH1cdFxyXG4gICAgICB9KTtcclxuICB9XHJcblxyXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcclxuICAgIG1lcmdlKC4uLltcclxuICAgICAgdGhpcy5fb25PcHRpb25zQ2hhbmdlLFxyXG4gICAgICB0aGlzLnNvcnQuc29ydENoYW5nZSxcclxuICAgICAgdGhpcy5maWx0ZXJDb250cm9scy52YWx1ZUNoYW5nZXMsXHJcbiAgICAgIHRoaXMub3ZlcmFsbEZpbHRlckNvbnRyb2wudmFsdWVDaGFuZ2VzXHJcbiAgICBdKVxyXG4gICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5fb25EZXN0cm95KSwgZGVib3VuY2VUaW1lKDEwMCkpXHJcbiAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGRhdGFDbG9uZTogTWF0U2VsZWN0VGFibGVSb3dbXSA9IFsuLi4oKHRoaXMuZGF0YVNvdXJjZSB8fCB7ZGF0YTogW119KS5kYXRhIHx8IFtdKV07XHJcbiAgICAgICAgaWYgKHRoaXMuYWRkTnVsbFJvdygpKSB7XHJcbiAgICAgICAgICBkYXRhQ2xvbmUudW5zaGlmdCh0aGlzLm51bGxSb3cpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQXBwbHkgZmlsdGVyaW5nXHJcbiAgICAgICAgaWYgKHRoaXMub3ZlcmFsbFNlYXJjaEVuYWJsZWQgJiYgdGhpcy5vdmVyYWxsU2VhcmNoVmlzaWJsZVN0YXRlKSB7XHJcbiAgICAgICAgICB0aGlzLmFwcGx5T3ZlcmFsbEZpbHRlcihkYXRhQ2xvbmUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmFwcGx5Q29sdW1uTGV2ZWxGaWx0ZXJzKGRhdGFDbG9uZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJbmhlcml0IGRlZmF1bHQgc29ydGluZyBvcHRpb25zIGlmIHNvcnQgbm90IHNwZWNpZmllZFxyXG4gICAgICAgIGlmICghdGhpcy5zb3J0LmFjdGl2ZSAmJiAhaXNOdWxsT3JVbmRlZmluZWQodGhpcy5kZWZhdWx0U29ydCkgJiYgdGhpcy5kZWZhdWx0U29ydC5hY3RpdmUpIHtcclxuICAgICAgICAgIHRoaXMuc29ydC5hY3RpdmUgPSB0aGlzLmRlZmF1bHRTb3J0LmFjdGl2ZTtcclxuICAgICAgICAgIHRoaXMuc29ydC5kaXJlY3Rpb24gPSB0aGlzLmRlZmF1bHRTb3J0LmRpcmVjdGlvbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEFwcGx5IGRlZmF1bHQgb3IgbWFudWFsIHNvcnRpbmdcclxuICAgICAgICB0aGlzLnRhYmxlRGF0YVNvdXJjZSA9ICF0aGlzLnNvcnQuYWN0aXZlID9cclxuICAgICAgICAgIGRhdGFDbG9uZSA6IHRoaXMuc29ydERhdGEoZGF0YUNsb25lLCB0aGlzLnNvcnQuYWN0aXZlLCB0aGlzLnNvcnQuZGlyZWN0aW9uKTtcclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIHRoaXMuY2QuZGV0ZWN0Q2hhbmdlcygpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGlnbm9yZWQpIHtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX29uU2VsZWN0T3Blbi5uZXh0KCk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgIC8vIE1hbnVhbGx5IHNvcnQgZGF0YSBmb3IgdGhpcy5tYXRTZWxlY3Qub3B0aW9ucyAoUXVlcnlMaXN0PE1hdE9wdGlvbj4pIGFuZCBub3RpZnkgbWF0U2VsZWN0Lm9wdGlvbnMgb2YgY2hhbmdlc1xyXG4gICAgLy8gSXQncyBpbXBvcnRhbnQgdG8ga2VlcCB0aGlzLm1hdFNlbGVjdC5vcHRpb25zIG9yZGVyIHN5bmNocm9uaXplZCB3aXRoIGRhdGEgaW4gdGhlIHRhYmxlXHJcbiAgICAvLyAgICAgYmVjYXVzZSB0aGlzLm1hdFNlbGVjdC5vcHRpb25zIChRdWVyeUxpc3Q8TWF0T3B0aW9uPikgZG9lc24ndCB1cGRhdGUgaXQncyBzdGF0ZSBhZnRlciB0YWJsZSBkYXRhIGlzIGNoYW5nZWRcclxuICAgIHRoaXMubWF0T3B0aW9ucy5jaGFuZ2VzLnN1YnNjcmliZSgoKSA9PiB7XHJcbiAgICAgIGNvbnN0IG9wdGlvbnM6IHsgW2tleTogc3RyaW5nXTogTWF0T3B0aW9uIH0gPSB7fTtcclxuICAgICAgdGhpcy5tYXRPcHRpb25zLnRvQXJyYXkoKVxyXG4gICAgICAgIC5maWx0ZXIob3B0aW9uID0+ICFpc051bGxPclVuZGVmaW5lZChvcHRpb24pKVxyXG4gICAgICAgIC5mb3JFYWNoKG9wdGlvbiA9PiBvcHRpb25zW2Ake29wdGlvbi52YWx1ZX1gXSA9IG9wdGlvbik7XHJcbiAgICAgIHRoaXMubWF0U2VsZWN0Lm9wdGlvbnMucmVzZXQodGhpcy50YWJsZURhdGFTb3VyY2VcclxuICAgICAgICAuZmlsdGVyKHJvdyA9PiAhaXNOdWxsT3JVbmRlZmluZWQob3B0aW9uc1tgJHtyb3cuaWR9YF0pKVxyXG4gICAgICAgIC5tYXAocm93ID0+IG9wdGlvbnNbYCR7cm93LmlkfWBdKSk7XHJcbiAgICAgIHRoaXMubWF0U2VsZWN0Lm9wdGlvbnMubm90aWZ5T25DaGFuZ2VzKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKHRoaXMubWF0U2VsZWN0Ll9rZXlNYW5hZ2VyKSkge1xyXG4gICAgICAvLyBTdWJzY3JpYmUgb24gS2V5TWFuYWdlciBjaGFuZ2VzIHRvIGhpZ2hsaWdodCB0aGUgdGFibGUgcm93cyBhY2NvcmRpbmdseVxyXG4gICAgICB0aGlzLm1hdFNlbGVjdC5fa2V5TWFuYWdlci5jaGFuZ2VcclxuICAgICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5fb25EZXN0cm95KSlcclxuICAgICAgICAuc3Vic2NyaWJlKGFjdGl2ZVJvdyA9PiB0aGlzLnRhYmxlQWN0aXZlUm93ID0gYWN0aXZlUm93KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xyXG4gICAgdGhpcy5fb25TZWxlY3RPcGVuLmNvbXBsZXRlKCk7XHJcbiAgICB0aGlzLl9vbkRlc3Ryb3kubmV4dCgpO1xyXG4gICAgdGhpcy5fb25EZXN0cm95LmNvbXBsZXRlKCk7XHJcbiAgfVxyXG5cclxuICByZWdpc3Rlck9uQ2hhbmdlKGZuOiAodmFsdWU6IGFueSkgPT4gdm9pZCk6IHZvaWQge1xyXG4gICAgY29uc3QgcHJveHlGbjogKHZhbHVlOiBhbnkpID0+IHZvaWQgPSAodmFsdWU6IGFueSkgPT4ge1xyXG4gICAgICAvLyBUb0RvOiByZWZhY3RvciAtIGNvbXBhcmlzb24gbWVjaGFuaXNtIGlzbid0IG9wdGltaXplZC4gZmlsdGVyZWRPdXRSb3dzIGlzIGEgbWFwIGJ1dCBjb21wbGV0ZVZhbHVlTGlzdCBpcyBhbiBhcnJheVxyXG4gICAgICBpZiAodGhpcy5tdWx0aXBsZSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSB0aGlzLmNvbXBsZXRlVmFsdWVMaXN0Lmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICBpZiAodGhpcy5maWx0ZXJlZE91dFJvd3NbYCR7dGhpcy5jb21wbGV0ZVZhbHVlTGlzdFtpXX1gXSA9PT0gdW5kZWZpbmVkICYmIHZhbHVlLmluZGV4T2YodGhpcy5jb21wbGV0ZVZhbHVlTGlzdFtpXSkgPT09IC0xKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29tcGxldGVWYWx1ZUxpc3Quc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB2YWx1ZVxyXG4gICAgICAgICAgLmZpbHRlcihjaG9pY2UgPT4gdGhpcy5jb21wbGV0ZVZhbHVlTGlzdC5pbmRleE9mKGNob2ljZSkgPT09IC0xKVxyXG4gICAgICAgICAgLmZvckVhY2goY2hvaWNlID0+IHRoaXMuY29tcGxldGVWYWx1ZUxpc3QucHVzaChjaG9pY2UpKTtcclxuICAgICAgICB0aGlzLm1hdFNlbGVjdC52YWx1ZSA9IHRoaXMuY29tcGxldGVWYWx1ZUxpc3Q7XHJcbiAgICAgICAgZm4odGhpcy5jb21wbGV0ZVZhbHVlTGlzdCk7XHJcbiAgICAgICAgdGhpcy5jb21wbGV0ZVJvd0xpc3Quc3BsaWNlKDApO1xyXG4gICAgICAgICgodGhpcy5kYXRhU291cmNlIHx8IHtkYXRhOiBbXX0pLmRhdGEgfHwgW10pXHJcbiAgICAgICAgICAuZmlsdGVyKHJvdyA9PiB0aGlzLmNvbXBsZXRlVmFsdWVMaXN0LmluZGV4T2Yocm93LmlkKSAhPT0gLTEpXHJcbiAgICAgICAgICAuZm9yRWFjaChyb3cgPT4gdGhpcy5jb21wbGV0ZVJvd0xpc3QucHVzaChyb3cpKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBmbih2YWx1ZSk7XHJcbiAgICAgICAgdGhpcy5jb21wbGV0ZVJvd0xpc3Quc3BsaWNlKDApO1xyXG4gICAgICAgICgodGhpcy5kYXRhU291cmNlIHx8IHtkYXRhOiBbXX0pLmRhdGEgfHwgW10pXHJcbiAgICAgICAgICAuZmlsdGVyKHJvdyA9PiByb3cuaWQgPT09IHZhbHVlKVxyXG4gICAgICAgICAgLmZvckVhY2gocm93ID0+IHRoaXMuY29tcGxldGVSb3dMaXN0LnB1c2gocm93KSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICB0aGlzLm1hdFNlbGVjdC5yZWdpc3Rlck9uQ2hhbmdlKHByb3h5Rm4pO1xyXG4gIH1cclxuXHJcbiAgcmVnaXN0ZXJPblRvdWNoZWQoZm46ICgpID0+IHt9KTogdm9pZCB7XHJcbiAgICB0aGlzLm1hdFNlbGVjdC5yZWdpc3Rlck9uVG91Y2hlZChmbik7XHJcbiAgfVxyXG5cclxuICBzZXREaXNhYmxlZFN0YXRlKGlzRGlzYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgIHRoaXMubWF0U2VsZWN0LnNldERpc2FibGVkU3RhdGUoaXNEaXNhYmxlZCk7XHJcbiAgfVxyXG5cclxuICB3cml0ZVZhbHVlKHZhbHVlOiBhbnkpOiB2b2lkIHtcclxuICAgIHRoaXMudXBkYXRlQ29tcGxldGVSb3dMaXN0KHZhbHVlKTtcclxuICAgIHRoaXMubWF0U2VsZWN0LndyaXRlVmFsdWUodmFsdWUpO1xyXG4gICAgaWYgKHRoaXMubWF0U2VsZWN0LnZhbHVlICE9PSB2YWx1ZSkge1xyXG4gICAgICB0aGlzLm1hdFNlbGVjdC52YWx1ZSA9IHZhbHVlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcyk6IHZvaWQge1xyXG5cclxuICAgIGlmICghaXNOdWxsT3JVbmRlZmluZWQoY2hhbmdlcy5yZXNldEZpbHRlcnNPbk9wZW4pICYmIGNoYW5nZXMucmVzZXRGaWx0ZXJzT25PcGVuLmN1cnJlbnRWYWx1ZSAhPT0gZmFsc2UpIHtcclxuICAgICAgdGhpcy5yZXNldEZpbHRlcnMoKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKGNoYW5nZXMuZGF0YVNvdXJjZSkpIHtcclxuICAgICAgdGhpcy51cGRhdGVDb21wbGV0ZVJvd0xpc3QodGhpcy5jb21wbGV0ZVJvd0xpc3QubWFwKHJvdyA9PiByb3cuaWQpKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBQcm94eSBASW5wdXQgYmluZGluZ3MgdG8gTWF0U2VsZWN0XHJcbiAgICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKGNoYW5nZXMubWF0U2VsZWN0Q29uZmlndXJhdG9yKSkge1xyXG4gICAgICBjb25zdCBjb25maWd1cmF0aW9uID0gY2hhbmdlcy5tYXRTZWxlY3RDb25maWd1cmF0b3IuY3VycmVudFZhbHVlO1xyXG4gICAgICBPYmplY3Qua2V5cyhjb25maWd1cmF0aW9uKVxyXG4gICAgICAgIC5maWx0ZXIoa2V5ID0+ICFbJ211bHRpcGxlJywgJ3BhbmVsQ2xhc3MnXS5pbmNsdWRlcyhrZXkpICYmICF0aGlzLmNvbnRyb2xWYWx1ZUFjY2Vzc29yS2V5cy5pbmNsdWRlcyhrZXkpKVxyXG4gICAgICAgIC5mb3JFYWNoKGtleSA9PiB0aGlzLm1hdFNlbGVjdFtrZXldID0gY29uZmlndXJhdGlvbltrZXldKTtcclxuICAgICAgY29uc3QgcGFuZWxDbGFzczogc3RyaW5nW10gPSBbXTtcclxuICAgICAgcGFuZWxDbGFzcy5wdXNoKCdtYXQtc2VsZWN0LXNlYXJjaC10YWJsZS1wYW5lbCcpO1xyXG4gICAgICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKGNvbmZpZ3VyYXRpb24ucGFuZWxDbGFzcykpIHtcclxuICAgICAgICBwYW5lbENsYXNzLnB1c2goY29uZmlndXJhdGlvbi5wYW5lbENsYXNzKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAodGhpcy5vdmVyYWxsU2VhcmNoRW5hYmxlZCkge1xyXG4gICAgICAgIHBhbmVsQ2xhc3MucHVzaCgnbWF0LXNlbGVjdC1zZWFyY2gtcGFuZWwnKTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLm1hdFNlbGVjdC5wYW5lbENsYXNzID0gcGFuZWxDbGFzcztcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKGNoYW5nZXMubWF0U2VsZWN0U2VhcmNoQ29uZmlndXJhdG9yKSkge1xyXG4gICAgICB0aGlzLnByb3h5TWF0U2VsZWN0U2VhcmNoQ29uZmlndXJhdGlvbihjaGFuZ2VzLm1hdFNlbGVjdFNlYXJjaENvbmZpZ3VyYXRvci5jdXJyZW50VmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghaXNOdWxsT3JVbmRlZmluZWQoY2hhbmdlcy5kYXRhU291cmNlKVxyXG4gICAgICAmJiAhaXNOdWxsT3JVbmRlZmluZWQoY2hhbmdlcy5kYXRhU291cmNlLmN1cnJlbnRWYWx1ZSlcclxuICAgICAgJiYgaXNBcnJheShjaGFuZ2VzLmRhdGFTb3VyY2UuY3VycmVudFZhbHVlLmRhdGEpKSB7XHJcbiAgICAgIHRoaXMudGFibGVEYXRhU291cmNlID0gWy4uLmNoYW5nZXMuZGF0YVNvdXJjZS5jdXJyZW50VmFsdWUuZGF0YV07XHJcbiAgICAgIGlmICh0aGlzLmFkZE51bGxSb3coKSkge1xyXG4gICAgICAgIHRoaXMudGFibGVEYXRhU291cmNlLnVuc2hpZnQodGhpcy5udWxsUm93KTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLnRhYmxlQ29sdW1ucyA9IFsnX3NlbGVjdGlvbicsIC4uLmNoYW5nZXMuZGF0YVNvdXJjZS5jdXJyZW50VmFsdWUuY29sdW1ucy5tYXAoY29sdW1uID0+IGNvbHVtbi5rZXkpXTtcclxuICAgICAgdGhpcy50YWJsZUNvbHVtbnNNYXAuY2xlYXIoKTtcclxuICAgICAgY2hhbmdlcy5kYXRhU291cmNlLmN1cnJlbnRWYWx1ZS5jb2x1bW5zLmZvckVhY2goY29sdW1uID0+IHRoaXMudGFibGVDb2x1bW5zTWFwLnNldChjb2x1bW4ua2V5LCBjb2x1bW4pKTtcclxuICAgICAgdGhpcy5hcHBseVByb3h5VG9BcnJheShjaGFuZ2VzLmRhdGFTb3VyY2UuY3VycmVudFZhbHVlLmRhdGEsICgpID0+IHtcclxuICAgICAgICB0aGlzLl9vbk9wdGlvbnNDaGFuZ2UubmV4dCgpO1xyXG4gICAgICB9KTtcclxuICAgICAgdGhpcy5fb25PcHRpb25zQ2hhbmdlLm5leHQoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGVtdWxhdGVNYXRPcHRpb25DbGljayhldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xyXG4gICAgaWYgKGV2ZW50LmNvbXBvc2VkUGF0aCgpXHJcbiAgICAgIC5maWx0ZXIoZXQgPT4gZXQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudClcclxuICAgICAgLnNvbWUoKGV0OiBIVE1MRWxlbWVudCkgPT4gZXQudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnbWF0LW9wdGlvbicpKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGlmICghKGV2ZW50LnRhcmdldCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBsZXQgcm93RWxlbWVudCA9IGV2ZW50LnRhcmdldDtcclxuICAgIHdoaWxlIChyb3dFbGVtZW50ICE9IG51bGwgJiYgcm93RWxlbWVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50ICYmIHJvd0VsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpICE9PSAndHInKSB7XHJcbiAgICAgIHJvd0VsZW1lbnQgPSByb3dFbGVtZW50LnBhcmVudEVsZW1lbnQ7XHJcbiAgICB9XHJcbiAgICBpZiAocm93RWxlbWVudCA9PT0gbnVsbCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBjb25zdCBjaGlsZE9wdGlvbjogSFRNTEVsZW1lbnQgPSByb3dFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ21hdC1vcHRpb24nKTtcclxuICAgIGlmICghY2hpbGRPcHRpb24pIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgY2hpbGRPcHRpb24uY2xpY2soKTtcclxuICB9XHJcblxyXG5cclxuICBmaWx0ZXJGb3JtQ29udHJvbChrZXk6IHN0cmluZyk6IEZvcm1Db250cm9sIHtcclxuICAgIGlmICghdGhpcy5maWx0ZXJDb250cm9scy5jb250YWlucyhrZXkpKSB7XHJcbiAgICAgIHRoaXMuZmlsdGVyQ29udHJvbHMucmVnaXN0ZXJDb250cm9sKGtleSwgbmV3IEZvcm1Db250cm9sKCcnKSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gPEZvcm1Db250cm9sPnRoaXMuZmlsdGVyQ29udHJvbHMuZ2V0KGtleSk7XHJcbiAgfVxyXG5cclxuICBzaW1wbGVUcmlnZ2VyTGFiZWxGbih2YWx1ZTogTWF0U2VsZWN0VGFibGVSb3dbXSk6IHN0cmluZyB7XHJcbiAgICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKHRoaXMudHJpZ2dlckxhYmVsU29ydCkpIHtcclxuICAgICAgdGhpcy5zb3J0RGF0YSh2YWx1ZSwgdGhpcy50cmlnZ2VyTGFiZWxTb3J0LmFjdGl2ZSwgdGhpcy50cmlnZ2VyTGFiZWxTb3J0LmRpcmVjdGlvbik7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdmFsdWUubWFwKHJvdyA9PiB7XHJcbiAgICAgIGlmIChpc051bGxPclVuZGVmaW5lZChyb3cpKSB7XHJcbiAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChpc051bGxPclVuZGVmaW5lZCh0aGlzLmN1c3RvbVRyaWdnZXJMYWJlbFRlbXBsYXRlKVxyXG4gICAgICAgIHx8IHR5cGVvZiB0aGlzLmN1c3RvbVRyaWdnZXJMYWJlbFRlbXBsYXRlICE9PSAnc3RyaW5nJ1xyXG4gICAgICAgIHx8IHRoaXMuY3VzdG9tVHJpZ2dlckxhYmVsVGVtcGxhdGUudHJpbSgpLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIHJldHVybiBgJHtyb3cuaWR9YDtcclxuICAgICAgfVxyXG4gICAgICBsZXQgYXRMZWFzdFBhcnRpYWxTdWJzdGl0dXRpb24gPSBmYWxzZTtcclxuICAgICAgY29uc3Qgc3Vic3RpdHV0aW9uOiBzdHJpbmcgPSB0aGlzLmN1c3RvbVRyaWdnZXJMYWJlbFRlbXBsYXRlLnJlcGxhY2UoL1skXXsxfVt7XXsxfShbXn1dKylbfV17MX0/L2csIChfLCBrZXkpID0+XHJcbiAgICAgICAgIWlzTnVsbE9yVW5kZWZpbmVkKHJvd1trZXldKSAmJiAoYXRMZWFzdFBhcnRpYWxTdWJzdGl0dXRpb24gPSB0cnVlKSA/IHJvd1trZXldIDogJycpO1xyXG4gICAgICBpZiAoYXRMZWFzdFBhcnRpYWxTdWJzdGl0dXRpb24gPT09IGZhbHNlKSB7XHJcbiAgICAgICAgcmV0dXJuIGAke3Jvdy5pZH1gO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBzdWJzdGl0dXRpb24udHJpbSgpO1xyXG4gICAgfSkuam9pbignLCAnKTtcclxuICB9XHJcblxyXG4gIHRvZ2dsZU92ZXJhbGxTZWFyY2goKTogdm9pZCB7XHJcbiAgICB0aGlzLm92ZXJhbGxTZWFyY2hWaXNpYmxlU3RhdGUgPSAhdGhpcy5vdmVyYWxsU2VhcmNoVmlzaWJsZVN0YXRlO1xyXG4gICAgdGhpcy5yZXNldEZpbHRlcnMoKTtcclxuICAgIGlmICh0aGlzLm92ZXJhbGxTZWFyY2hWaXNpYmxlU3RhdGUpIHtcclxuICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLm1hdFNlbGVjdFNlYXJjaC5fZm9jdXMoKSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHVwZGF0ZUNvbXBsZXRlUm93TGlzdCh2YWx1ZTogYW55W10pOiB2b2lkIHtcclxuICAgIHRoaXMuY29tcGxldGVSb3dMaXN0LnNwbGljZSgwKTtcclxuICAgIHRoaXMuY29tcGxldGVWYWx1ZUxpc3Quc3BsaWNlKDApO1xyXG4gICAgaWYgKGlzTnVsbE9yVW5kZWZpbmVkKHZhbHVlKSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBjb25zdCB2YWx1ZUFycmF5OiBhbnlbXSA9ICFpc0FycmF5KHZhbHVlKSA/IFt2YWx1ZV0gOiB2YWx1ZTtcclxuICAgIHZhbHVlQXJyYXlcclxuICAgICAgLmZpbHRlcih2YWx1ZUlkID0+ICFpc051bGxPclVuZGVmaW5lZCh2YWx1ZUlkKSlcclxuICAgICAgLmZvckVhY2godmFsdWVJZCA9PiB7XHJcbiAgICAgICAgKCh0aGlzLmRhdGFTb3VyY2UgfHwge2RhdGE6IFtdfSkuZGF0YSB8fCBbXSlcclxuICAgICAgICAgIC5maWx0ZXIocm93ID0+ICFpc051bGxPclVuZGVmaW5lZChyb3cpICYmICFpc051bGxPclVuZGVmaW5lZChyb3cuaWQpICYmIHJvdy5pZCA9PT0gdmFsdWVJZClcclxuICAgICAgICAgIC5mb3JFYWNoKHJvdyA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuY29tcGxldGVSb3dMaXN0LnB1c2gocm93KTtcclxuICAgICAgICAgICAgdGhpcy5jb21wbGV0ZVZhbHVlTGlzdC5wdXNoKHJvdy5pZCk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHByb3h5TWF0U2VsZWN0U2VhcmNoQ29uZmlndXJhdGlvbihjb25maWd1cmF0aW9uOiB7IFtrZXk6IHN0cmluZ106IGFueSB9KTogdm9pZCB7XHJcbiAgICBpZiAoaXNOdWxsT3JVbmRlZmluZWQodGhpcy5tYXRTZWxlY3RTZWFyY2gpKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBQcm94eSBASW5wdXQgYmluZGluZ3MgdG8gTmd4TWF0U2VsZWN0U2VhcmNoXHJcbiAgICBPYmplY3Qua2V5cyhjb25maWd1cmF0aW9uKVxyXG4gICAgICAuZmlsdGVyKGtleSA9PiAhWydjbGVhclNlYXJjaElucHV0J10uaW5jbHVkZXMoa2V5KSAmJiAhdGhpcy5jb250cm9sVmFsdWVBY2Nlc3NvcktleXMuaW5jbHVkZXMoa2V5KSlcclxuICAgICAgLmZvckVhY2goa2V5ID0+IHRoaXMubWF0U2VsZWN0U2VhcmNoW2tleV0gPSBjb25maWd1cmF0aW9uW2tleV0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhcHBseUNvbHVtbkxldmVsRmlsdGVycyhkYXRhOiBNYXRTZWxlY3RUYWJsZVJvd1tdKTogdm9pZCB7XHJcbiAgICB0aGlzLmZpbHRlcmVkT3V0Um93cyA9IHt9O1xyXG4gICAgY29uc3QgZmlsdGVyczogeyBba2V5OiBzdHJpbmddOiB7IGZpbHRlcjogTWF0U2VsZWN0VGFibGVGaWx0ZXIsIHZhbHVlOiBhbnkgfSB9ID0ge307XHJcbiAgICBPYmplY3Qua2V5cyh0aGlzLmZpbHRlckNvbnRyb2xzLmNvbnRyb2xzKVxyXG4gICAgICAuZmlsdGVyKGtleSA9PiB0aGlzLnRhYmxlQ29sdW1uc01hcC5oYXMoa2V5KVxyXG4gICAgICAgICYmICFpc051bGxPclVuZGVmaW5lZCh0aGlzLnRhYmxlQ29sdW1uc01hcC5nZXQoa2V5KS5maWx0ZXIpXHJcbiAgICAgICAgLy8gSWYgZmlsdGVyIGlzIGVuYWJsZWRcclxuICAgICAgICAmJiB0aGlzLnRhYmxlQ29sdW1uc01hcC5nZXQoa2V5KS5maWx0ZXIuZW5hYmxlZCAhPT0gZmFsc2UpXHJcbiAgICAgIC5maWx0ZXIoa2V5ID0+IHtcclxuICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuZmlsdGVyQ29udHJvbHMuZ2V0KGtleSkudmFsdWU7XHJcbiAgICAgICAgcmV0dXJuICFpc051bGxPclVuZGVmaW5lZCh2YWx1ZSlcclxuICAgICAgICAgIC8vIElmIGFuIGFycmF5IC0gY2hlY2sgaXQncyBub3QgZW1wdHlcclxuICAgICAgICAgICYmICgoaXNBcnJheSh2YWx1ZSkgJiYgdmFsdWUubGVuZ3RoID4gMClcclxuICAgICAgICAgICAgLy8gSWYgc3RyaW5nIC0gY2hlY2sgdGhhdCBub3QgYmxhbmtcclxuICAgICAgICAgICAgfHwgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdmFsdWUudHJpbSgpLmxlbmd0aCA+IDApXHJcbiAgICAgICAgICAgIC8vIElmIG51bWJlciAtIGNoZWNrIHRoYXQgdG9TdHJpbmcoKSBpcyBub3QgYmxhbmtcclxuICAgICAgICAgICAgfHwgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgYCR7dmFsdWV9YC50cmltKCkubGVuZ3RoID4gMCkpO1xyXG4gICAgICB9KVxyXG4gICAgICAuZm9yRWFjaChrZXkgPT4gZmlsdGVyc1trZXldID0ge1xyXG4gICAgICAgIGZpbHRlcjogdGhpcy50YWJsZUNvbHVtbnNNYXAuZ2V0KGtleSkuZmlsdGVyLFxyXG4gICAgICAgIHZhbHVlOiB0aGlzLmZpbHRlckNvbnRyb2xzLmdldChrZXkpLnZhbHVlXHJcbiAgICAgIH0pO1xyXG4gICAgY29uc3QgZmlsdGVyS2V5czogc3RyaW5nW10gPSBPYmplY3Qua2V5cyhmaWx0ZXJzKTtcclxuICAgIGZvciAobGV0IGkgPSBkYXRhLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgIGZvciAobGV0IGsgPSAwOyBrIDwgZmlsdGVyS2V5cy5sZW5ndGg7IGsrKykge1xyXG4gICAgICAgIGNvbnN0IGZpbHRlcktleTogc3RyaW5nID0gZmlsdGVyS2V5c1trXTtcclxuICAgICAgICBjb25zdCByb3c6IE1hdFNlbGVjdFRhYmxlUm93ID0gZGF0YVtpXTtcclxuICAgICAgICBpZiAoaXNOdWxsT3JVbmRlZmluZWQocm93KSkge1xyXG4gICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGNlbGxWYWx1ZTogYW55ID0gcm93W2ZpbHRlcktleV07XHJcbiAgICAgICAgaWYgKGlzTnVsbE9yVW5kZWZpbmVkKGNlbGxWYWx1ZSkpIHtcclxuICAgICAgICAgIGRhdGEuc3BsaWNlKGksIDEpLmZvckVhY2goaXRlbSA9PiB0aGlzLmZpbHRlcmVkT3V0Um93c1tgJHtpdGVtLmlkfWBdID0gaXRlbSk7XHJcbiAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgZmlsdGVyID0gZmlsdGVyc1tmaWx0ZXJLZXldO1xyXG4gICAgICAgIGNvbnN0IGNvbXBhcmF0b3IgPSBmaWx0ZXIuZmlsdGVyLmNvbXBhcmF0b3I7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBmaWx0ZXIuZmlsdGVyLmNvbXBhcmF0b3JGbiA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgaWYgKCFmaWx0ZXIuZmlsdGVyLmNvbXBhcmF0b3JGbi5jYWxsKG51bGwsIGNlbGxWYWx1ZSwgZmlsdGVyLnZhbHVlLCByb3cpKSB7XHJcbiAgICAgICAgICAgIGRhdGEuc3BsaWNlKGksIDEpLmZvckVhY2goaXRlbSA9PiB0aGlzLmZpbHRlcmVkT3V0Um93c1tgJHtpdGVtLmlkfWBdID0gaXRlbSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAoaXNOdWxsT3JVbmRlZmluZWQoY29tcGFyYXRvcikgfHwgY29tcGFyYXRvciA9PT0gJ2VxdWFscycpIHtcclxuICAgICAgICAgIGlmIChmaWx0ZXIudmFsdWUgIT09IGNlbGxWYWx1ZSkge1xyXG4gICAgICAgICAgICBkYXRhLnNwbGljZShpLCAxKS5mb3JFYWNoKGl0ZW0gPT4gdGhpcy5maWx0ZXJlZE91dFJvd3NbYCR7aXRlbS5pZH1gXSA9IGl0ZW0pO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBjZWxsVmFsdWUgPT09ICdzdHJpbmcnICYmIHR5cGVvZiBmaWx0ZXIudmFsdWUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICBjb25zdCBjZWxsVmFsdWVMQzogc3RyaW5nID0gYCR7Y2VsbFZhbHVlfWAudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgIGNvbnN0IGZpbHRlclZhbHVlTEM6IHN0cmluZyA9IGZpbHRlci52YWx1ZS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgaWYgKGlzTnVsbE9yVW5kZWZpbmVkKGNvbXBhcmF0b3IpIHx8IGNvbXBhcmF0b3IgPT09ICdlcXVhbHNJZ25vcmVDYXNlJykge1xyXG4gICAgICAgICAgICBpZiAoZmlsdGVyVmFsdWVMQyAhPT0gY2VsbFZhbHVlTEMpIHtcclxuICAgICAgICAgICAgICBkYXRhLnNwbGljZShpLCAxKS5mb3JFYWNoKGl0ZW0gPT4gdGhpcy5maWx0ZXJlZE91dFJvd3NbYCR7aXRlbS5pZH1gXSA9IGl0ZW0pO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGNvbXBhcmF0b3IgPT09ICdjb250YWlucycpIHtcclxuICAgICAgICAgICAgaWYgKGNlbGxWYWx1ZS5pbmRleE9mKGZpbHRlci52YWx1ZSkgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgZGF0YS5zcGxpY2UoaSwgMSkuZm9yRWFjaChpdGVtID0+IHRoaXMuZmlsdGVyZWRPdXRSb3dzW2Ake2l0ZW0uaWR9YF0gPSBpdGVtKTtcclxuICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIGlmIChjb21wYXJhdG9yID09PSAnY29udGFpbnNJZ25vcmVDYXNlJykge1xyXG4gICAgICAgICAgICBpZiAoY2VsbFZhbHVlTEMuaW5kZXhPZihmaWx0ZXJWYWx1ZUxDKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICBkYXRhLnNwbGljZShpLCAxKS5mb3JFYWNoKGl0ZW0gPT4gdGhpcy5maWx0ZXJlZE91dFJvd3NbYCR7aXRlbS5pZH1gXSA9IGl0ZW0pO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGNvbXBhcmF0b3IgPT09ICdzdGFydHNXaXRoJykge1xyXG4gICAgICAgICAgICBpZiAoIWNlbGxWYWx1ZS5zdGFydHNXaXRoKGZpbHRlci52YWx1ZSkpIHtcclxuICAgICAgICAgICAgICBkYXRhLnNwbGljZShpLCAxKS5mb3JFYWNoKGl0ZW0gPT4gdGhpcy5maWx0ZXJlZE91dFJvd3NbYCR7aXRlbS5pZH1gXSA9IGl0ZW0pO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGNvbXBhcmF0b3IgPT09ICdzdGFydHNXaXRoSWdub3JlQ2FzZScpIHtcclxuICAgICAgICAgICAgaWYgKCFjZWxsVmFsdWVMQy5zdGFydHNXaXRoKGZpbHRlclZhbHVlTEMpKSB7XHJcbiAgICAgICAgICAgICAgZGF0YS5zcGxpY2UoaSwgMSkuZm9yRWFjaChpdGVtID0+IHRoaXMuZmlsdGVyZWRPdXRSb3dzW2Ake2l0ZW0uaWR9YF0gPSBpdGVtKTtcclxuICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhcHBseU92ZXJhbGxGaWx0ZXIoZGF0YTogTWF0U2VsZWN0VGFibGVSb3dbXSk6IHZvaWQge1xyXG4gICAgdGhpcy5maWx0ZXJlZE91dFJvd3MgPSB7fTtcclxuICAgIGlmIChpc051bGxPclVuZGVmaW5lZCh0aGlzLm92ZXJhbGxGaWx0ZXJDb250cm9sLnZhbHVlKSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBjb25zdCBmaWx0ZXJWYWx1ZUxDOiBzdHJpbmcgPSB0aGlzLm92ZXJhbGxGaWx0ZXJDb250cm9sLnZhbHVlLnRvTG93ZXJDYXNlKCk7XHJcbiAgICBpZiAoZmlsdGVyVmFsdWVMQy50cmltKCkubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGZvciAobGV0IGkgPSBkYXRhLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgIGNvbnN0IHJvdzogTWF0U2VsZWN0VGFibGVSb3cgPSBkYXRhW2ldO1xyXG4gICAgICBsZXQgcm93U2hvdWxkQmVGaWx0ZXJlZCA9IHRydWU7XHJcbiAgICAgIGZvciAobGV0IGogPSB0aGlzLmRhdGFTb3VyY2UuY29sdW1ucy5sZW5ndGggLSAxOyBqID49IDA7IGotLSkge1xyXG4gICAgICAgIGNvbnN0IGtleTogc3RyaW5nID0gdGhpcy5kYXRhU291cmNlLmNvbHVtbnNbal0ua2V5O1xyXG4gICAgICAgIGNvbnN0IGNlbGxWYWx1ZTogYW55ID0gcm93W2tleV07XHJcbiAgICAgICAgaWYgKGlzTnVsbE9yVW5kZWZpbmVkKGNlbGxWYWx1ZSkpIHtcclxuICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBjZWxsVmFsdWVMQzogc3RyaW5nID0gYCR7Y2VsbFZhbHVlfWAudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICBpZiAoY2VsbFZhbHVlTEMuaW5kZXhPZihmaWx0ZXJWYWx1ZUxDKSAhPT0gLTEpIHtcclxuICAgICAgICAgIHJvd1Nob3VsZEJlRmlsdGVyZWQgPSBmYWxzZTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpZiAocm93U2hvdWxkQmVGaWx0ZXJlZCkge1xyXG4gICAgICAgIGRhdGEuc3BsaWNlKGksIDEpLmZvckVhY2goaXRlbSA9PiB0aGlzLmZpbHRlcmVkT3V0Um93c1tgJHtpdGVtLmlkfWBdID0gaXRlbSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgYXBwbHlQcm94eVRvQXJyYXkoYXJyYXk6IGFueVtdLCBjYWxsYmFjazogKCkgPT4gdm9pZCk6IHZvaWQge1xyXG4gICAgWydwb3AnLCAncHVzaCcsICdyZXZlcnNlJywgJ3NoaWZ0JywgJ3Vuc2hpZnQnLCAnc3BsaWNlJywgJ3NvcnQnXS5mb3JFYWNoKChtZXRob2ROYW1lKSA9PiB7XHJcbiAgICAgIGFycmF5W21ldGhvZE5hbWVdID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGNvbnN0IHJlcyA9IEFycmF5LnByb3RvdHlwZVttZXRob2ROYW1lXS5hcHBseShhcnJheSwgYXJndW1lbnRzKTsgLy8gY2FsbCBub3JtYWwgYmVoYXZpb3VyXHJcbiAgICAgICAgY2FsbGJhY2suYXBwbHkoYXJyYXksIGFyZ3VtZW50cyk7IC8vIGZpbmFsbHkgY2FsbCB0aGUgY2FsbGJhY2sgc3VwcGxpZWRcclxuICAgICAgICByZXR1cm4gcmVzO1xyXG4gICAgICB9O1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJlc2V0RmlsdGVycygpOiB2b2lkIHtcclxuICAgIHRoaXMub3ZlcmFsbEZpbHRlckNvbnRyb2wuc2V0VmFsdWUoJycpO1xyXG4gICAgT2JqZWN0LmtleXModGhpcy5maWx0ZXJDb250cm9scy5jb250cm9scylcclxuICAgICAgLmZvckVhY2goa2V5ID0+IHRoaXMuZmlsdGVyQ29udHJvbHMuZ2V0KGtleSkuc2V0VmFsdWUoJycpKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRha2VuIGZyb20ge0BzZWUgTWF0VGFibGVEYXRhU291cmNlI3NvcnRpbmdEYXRhQWNjZXNzb3J9XHJcbiAgICpcclxuICAgKiBAcGFyYW0gZGF0YVxyXG4gICAqIEBwYXJhbSBzb3J0SGVhZGVySWRcclxuICAgKi9cclxuICBwcml2YXRlIHNvcnRpbmdEYXRhQWNjZXNzb3IoZGF0YTogTWF0U2VsZWN0VGFibGVSb3csIGFjdGl2ZTogc3RyaW5nKTogc3RyaW5nIHwgbnVtYmVyIHwgRGF0ZSB7XHJcblxyXG4gICAgY29uc3QgdmFsdWUgPSAoZGF0YSBhcyB7IFtrZXk6IHN0cmluZ106IGFueSB9KVthY3RpdmVdO1xyXG5cclxuICAgIGlmIChfaXNOdW1iZXJWYWx1ZSh2YWx1ZSkpIHtcclxuICAgICAgY29uc3QgbnVtYmVyVmFsdWUgPSBOdW1iZXIodmFsdWUpO1xyXG5cclxuICAgICAgLy8gTnVtYmVycyBiZXlvbmQgYE1BWF9TQUZFX0lOVEVHRVJgIGNhbid0IGJlIGNvbXBhcmVkIHJlbGlhYmx5IHNvIHdlXHJcbiAgICAgIC8vIGxlYXZlIHRoZW0gYXMgc3RyaW5ncy4gRm9yIG1vcmUgaW5mbzogaHR0cHM6Ly9nb28uZ2wveTV2YlNnXHJcbiAgICAgIHJldHVybiBudW1iZXJWYWx1ZSA8IE1BWF9TQUZFX0lOVEVHRVIgPyBudW1iZXJWYWx1ZSA6IHZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB2YWx1ZTtcclxuICB9XHJcblxyXG5cclxuICBwcml2YXRlIHNvcnREYXRhKGRhdGE6IE1hdFNlbGVjdFRhYmxlUm93W10sIGFjdGl2ZTogc3RyaW5nLCBkaXJlY3Rpb246IFNvcnREaXJlY3Rpb24pOiBNYXRTZWxlY3RUYWJsZVJvd1tdIHtcclxuICAgIGlmICghYWN0aXZlIHx8IGRpcmVjdGlvbiA9PT0gJycpIHtcclxuICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGRhdGEuc29ydCgoYSwgYikgPT4ge1xyXG4gICAgICBsZXQgYVZhbHVlID0gdGhpcy5zb3J0aW5nRGF0YUFjY2Vzc29yKGEsIGFjdGl2ZSk7XHJcbiAgICAgIGxldCBiVmFsdWUgPSB0aGlzLnNvcnRpbmdEYXRhQWNjZXNzb3IoYiwgYWN0aXZlKTtcclxuXHJcbiAgICAgIGlmIChhLmlkID09PSBudWxsKSB7XHJcbiAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICB9IGVsc2UgaWYgKGIuaWQgPT09IG51bGwpIHtcclxuICAgICAgICByZXR1cm4gMTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQm90aCBudWxsL3VuZGVmaW5lZC9lcXVhbCB2YWx1ZSBjaGVja1xyXG4gICAgICBpZiAoYVZhbHVlID09PSBiVmFsdWUpIHtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gT25lIG51bGwgdmFsdWUgY2hlY2tcclxuICAgICAgaWYgKGlzTnVsbE9yVW5kZWZpbmVkKGFWYWx1ZSkgJiYgIWlzTnVsbE9yVW5kZWZpbmVkKGJWYWx1ZSkpIHtcclxuICAgICAgICByZXR1cm4gLTE7XHJcbiAgICAgIH0gZWxzZSBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKGFWYWx1ZSkgJiYgaXNOdWxsT3JVbmRlZmluZWQoYlZhbHVlKSkge1xyXG4gICAgICAgIHJldHVybiAxO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoYVZhbHVlIGluc3RhbmNlb2YgRGF0ZSkge1xyXG4gICAgICAgIGFWYWx1ZSA9IGFWYWx1ZS5nZXRUaW1lKCk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGJWYWx1ZSBpbnN0YW5jZW9mIERhdGUpIHtcclxuICAgICAgICBiVmFsdWUgPSBiVmFsdWUuZ2V0VGltZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBVc2VyIGxvY2FsZUNvbXBhcmUgZm9yIHN0cmluZ3NcclxuICAgICAgaWYgKGlzU3RyaW5nKGFWYWx1ZSkgJiYgaXNTdHJpbmcoYlZhbHVlKSkge1xyXG4gICAgICAgIHJldHVybiAoPHN0cmluZz5hVmFsdWUpLmxvY2FsZUNvbXBhcmUoPHN0cmluZz5iVmFsdWUpICogKGRpcmVjdGlvbiA9PT0gJ2FzYycgPyAxIDogLTEpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBUcnkgdG8gY29udmVydCB0byBhIE51bWJlciB0eXBlXHJcbiAgICAgIGFWYWx1ZSA9IGlzTmFOKDxudW1iZXI+YVZhbHVlKSA/IGAke2FWYWx1ZX1gIDogK2FWYWx1ZTtcclxuICAgICAgYlZhbHVlID0gaXNOYU4oPG51bWJlcj5iVmFsdWUpID8gYCR7YlZhbHVlfWAgOiArYlZhbHVlO1xyXG5cclxuICAgICAgLy8gaWYgb25lIGlzIG51bWJlciBhbmQgb3RoZXIgaXMgU3RyaW5nXHJcbiAgICAgIGlmIChpc1N0cmluZyhhVmFsdWUpICYmIGlzTnVtYmVyKGJWYWx1ZSkpIHtcclxuICAgICAgICByZXR1cm4gKDEpICogKGRpcmVjdGlvbiA9PT0gJ2FzYycgPyAxIDogLTEpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChpc051bWJlcihhVmFsdWUpICYmIGlzU3RyaW5nKGJWYWx1ZSkpIHtcclxuICAgICAgICByZXR1cm4gKC0xKSAqIChkaXJlY3Rpb24gPT09ICdhc2MnID8gMSA6IC0xKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQ29tcGFyZSBhcyBOdW1iZXJzIG90aGVyd2lzZVxyXG4gICAgICByZXR1cm4gKGFWYWx1ZSA+IGJWYWx1ZSA/IDEgOiAtMSkgKiAoZGlyZWN0aW9uID09PSAnYXNjJyA/IDEgOiAtMSk7XHJcbiAgICB9KTtcclxuXHRcclxuICB9XHJcblxyXG4gIGFkZE51bGxSb3coKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gIXRoaXMubXVsdGlwbGUgJiYgIWlzTnVsbE9yVW5kZWZpbmVkKHRoaXMubGFiZWxGb3JOdWxsVmFsdWUpO1xyXG4gIH1cclxuICBcclxuICBwcml2YXRlIGNoZWNrQW5kUmVzZXRTZWxlY3Rpb24oKSB7XHRcclxuICAgIGlmICh0aGlzLm1hdFNlbGVjdC52YWx1ZSAmJiBpc0FycmF5KHRoaXMubWF0U2VsZWN0LnZhbHVlKSAmJiB0aGlzLm1hdFNlbGVjdC52YWx1ZS5sZW5ndGggPCAxXHRcclxuICAgICAgJiYgIWlzTnVsbE9yVW5kZWZpbmVkKHRoaXMucmVzZXRPcHRpb25BY3Rpb24pKSB7XHRcclxuICAgICAgdGhpcy5yZXNldE9wdGlvbkFjdGlvbigpO1x0XHJcbiAgICB9XHRcclxuICB9XHJcbn1cclxuIl19