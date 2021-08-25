var MatSelectTableComponent_1;
import * as tslib_1 from "tslib";
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, forwardRef, Input, OnChanges, OnDestroy, OnInit, Output, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { merge, Subject } from 'rxjs';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
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
    ViewChild('componentSelect', { static: true }),
    tslib_1.__metadata("design:type", MatSelect)
], MatSelectTableComponent.prototype, "matSelect", void 0);
tslib_1.__decorate([
    ViewChild(MatSelectSearchComponent, { static: false }),
    tslib_1.__metadata("design:type", MatSelectSearchComponent)
], MatSelectTableComponent.prototype, "matSelectSearch", void 0);
tslib_1.__decorate([
    ViewChild(MatSort, { static: true }),
    tslib_1.__metadata("design:type", MatSort)
], MatSelectTableComponent.prototype, "sort", void 0);
tslib_1.__decorate([
    ViewChild(MatTable, { static: true }),
    tslib_1.__metadata("design:type", MatTable)
], MatSelectTableComponent.prototype, "table", void 0);
tslib_1.__decorate([
    ViewChild('table', { read: ElementRef, static: true }),
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
        styles: [":host{display:block}:host mat-form-field{width:100%}::ng-deep .mat-select-panel.mat-select-search-table-panel{overflow-x:auto!important}::ng-deep .mat-select-panel.mat-select-search-table-panel .overall-search-toggle{z-index:102;position:absolute;left:13px;top:17px;cursor:pointer}::ng-deep .mat-select-panel.mat-select-search-table-panel ngx-mat-select-search{position:absolute;z-index:101}::ng-deep .mat-select-panel.mat-select-search-table-panel ngx-mat-select-search.hidden{display:none}::ng-deep .mat-select-panel.mat-select-search-table-panel ngx-mat-select-search .mat-select-search-inner{height:56px}::ng-deep .mat-select-panel.mat-select-search-table-panel ngx-mat-select-search .mat-select-search-inner .mat-select-search-input{margin-left:26px;width:calc(100% - 26px)}::ng-deep .mat-select-panel.mat-select-search-table-panel table{width:100%}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr{cursor:pointer;height:48px;max-height:48px}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr mat-option{height:48px;max-height:48px}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr.active{background:rgba(0,0,0,.04)}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr td{-webkit-user-select:none;-moz-user-select:none;user-select:none;border-bottom:0!important;box-shadow:inset 0 -1px 0 0 rgba(0,0,0,.12)}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th ::ng-deep .mat-sort-header-container{height:55px}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th ::ng-deep .mat-sort-header-container mat-form-field .mat-form-field-infix{width:initial}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th[aria-sort] ::ng-deep .mat-sort-header-arrow{opacity:1!important}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr td mat-option,::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th mat-option{background:0 0!important}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr td.selection,::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th.selection{width:56px;padding:0;margin:0}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr td.selection.hidden mat-option,::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th.selection.hidden mat-option{visibility:hidden}"]
    }),
    tslib_1.__metadata("design:paramtypes", [ChangeDetectorRef])
], MatSelectTableComponent);
export { MatSelectTableComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0LXNlbGVjdC10YWJsZS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9uZ3gtbWF0LXNlbGVjdC10YWJsZS8iLCJzb3VyY2VzIjpbIm1hdC1zZWxlY3QtdGFibGUuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsT0FBTyxFQUNMLGFBQWEsRUFDYix1QkFBdUIsRUFDdkIsaUJBQWlCLEVBQ2pCLFNBQVMsRUFDVCxVQUFVLEVBQ1YsWUFBWSxFQUNaLFVBQVUsRUFDVixLQUFLLEVBQ0wsU0FBUyxFQUNULFNBQVMsRUFDVCxNQUFNLEVBQ04sTUFBTSxFQUNOLFNBQVMsRUFDVCxhQUFhLEVBQ2IsU0FBUyxFQUNULFlBQVksRUFDYixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQXVCLFdBQVcsRUFBRSxTQUFTLEVBQUUsaUJBQWlCLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUMvRixPQUFPLEVBQUMsS0FBSyxFQUFFLE9BQU8sRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUNwQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDbkQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3JELE9BQU8sRUFBRSxPQUFPLEVBQXVCLE1BQU0sd0JBQXdCLENBQUM7QUFDdEUsT0FBTyxFQUFFLFFBQVEsRUFBc0IsTUFBTSx5QkFBeUIsQ0FBQztBQUN2RSxPQUFPLEVBQUMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFHcEUsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ3JELE9BQU8sRUFBQyxZQUFZLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRzdELE9BQU8sRUFBQyx3QkFBd0IsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBRS9ELE1BQU0sZ0JBQWdCLEdBQUcsZ0JB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QUFDOzZDQXFId0IsaUJBQWlCO0dBcEg5Qix1QkFBdUIsQ0EwcEJuQztTQTFwQlksdUJBQXVCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcclxuICBBZnRlclZpZXdJbml0LFxyXG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxyXG4gIENoYW5nZURldGVjdG9yUmVmLFxyXG4gIENvbXBvbmVudCxcclxuICBFbGVtZW50UmVmLFxyXG4gIEV2ZW50RW1pdHRlcixcclxuICBmb3J3YXJkUmVmLFxyXG4gIElucHV0LFxyXG4gIE9uQ2hhbmdlcyxcclxuICBPbkRlc3Ryb3ksXHJcbiAgT25Jbml0LFxyXG4gIE91dHB1dCxcclxuICBRdWVyeUxpc3QsXHJcbiAgU2ltcGxlQ2hhbmdlcyxcclxuICBWaWV3Q2hpbGQsXHJcbiAgVmlld0NoaWxkcmVuXHJcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7Q29udHJvbFZhbHVlQWNjZXNzb3IsIEZvcm1Db250cm9sLCBGb3JtR3JvdXAsIE5HX1ZBTFVFX0FDQ0VTU09SfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XHJcbmltcG9ydCB7bWVyZ2UsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgeyBNYXRPcHRpb24gfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9jb3JlJztcbmltcG9ydCB7IE1hdFNlbGVjdCB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL3NlbGVjdCc7XG5pbXBvcnQgeyBNYXRTb3J0LCBTb3J0LCBTb3J0RGlyZWN0aW9uIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvc29ydCc7XG5pbXBvcnQgeyBNYXRUYWJsZSwgTWF0VGFibGVEYXRhU291cmNlIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvdGFibGUnO1xyXG5pbXBvcnQge2lzQXJyYXksIGlzTnVsbE9yVW5kZWZpbmVkLCBpc051bWJlciwgaXNTdHJpbmd9IGZyb20gJ3V0aWwnO1xyXG5pbXBvcnQge01hdFNlbGVjdFRhYmxlRGF0YVNvdXJjZX0gZnJvbSAnLi9NYXRTZWxlY3RUYWJsZURhdGFTb3VyY2UnO1xyXG5pbXBvcnQge01hdFNlbGVjdFRhYmxlUm93fSBmcm9tICcuL01hdFNlbGVjdFRhYmxlUm93JztcclxuaW1wb3J0IHtfaXNOdW1iZXJWYWx1ZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcclxuaW1wb3J0IHtkZWJvdW5jZVRpbWUsIHRha2UsIHRha2VVbnRpbH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG5pbXBvcnQge01hdFNlbGVjdFRhYmxlQ29sdW1ufSBmcm9tICcuL01hdFNlbGVjdFRhYmxlQ29sdW1uJztcclxuaW1wb3J0IHtNYXRTZWxlY3RUYWJsZUZpbHRlcn0gZnJvbSAnLi9NYXRTZWxlY3RUYWJsZUZpbHRlcic7XHJcbmltcG9ydCB7TWF0U2VsZWN0U2VhcmNoQ29tcG9uZW50fSBmcm9tICduZ3gtbWF0LXNlbGVjdC1zZWFyY2gnO1xyXG5cclxuY29uc3QgTUFYX1NBRkVfSU5URUdFUiA9IDkwMDcxOTkyNTQ3NDA5OTE7XHJcblxyXG5AQ29tcG9uZW50KHtcclxuICBzZWxlY3RvcjogJ25neC1tYXQtc2VsZWN0LXRhYmxlJyxcclxuICB0ZW1wbGF0ZVVybDogJy4vbWF0LXNlbGVjdC10YWJsZS5jb21wb25lbnQuaHRtbCcsXHJcbiAgc3R5bGVVcmxzOiBbJy4vbWF0LXNlbGVjdC10YWJsZS5jb21wb25lbnQuc2NzcyddLFxyXG4gIGV4cG9ydEFzOiAnbmd4LW1hdC1zZWxlY3QtdGFibGUnLFxyXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxyXG4gIHByb3ZpZGVyczogW1xyXG4gICAge1xyXG4gICAgICBwcm92aWRlOiBOR19WQUxVRV9BQ0NFU1NPUixcclxuICAgICAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gTWF0U2VsZWN0VGFibGVDb21wb25lbnQpLFxyXG4gICAgICBtdWx0aTogdHJ1ZVxyXG4gICAgfVxyXG4gIF1cclxufSlcclxuZXhwb3J0IGNsYXNzIE1hdFNlbGVjdFRhYmxlQ29tcG9uZW50IGltcGxlbWVudHMgQ29udHJvbFZhbHVlQWNjZXNzb3IsIE9uSW5pdCwgQWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95LCBPbkNoYW5nZXMge1xyXG5cclxuICAvKiogRGF0YSBTb3VyY2UgZm9yIHRoZSB0YWJsZSAqL1xyXG4gIEBJbnB1dCgpIGRhdGFTb3VyY2U6IE1hdFNlbGVjdFRhYmxlRGF0YVNvdXJjZTxNYXRTZWxlY3RUYWJsZVJvdz47XHJcblxyXG4gIC8qKlxyXG4gICAqIE11bHRpcGxlL1NpbmdsZSBtb2RlIGZvciB7QHNlZSBNYXRTZWxlY3QjbXVsdGlwbGV9IHRvIGluaXRpYWxpemUuXHJcbiAgICogTkI6IHN3aXRjaGluZyBiZXR3ZWVuIG1vZGVzIGluIHJ1bnRpbWUgaXMgbm90IHN1cHBvcnRlZCBieSB7QHNlZSBNYXRTZWxlY3R9XHJcbiAgICovXHJcbiAgQElucHV0KCkgbXVsdGlwbGU6IGJvb2xlYW47XHJcblxyXG4gIC8qKiBXaGV0aGVyIG9yIG5vdCBvdmVyYWxsIHNlYXJjaCBtb2RlIGVuYWJsZWQuIFNlZSB7QHNlZSBNYXRTZWxlY3RUYWJsZUNvbXBvbmVudH0gKi9cclxuICBASW5wdXQoKSBvdmVyYWxsU2VhcmNoRW5hYmxlZDogYm9vbGVhbjtcclxuXHJcbiAgLyoqIERlZmF1bHQgaXMgdHJ1ZSAqL1xyXG4gIEBJbnB1dCgpIG92ZXJhbGxTZWFyY2hWaXNpYmxlOiBib29sZWFuO1xyXG5cclxuICAvKiogV2hldGhlciBvciBub3Qgc2hvdWxkIHtAc2VlIE1hdFNlbGVjdFRhYmxlQ29tcG9uZW50fSBiZSB2aXNpYmxlIG9uIG9wZW4uIERlZmF1bHQgaXMgdHJ1ZSAqL1xyXG4gIEBJbnB1dCgpIHJlc2V0U29ydE9uT3BlbjogYm9vbGVhbjtcclxuXHJcbiAgLyoqIFdoZXRoZXIgb3Igbm90IHByZXZpb3VzIHNlYXJjaCBzaG91bGQgYmUgY2xlYXJlZCBvbiBvcGVuLiBEZWZhdWx0IGlzIHRydWUgKi9cclxuICBASW5wdXQoKSByZXNldEZpbHRlcnNPbk9wZW46IGJvb2xlYW47XHJcblxyXG4gIC8qKlxyXG4gICAqIEZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSB0aGUgZGVmYXVsdCBsYWJlbFxyXG4gICAqL1xyXG4gIEBJbnB1dCgpIGN1c3RvbVRyaWdnZXJMYWJlbEZuOiAodmFsdWU6IE1hdFNlbGVjdFRhYmxlUm93W10pID0+IHN0cmluZztcclxuXHJcbiAgLyoqXHJcbiAgICogU29ydCBvcHRpb24gZm9yIHZhbHVlcyBpbiB0aGUgY3VzdG9tVHJpZ2dlckxhYmVsRm4gaW4gTXVsdGlwbGUgbW9kZS5cclxuICAgKi9cclxuICBASW5wdXQoKSB0cmlnZ2VyTGFiZWxTb3J0OiBTb3J0O1xyXG5cclxuICAvKipcclxuICAgKiBUZW1wbGF0ZSB0byBjdXN0b21pemUgdGhlIGRlZmF1bHQgdHJpZ2dlciBsYWJlbC4gSGFzIGxlc3NlciBwcmlvcml0eSB0aGFuIHtAc2VlIE1hdFNlbGVjdFRhYmxlQ29tcG9uZW50I2N1c3RvbVRyaWdnZXJMYWJlbEZufS5cclxuICAgKiBTdWJzdGl0dXRpb24gaXMgY2FzZSBzZW5zaXRpdmUuXHJcbiAgICogRXhhbXBsZTogJHtuYW1lfSAke2lkfSAtICR7YWRkcmVzc31cclxuICAgKi9cclxuICBASW5wdXQoKSBjdXN0b21UcmlnZ2VyTGFiZWxUZW1wbGF0ZTogc3RyaW5nO1xyXG5cclxuICBASW5wdXQoKSBsYWJlbEZvck51bGxWYWx1ZTogc3RyaW5nO1xyXG4gIHByaXZhdGUgbnVsbFJvdzogTWF0U2VsZWN0VGFibGVSb3cgPSB7aWQ6IG51bGx9O1xyXG5cclxuICAvKipcclxuICAgKiB7QHNlZSBNYXRTZWxlY3R9IHByb3h5IGlucHV0cyBjb25maWd1cmF0b3JcclxuICAgKiB7QHNlZSBNYXRTZWxlY3QjbXVsdGlwbGV9IGdldHMgdmFsdWUgZnJvbSB7QHNlZSBNYXRTZWxlY3RUYWJsZUNvbXBvbmVudCNtdWx0aXBsZX1cclxuICAgKi9cclxuICBASW5wdXQoKSBtYXRTZWxlY3RDb25maWd1cmF0b3I6IHsgW2tleTogc3RyaW5nXTogYW55IH07XHJcblxyXG4gIC8qKlxyXG4gICAqIHtAc2VlIE1hdFNlbGVjdFNlYXJjaENvbXBvbmVudH0gcHJveHkgaW5wdXRzIGNvbmZpZ3VyYXRvclxyXG4gICAqIHtAc2VlIE1hdFNlbGVjdFNlYXJjaENvbXBvbmVudCNjbGVhclNlYXJjaElucHV0fSBnZXRzIHZhbHVlIGZyb20ge0BzZWUgTWF0U2VsZWN0VGFibGVDb21wb25lbnQjcmVzZXRGaWx0ZXJzT25PcGVufVxyXG4gICAqIHtAc2VlIE1hdFNlbGVjdFNlYXJjaENvbXBvbmVudH0ge0BzZWUgQ29udHJvbFZhbHVlQWNjZXNzb3J9IGdldHMgdmFsdWUgZnJvbSB7QHNlZSBNYXRTZWxlY3RUYWJsZUNvbXBvbmVudCNvdmVyYWxsRmlsdGVyQ29udHJvbH1cclxuICAgKi9cclxuICBASW5wdXQoKSBtYXRTZWxlY3RTZWFyY2hDb25maWd1cmF0b3I6IHsgW2tleTogc3RyaW5nXTogYW55IH07XHJcblxyXG4gIC8qKlxyXG4gICAqIEFwcGx5IGRlZmF1bHQgc29ydGluZ1xyXG4gICAqL1xyXG4gIEBJbnB1dCgpIGRlZmF1bHRTb3J0OiBTb3J0O1xyXG4gIFxyXG4gIC8qKlxyXG4gICAqIEFjdGlvbiBmb3IgJ0FsbCcgb3B0aW9uLlxyXG4gICAqL1xyXG4gIEBJbnB1dCgpIHJlc2V0T3B0aW9uQWN0aW9uOiAoKSA9PiB2b2lkO1xyXG5cclxuICBAT3V0cHV0KCkgY2xvc2U6IEV2ZW50RW1pdHRlcjxib29sZWFuPiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuXHJcbiAgQFZpZXdDaGlsZCgnY29tcG9uZW50U2VsZWN0JywgeyBzdGF0aWM6IHRydWUgfSkgcHJpdmF0ZSBtYXRTZWxlY3Q6IE1hdFNlbGVjdDtcclxuXHJcbiAgQFZpZXdDaGlsZChNYXRTZWxlY3RTZWFyY2hDb21wb25lbnQsIHsgc3RhdGljOiBmYWxzZSB9KSBwcml2YXRlIG1hdFNlbGVjdFNlYXJjaDogTWF0U2VsZWN0U2VhcmNoQ29tcG9uZW50O1xyXG5cclxuICBAVmlld0NoaWxkKE1hdFNvcnQsIHsgc3RhdGljOiB0cnVlIH0pIHByaXZhdGUgc29ydDogTWF0U29ydDtcclxuXHJcbiAgQFZpZXdDaGlsZChNYXRUYWJsZSwgeyBzdGF0aWM6IHRydWUgfSkgcHJpdmF0ZSB0YWJsZTogTWF0VGFibGU8TWF0U2VsZWN0VGFibGVSb3c+O1xyXG5cclxuICBAVmlld0NoaWxkKCd0YWJsZScsIHsgcmVhZDogRWxlbWVudFJlZiwgc3RhdGljOiB0cnVlIH0pIHByaXZhdGUgdGFibGVSZWY6IEVsZW1lbnRSZWY7XHJcblxyXG4gIEBWaWV3Q2hpbGRyZW4oTWF0T3B0aW9uKSBwcml2YXRlIG1hdE9wdGlvbnM6IFF1ZXJ5TGlzdDxNYXRPcHRpb24+O1xyXG5cclxuICB0YWJsZURhdGFTb3VyY2U6IE1hdFNlbGVjdFRhYmxlUm93W107XHJcblxyXG4gIHRhYmxlQ29sdW1uczogc3RyaW5nW107XHJcblxyXG4gIHRhYmxlQ29sdW1uc01hcDogTWFwPHN0cmluZywgTWF0U2VsZWN0VGFibGVDb2x1bW4+O1xyXG5cclxuICB0YWJsZUFjdGl2ZVJvdzogbnVtYmVyO1xyXG5cclxuICBmaWx0ZXJlZE91dFJvd3M6IHsgW2tleTogc3RyaW5nXTogTWF0U2VsZWN0VGFibGVSb3cgfTtcclxuXHJcbiAgY29tcGxldGVSb3dMaXN0OiBNYXRTZWxlY3RUYWJsZVJvd1tdID0gW107XHJcblxyXG4gIG92ZXJhbGxTZWFyY2hWaXNpYmxlU3RhdGU6IGJvb2xlYW47XHJcblxyXG4gIG92ZXJhbGxGaWx0ZXJDb250cm9sOiBGb3JtQ29udHJvbDtcclxuXHJcbiAgcHJpdmF0ZSBmaWx0ZXJDb250cm9sczogRm9ybUdyb3VwO1xyXG5cclxuICBwcml2YXRlIGNvbXBsZXRlVmFsdWVMaXN0OiBhbnlbXSA9IFtdO1xyXG5cclxuICBwcml2YXRlIGNvbnRyb2xWYWx1ZUFjY2Vzc29yS2V5czogc3RyaW5nW10gPSBbXHJcbiAgICAnZm9ybUNvbnRyb2wnLFxyXG4gICAgJ2Zvcm1Db250cm9sTmFtZScsXHJcbiAgICAnZm9ybUdyb3VwJyxcclxuICAgICdmb3JtR3JvdXBOYW1lJyxcclxuICAgICdmb3JtQXJyYXknLFxyXG4gICAgJ2Zvcm1BcnJheU5hbWUnXHJcbiAgXTtcclxuXHJcbiAgLyoqIFN1YmplY3QgdGhhdCBlbWl0cyB3aGVuIHRoZSBjb21wb25lbnQgaGFzIGJlZW4gZGVzdHJveWVkLiAqL1xyXG4gIHByaXZhdGUgX29uRGVzdHJveSA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XHJcblxyXG4gIHByaXZhdGUgX29uU2VsZWN0T3BlbiA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XHJcblxyXG4gIHByaXZhdGUgX29uT3B0aW9uc0NoYW5nZSA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgY2Q6IENoYW5nZURldGVjdG9yUmVmKSB7XHJcbiAgICB0aGlzLnRhYmxlQ29sdW1uc01hcCA9IG5ldyBNYXAoKTtcclxuICAgIHRoaXMuZmlsdGVyQ29udHJvbHMgPSBuZXcgRm9ybUdyb3VwKHt9KTtcclxuICAgIHRoaXMub3ZlcmFsbEZpbHRlckNvbnRyb2wgPSBuZXcgRm9ybUNvbnRyb2woJycpO1xyXG4gIH1cclxuXHJcbiAgbmdPbkluaXQoKTogdm9pZCB7XHJcbiAgICB0aGlzLm11bHRpcGxlID0gdGhpcy5tdWx0aXBsZSB8fCBmYWxzZTtcclxuICAgIHRoaXMubWF0U2VsZWN0Lm9wZW5lZENoYW5nZVxyXG4gICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5fb25EZXN0cm95KSlcclxuICAgICAgLnN1YnNjcmliZShvcGVuZWQgPT4ge1xyXG4gICAgICAgIGlmICh0aGlzLnJlc2V0RmlsdGVyc09uT3BlbiAhPT0gZmFsc2UgfHwgIXRoaXMubWF0T3B0aW9ucy5sZW5ndGgpIHtcclxuICAgICAgICAgIHRoaXMucmVzZXRGaWx0ZXJzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMub3ZlcmFsbFNlYXJjaFZpc2libGVTdGF0ZSA9IHRoaXMub3ZlcmFsbFNlYXJjaFZpc2libGU7XHJcbiAgICAgICAgaWYgKHRoaXMucmVzZXRTb3J0T25PcGVuICE9PSBmYWxzZSkge1xyXG4gICAgICAgICAgdGhpcy5zb3J0LnNvcnQoe2lkOiAnJywgc3RhcnQ6ICdhc2MnLCBkaXNhYmxlQ2xlYXI6IGZhbHNlfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghb3BlbmVkKSB7XHJcbiAgICAgICAgICB0aGlzLmNsb3NlLmVtaXQoIW9wZW5lZCk7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLm92ZXJhbGxTZWFyY2hFbmFibGVkKSB7XHJcbiAgICAgICAgICB0aGlzLnByb3h5TWF0U2VsZWN0U2VhcmNoQ29uZmlndXJhdGlvbih0aGlzLm1hdFNlbGVjdFNlYXJjaENvbmZpZ3VyYXRvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIFRvRG86IGdldCByaWQgb2YgdGhpcyB3b3JrYXJvdW5kICh1cGRhdGVzIGhlYWRlciByb3cgW290aGVyd2lzZSBzb3J0IG1lY2hhbmlzbSBwcm9kdWNlcyBnbGl0Y2hlc10pXHJcbiAgICAgICAgKHRoaXMudGFibGUgYXMgYW55KS5faGVhZGVyUm93RGVmQ2hhbmdlZCA9IHRydWU7XHJcbiAgICAgICAgLy8gRGlzYWJsZSBzb3J0IGJ1dHRvbnMgdG8gcHJldmVudCBzb3J0aW5nIGNoYW5nZSBvbiBTUEFDRSBrZXkgcHJlc3NlZCBpbiBmaWx0ZXIgZmllbGRcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IFtdLmZvckVhY2guY2FsbChcclxuICAgICAgICAgIHRoaXMudGFibGVSZWYubmF0aXZlRWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCdidXR0b24ubWF0LXNvcnQtaGVhZGVyLWJ1dHRvbicpLFxyXG4gICAgICAgICAgKGUpID0+IGUuZGlzYWJsZWQgPSB0cnVlKVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIC8vIFBhdGNoIHRoZSBoZWlnaHQgb2YgdGhlIHBhbmVsIHRvIGluY2x1ZGUgdGhlIGhlaWdodCBvZiB0aGUgaGVhZGVyIGFuZCBmb290ZXJcclxuICAgICAgICBjb25zdCBwYW5lbEVsZW1lbnQ6IEhUTUxEaXZFbGVtZW50ID0gdGhpcy5tYXRTZWxlY3QucGFuZWwubmF0aXZlRWxlbWVudDtcclxuICAgICAgICBjb25zdCBwYW5lbEhlaWdodCA9IHBhbmVsRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQ7XHJcbiAgICAgICAgbGV0IHRhYmxlQWRkaXRpb25hbEhlaWdodCA9IDA7XHJcbiAgICAgICAgdGhpcy50YWJsZVxyXG4gICAgICAgICAgLl9nZXRSZW5kZXJlZFJvd3ModGhpcy50YWJsZS5faGVhZGVyUm93T3V0bGV0KVxyXG4gICAgICAgICAgLmNvbmNhdCh0aGlzLnRhYmxlLl9nZXRSZW5kZXJlZFJvd3ModGhpcy50YWJsZS5fZm9vdGVyUm93T3V0bGV0KSlcclxuICAgICAgICAgIC5mb3JFYWNoKHJvdyA9PiB0YWJsZUFkZGl0aW9uYWxIZWlnaHQgKz0gcm93LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodCk7XHJcbiAgICAgICAgaWYgKCFpc05hTihwYW5lbEhlaWdodCkpIHtcclxuICAgICAgICAgIHBhbmVsRWxlbWVudC5zdHlsZS5tYXhIZWlnaHQgPSBgJHtwYW5lbEhlaWdodCArIHRhYmxlQWRkaXRpb25hbEhlaWdodH1weGA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXRoaXMubWF0U2VsZWN0U2VhcmNoQ29uZmlndXJhdG9yLmRpc2FibGVTY3JvbGxUb0FjdGl2ZU9uT3B0aW9uc0NoYW5nZWRcclxuICAgICAgICAgICYmICFpc051bGxPclVuZGVmaW5lZCh0aGlzLm1hdFNlbGVjdC5fa2V5TWFuYWdlcikgJiYgdGhpcy5jb21wbGV0ZVJvd0xpc3QubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgdGhpcy5fb25TZWxlY3RPcGVuLnBpcGUodGFrZVVudGlsKHRoaXMuX29uRGVzdHJveSksIGRlYm91bmNlVGltZSgxKSwgdGFrZSgxKSkuc3Vic2NyaWJlKCgpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgZmlyc3RWYWx1ZSA9IGAke3RoaXMuY29tcGxldGVSb3dMaXN0WzBdLmlkfWA7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy50YWJsZURhdGFTb3VyY2UubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICBpZiAoYCR7dGhpcy50YWJsZURhdGFTb3VyY2VbaV0uaWR9YCA9PT0gZmlyc3RWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tYXRTZWxlY3QuX2tleU1hbmFnZXIuc2V0QWN0aXZlSXRlbShpKTtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgIHRoaXMuY2QuZGV0ZWN0Q2hhbmdlcygpO1xyXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoaWdub3JlZCkge1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cdCAgXHJcblx0ICB0aGlzLm1hdFNlbGVjdC52YWx1ZUNoYW5nZVx0XHJcbiAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLl9vbkRlc3Ryb3kpKVx0XHJcbiAgICAgIC5zdWJzY3JpYmUoKHZhbHVlKSA9PiB7XHRcclxuICAgICAgICBpZiAoIXRoaXMubXVsdGlwbGUpIHtcdFxyXG4gICAgICAgICAgcmV0dXJuO1x0XHJcbiAgICAgICAgfVx0XHJcbiAgICAgICAgaWYgKGlzQXJyYXkodmFsdWUpICYmIHZhbHVlLmxlbmd0aCA+IDEgJiYgdmFsdWUuc29tZSh2ID0+IHYgPT09ICcnKSkge1x0XHJcbiAgICAgICAgICB0aGlzLndyaXRlVmFsdWUodmFsdWUuZmlsdGVyKHYgPT4gdiAhPT0gJycpKTtcdFxyXG4gICAgICAgICAgdHJ5IHtcdFxyXG4gICAgICAgICAgICB0aGlzLmNkLmRldGVjdENoYW5nZXMoKTtcdFxyXG4gICAgICAgICAgfSBjYXRjaCAoaWdub3JlZCkge1x0XHJcbiAgICAgICAgICB9XHRcclxuICAgICAgICB9XHRcclxuICAgICAgICBpZiAoaXNBcnJheSh2YWx1ZSkgJiYgdmFsdWUubGVuZ3RoID09PSAwKSB7XHRcclxuICAgICAgICAgIHRoaXMuY2hlY2tBbmRSZXNldFNlbGVjdGlvbigpO1x0XHJcbiAgICAgICAgfVx0XHJcbiAgICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgbmdBZnRlclZpZXdJbml0KCk6IHZvaWQge1xyXG4gICAgbWVyZ2UoLi4uW1xyXG4gICAgICB0aGlzLl9vbk9wdGlvbnNDaGFuZ2UsXHJcbiAgICAgIHRoaXMuc29ydC5zb3J0Q2hhbmdlLFxyXG4gICAgICB0aGlzLmZpbHRlckNvbnRyb2xzLnZhbHVlQ2hhbmdlcyxcclxuICAgICAgdGhpcy5vdmVyYWxsRmlsdGVyQ29udHJvbC52YWx1ZUNoYW5nZXNcclxuICAgIF0pXHJcbiAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLl9vbkRlc3Ryb3kpLCBkZWJvdW5jZVRpbWUoMTAwKSlcclxuICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgZGF0YUNsb25lOiBNYXRTZWxlY3RUYWJsZVJvd1tdID0gWy4uLigodGhpcy5kYXRhU291cmNlIHx8IHtkYXRhOiBbXX0pLmRhdGEgfHwgW10pXTtcclxuICAgICAgICBpZiAodGhpcy5hZGROdWxsUm93KCkpIHtcclxuICAgICAgICAgIGRhdGFDbG9uZS51bnNoaWZ0KHRoaXMubnVsbFJvdyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBBcHBseSBmaWx0ZXJpbmdcclxuICAgICAgICBpZiAodGhpcy5vdmVyYWxsU2VhcmNoRW5hYmxlZCAmJiB0aGlzLm92ZXJhbGxTZWFyY2hWaXNpYmxlU3RhdGUpIHtcclxuICAgICAgICAgIHRoaXMuYXBwbHlPdmVyYWxsRmlsdGVyKGRhdGFDbG9uZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuYXBwbHlDb2x1bW5MZXZlbEZpbHRlcnMoZGF0YUNsb25lKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEluaGVyaXQgZGVmYXVsdCBzb3J0aW5nIG9wdGlvbnMgaWYgc29ydCBub3Qgc3BlY2lmaWVkXHJcbiAgICAgICAgaWYgKCF0aGlzLnNvcnQuYWN0aXZlICYmICFpc051bGxPclVuZGVmaW5lZCh0aGlzLmRlZmF1bHRTb3J0KSAmJiB0aGlzLmRlZmF1bHRTb3J0LmFjdGl2ZSkge1xyXG4gICAgICAgICAgdGhpcy5zb3J0LmFjdGl2ZSA9IHRoaXMuZGVmYXVsdFNvcnQuYWN0aXZlO1xyXG4gICAgICAgICAgdGhpcy5zb3J0LmRpcmVjdGlvbiA9IHRoaXMuZGVmYXVsdFNvcnQuZGlyZWN0aW9uO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQXBwbHkgZGVmYXVsdCBvciBtYW51YWwgc29ydGluZ1xyXG4gICAgICAgIHRoaXMudGFibGVEYXRhU291cmNlID0gIXRoaXMuc29ydC5hY3RpdmUgP1xyXG4gICAgICAgICAgZGF0YUNsb25lIDogdGhpcy5zb3J0RGF0YShkYXRhQ2xvbmUsIHRoaXMuc29ydC5hY3RpdmUsIHRoaXMuc29ydC5kaXJlY3Rpb24pO1xyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgdGhpcy5jZC5kZXRlY3RDaGFuZ2VzKCk7XHJcbiAgICAgICAgfSBjYXRjaCAoaWdub3JlZCkge1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5fb25TZWxlY3RPcGVuLm5leHQoKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgLy8gTWFudWFsbHkgc29ydCBkYXRhIGZvciB0aGlzLm1hdFNlbGVjdC5vcHRpb25zIChRdWVyeUxpc3Q8TWF0T3B0aW9uPikgYW5kIG5vdGlmeSBtYXRTZWxlY3Qub3B0aW9ucyBvZiBjaGFuZ2VzXHJcbiAgICAvLyBJdCdzIGltcG9ydGFudCB0byBrZWVwIHRoaXMubWF0U2VsZWN0Lm9wdGlvbnMgb3JkZXIgc3luY2hyb25pemVkIHdpdGggZGF0YSBpbiB0aGUgdGFibGVcclxuICAgIC8vICAgICBiZWNhdXNlIHRoaXMubWF0U2VsZWN0Lm9wdGlvbnMgKFF1ZXJ5TGlzdDxNYXRPcHRpb24+KSBkb2Vzbid0IHVwZGF0ZSBpdCdzIHN0YXRlIGFmdGVyIHRhYmxlIGRhdGEgaXMgY2hhbmdlZFxyXG4gICAgdGhpcy5tYXRPcHRpb25zLmNoYW5nZXMuc3Vic2NyaWJlKCgpID0+IHtcclxuICAgICAgY29uc3Qgb3B0aW9uczogeyBba2V5OiBzdHJpbmddOiBNYXRPcHRpb24gfSA9IHt9O1xyXG4gICAgICB0aGlzLm1hdE9wdGlvbnMudG9BcnJheSgpXHJcbiAgICAgICAgLmZpbHRlcihvcHRpb24gPT4gIWlzTnVsbE9yVW5kZWZpbmVkKG9wdGlvbikpXHJcbiAgICAgICAgLmZvckVhY2gob3B0aW9uID0+IG9wdGlvbnNbYCR7b3B0aW9uLnZhbHVlfWBdID0gb3B0aW9uKTtcclxuICAgICAgdGhpcy5tYXRTZWxlY3Qub3B0aW9ucy5yZXNldCh0aGlzLnRhYmxlRGF0YVNvdXJjZVxyXG4gICAgICAgIC5maWx0ZXIocm93ID0+ICFpc051bGxPclVuZGVmaW5lZChvcHRpb25zW2Ake3Jvdy5pZH1gXSkpXHJcbiAgICAgICAgLm1hcChyb3cgPT4gb3B0aW9uc1tgJHtyb3cuaWR9YF0pKTtcclxuICAgICAgdGhpcy5tYXRTZWxlY3Qub3B0aW9ucy5ub3RpZnlPbkNoYW5nZXMoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGlmICghaXNOdWxsT3JVbmRlZmluZWQodGhpcy5tYXRTZWxlY3QuX2tleU1hbmFnZXIpKSB7XHJcbiAgICAgIC8vIFN1YnNjcmliZSBvbiBLZXlNYW5hZ2VyIGNoYW5nZXMgdG8gaGlnaGxpZ2h0IHRoZSB0YWJsZSByb3dzIGFjY29yZGluZ2x5XHJcbiAgICAgIHRoaXMubWF0U2VsZWN0Ll9rZXlNYW5hZ2VyLmNoYW5nZVxyXG4gICAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLl9vbkRlc3Ryb3kpKVxyXG4gICAgICAgIC5zdWJzY3JpYmUoYWN0aXZlUm93ID0+IHRoaXMudGFibGVBY3RpdmVSb3cgPSBhY3RpdmVSb3cpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XHJcbiAgICB0aGlzLl9vblNlbGVjdE9wZW4uY29tcGxldGUoKTtcclxuICAgIHRoaXMuX29uRGVzdHJveS5uZXh0KCk7XHJcbiAgICB0aGlzLl9vbkRlc3Ryb3kuY29tcGxldGUoKTtcclxuICB9XHJcblxyXG4gIHJlZ2lzdGVyT25DaGFuZ2UoZm46ICh2YWx1ZTogYW55KSA9PiB2b2lkKTogdm9pZCB7XHJcbiAgICBjb25zdCBwcm94eUZuOiAodmFsdWU6IGFueSkgPT4gdm9pZCA9ICh2YWx1ZTogYW55KSA9PiB7XHJcbiAgICAgIC8vIFRvRG86IHJlZmFjdG9yIC0gY29tcGFyaXNvbiBtZWNoYW5pc20gaXNuJ3Qgb3B0aW1pemVkLiBmaWx0ZXJlZE91dFJvd3MgaXMgYSBtYXAgYnV0IGNvbXBsZXRlVmFsdWVMaXN0IGlzIGFuIGFycmF5XHJcbiAgICAgIGlmICh0aGlzLm11bHRpcGxlID09PSB0cnVlKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IHRoaXMuY29tcGxldGVWYWx1ZUxpc3QubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgIGlmICh0aGlzLmZpbHRlcmVkT3V0Um93c1tgJHt0aGlzLmNvbXBsZXRlVmFsdWVMaXN0W2ldfWBdID09PSB1bmRlZmluZWQgJiYgdmFsdWUuaW5kZXhPZih0aGlzLmNvbXBsZXRlVmFsdWVMaXN0W2ldKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgdGhpcy5jb21wbGV0ZVZhbHVlTGlzdC5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhbHVlXHJcbiAgICAgICAgICAuZmlsdGVyKGNob2ljZSA9PiB0aGlzLmNvbXBsZXRlVmFsdWVMaXN0LmluZGV4T2YoY2hvaWNlKSA9PT0gLTEpXHJcbiAgICAgICAgICAuZm9yRWFjaChjaG9pY2UgPT4gdGhpcy5jb21wbGV0ZVZhbHVlTGlzdC5wdXNoKGNob2ljZSkpO1xyXG4gICAgICAgIHRoaXMubWF0U2VsZWN0LnZhbHVlID0gdGhpcy5jb21wbGV0ZVZhbHVlTGlzdDtcclxuICAgICAgICBmbih0aGlzLmNvbXBsZXRlVmFsdWVMaXN0KTtcclxuICAgICAgICB0aGlzLmNvbXBsZXRlUm93TGlzdC5zcGxpY2UoMCk7XHJcbiAgICAgICAgKCh0aGlzLmRhdGFTb3VyY2UgfHwge2RhdGE6IFtdfSkuZGF0YSB8fCBbXSlcclxuICAgICAgICAgIC5maWx0ZXIocm93ID0+IHRoaXMuY29tcGxldGVWYWx1ZUxpc3QuaW5kZXhPZihyb3cuaWQpICE9PSAtMSlcclxuICAgICAgICAgIC5mb3JFYWNoKHJvdyA9PiB0aGlzLmNvbXBsZXRlUm93TGlzdC5wdXNoKHJvdykpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGZuKHZhbHVlKTtcclxuICAgICAgICB0aGlzLmNvbXBsZXRlUm93TGlzdC5zcGxpY2UoMCk7XHJcbiAgICAgICAgKCh0aGlzLmRhdGFTb3VyY2UgfHwge2RhdGE6IFtdfSkuZGF0YSB8fCBbXSlcclxuICAgICAgICAgIC5maWx0ZXIocm93ID0+IHJvdy5pZCA9PT0gdmFsdWUpXHJcbiAgICAgICAgICAuZm9yRWFjaChyb3cgPT4gdGhpcy5jb21wbGV0ZVJvd0xpc3QucHVzaChyb3cpKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIHRoaXMubWF0U2VsZWN0LnJlZ2lzdGVyT25DaGFuZ2UocHJveHlGbik7XHJcbiAgfVxyXG5cclxuICByZWdpc3Rlck9uVG91Y2hlZChmbjogKCkgPT4ge30pOiB2b2lkIHtcclxuICAgIHRoaXMubWF0U2VsZWN0LnJlZ2lzdGVyT25Ub3VjaGVkKGZuKTtcclxuICB9XHJcblxyXG4gIHNldERpc2FibGVkU3RhdGUoaXNEaXNhYmxlZDogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgdGhpcy5tYXRTZWxlY3Quc2V0RGlzYWJsZWRTdGF0ZShpc0Rpc2FibGVkKTtcclxuICB9XHJcblxyXG4gIHdyaXRlVmFsdWUodmFsdWU6IGFueSk6IHZvaWQge1xyXG4gICAgdGhpcy51cGRhdGVDb21wbGV0ZVJvd0xpc3QodmFsdWUpO1xyXG4gICAgdGhpcy5tYXRTZWxlY3Qud3JpdGVWYWx1ZSh2YWx1ZSk7XHJcbiAgICBpZiAodGhpcy5tYXRTZWxlY3QudmFsdWUgIT09IHZhbHVlKSB7XHJcbiAgICAgIHRoaXMubWF0U2VsZWN0LnZhbHVlID0gdmFsdWU7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKTogdm9pZCB7XHJcblxyXG4gICAgaWYgKCFpc051bGxPclVuZGVmaW5lZChjaGFuZ2VzLnJlc2V0RmlsdGVyc09uT3BlbikgJiYgY2hhbmdlcy5yZXNldEZpbHRlcnNPbk9wZW4uY3VycmVudFZhbHVlICE9PSBmYWxzZSkge1xyXG4gICAgICB0aGlzLnJlc2V0RmlsdGVycygpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghaXNOdWxsT3JVbmRlZmluZWQoY2hhbmdlcy5kYXRhU291cmNlKSkge1xyXG4gICAgICB0aGlzLnVwZGF0ZUNvbXBsZXRlUm93TGlzdCh0aGlzLmNvbXBsZXRlUm93TGlzdC5tYXAocm93ID0+IHJvdy5pZCkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFByb3h5IEBJbnB1dCBiaW5kaW5ncyB0byBNYXRTZWxlY3RcclxuICAgIGlmICghaXNOdWxsT3JVbmRlZmluZWQoY2hhbmdlcy5tYXRTZWxlY3RDb25maWd1cmF0b3IpKSB7XHJcbiAgICAgIGNvbnN0IGNvbmZpZ3VyYXRpb24gPSBjaGFuZ2VzLm1hdFNlbGVjdENvbmZpZ3VyYXRvci5jdXJyZW50VmFsdWU7XHJcbiAgICAgIE9iamVjdC5rZXlzKGNvbmZpZ3VyYXRpb24pXHJcbiAgICAgICAgLmZpbHRlcihrZXkgPT4gIVsnbXVsdGlwbGUnLCAncGFuZWxDbGFzcyddLmluY2x1ZGVzKGtleSkgJiYgIXRoaXMuY29udHJvbFZhbHVlQWNjZXNzb3JLZXlzLmluY2x1ZGVzKGtleSkpXHJcbiAgICAgICAgLmZvckVhY2goa2V5ID0+IHRoaXMubWF0U2VsZWN0W2tleV0gPSBjb25maWd1cmF0aW9uW2tleV0pO1xyXG4gICAgICBjb25zdCBwYW5lbENsYXNzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICBwYW5lbENsYXNzLnB1c2goJ21hdC1zZWxlY3Qtc2VhcmNoLXRhYmxlLXBhbmVsJyk7XHJcbiAgICAgIGlmICghaXNOdWxsT3JVbmRlZmluZWQoY29uZmlndXJhdGlvbi5wYW5lbENsYXNzKSkge1xyXG4gICAgICAgIHBhbmVsQ2xhc3MucHVzaChjb25maWd1cmF0aW9uLnBhbmVsQ2xhc3MpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh0aGlzLm92ZXJhbGxTZWFyY2hFbmFibGVkKSB7XHJcbiAgICAgICAgcGFuZWxDbGFzcy5wdXNoKCdtYXQtc2VsZWN0LXNlYXJjaC1wYW5lbCcpO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMubWF0U2VsZWN0LnBhbmVsQ2xhc3MgPSBwYW5lbENsYXNzO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghaXNOdWxsT3JVbmRlZmluZWQoY2hhbmdlcy5tYXRTZWxlY3RTZWFyY2hDb25maWd1cmF0b3IpKSB7XHJcbiAgICAgIHRoaXMucHJveHlNYXRTZWxlY3RTZWFyY2hDb25maWd1cmF0aW9uKGNoYW5nZXMubWF0U2VsZWN0U2VhcmNoQ29uZmlndXJhdG9yLmN1cnJlbnRWYWx1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFpc051bGxPclVuZGVmaW5lZChjaGFuZ2VzLmRhdGFTb3VyY2UpXHJcbiAgICAgICYmICFpc051bGxPclVuZGVmaW5lZChjaGFuZ2VzLmRhdGFTb3VyY2UuY3VycmVudFZhbHVlKVxyXG4gICAgICAmJiBpc0FycmF5KGNoYW5nZXMuZGF0YVNvdXJjZS5jdXJyZW50VmFsdWUuZGF0YSkpIHtcclxuICAgICAgdGhpcy50YWJsZURhdGFTb3VyY2UgPSBbLi4uY2hhbmdlcy5kYXRhU291cmNlLmN1cnJlbnRWYWx1ZS5kYXRhXTtcclxuICAgICAgaWYgKHRoaXMuYWRkTnVsbFJvdygpKSB7XHJcbiAgICAgICAgdGhpcy50YWJsZURhdGFTb3VyY2UudW5zaGlmdCh0aGlzLm51bGxSb3cpO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMudGFibGVDb2x1bW5zID0gWydfc2VsZWN0aW9uJywgLi4uY2hhbmdlcy5kYXRhU291cmNlLmN1cnJlbnRWYWx1ZS5jb2x1bW5zLm1hcChjb2x1bW4gPT4gY29sdW1uLmtleSldO1xyXG4gICAgICB0aGlzLnRhYmxlQ29sdW1uc01hcC5jbGVhcigpO1xyXG4gICAgICBjaGFuZ2VzLmRhdGFTb3VyY2UuY3VycmVudFZhbHVlLmNvbHVtbnMuZm9yRWFjaChjb2x1bW4gPT4gdGhpcy50YWJsZUNvbHVtbnNNYXAuc2V0KGNvbHVtbi5rZXksIGNvbHVtbikpO1xyXG4gICAgICB0aGlzLmFwcGx5UHJveHlUb0FycmF5KGNoYW5nZXMuZGF0YVNvdXJjZS5jdXJyZW50VmFsdWUuZGF0YSwgKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuX29uT3B0aW9uc0NoYW5nZS5uZXh0KCk7XHJcbiAgICAgIH0pO1xyXG4gICAgICB0aGlzLl9vbk9wdGlvbnNDaGFuZ2UubmV4dCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZW11bGF0ZU1hdE9wdGlvbkNsaWNrKGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCB7XHJcbiAgICBpZiAoZXZlbnQuY29tcG9zZWRQYXRoKClcclxuICAgICAgLmZpbHRlcihldCA9PiBldCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KVxyXG4gICAgICAuc29tZSgoZXQ6IEhUTUxFbGVtZW50KSA9PiBldC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdtYXQtb3B0aW9uJykpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgaWYgKCEoZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGxldCByb3dFbGVtZW50ID0gZXZlbnQudGFyZ2V0O1xyXG4gICAgd2hpbGUgKHJvd0VsZW1lbnQgIT0gbnVsbCAmJiByb3dFbGVtZW50IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgJiYgcm93RWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgIT09ICd0cicpIHtcclxuICAgICAgcm93RWxlbWVudCA9IHJvd0VsZW1lbnQucGFyZW50RWxlbWVudDtcclxuICAgIH1cclxuICAgIGlmIChyb3dFbGVtZW50ID09PSBudWxsKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGNvbnN0IGNoaWxkT3B0aW9uOiBIVE1MRWxlbWVudCA9IHJvd0VsZW1lbnQucXVlcnlTZWxlY3RvcignbWF0LW9wdGlvbicpO1xyXG4gICAgaWYgKCFjaGlsZE9wdGlvbikge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBjaGlsZE9wdGlvbi5jbGljaygpO1xyXG4gIH1cclxuXHJcblxyXG4gIGZpbHRlckZvcm1Db250cm9sKGtleTogc3RyaW5nKTogRm9ybUNvbnRyb2wge1xyXG4gICAgaWYgKCF0aGlzLmZpbHRlckNvbnRyb2xzLmNvbnRhaW5zKGtleSkpIHtcclxuICAgICAgdGhpcy5maWx0ZXJDb250cm9scy5yZWdpc3RlckNvbnRyb2woa2V5LCBuZXcgRm9ybUNvbnRyb2woJycpKTtcclxuICAgIH1cclxuICAgIHJldHVybiA8Rm9ybUNvbnRyb2w+dGhpcy5maWx0ZXJDb250cm9scy5nZXQoa2V5KTtcclxuICB9XHJcblxyXG4gIHNpbXBsZVRyaWdnZXJMYWJlbEZuKHZhbHVlOiBNYXRTZWxlY3RUYWJsZVJvd1tdKTogc3RyaW5nIHtcclxuICAgIGlmICghaXNOdWxsT3JVbmRlZmluZWQodGhpcy50cmlnZ2VyTGFiZWxTb3J0KSkge1xyXG4gICAgICB0aGlzLnNvcnREYXRhKHZhbHVlLCB0aGlzLnRyaWdnZXJMYWJlbFNvcnQuYWN0aXZlLCB0aGlzLnRyaWdnZXJMYWJlbFNvcnQuZGlyZWN0aW9uKTtcclxuICAgIH1cclxuICAgIHJldHVybiB2YWx1ZS5tYXAocm93ID0+IHtcclxuICAgICAgaWYgKGlzTnVsbE9yVW5kZWZpbmVkKHJvdykpIHtcclxuICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGlzTnVsbE9yVW5kZWZpbmVkKHRoaXMuY3VzdG9tVHJpZ2dlckxhYmVsVGVtcGxhdGUpXHJcbiAgICAgICAgfHwgdHlwZW9mIHRoaXMuY3VzdG9tVHJpZ2dlckxhYmVsVGVtcGxhdGUgIT09ICdzdHJpbmcnXHJcbiAgICAgICAgfHwgdGhpcy5jdXN0b21UcmlnZ2VyTGFiZWxUZW1wbGF0ZS50cmltKCkubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuIGAke3Jvdy5pZH1gO1xyXG4gICAgICB9XHJcbiAgICAgIGxldCBhdExlYXN0UGFydGlhbFN1YnN0aXR1dGlvbiA9IGZhbHNlO1xyXG4gICAgICBjb25zdCBzdWJzdGl0dXRpb246IHN0cmluZyA9IHRoaXMuY3VzdG9tVHJpZ2dlckxhYmVsVGVtcGxhdGUucmVwbGFjZSgvWyRdezF9W3tdezF9KFtefV0rKVt9XXsxfT8vZywgKF8sIGtleSkgPT5cclxuICAgICAgICAhaXNOdWxsT3JVbmRlZmluZWQocm93W2tleV0pICYmIChhdExlYXN0UGFydGlhbFN1YnN0aXR1dGlvbiA9IHRydWUpID8gcm93W2tleV0gOiAnJyk7XHJcbiAgICAgIGlmIChhdExlYXN0UGFydGlhbFN1YnN0aXR1dGlvbiA9PT0gZmFsc2UpIHtcclxuICAgICAgICByZXR1cm4gYCR7cm93LmlkfWA7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHN1YnN0aXR1dGlvbi50cmltKCk7XHJcbiAgICB9KS5qb2luKCcsICcpO1xyXG4gIH1cclxuXHJcbiAgdG9nZ2xlT3ZlcmFsbFNlYXJjaCgpOiB2b2lkIHtcclxuICAgIHRoaXMub3ZlcmFsbFNlYXJjaFZpc2libGVTdGF0ZSA9ICF0aGlzLm92ZXJhbGxTZWFyY2hWaXNpYmxlU3RhdGU7XHJcbiAgICB0aGlzLnJlc2V0RmlsdGVycygpO1xyXG4gICAgaWYgKHRoaXMub3ZlcmFsbFNlYXJjaFZpc2libGVTdGF0ZSkge1xyXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMubWF0U2VsZWN0U2VhcmNoLl9mb2N1cygpKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgdXBkYXRlQ29tcGxldGVSb3dMaXN0KHZhbHVlOiBhbnlbXSk6IHZvaWQge1xyXG4gICAgdGhpcy5jb21wbGV0ZVJvd0xpc3Quc3BsaWNlKDApO1xyXG4gICAgdGhpcy5jb21wbGV0ZVZhbHVlTGlzdC5zcGxpY2UoMCk7XHJcbiAgICBpZiAoaXNOdWxsT3JVbmRlZmluZWQodmFsdWUpKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGNvbnN0IHZhbHVlQXJyYXk6IGFueVtdID0gIWlzQXJyYXkodmFsdWUpID8gW3ZhbHVlXSA6IHZhbHVlO1xyXG4gICAgdmFsdWVBcnJheVxyXG4gICAgICAuZmlsdGVyKHZhbHVlSWQgPT4gIWlzTnVsbE9yVW5kZWZpbmVkKHZhbHVlSWQpKVxyXG4gICAgICAuZm9yRWFjaCh2YWx1ZUlkID0+IHtcclxuICAgICAgICAoKHRoaXMuZGF0YVNvdXJjZSB8fCB7ZGF0YTogW119KS5kYXRhIHx8IFtdKVxyXG4gICAgICAgICAgLmZpbHRlcihyb3cgPT4gIWlzTnVsbE9yVW5kZWZpbmVkKHJvdykgJiYgIWlzTnVsbE9yVW5kZWZpbmVkKHJvdy5pZCkgJiYgcm93LmlkID09PSB2YWx1ZUlkKVxyXG4gICAgICAgICAgLmZvckVhY2gocm93ID0+IHtcclxuICAgICAgICAgICAgdGhpcy5jb21wbGV0ZVJvd0xpc3QucHVzaChyb3cpO1xyXG4gICAgICAgICAgICB0aGlzLmNvbXBsZXRlVmFsdWVMaXN0LnB1c2gocm93LmlkKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcHJveHlNYXRTZWxlY3RTZWFyY2hDb25maWd1cmF0aW9uKGNvbmZpZ3VyYXRpb246IHsgW2tleTogc3RyaW5nXTogYW55IH0pOiB2b2lkIHtcclxuICAgIGlmIChpc051bGxPclVuZGVmaW5lZCh0aGlzLm1hdFNlbGVjdFNlYXJjaCkpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFByb3h5IEBJbnB1dCBiaW5kaW5ncyB0byBOZ3hNYXRTZWxlY3RTZWFyY2hcclxuICAgIE9iamVjdC5rZXlzKGNvbmZpZ3VyYXRpb24pXHJcbiAgICAgIC5maWx0ZXIoa2V5ID0+ICFbJ2NsZWFyU2VhcmNoSW5wdXQnXS5pbmNsdWRlcyhrZXkpICYmICF0aGlzLmNvbnRyb2xWYWx1ZUFjY2Vzc29yS2V5cy5pbmNsdWRlcyhrZXkpKVxyXG4gICAgICAuZm9yRWFjaChrZXkgPT4gdGhpcy5tYXRTZWxlY3RTZWFyY2hba2V5XSA9IGNvbmZpZ3VyYXRpb25ba2V5XSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFwcGx5Q29sdW1uTGV2ZWxGaWx0ZXJzKGRhdGE6IE1hdFNlbGVjdFRhYmxlUm93W10pOiB2b2lkIHtcclxuICAgIHRoaXMuZmlsdGVyZWRPdXRSb3dzID0ge307XHJcbiAgICBjb25zdCBmaWx0ZXJzOiB7IFtrZXk6IHN0cmluZ106IHsgZmlsdGVyOiBNYXRTZWxlY3RUYWJsZUZpbHRlciwgdmFsdWU6IGFueSB9IH0gPSB7fTtcclxuICAgIE9iamVjdC5rZXlzKHRoaXMuZmlsdGVyQ29udHJvbHMuY29udHJvbHMpXHJcbiAgICAgIC5maWx0ZXIoa2V5ID0+IHRoaXMudGFibGVDb2x1bW5zTWFwLmhhcyhrZXkpXHJcbiAgICAgICAgJiYgIWlzTnVsbE9yVW5kZWZpbmVkKHRoaXMudGFibGVDb2x1bW5zTWFwLmdldChrZXkpLmZpbHRlcilcclxuICAgICAgICAvLyBJZiBmaWx0ZXIgaXMgZW5hYmxlZFxyXG4gICAgICAgICYmIHRoaXMudGFibGVDb2x1bW5zTWFwLmdldChrZXkpLmZpbHRlci5lbmFibGVkICE9PSBmYWxzZSlcclxuICAgICAgLmZpbHRlcihrZXkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5maWx0ZXJDb250cm9scy5nZXQoa2V5KS52YWx1ZTtcclxuICAgICAgICByZXR1cm4gIWlzTnVsbE9yVW5kZWZpbmVkKHZhbHVlKVxyXG4gICAgICAgICAgLy8gSWYgYW4gYXJyYXkgLSBjaGVjayBpdCdzIG5vdCBlbXB0eVxyXG4gICAgICAgICAgJiYgKChpc0FycmF5KHZhbHVlKSAmJiB2YWx1ZS5sZW5ndGggPiAwKVxyXG4gICAgICAgICAgICAvLyBJZiBzdHJpbmcgLSBjaGVjayB0aGF0IG5vdCBibGFua1xyXG4gICAgICAgICAgICB8fCAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB2YWx1ZS50cmltKCkubGVuZ3RoID4gMClcclxuICAgICAgICAgICAgLy8gSWYgbnVtYmVyIC0gY2hlY2sgdGhhdCB0b1N0cmluZygpIGlzIG5vdCBibGFua1xyXG4gICAgICAgICAgICB8fCAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiBgJHt2YWx1ZX1gLnRyaW0oKS5sZW5ndGggPiAwKSk7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5mb3JFYWNoKGtleSA9PiBmaWx0ZXJzW2tleV0gPSB7XHJcbiAgICAgICAgZmlsdGVyOiB0aGlzLnRhYmxlQ29sdW1uc01hcC5nZXQoa2V5KS5maWx0ZXIsXHJcbiAgICAgICAgdmFsdWU6IHRoaXMuZmlsdGVyQ29udHJvbHMuZ2V0KGtleSkudmFsdWVcclxuICAgICAgfSk7XHJcbiAgICBjb25zdCBmaWx0ZXJLZXlzOiBzdHJpbmdbXSA9IE9iamVjdC5rZXlzKGZpbHRlcnMpO1xyXG4gICAgZm9yIChsZXQgaSA9IGRhdGEubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgZm9yIChsZXQgayA9IDA7IGsgPCBmaWx0ZXJLZXlzLmxlbmd0aDsgaysrKSB7XHJcbiAgICAgICAgY29uc3QgZmlsdGVyS2V5OiBzdHJpbmcgPSBmaWx0ZXJLZXlzW2tdO1xyXG4gICAgICAgIGNvbnN0IHJvdzogTWF0U2VsZWN0VGFibGVSb3cgPSBkYXRhW2ldO1xyXG4gICAgICAgIGlmIChpc051bGxPclVuZGVmaW5lZChyb3cpKSB7XHJcbiAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgY2VsbFZhbHVlOiBhbnkgPSByb3dbZmlsdGVyS2V5XTtcclxuICAgICAgICBpZiAoaXNOdWxsT3JVbmRlZmluZWQoY2VsbFZhbHVlKSkge1xyXG4gICAgICAgICAgZGF0YS5zcGxpY2UoaSwgMSkuZm9yRWFjaChpdGVtID0+IHRoaXMuZmlsdGVyZWRPdXRSb3dzW2Ake2l0ZW0uaWR9YF0gPSBpdGVtKTtcclxuICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBmaWx0ZXIgPSBmaWx0ZXJzW2ZpbHRlcktleV07XHJcbiAgICAgICAgY29uc3QgY29tcGFyYXRvciA9IGZpbHRlci5maWx0ZXIuY29tcGFyYXRvcjtcclxuICAgICAgICBpZiAodHlwZW9mIGZpbHRlci5maWx0ZXIuY29tcGFyYXRvckZuID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICBpZiAoIWZpbHRlci5maWx0ZXIuY29tcGFyYXRvckZuLmNhbGwobnVsbCwgY2VsbFZhbHVlLCBmaWx0ZXIudmFsdWUsIHJvdykpIHtcclxuICAgICAgICAgICAgZGF0YS5zcGxpY2UoaSwgMSkuZm9yRWFjaChpdGVtID0+IHRoaXMuZmlsdGVyZWRPdXRSb3dzW2Ake2l0ZW0uaWR9YF0gPSBpdGVtKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmIChpc051bGxPclVuZGVmaW5lZChjb21wYXJhdG9yKSB8fCBjb21wYXJhdG9yID09PSAnZXF1YWxzJykge1xyXG4gICAgICAgICAgaWYgKGZpbHRlci52YWx1ZSAhPT0gY2VsbFZhbHVlKSB7XHJcbiAgICAgICAgICAgIGRhdGEuc3BsaWNlKGksIDEpLmZvckVhY2goaXRlbSA9PiB0aGlzLmZpbHRlcmVkT3V0Um93c1tgJHtpdGVtLmlkfWBdID0gaXRlbSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGNlbGxWYWx1ZSA9PT0gJ3N0cmluZycgJiYgdHlwZW9mIGZpbHRlci52YWx1ZSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgIGNvbnN0IGNlbGxWYWx1ZUxDOiBzdHJpbmcgPSBgJHtjZWxsVmFsdWV9YC50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgY29uc3QgZmlsdGVyVmFsdWVMQzogc3RyaW5nID0gZmlsdGVyLnZhbHVlLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICBpZiAoaXNOdWxsT3JVbmRlZmluZWQoY29tcGFyYXRvcikgfHwgY29tcGFyYXRvciA9PT0gJ2VxdWFsc0lnbm9yZUNhc2UnKSB7XHJcbiAgICAgICAgICAgIGlmIChmaWx0ZXJWYWx1ZUxDICE9PSBjZWxsVmFsdWVMQykge1xyXG4gICAgICAgICAgICAgIGRhdGEuc3BsaWNlKGksIDEpLmZvckVhY2goaXRlbSA9PiB0aGlzLmZpbHRlcmVkT3V0Um93c1tgJHtpdGVtLmlkfWBdID0gaXRlbSk7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSBpZiAoY29tcGFyYXRvciA9PT0gJ2NvbnRhaW5zJykge1xyXG4gICAgICAgICAgICBpZiAoY2VsbFZhbHVlLmluZGV4T2YoZmlsdGVyLnZhbHVlKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICBkYXRhLnNwbGljZShpLCAxKS5mb3JFYWNoKGl0ZW0gPT4gdGhpcy5maWx0ZXJlZE91dFJvd3NbYCR7aXRlbS5pZH1gXSA9IGl0ZW0pO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGNvbXBhcmF0b3IgPT09ICdjb250YWluc0lnbm9yZUNhc2UnKSB7XHJcbiAgICAgICAgICAgIGlmIChjZWxsVmFsdWVMQy5pbmRleE9mKGZpbHRlclZhbHVlTEMpID09PSAtMSkge1xyXG4gICAgICAgICAgICAgIGRhdGEuc3BsaWNlKGksIDEpLmZvckVhY2goaXRlbSA9PiB0aGlzLmZpbHRlcmVkT3V0Um93c1tgJHtpdGVtLmlkfWBdID0gaXRlbSk7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSBpZiAoY29tcGFyYXRvciA9PT0gJ3N0YXJ0c1dpdGgnKSB7XHJcbiAgICAgICAgICAgIGlmICghY2VsbFZhbHVlLnN0YXJ0c1dpdGgoZmlsdGVyLnZhbHVlKSkge1xyXG4gICAgICAgICAgICAgIGRhdGEuc3BsaWNlKGksIDEpLmZvckVhY2goaXRlbSA9PiB0aGlzLmZpbHRlcmVkT3V0Um93c1tgJHtpdGVtLmlkfWBdID0gaXRlbSk7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSBpZiAoY29tcGFyYXRvciA9PT0gJ3N0YXJ0c1dpdGhJZ25vcmVDYXNlJykge1xyXG4gICAgICAgICAgICBpZiAoIWNlbGxWYWx1ZUxDLnN0YXJ0c1dpdGgoZmlsdGVyVmFsdWVMQykpIHtcclxuICAgICAgICAgICAgICBkYXRhLnNwbGljZShpLCAxKS5mb3JFYWNoKGl0ZW0gPT4gdGhpcy5maWx0ZXJlZE91dFJvd3NbYCR7aXRlbS5pZH1gXSA9IGl0ZW0pO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFwcGx5T3ZlcmFsbEZpbHRlcihkYXRhOiBNYXRTZWxlY3RUYWJsZVJvd1tdKTogdm9pZCB7XHJcbiAgICB0aGlzLmZpbHRlcmVkT3V0Um93cyA9IHt9O1xyXG4gICAgaWYgKGlzTnVsbE9yVW5kZWZpbmVkKHRoaXMub3ZlcmFsbEZpbHRlckNvbnRyb2wudmFsdWUpKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGNvbnN0IGZpbHRlclZhbHVlTEM6IHN0cmluZyA9IHRoaXMub3ZlcmFsbEZpbHRlckNvbnRyb2wudmFsdWUudG9Mb3dlckNhc2UoKTtcclxuICAgIGlmIChmaWx0ZXJWYWx1ZUxDLnRyaW0oKS5sZW5ndGggPT09IDApIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgZm9yIChsZXQgaSA9IGRhdGEubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgY29uc3Qgcm93OiBNYXRTZWxlY3RUYWJsZVJvdyA9IGRhdGFbaV07XHJcbiAgICAgIGxldCByb3dTaG91bGRCZUZpbHRlcmVkID0gdHJ1ZTtcclxuICAgICAgZm9yIChsZXQgaiA9IHRoaXMuZGF0YVNvdXJjZS5jb2x1bW5zLmxlbmd0aCAtIDE7IGogPj0gMDsgai0tKSB7XHJcbiAgICAgICAgY29uc3Qga2V5OiBzdHJpbmcgPSB0aGlzLmRhdGFTb3VyY2UuY29sdW1uc1tqXS5rZXk7XHJcbiAgICAgICAgY29uc3QgY2VsbFZhbHVlOiBhbnkgPSByb3dba2V5XTtcclxuICAgICAgICBpZiAoaXNOdWxsT3JVbmRlZmluZWQoY2VsbFZhbHVlKSkge1xyXG4gICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGNlbGxWYWx1ZUxDOiBzdHJpbmcgPSBgJHtjZWxsVmFsdWV9YC50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgIGlmIChjZWxsVmFsdWVMQy5pbmRleE9mKGZpbHRlclZhbHVlTEMpICE9PSAtMSkge1xyXG4gICAgICAgICAgcm93U2hvdWxkQmVGaWx0ZXJlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChyb3dTaG91bGRCZUZpbHRlcmVkKSB7XHJcbiAgICAgICAgZGF0YS5zcGxpY2UoaSwgMSkuZm9yRWFjaChpdGVtID0+IHRoaXMuZmlsdGVyZWRPdXRSb3dzW2Ake2l0ZW0uaWR9YF0gPSBpdGVtKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhcHBseVByb3h5VG9BcnJheShhcnJheTogYW55W10sIGNhbGxiYWNrOiAoKSA9PiB2b2lkKTogdm9pZCB7XHJcbiAgICBbJ3BvcCcsICdwdXNoJywgJ3JldmVyc2UnLCAnc2hpZnQnLCAndW5zaGlmdCcsICdzcGxpY2UnLCAnc29ydCddLmZvckVhY2goKG1ldGhvZE5hbWUpID0+IHtcclxuICAgICAgYXJyYXlbbWV0aG9kTmFtZV0gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgY29uc3QgcmVzID0gQXJyYXkucHJvdG90eXBlW21ldGhvZE5hbWVdLmFwcGx5KGFycmF5LCBhcmd1bWVudHMpOyAvLyBjYWxsIG5vcm1hbCBiZWhhdmlvdXJcclxuICAgICAgICBjYWxsYmFjay5hcHBseShhcnJheSwgYXJndW1lbnRzKTsgLy8gZmluYWxseSBjYWxsIHRoZSBjYWxsYmFjayBzdXBwbGllZFxyXG4gICAgICAgIHJldHVybiByZXM7XHJcbiAgICAgIH07XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcmVzZXRGaWx0ZXJzKCk6IHZvaWQge1xyXG4gICAgdGhpcy5vdmVyYWxsRmlsdGVyQ29udHJvbC5zZXRWYWx1ZSgnJyk7XHJcbiAgICBPYmplY3Qua2V5cyh0aGlzLmZpbHRlckNvbnRyb2xzLmNvbnRyb2xzKVxyXG4gICAgICAuZm9yRWFjaChrZXkgPT4gdGhpcy5maWx0ZXJDb250cm9scy5nZXQoa2V5KS5zZXRWYWx1ZSgnJykpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGFrZW4gZnJvbSB7QHNlZSBNYXRUYWJsZURhdGFTb3VyY2Ujc29ydGluZ0RhdGFBY2Nlc3Nvcn1cclxuICAgKlxyXG4gICAqIEBwYXJhbSBkYXRhXHJcbiAgICogQHBhcmFtIHNvcnRIZWFkZXJJZFxyXG4gICAqL1xyXG4gIHByaXZhdGUgc29ydGluZ0RhdGFBY2Nlc3NvcihkYXRhOiBNYXRTZWxlY3RUYWJsZVJvdywgYWN0aXZlOiBzdHJpbmcpOiBzdHJpbmcgfCBudW1iZXIgfCBEYXRlIHtcclxuXHJcbiAgICBjb25zdCB2YWx1ZSA9IChkYXRhIGFzIHsgW2tleTogc3RyaW5nXTogYW55IH0pW2FjdGl2ZV07XHJcblxyXG4gICAgaWYgKF9pc051bWJlclZhbHVlKHZhbHVlKSkge1xyXG4gICAgICBjb25zdCBudW1iZXJWYWx1ZSA9IE51bWJlcih2YWx1ZSk7XHJcblxyXG4gICAgICAvLyBOdW1iZXJzIGJleW9uZCBgTUFYX1NBRkVfSU5URUdFUmAgY2FuJ3QgYmUgY29tcGFyZWQgcmVsaWFibHkgc28gd2VcclxuICAgICAgLy8gbGVhdmUgdGhlbSBhcyBzdHJpbmdzLiBGb3IgbW9yZSBpbmZvOiBodHRwczovL2dvby5nbC95NXZiU2dcclxuICAgICAgcmV0dXJuIG51bWJlclZhbHVlIDwgTUFYX1NBRkVfSU5URUdFUiA/IG51bWJlclZhbHVlIDogdmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG4gIH1cclxuXHJcblxyXG4gIHByaXZhdGUgc29ydERhdGEoZGF0YTogTWF0U2VsZWN0VGFibGVSb3dbXSwgYWN0aXZlOiBzdHJpbmcsIGRpcmVjdGlvbjogU29ydERpcmVjdGlvbik6IE1hdFNlbGVjdFRhYmxlUm93W10ge1xyXG4gICAgaWYgKCFhY3RpdmUgfHwgZGlyZWN0aW9uID09PSAnJykge1xyXG4gICAgICByZXR1cm4gZGF0YTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZGF0YS5zb3J0KChhLCBiKSA9PiB7XHJcbiAgICAgIGxldCBhVmFsdWUgPSB0aGlzLnNvcnRpbmdEYXRhQWNjZXNzb3IoYSwgYWN0aXZlKTtcclxuICAgICAgbGV0IGJWYWx1ZSA9IHRoaXMuc29ydGluZ0RhdGFBY2Nlc3NvcihiLCBhY3RpdmUpO1xyXG5cclxuICAgICAgaWYgKGEuaWQgPT09IG51bGwpIHtcclxuICAgICAgICByZXR1cm4gLTE7XHJcbiAgICAgIH0gZWxzZSBpZiAoYi5pZCA9PT0gbnVsbCkge1xyXG4gICAgICAgIHJldHVybiAxO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBCb3RoIG51bGwvdW5kZWZpbmVkL2VxdWFsIHZhbHVlIGNoZWNrXHJcbiAgICAgIGlmIChhVmFsdWUgPT09IGJWYWx1ZSkge1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBPbmUgbnVsbCB2YWx1ZSBjaGVja1xyXG4gICAgICBpZiAoaXNOdWxsT3JVbmRlZmluZWQoYVZhbHVlKSAmJiAhaXNOdWxsT3JVbmRlZmluZWQoYlZhbHVlKSkge1xyXG4gICAgICAgIHJldHVybiAtMTtcclxuICAgICAgfSBlbHNlIGlmICghaXNOdWxsT3JVbmRlZmluZWQoYVZhbHVlKSAmJiBpc051bGxPclVuZGVmaW5lZChiVmFsdWUpKSB7XHJcbiAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChhVmFsdWUgaW5zdGFuY2VvZiBEYXRlKSB7XHJcbiAgICAgICAgYVZhbHVlID0gYVZhbHVlLmdldFRpbWUoKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoYlZhbHVlIGluc3RhbmNlb2YgRGF0ZSkge1xyXG4gICAgICAgIGJWYWx1ZSA9IGJWYWx1ZS5nZXRUaW1lKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFVzZXIgbG9jYWxlQ29tcGFyZSBmb3Igc3RyaW5nc1xyXG4gICAgICBpZiAoaXNTdHJpbmcoYVZhbHVlKSAmJiBpc1N0cmluZyhiVmFsdWUpKSB7XHJcbiAgICAgICAgcmV0dXJuICg8c3RyaW5nPmFWYWx1ZSkubG9jYWxlQ29tcGFyZSg8c3RyaW5nPmJWYWx1ZSkgKiAoZGlyZWN0aW9uID09PSAnYXNjJyA/IDEgOiAtMSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFRyeSB0byBjb252ZXJ0IHRvIGEgTnVtYmVyIHR5cGVcclxuICAgICAgYVZhbHVlID0gaXNOYU4oPG51bWJlcj5hVmFsdWUpID8gYCR7YVZhbHVlfWAgOiArYVZhbHVlO1xyXG4gICAgICBiVmFsdWUgPSBpc05hTig8bnVtYmVyPmJWYWx1ZSkgPyBgJHtiVmFsdWV9YCA6ICtiVmFsdWU7XHJcblxyXG4gICAgICAvLyBpZiBvbmUgaXMgbnVtYmVyIGFuZCBvdGhlciBpcyBTdHJpbmdcclxuICAgICAgaWYgKGlzU3RyaW5nKGFWYWx1ZSkgJiYgaXNOdW1iZXIoYlZhbHVlKSkge1xyXG4gICAgICAgIHJldHVybiAoMSkgKiAoZGlyZWN0aW9uID09PSAnYXNjJyA/IDEgOiAtMSk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGlzTnVtYmVyKGFWYWx1ZSkgJiYgaXNTdHJpbmcoYlZhbHVlKSkge1xyXG4gICAgICAgIHJldHVybiAoLTEpICogKGRpcmVjdGlvbiA9PT0gJ2FzYycgPyAxIDogLTEpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBDb21wYXJlIGFzIE51bWJlcnMgb3RoZXJ3aXNlXHJcbiAgICAgIHJldHVybiAoYVZhbHVlID4gYlZhbHVlID8gMSA6IC0xKSAqIChkaXJlY3Rpb24gPT09ICdhc2MnID8gMSA6IC0xKTtcclxuICAgIH0pO1xyXG5cdFxyXG4gIH1cclxuXHJcbiAgYWRkTnVsbFJvdygpOiBib29sZWFuIHtcclxuICAgIHJldHVybiAhdGhpcy5tdWx0aXBsZSAmJiAhaXNOdWxsT3JVbmRlZmluZWQodGhpcy5sYWJlbEZvck51bGxWYWx1ZSk7XHJcbiAgfVxyXG4gIFxyXG4gIHByaXZhdGUgY2hlY2tBbmRSZXNldFNlbGVjdGlvbigpIHtcdFxyXG4gICAgaWYgKHRoaXMubWF0U2VsZWN0LnZhbHVlICYmIGlzQXJyYXkodGhpcy5tYXRTZWxlY3QudmFsdWUpICYmIHRoaXMubWF0U2VsZWN0LnZhbHVlLmxlbmd0aCA8IDFcdFxyXG4gICAgICAmJiAhaXNOdWxsT3JVbmRlZmluZWQodGhpcy5yZXNldE9wdGlvbkFjdGlvbikpIHtcdFxyXG4gICAgICB0aGlzLnJlc2V0T3B0aW9uQWN0aW9uKCk7XHRcclxuICAgIH1cdFxyXG4gIH1cclxufVxyXG4iXX0=