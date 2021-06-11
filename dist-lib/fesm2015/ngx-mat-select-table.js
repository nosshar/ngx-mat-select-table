import { __decorate, __metadata } from 'tslib';
import { EventEmitter, ChangeDetectorRef, Input, Output, ViewChild, ElementRef, ViewChildren, QueryList, Component, ChangeDetectionStrategy, forwardRef, HostListener, Directive, NgModule } from '@angular/core';
import { FormGroup, FormControl, NG_VALUE_ACCESSOR, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject, merge } from 'rxjs';
import { MatSelect, MatSort, MatTable, MatOption, MatSelectModule, MatSortModule, MatOptionModule, MatCommonModule, MatTableModule, MatInputModule, MatIconModule } from '@angular/material';
import { isNullOrUndefined, isArray, isString, isNumber } from 'util';
import { _isNumberValue } from '@angular/cdk/coercion';
import { takeUntil, debounceTime, take } from 'rxjs/operators';
import { MatSelectSearchComponent, NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { CommonModule } from '@angular/common';

var MatSelectTableComponent_1;
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
__decorate([
    Input(),
    __metadata("design:type", Object)
], MatSelectTableComponent.prototype, "dataSource", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], MatSelectTableComponent.prototype, "multiple", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], MatSelectTableComponent.prototype, "overallSearchEnabled", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], MatSelectTableComponent.prototype, "overallSearchVisible", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], MatSelectTableComponent.prototype, "resetSortOnOpen", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], MatSelectTableComponent.prototype, "resetFiltersOnOpen", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], MatSelectTableComponent.prototype, "customTriggerLabelFn", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], MatSelectTableComponent.prototype, "triggerLabelSort", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], MatSelectTableComponent.prototype, "customTriggerLabelTemplate", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], MatSelectTableComponent.prototype, "labelForNullValue", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], MatSelectTableComponent.prototype, "matSelectConfigurator", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], MatSelectTableComponent.prototype, "matSelectSearchConfigurator", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], MatSelectTableComponent.prototype, "defaultSort", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], MatSelectTableComponent.prototype, "resetOptionAction", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], MatSelectTableComponent.prototype, "close", void 0);
__decorate([
    ViewChild('componentSelect'),
    __metadata("design:type", MatSelect)
], MatSelectTableComponent.prototype, "matSelect", void 0);
__decorate([
    ViewChild(MatSelectSearchComponent),
    __metadata("design:type", MatSelectSearchComponent)
], MatSelectTableComponent.prototype, "matSelectSearch", void 0);
__decorate([
    ViewChild(MatSort),
    __metadata("design:type", MatSort)
], MatSelectTableComponent.prototype, "sort", void 0);
__decorate([
    ViewChild(MatTable),
    __metadata("design:type", MatTable)
], MatSelectTableComponent.prototype, "table", void 0);
__decorate([
    ViewChild('table', { read: ElementRef }),
    __metadata("design:type", ElementRef)
], MatSelectTableComponent.prototype, "tableRef", void 0);
__decorate([
    ViewChildren(MatOption),
    __metadata("design:type", QueryList)
], MatSelectTableComponent.prototype, "matOptions", void 0);
MatSelectTableComponent = MatSelectTableComponent_1 = __decorate([
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
    __metadata("design:paramtypes", [ChangeDetectorRef])
], MatSelectTableComponent);

let MatSelectTableInputRestrictionDirective = class MatSelectTableInputRestrictionDirective {
    onKeyPress(event) {
        if (this.appInputRestriction === 'integer') {
            this.integerOnly(event);
        }
    }
    integerOnly(event) {
        const e = event;
        if (['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].indexOf(e.key) === -1) {
            e.preventDefault();
        }
    }
    onPaste(event) {
        let regex;
        if (this.appInputRestriction === 'integer') {
            regex = /^[0-9]*$/;
        }
        const e = event;
        const pasteData = e.clipboardData.getData('text/plain');
        if (!pasteData.match(regex)) {
            e.preventDefault();
        }
    }
};
__decorate([
    Input(),
    __metadata("design:type", String)
], MatSelectTableInputRestrictionDirective.prototype, "appInputRestriction", void 0);
__decorate([
    HostListener('keypress', ['$event']),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MatSelectTableInputRestrictionDirective.prototype, "onKeyPress", null);
__decorate([
    HostListener('paste', ['$event']),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MatSelectTableInputRestrictionDirective.prototype, "onPaste", null);
MatSelectTableInputRestrictionDirective = __decorate([
    Directive({
        selector: '[appInputRestriction]'
    })
], MatSelectTableInputRestrictionDirective);

let NgxMatSelectTableModule = class NgxMatSelectTableModule {
};
NgxMatSelectTableModule = __decorate([
    NgModule({
        declarations: [
            MatSelectTableComponent,
            MatSelectTableInputRestrictionDirective
        ],
        imports: [
            CommonModule,
            FormsModule,
            ReactiveFormsModule,
            MatSelectModule,
            MatSortModule,
            MatOptionModule,
            MatCommonModule,
            MatTableModule,
            MatInputModule,
            MatIconModule,
            NgxMatSelectSearchModule
        ],
        providers: [],
        bootstrap: [MatSelectTableComponent],
        exports: [MatSelectTableComponent]
    })
], NgxMatSelectTableModule);

/**
 * Generated bundle index. Do not edit.
 */

export { MatSelectTableComponent, NgxMatSelectTableModule, MatSelectTableInputRestrictionDirective as ɵa };
//# sourceMappingURL=ngx-mat-select-table.js.map
