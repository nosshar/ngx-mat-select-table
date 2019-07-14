/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, forwardRef, Input, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { merge, Subject } from 'rxjs';
import { MatOption, MatSelect, MatSort, MatTable } from '@angular/material';
import { isArray, isNullOrUndefined, isNumber, isString } from 'util';
import { _isNumberValue } from '@angular/cdk/coercion';
import { debounceTime, take, takeUntil } from 'rxjs/operators';
import { MatSelectSearchComponent } from 'ngx-mat-select-search';
/** @type {?} */
const MAX_SAFE_INTEGER = 9007199254740991;
export class MatSelectTableComponent {
    /**
     * @param {?} cd
     */
    constructor(cd) {
        this.cd = cd;
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
        /**
         * Subject that emits when the component has been destroyed.
         */
        this._onDestroy = new Subject();
        this._onOptionsChange = new Subject();
        this.tableColumnsMap = new Map();
        this.filterControls = new FormGroup({});
        this.overallFilterControl = new FormControl('');
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        this.multiple = this.multiple || false;
        this.matSelect.openedChange
            .pipe(takeUntil(this._onDestroy))
            .subscribe((/**
         * @param {?} opened
         * @return {?}
         */
        opened => {
            if (this.resetFiltersOnOpen !== false || !this.matOptions.length) {
                this.resetFilters();
            }
            this.overallSearchVisibleState = this.overallSearchVisible;
            if (this.resetSortOnOpen !== false) {
                this.sort.sort({ id: '', start: 'asc', disableClear: false });
            }
            if (!opened) {
                return;
            }
            if (this.overallSearchEnabled) {
                this.proxyMatSelectSearchConfiguration(this.matSelectSearchConfigurator);
            }
            // ToDo: get rid of this workaround (updates header row [otherwise sort mechanism produces glitches])
            ((/** @type {?} */ (this.table)))._headerRowDefChanged = true;
            // Disable sort buttons to prevent sorting change on SPACE key pressed in filter field
            setTimeout((/**
             * @return {?}
             */
            () => [].forEach.call(this.tableRef.nativeElement.querySelectorAll('button.mat-sort-header-button'), (/**
             * @param {?} e
             * @return {?}
             */
            (e) => e.disabled = true))));
            // Patch the height of the panel to include the height of the header and footer
            /** @type {?} */
            const panelElement = this.matSelect.panel.nativeElement;
            /** @type {?} */
            const panelHeight = panelElement.getBoundingClientRect().height;
            /** @type {?} */
            let tableAdditionalHeight = 0;
            this.table
                ._getRenderedRows(this.table._headerRowOutlet)
                .concat(this.table._getRenderedRows(this.table._footerRowOutlet))
                .forEach((/**
             * @param {?} row
             * @return {?}
             */
            row => tableAdditionalHeight += row.getBoundingClientRect().height));
            if (!isNaN(panelHeight)) {
                panelElement.style.maxHeight = `${panelHeight + tableAdditionalHeight}px`;
            }
            if (!this.matSelectSearchConfigurator.disableScrollToActiveOnOptionsChanged
                && !isNullOrUndefined(this.matSelect._keyManager) && this.completeRowList.length > 0) {
                setTimeout((/**
                 * @return {?}
                 */
                () => {
                    /** @type {?} */
                    const firstValue = `${this.completeRowList[0].id}`;
                    for (let i = 0; i < this.tableDataSource.length; i++) {
                        if (`${this.tableDataSource[i].id}` === firstValue) {
                            this.matSelect._keyManager.change.pipe(takeUntil(this._onDestroy), take(1)).subscribe((/**
                             * @return {?}
                             */
                            () => {
                                this.matSelect._keyManager.setActiveItem(i);
                                this.cd.detectChanges();
                            }));
                            break;
                        }
                    }
                }));
            }
        }));
    }
    /**
     * @return {?}
     */
    ngAfterViewInit() {
        merge(...[
            this.sort.sortChange,
            this.filterControls.valueChanges,
            this.overallFilterControl.valueChanges
        ])
            .pipe(takeUntil(this._onDestroy), debounceTime(100))
            .subscribe((/**
         * @return {?}
         */
        () => {
            /** @type {?} */
            const dataClone = [...this.dataSource.data];
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
            this.cd.detectChanges();
        }));
        // Manually sort data for this.matSelect.options (QueryList<MatOption>) and notify matSelect.options of changes
        // It's important to keep this.matSelect.options order synchronized with data in the table
        //     because this.matSelect.options (QueryList<MatOption>) doesn't update it's state after table data is changed
        this.matOptions.changes.subscribe((/**
         * @return {?}
         */
        () => {
            /** @type {?} */
            const options = {};
            this.matOptions.toArray()
                .filter((/**
             * @param {?} option
             * @return {?}
             */
            option => !isNullOrUndefined(option)))
                .forEach((/**
             * @param {?} option
             * @return {?}
             */
            option => options[`${option.value}`] = option));
            this.matSelect.options.reset(this.tableDataSource
                .filter((/**
             * @param {?} row
             * @return {?}
             */
            row => !isNullOrUndefined(options[`${row.id}`])))
                .map((/**
             * @param {?} row
             * @return {?}
             */
            row => options[`${row.id}`])));
            this.matSelect.options.notifyOnChanges();
        }));
        if (!isNullOrUndefined(this.matSelect._keyManager)) {
            // Subscribe on KeyManager changes to highlight the table rows accordingly
            this.matSelect._keyManager.change
                .pipe(takeUntil(this._onDestroy))
                .subscribe((/**
             * @param {?} activeRow
             * @return {?}
             */
            activeRow => this.tableActiveRow = activeRow));
        }
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        this._onDestroy.next();
        this._onDestroy.complete();
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    registerOnChange(fn) {
        /** @type {?} */
        const proxyFn = (/**
         * @param {?} value
         * @return {?}
         */
        (value) => {
            // ToDo: refactor - comparison mechanism isn't optimized. filteredOutRows is a map but completeValueList is an array
            if (this.multiple === true) {
                for (let i = this.completeValueList.length - 1; i >= 0; i--) {
                    if (this.filteredOutRows[`${this.completeValueList[i]}`] === undefined && value.indexOf(this.completeValueList[i]) === -1) {
                        this.completeValueList.splice(i, 1);
                    }
                }
                value
                    .filter((/**
                 * @param {?} choice
                 * @return {?}
                 */
                choice => this.completeValueList.indexOf(choice) === -1))
                    .forEach((/**
                 * @param {?} choice
                 * @return {?}
                 */
                choice => this.completeValueList.push(choice)));
                this.matSelect.value = this.completeValueList;
                fn(this.completeValueList);
                this.completeRowList.splice(0);
                this.dataSource.data
                    .filter((/**
                 * @param {?} row
                 * @return {?}
                 */
                row => this.completeValueList.indexOf(row.id) !== -1))
                    .forEach((/**
                 * @param {?} row
                 * @return {?}
                 */
                row => this.completeRowList.push(row)));
            }
            else {
                fn(value);
                this.completeRowList.splice(0);
                this.dataSource.data
                    .filter((/**
                 * @param {?} row
                 * @return {?}
                 */
                row => row.id === value))
                    .forEach((/**
                 * @param {?} row
                 * @return {?}
                 */
                row => this.completeRowList.push(row)));
            }
        });
        this.matSelect.registerOnChange(proxyFn);
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    registerOnTouched(fn) {
        this.matSelect.registerOnTouched(fn);
    }
    /**
     * @param {?} isDisabled
     * @return {?}
     */
    setDisabledState(isDisabled) {
        this.matSelect.setDisabledState(isDisabled);
    }
    /**
     * @param {?} value
     * @return {?}
     */
    writeValue(value) {
        this.updateCompleteRowList(value);
        this.matSelect.writeValue(value);
        if (this.matSelect.value !== value) {
            this.matSelect.value = value;
        }
    }
    /**
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        if (!isNullOrUndefined(changes.resetFiltersOnOpen) && changes.resetFiltersOnOpen.currentValue !== false) {
            this.resetFilters();
        }
        if (!isNullOrUndefined(changes.dataSource)) {
            this.updateCompleteRowList(this.completeRowList.map((/**
             * @param {?} row
             * @return {?}
             */
            row => row.id)));
        }
        // Proxy @Input bindings to MatSelect
        if (!isNullOrUndefined(changes.matSelectConfigurator)) {
            /** @type {?} */
            const configuration = changes.matSelectConfigurator.currentValue;
            Object.keys(configuration)
                .filter((/**
             * @param {?} key
             * @return {?}
             */
            key => !['multiple', 'panelClass'].includes(key) && !this.controlValueAccessorKeys.includes(key)))
                .forEach((/**
             * @param {?} key
             * @return {?}
             */
            key => this.matSelect[key] = configuration[key]));
            /** @type {?} */
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
            this.tableColumns = ['_selection', ...changes.dataSource.currentValue.columns.map((/**
                 * @param {?} column
                 * @return {?}
                 */
                column => column.key))];
            this.tableColumnsMap.clear();
            changes.dataSource.currentValue.columns.forEach((/**
             * @param {?} column
             * @return {?}
             */
            column => this.tableColumnsMap.set(column.key, column)));
            this.applyProxyToArray(changes.dataSource.currentValue.data, (/**
             * @return {?}
             */
            () => {
                this._onOptionsChange.next();
            }));
            this._onOptionsChange.next();
        }
    }
    /**
     * @param {?} event
     * @return {?}
     */
    emulateMatOptionClick(event) {
        if (event.composedPath()
            .filter((/**
         * @param {?} et
         * @return {?}
         */
        et => et instanceof HTMLElement))
            .some((/**
         * @param {?} et
         * @return {?}
         */
        (et) => et.tagName.toLowerCase() === 'mat-option'))) {
            return;
        }
        if (!(event.target instanceof HTMLElement)) {
            return;
        }
        /** @type {?} */
        let rowElement = event.target;
        while (rowElement != null && rowElement instanceof HTMLElement && rowElement.tagName.toLowerCase() !== 'tr') {
            rowElement = rowElement.parentElement;
        }
        if (rowElement === null) {
            return;
        }
        /** @type {?} */
        const childOption = rowElement.querySelector('mat-option');
        if (!childOption) {
            return;
        }
        childOption.click();
    }
    /**
     * @param {?} key
     * @return {?}
     */
    filterFormControl(key) {
        if (!this.filterControls.contains(key)) {
            this.filterControls.registerControl(key, new FormControl(''));
        }
        return (/** @type {?} */ (this.filterControls.get(key)));
    }
    /**
     * @param {?} value
     * @return {?}
     */
    simpleTriggerLabelFn(value) {
        return value.map((/**
         * @param {?} row
         * @return {?}
         */
        row => {
            if (isNullOrUndefined(row)) {
                return '';
            }
            if (isNullOrUndefined(this.customTriggerLabelTemplate)
                || typeof this.customTriggerLabelTemplate !== 'string'
                || this.customTriggerLabelTemplate.trim().length === 0) {
                return `${row.id}`;
            }
            /** @type {?} */
            let atLeastPartialSubstitution = false;
            /** @type {?} */
            const substitution = this.customTriggerLabelTemplate.replace(/[$]{1}[{]{1}([^}]+)[}]{1}?/g, (/**
             * @param {?} _
             * @param {?} key
             * @return {?}
             */
            (_, key) => !isNullOrUndefined(row[key]) && (atLeastPartialSubstitution = true) ? row[key] : ''));
            if (atLeastPartialSubstitution === false) {
                return `${row.id}`;
            }
            return substitution.trim();
        })).join(', ');
    }
    /**
     * @return {?}
     */
    toggleOverallSearch() {
        this.overallSearchVisibleState = !this.overallSearchVisibleState;
        this.resetFilters();
        if (this.overallSearchVisibleState) {
            setTimeout((/**
             * @return {?}
             */
            () => this.matSelectSearch._focus()));
        }
    }
    /**
     * @private
     * @param {?} value
     * @return {?}
     */
    updateCompleteRowList(value) {
        this.completeRowList.splice(0);
        if (!isNullOrUndefined(value)) {
            /** @type {?} */
            const valueArray = !isArray(value) ? [value] : value;
            valueArray.forEach((/**
             * @param {?} item
             * @return {?}
             */
            item => {
                /** @type {?} */
                const rowFound = this.dataSource.data.find((/**
                 * @param {?} row
                 * @return {?}
                 */
                row => row.id === item));
                if (rowFound === null) {
                    return;
                }
                this.completeRowList.push(rowFound);
            }));
        }
    }
    /**
     * @private
     * @param {?} configuration
     * @return {?}
     */
    proxyMatSelectSearchConfiguration(configuration) {
        if (isNullOrUndefined(this.matSelectSearch)) {
            return;
        }
        // Proxy @Input bindings to NgxMatSelectSearch
        Object.keys(configuration)
            .filter((/**
         * @param {?} key
         * @return {?}
         */
        key => !['clearSearchInput'].includes(key) && !this.controlValueAccessorKeys.includes(key)))
            .forEach((/**
         * @param {?} key
         * @return {?}
         */
        key => this.matSelectSearch[key] = configuration[key]));
    }
    /**
     * @private
     * @param {?} data
     * @return {?}
     */
    applyColumnLevelFilters(data) {
        this.filteredOutRows = {};
        /** @type {?} */
        const filters = {};
        Object.keys(this.filterControls.controls)
            .filter((/**
         * @param {?} key
         * @return {?}
         */
        key => this.tableColumnsMap.has(key)
            && !isNullOrUndefined(this.tableColumnsMap.get(key).filter)
            // If filter is enabled
            && this.tableColumnsMap.get(key).filter.enabled !== false))
            .filter((/**
         * @param {?} key
         * @return {?}
         */
        key => {
            /** @type {?} */
            const value = this.filterControls.get(key).value;
            return !isNullOrUndefined(value)
                // If an array - check it's not empty
                && ((isArray(value) && value.length > 0)
                    // If string - check that not blank
                    || (typeof value === 'string' && value.trim().length > 0)
                    // If number - check that toString() is not blank
                    || (typeof value === 'number' && `${value}`.trim().length > 0));
        }))
            .forEach((/**
         * @param {?} key
         * @return {?}
         */
        key => filters[key] = {
            filter: this.tableColumnsMap.get(key).filter,
            value: this.filterControls.get(key).value
        }));
        /** @type {?} */
        const filterKeys = Object.keys(filters);
        for (let i = data.length - 1; i >= 0; i--) {
            for (let k = 0; k < filterKeys.length; k++) {
                /** @type {?} */
                const filterKey = filterKeys[k];
                /** @type {?} */
                const row = data[i];
                /** @type {?} */
                const cellValue = row[filterKey];
                if (isNullOrUndefined(cellValue)) {
                    continue;
                }
                /** @type {?} */
                const filter = filters[filterKey];
                /** @type {?} */
                const comparator = filter.filter.comparator;
                if (typeof filter.filter.comparatorFn === 'function') {
                    if (!filter.filter.comparatorFn.call(null, cellValue, filter.value, row)) {
                        data.splice(i, 1).forEach((/**
                         * @param {?} item
                         * @return {?}
                         */
                        item => this.filteredOutRows[`${item.id}`] = item));
                        break;
                    }
                }
                else if (isNullOrUndefined(comparator) || comparator === 'equals') {
                    if (filter.value !== cellValue) {
                        data.splice(i, 1).forEach((/**
                         * @param {?} item
                         * @return {?}
                         */
                        item => this.filteredOutRows[`${item.id}`] = item));
                        break;
                    }
                }
                else if (typeof cellValue === 'string' && typeof filter.value === 'string') {
                    /** @type {?} */
                    const cellValueLC = `${cellValue}`.toLowerCase();
                    /** @type {?} */
                    const filterValueLC = filter.value.toLowerCase();
                    if (isNullOrUndefined(comparator) || comparator === 'equalsIgnoreCase') {
                        if (filterValueLC !== cellValueLC) {
                            data.splice(i, 1).forEach((/**
                             * @param {?} item
                             * @return {?}
                             */
                            item => this.filteredOutRows[`${item.id}`] = item));
                            break;
                        }
                    }
                    else if (comparator === 'contains') {
                        if (cellValue.indexOf(filter.value) === -1) {
                            data.splice(i, 1).forEach((/**
                             * @param {?} item
                             * @return {?}
                             */
                            item => this.filteredOutRows[`${item.id}`] = item));
                            break;
                        }
                    }
                    else if (comparator === 'containsIgnoreCase') {
                        if (cellValueLC.indexOf(filterValueLC) === -1) {
                            data.splice(i, 1).forEach((/**
                             * @param {?} item
                             * @return {?}
                             */
                            item => this.filteredOutRows[`${item.id}`] = item));
                            break;
                        }
                    }
                    else if (comparator === 'startsWith') {
                        if (!cellValue.startsWith(filter.value)) {
                            data.splice(i, 1).forEach((/**
                             * @param {?} item
                             * @return {?}
                             */
                            item => this.filteredOutRows[`${item.id}`] = item));
                            break;
                        }
                    }
                    else if (comparator === 'startsWithIgnoreCase') {
                        if (!cellValueLC.startsWith(filterValueLC)) {
                            data.splice(i, 1).forEach((/**
                             * @param {?} item
                             * @return {?}
                             */
                            item => this.filteredOutRows[`${item.id}`] = item));
                            break;
                        }
                    }
                }
            }
        }
    }
    /**
     * @private
     * @param {?} data
     * @return {?}
     */
    applyOverallFilter(data) {
        this.filteredOutRows = {};
        if (isNullOrUndefined(this.overallFilterControl.value)) {
            return;
        }
        /** @type {?} */
        const filterValueLC = this.overallFilterControl.value.toLowerCase();
        if (filterValueLC.trim().length === 0) {
            return;
        }
        for (let i = data.length - 1; i >= 0; i--) {
            /** @type {?} */
            const row = data[i];
            /** @type {?} */
            let rowShouldBeFiltered = true;
            for (let j = this.dataSource.columns.length - 1; j >= 0; j--) {
                /** @type {?} */
                const key = this.dataSource.columns[j].key;
                /** @type {?} */
                const cellValue = row[key];
                if (isNullOrUndefined(cellValue)) {
                    continue;
                }
                /** @type {?} */
                const cellValueLC = `${cellValue}`.toLowerCase();
                if (cellValueLC.indexOf(filterValueLC) !== -1) {
                    rowShouldBeFiltered = false;
                    break;
                }
            }
            if (rowShouldBeFiltered) {
                data.splice(i, 1).forEach((/**
                 * @param {?} item
                 * @return {?}
                 */
                item => this.filteredOutRows[`${item.id}`] = item));
            }
        }
    }
    /**
     * @private
     * @param {?} array
     * @param {?} callback
     * @return {?}
     */
    applyProxyToArray(array, callback) {
        ['pop', 'push', 'reverse', 'shift', 'unshift', 'splice', 'sort'].forEach((/**
         * @param {?} methodName
         * @return {?}
         */
        (methodName) => {
            array[methodName] = (/**
             * @return {?}
             */
            function () {
                /** @type {?} */
                const res = Array.prototype[methodName].apply(array, arguments);
                callback.apply(array, arguments); // finally call the callback supplied
                return res;
            });
        }));
    }
    /**
     * @private
     * @return {?}
     */
    resetFilters() {
        this.overallFilterControl.setValue('');
        Object.keys(this.filterControls.controls)
            .forEach((/**
         * @param {?} key
         * @return {?}
         */
        key => this.filterControls.get(key).setValue('')));
    }
    /**
     * Taken from {\@see MatTableDataSource#sortingDataAccessor}
     *
     * @private
     * @param {?} data
     * @param {?} active
     * @return {?}
     */
    sortingDataAccessor(data, active) {
        /** @type {?} */
        const value = ((/** @type {?} */ (data)))[active];
        if (_isNumberValue(value)) {
            /** @type {?} */
            const numberValue = Number(value);
            // Numbers beyond `MAX_SAFE_INTEGER` can't be compared reliably so we
            // leave them as strings. For more info: https://goo.gl/y5vbSg
            return numberValue < MAX_SAFE_INTEGER ? numberValue : value;
        }
        return value;
    }
    /**
     * @private
     * @param {?} data
     * @param {?} active
     * @param {?} direction
     * @return {?}
     */
    sortData(data, active, direction) {
        if (!active || direction === '') {
            return data;
        }
        return data.sort((/**
         * @param {?} a
         * @param {?} b
         * @return {?}
         */
        (a, b) => {
            /** @type {?} */
            let aValue = this.sortingDataAccessor(a, active);
            /** @type {?} */
            let bValue = this.sortingDataAccessor(b, active);
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
                return ((/** @type {?} */ (aValue))).localeCompare((/** @type {?} */ (bValue))) * (this.sort.direction === 'asc' ? 1 : -1);
            }
            // Try to convert to a Number type
            aValue = isNaN((/** @type {?} */ (aValue))) ? `${aValue}` : +aValue;
            bValue = isNaN((/** @type {?} */ (bValue))) ? `${bValue}` : +bValue;
            // if one is number and other is String
            if (isString(aValue) && isNumber(bValue)) {
                return (1) * (this.sort.direction === 'asc' ? 1 : -1);
            }
            if (isNumber(aValue) && isString(bValue)) {
                return (-1) * (this.sort.direction === 'asc' ? 1 : -1);
            }
            // Compare as Numbers otherwise
            return (aValue > bValue ? 1 : -1) * (this.sort.direction === 'asc' ? 1 : -1);
        }));
    }
}
MatSelectTableComponent.decorators = [
    { type: Component, args: [{
                selector: 'ngx-mat-select-table',
                template: "<mat-form-field>\r\n  <mat-select #componentSelect\r\n              [multiple]=\"multiple\"\r\n              disableRipple>\r\n\r\n    <mat-select-trigger>\r\n      <ng-container *ngIf=\"!customTriggerLabelFn\">{{simpleTriggerLabelFn(completeRowList)}}</ng-container>\r\n      <ng-container *ngIf=\"customTriggerLabelFn\">{{customTriggerLabelFn(completeRowList)}}</ng-container>\r\n    </mat-select-trigger>\r\n\r\n    <ngx-mat-select-search *ngIf=\"overallSearchEnabled\"\r\n                           [formControl]=\"overallFilterControl\"\r\n                           [clearSearchInput]=\"resetFiltersOnOpen\"\r\n                           [ngClass]=\"{hidden: overallSearchVisibleState !== true}\">\r\n      <mat-icon *ngIf=\"matSelectSearchConfigurator?.clearIcon\"\r\n                ngxMatSelectSearchClear\r\n                color=\"primary\">{{matSelectSearchConfigurator.clearIcon}}</mat-icon>\r\n    </ngx-mat-select-search>\r\n    <mat-icon *ngIf=\"overallSearchEnabled\"\r\n              (click)=\"toggleOverallSearch()\"\r\n              class=\"overall-search-toggle\"\r\n              color=\"primary\">{{overallSearchVisibleState ? 'arrow_back' : 'search'}}</mat-icon>\r\n\r\n    <table #table\r\n           mat-table\r\n           matSort\r\n           [dataSource]=\"tableDataSource\">\r\n\r\n      <ng-container *ngFor=\"let columnKey of tableColumns\"\r\n                    [matColumnDef]=\"columnKey\"\r\n                    [ngSwitch]=\"columnKey\">\r\n\r\n        <ng-container *ngSwitchCase=\"'_selection'\">\r\n          <th mat-header-cell *matHeaderCellDef [ngClass]=\"{selection: true, hidden: !multiple}\"></th>\r\n          <td mat-cell *matCellDef=\"let row\" [ngClass]=\"{selection: true, hidden: !multiple}\">\r\n            <mat-option [value]=\"row.id\"></mat-option>\r\n          </td>\r\n        </ng-container>\r\n\r\n        <ng-container *ngSwitchDefault>\r\n          <th mat-header-cell\r\n              mat-sort-header\r\n              [disabled]=\"!tableColumnsMap.get(columnKey).sortable\"\r\n              *matHeaderCellDef>\r\n            <!-- Header cell -->\r\n            <ng-container [ngSwitch]=\"tableColumnsMap.get(columnKey).filter?.type\">\r\n              <ng-container *ngSwitchCase=\"'string'\"\r\n                            [ngTemplateOutlet]=\"filterTypeString\"\r\n                            [ngTemplateOutletContext]=\"{column: tableColumnsMap.get(columnKey)}\"></ng-container>\r\n\r\n              <div *ngSwitchDefault>{{tableColumnsMap.get(columnKey).name}}</div>\r\n            </ng-container>\r\n          </th>\r\n          <td mat-cell *matCellDef=\"let row\">{{row[columnKey]}}</td>\r\n        </ng-container>\r\n\r\n      </ng-container>\r\n\r\n      <tr mat-header-row *matHeaderRowDef=\"tableColumns; sticky: true\"></tr>\r\n      <tr mat-row *matRowDef=\"let row; columns: tableColumns; let i = index\"\r\n          (click)=\"emulateMatOptionClick($event)\"\r\n          [ngClass]=\"{active: i === tableActiveRow}\"></tr>\r\n    </table>\r\n\r\n  </mat-select>\r\n</mat-form-field>\r\n\r\n<ng-template #filterTypeString\r\n             let-column='column'>\r\n  <mat-form-field\r\n    (click)=\"$event.stopPropagation()\"\r\n    class=\"filter\">\r\n    <input matInput\r\n           [formControl]=\"filterFormControl(column.key)\"\r\n           (keydown)=\"$event.stopPropagation()\"\r\n           (keyup)=\"$event.stopPropagation()\"\r\n           (keypress)=\"$event.stopPropagation()\"\r\n           [placeholder]=\"column.name\"/>\r\n  </mat-form-field>\r\n</ng-template>\r\n",
                exportAs: 'ngx-mat-select-table',
                changeDetection: ChangeDetectionStrategy.OnPush,
                providers: [
                    {
                        provide: NG_VALUE_ACCESSOR,
                        useExisting: forwardRef((/**
                         * @return {?}
                         */
                        () => MatSelectTableComponent)),
                        multi: true
                    }
                ],
                styles: [":host{display:block}:host mat-form-field{width:100%}::ng-deep .mat-select-panel.mat-select-search-table-panel{overflow-x:auto!important}::ng-deep .mat-select-panel.mat-select-search-table-panel .overall-search-toggle{z-index:102;position:absolute;left:13px;top:17px;cursor:pointer}::ng-deep .mat-select-panel.mat-select-search-table-panel ngx-mat-select-search{position:absolute;z-index:101}::ng-deep .mat-select-panel.mat-select-search-table-panel ngx-mat-select-search.hidden{display:none}::ng-deep .mat-select-panel.mat-select-search-table-panel ngx-mat-select-search .mat-select-search-inner{height:56px}::ng-deep .mat-select-panel.mat-select-search-table-panel ngx-mat-select-search .mat-select-search-inner .mat-select-search-input{margin-left:26px;width:calc(100% - 26px)}::ng-deep .mat-select-panel.mat-select-search-table-panel table{width:100%}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr{cursor:pointer;height:48px;max-height:48px}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr mat-option{height:48px;max-height:48px}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr.active{background:rgba(0,0,0,.04)}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr td{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;border-bottom:0!important;box-shadow:inset 0 -1px 0 0 rgba(0,0,0,.12)}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th ::ng-deep .mat-sort-header-container{height:55px}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th ::ng-deep .mat-sort-header-container mat-form-field .mat-form-field-infix{width:initial}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr td mat-option,::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th mat-option{background:0 0!important}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr td.selection,::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th.selection{width:56px;padding:0;margin:0}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr td.selection.hidden mat-option,::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th.selection.hidden mat-option{visibility:hidden}"]
            }] }
];
/** @nocollapse */
MatSelectTableComponent.ctorParameters = () => [
    { type: ChangeDetectorRef }
];
MatSelectTableComponent.propDecorators = {
    dataSource: [{ type: Input }],
    multiple: [{ type: Input }],
    overallSearchEnabled: [{ type: Input }],
    overallSearchVisible: [{ type: Input }],
    resetSortOnOpen: [{ type: Input }],
    resetFiltersOnOpen: [{ type: Input }],
    customTriggerLabelFn: [{ type: Input }],
    customTriggerLabelTemplate: [{ type: Input }],
    matSelectConfigurator: [{ type: Input }],
    matSelectSearchConfigurator: [{ type: Input }],
    defaultSort: [{ type: Input }],
    matSelect: [{ type: ViewChild, args: ['componentSelect',] }],
    matSelectSearch: [{ type: ViewChild, args: [MatSelectSearchComponent,] }],
    sort: [{ type: ViewChild, args: [MatSort,] }],
    table: [{ type: ViewChild, args: [MatTable,] }],
    tableRef: [{ type: ViewChild, args: ['table', { read: ElementRef },] }],
    matOptions: [{ type: ViewChildren, args: [MatOption,] }]
};
if (false) {
    /**
     * Data Source for the table
     * @type {?}
     */
    MatSelectTableComponent.prototype.dataSource;
    /**
     * Multiple/Single mode for {\@see MatSelect#multiple} to initialize.
     * NB: switching between modes in runtime is not supported by {\@see MatSelect}
     * @type {?}
     */
    MatSelectTableComponent.prototype.multiple;
    /**
     * Whether or not overall search mode enabled. See {\@see MatSelectTableComponent}
     * @type {?}
     */
    MatSelectTableComponent.prototype.overallSearchEnabled;
    /**
     * Default is true
     * @type {?}
     */
    MatSelectTableComponent.prototype.overallSearchVisible;
    /**
     * Whether or not should {\@see MatSelectTableComponent} be visible on open. Default is true
     * @type {?}
     */
    MatSelectTableComponent.prototype.resetSortOnOpen;
    /**
     * Whether or not previous search should be cleared on open. Default is true
     * @type {?}
     */
    MatSelectTableComponent.prototype.resetFiltersOnOpen;
    /**
     * Function to customize the default label
     * @type {?}
     */
    MatSelectTableComponent.prototype.customTriggerLabelFn;
    /**
     * Template to customize the default trigger label. Has lesser priority than {\@see MatSelectTableComponent#customTriggerLabelFn}.
     * Substitution is case sensitive.
     * Example: ${name} ${id} - ${address}
     * @type {?}
     */
    MatSelectTableComponent.prototype.customTriggerLabelTemplate;
    /**
     * {\@see MatSelect} proxy inputs configurator
     * {\@see MatSelect#multiple} gets value from {\@see MatSelectTableComponent#multiple}
     * @type {?}
     */
    MatSelectTableComponent.prototype.matSelectConfigurator;
    /**
     * {\@see MatSelectSearchComponent} proxy inputs configurator
     * {\@see MatSelectSearchComponent#clearSearchInput} gets value from {\@see MatSelectTableComponent#resetFiltersOnOpen}
     * {\@see MatSelectSearchComponent} {\@see ControlValueAccessor} gets value from {\@see MatSelectTableComponent#overallFilterControl}
     * @type {?}
     */
    MatSelectTableComponent.prototype.matSelectSearchConfigurator;
    /**
     * Apply default sorting
     * @type {?}
     */
    MatSelectTableComponent.prototype.defaultSort;
    /**
     * @type {?}
     * @private
     */
    MatSelectTableComponent.prototype.matSelect;
    /**
     * @type {?}
     * @private
     */
    MatSelectTableComponent.prototype.matSelectSearch;
    /**
     * @type {?}
     * @private
     */
    MatSelectTableComponent.prototype.sort;
    /**
     * @type {?}
     * @private
     */
    MatSelectTableComponent.prototype.table;
    /**
     * @type {?}
     * @private
     */
    MatSelectTableComponent.prototype.tableRef;
    /**
     * @type {?}
     * @private
     */
    MatSelectTableComponent.prototype.matOptions;
    /** @type {?} */
    MatSelectTableComponent.prototype.tableDataSource;
    /** @type {?} */
    MatSelectTableComponent.prototype.tableColumns;
    /** @type {?} */
    MatSelectTableComponent.prototype.tableColumnsMap;
    /** @type {?} */
    MatSelectTableComponent.prototype.tableActiveRow;
    /** @type {?} */
    MatSelectTableComponent.prototype.filteredOutRows;
    /** @type {?} */
    MatSelectTableComponent.prototype.completeRowList;
    /** @type {?} */
    MatSelectTableComponent.prototype.overallSearchVisibleState;
    /** @type {?} */
    MatSelectTableComponent.prototype.overallFilterControl;
    /**
     * @type {?}
     * @private
     */
    MatSelectTableComponent.prototype.filterControls;
    /**
     * @type {?}
     * @private
     */
    MatSelectTableComponent.prototype.completeValueList;
    /**
     * @type {?}
     * @private
     */
    MatSelectTableComponent.prototype.controlValueAccessorKeys;
    /**
     * Subject that emits when the component has been destroyed.
     * @type {?}
     * @private
     */
    MatSelectTableComponent.prototype._onDestroy;
    /**
     * @type {?}
     * @private
     */
    MatSelectTableComponent.prototype._onOptionsChange;
    /**
     * @type {?}
     * @private
     */
    MatSelectTableComponent.prototype.cd;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0LXNlbGVjdC10YWJsZS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9uZ3gtbWF0LXNlbGVjdC10YWJsZS8iLCJzb3VyY2VzIjpbIm1hdC1zZWxlY3QtdGFibGUuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxPQUFPLEVBRUwsdUJBQXVCLEVBQ3ZCLGlCQUFpQixFQUNqQixTQUFTLEVBQ1QsVUFBVSxFQUNWLFVBQVUsRUFDVixLQUFLLEVBSUwsU0FBUyxFQUVULFNBQVMsRUFDVCxZQUFZLEVBQ2IsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUF1QixXQUFXLEVBQUUsU0FBUyxFQUFFLGlCQUFpQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDL0YsT0FBTyxFQUFDLEtBQUssRUFBRSxPQUFPLEVBQVEsTUFBTSxNQUFNLENBQUM7QUFDM0MsT0FBTyxFQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBaUUsTUFBTSxtQkFBbUIsQ0FBQztBQUMxSSxPQUFPLEVBQUMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFHcEUsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ3JELE9BQU8sRUFBVyxZQUFZLEVBQXdCLElBQUksRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUc3RixPQUFPLEVBQUMsd0JBQXdCLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQzs7TUFFekQsZ0JBQWdCLEdBQUcsZ0JBQWdCO0FBZ0J6QyxNQUFNLE9BQU8sdUJBQXVCOzs7O0lBbUdsQyxZQUFvQixFQUFxQjtRQUFyQixPQUFFLEdBQUYsRUFBRSxDQUFtQjtRQXhCekMsb0JBQWUsR0FBd0IsRUFBRSxDQUFDO1FBUWxDLHNCQUFpQixHQUFVLEVBQUUsQ0FBQztRQUU5Qiw2QkFBd0IsR0FBYTtZQUMzQyxhQUFhO1lBQ2IsaUJB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ZW50IjpbImltcG9ydCB7XHJcbiAgQWZ0ZXJWaWV3SW5pdCxcclxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcclxuICBDaGFuZ2VEZXRlY3RvclJlZixcclxuICBDb21wb25lbnQsXHJcbiAgRWxlbWVudFJlZixcclxuICBmb3J3YXJkUmVmLFxyXG4gIElucHV0LFxyXG4gIE9uQ2hhbmdlcyxcclxuICBPbkRlc3Ryb3ksXHJcbiAgT25Jbml0LFxyXG4gIFF1ZXJ5TGlzdCxcclxuICBTaW1wbGVDaGFuZ2VzLFxyXG4gIFZpZXdDaGlsZCxcclxuICBWaWV3Q2hpbGRyZW5cclxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHtDb250cm9sVmFsdWVBY2Nlc3NvciwgRm9ybUNvbnRyb2wsIEZvcm1Hcm91cCwgTkdfVkFMVUVfQUNDRVNTT1J9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcclxuaW1wb3J0IHttZXJnZSwgU3ViamVjdCwgdGltZXJ9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQge01hdE9wdGlvbiwgTWF0U2VsZWN0LCBNYXRTb3J0LCBNYXRUYWJsZSwgTWF0VGFibGVEYXRhU291cmNlLCBTRUxFQ1RfSVRFTV9IRUlHSFRfRU0sIFNvcnQsIFNvcnREaXJlY3Rpb259IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsJztcclxuaW1wb3J0IHtpc0FycmF5LCBpc051bGxPclVuZGVmaW5lZCwgaXNOdW1iZXIsIGlzU3RyaW5nfSBmcm9tICd1dGlsJztcclxuaW1wb3J0IHtNYXRTZWxlY3RUYWJsZURhdGFTb3VyY2V9IGZyb20gJy4vTWF0U2VsZWN0VGFibGVEYXRhU291cmNlJztcclxuaW1wb3J0IHtNYXRTZWxlY3RUYWJsZVJvd30gZnJvbSAnLi9NYXRTZWxlY3RUYWJsZVJvdyc7XHJcbmltcG9ydCB7X2lzTnVtYmVyVmFsdWV9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XHJcbmltcG9ydCB7ZGVib3VuY2UsIGRlYm91bmNlVGltZSwgZGlzdGluY3RVbnRpbENoYW5nZWQsIHRha2UsIHRha2VVbnRpbH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG5pbXBvcnQge01hdFNlbGVjdFRhYmxlQ29sdW1ufSBmcm9tICcuL01hdFNlbGVjdFRhYmxlQ29sdW1uJztcclxuaW1wb3J0IHtNYXRTZWxlY3RUYWJsZUZpbHRlcn0gZnJvbSAnLi9NYXRTZWxlY3RUYWJsZUZpbHRlcic7XHJcbmltcG9ydCB7TWF0U2VsZWN0U2VhcmNoQ29tcG9uZW50fSBmcm9tICduZ3gtbWF0LXNlbGVjdC1zZWFyY2gnO1xyXG5cclxuY29uc3QgTUFYX1NBRkVfSU5URUdFUiA9IDkwMDcxOTkyNTQ3NDA5OTE7XHJcblxyXG5AQ29tcG9uZW50KHtcclxuICBzZWxlY3RvcjogJ25neC1tYXQtc2VsZWN0LXRhYmxlJyxcclxuICB0ZW1wbGF0ZVVybDogJy4vbWF0LXNlbGVjdC10YWJsZS5jb21wb25lbnQuaHRtbCcsXHJcbiAgc3R5bGVVcmxzOiBbJy4vbWF0LXNlbGVjdC10YWJsZS5jb21wb25lbnQuc2NzcyddLFxyXG4gIGV4cG9ydEFzOiAnbmd4LW1hdC1zZWxlY3QtdGFibGUnLFxyXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxyXG4gIHByb3ZpZGVyczogW1xyXG4gICAge1xyXG4gICAgICBwcm92aWRlOiBOR19WQUxVRV9BQ0NFU1NPUixcclxuICAgICAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gTWF0U2VsZWN0VGFibGVDb21wb25lbnQpLFxyXG4gICAgICBtdWx0aTogdHJ1ZVxyXG4gICAgfVxyXG4gIF1cclxufSlcclxuZXhwb3J0IGNsYXNzIE1hdFNlbGVjdFRhYmxlQ29tcG9uZW50IGltcGxlbWVudHMgQ29udHJvbFZhbHVlQWNjZXNzb3IsIE9uSW5pdCwgQWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95LCBPbkNoYW5nZXMge1xyXG5cclxuICAvKiogRGF0YSBTb3VyY2UgZm9yIHRoZSB0YWJsZSAqL1xyXG4gIEBJbnB1dCgpIGRhdGFTb3VyY2U6IE1hdFNlbGVjdFRhYmxlRGF0YVNvdXJjZTxNYXRTZWxlY3RUYWJsZVJvdz47XHJcblxyXG4gIC8qKlxyXG4gICAqIE11bHRpcGxlL1NpbmdsZSBtb2RlIGZvciB7QHNlZSBNYXRTZWxlY3QjbXVsdGlwbGV9IHRvIGluaXRpYWxpemUuXHJcbiAgICogTkI6IHN3aXRjaGluZyBiZXR3ZWVuIG1vZGVzIGluIHJ1bnRpbWUgaXMgbm90IHN1cHBvcnRlZCBieSB7QHNlZSBNYXRTZWxlY3R9XHJcbiAgICovXHJcbiAgQElucHV0KCkgbXVsdGlwbGU6IGJvb2xlYW47XHJcblxyXG4gIC8qKiBXaGV0aGVyIG9yIG5vdCBvdmVyYWxsIHNlYXJjaCBtb2RlIGVuYWJsZWQuIFNlZSB7QHNlZSBNYXRTZWxlY3RUYWJsZUNvbXBvbmVudH0gKi9cclxuICBASW5wdXQoKSBvdmVyYWxsU2VhcmNoRW5hYmxlZDogYm9vbGVhbjtcclxuXHJcbiAgLyoqIERlZmF1bHQgaXMgdHJ1ZSAqL1xyXG4gIEBJbnB1dCgpIG92ZXJhbGxTZWFyY2hWaXNpYmxlOiBib29sZWFuO1xyXG5cclxuICAvKiogV2hldGhlciBvciBub3Qgc2hvdWxkIHtAc2VlIE1hdFNlbGVjdFRhYmxlQ29tcG9uZW50fSBiZSB2aXNpYmxlIG9uIG9wZW4uIERlZmF1bHQgaXMgdHJ1ZSAqL1xyXG4gIEBJbnB1dCgpIHJlc2V0U29ydE9uT3BlbjogYm9vbGVhbjtcclxuXHJcbiAgLyoqIFdoZXRoZXIgb3Igbm90IHByZXZpb3VzIHNlYXJjaCBzaG91bGQgYmUgY2xlYXJlZCBvbiBvcGVuLiBEZWZhdWx0IGlzIHRydWUgKi9cclxuICBASW5wdXQoKSByZXNldEZpbHRlcnNPbk9wZW46IGJvb2xlYW47XHJcblxyXG4gIC8qKlxyXG4gICAqIEZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSB0aGUgZGVmYXVsdCBsYWJlbFxyXG4gICAqL1xyXG4gIEBJbnB1dCgpIGN1c3RvbVRyaWdnZXJMYWJlbEZuOiAodmFsdWU6IE1hdFNlbGVjdFRhYmxlUm93W10pID0+IHN0cmluZztcclxuXHJcbiAgLyoqXHJcbiAgICogVGVtcGxhdGUgdG8gY3VzdG9taXplIHRoZSBkZWZhdWx0IHRyaWdnZXIgbGFiZWwuIEhhcyBsZXNzZXIgcHJpb3JpdHkgdGhhbiB7QHNlZSBNYXRTZWxlY3RUYWJsZUNvbXBvbmVudCNjdXN0b21UcmlnZ2VyTGFiZWxGbn0uXHJcbiAgICogU3Vic3RpdHV0aW9uIGlzIGNhc2Ugc2Vuc2l0aXZlLlxyXG4gICAqIEV4YW1wbGU6ICR7bmFtZX0gJHtpZH0gLSAke2FkZHJlc3N9XHJcbiAgICovXHJcbiAgQElucHV0KCkgY3VzdG9tVHJpZ2dlckxhYmVsVGVtcGxhdGU6IHN0cmluZztcclxuXHJcbiAgLyoqXHJcbiAgICoge0BzZWUgTWF0U2VsZWN0fSBwcm94eSBpbnB1dHMgY29uZmlndXJhdG9yXHJcbiAgICoge0BzZWUgTWF0U2VsZWN0I211bHRpcGxlfSBnZXRzIHZhbHVlIGZyb20ge0BzZWUgTWF0U2VsZWN0VGFibGVDb21wb25lbnQjbXVsdGlwbGV9XHJcbiAgICovXHJcbiAgQElucHV0KCkgbWF0U2VsZWN0Q29uZmlndXJhdG9yOiB7IFtrZXk6IHN0cmluZ106IGFueSB9O1xyXG5cclxuICAvKipcclxuICAgKiB7QHNlZSBNYXRTZWxlY3RTZWFyY2hDb21wb25lbnR9IHByb3h5IGlucHV0cyBjb25maWd1cmF0b3JcclxuICAgKiB7QHNlZSBNYXRTZWxlY3RTZWFyY2hDb21wb25lbnQjY2xlYXJTZWFyY2hJbnB1dH0gZ2V0cyB2YWx1ZSBmcm9tIHtAc2VlIE1hdFNlbGVjdFRhYmxlQ29tcG9uZW50I3Jlc2V0RmlsdGVyc09uT3Blbn1cclxuICAgKiB7QHNlZSBNYXRTZWxlY3RTZWFyY2hDb21wb25lbnR9IHtAc2VlIENvbnRyb2xWYWx1ZUFjY2Vzc29yfSBnZXRzIHZhbHVlIGZyb20ge0BzZWUgTWF0U2VsZWN0VGFibGVDb21wb25lbnQjb3ZlcmFsbEZpbHRlckNvbnRyb2x9XHJcbiAgICovXHJcbiAgQElucHV0KCkgbWF0U2VsZWN0U2VhcmNoQ29uZmlndXJhdG9yOiB7IFtrZXk6IHN0cmluZ106IGFueSB9O1xyXG5cclxuICAvKipcclxuICAgKiBBcHBseSBkZWZhdWx0IHNvcnRpbmdcclxuICAgKi9cclxuICBASW5wdXQoKSBkZWZhdWx0U29ydDogU29ydDtcclxuXHJcbiAgQFZpZXdDaGlsZCgnY29tcG9uZW50U2VsZWN0JykgcHJpdmF0ZSBtYXRTZWxlY3Q6IE1hdFNlbGVjdDtcclxuXHJcbiAgQFZpZXdDaGlsZChNYXRTZWxlY3RTZWFyY2hDb21wb25lbnQpIHByaXZhdGUgbWF0U2VsZWN0U2VhcmNoOiBNYXRTZWxlY3RTZWFyY2hDb21wb25lbnQ7XHJcblxyXG4gIEBWaWV3Q2hpbGQoTWF0U29ydCkgcHJpdmF0ZSBzb3J0OiBNYXRTb3J0O1xyXG5cclxuICBAVmlld0NoaWxkKE1hdFRhYmxlKSBwcml2YXRlIHRhYmxlOiBNYXRUYWJsZTxNYXRTZWxlY3RUYWJsZVJvdz47XHJcblxyXG4gIEBWaWV3Q2hpbGQoJ3RhYmxlJywge3JlYWQ6IEVsZW1lbnRSZWZ9KSBwcml2YXRlIHRhYmxlUmVmOiBFbGVtZW50UmVmO1xyXG5cclxuICBAVmlld0NoaWxkcmVuKE1hdE9wdGlvbikgcHJpdmF0ZSBtYXRPcHRpb25zOiBRdWVyeUxpc3Q8TWF0T3B0aW9uPjtcclxuXHJcbiAgdGFibGVEYXRhU291cmNlOiBNYXRTZWxlY3RUYWJsZVJvd1tdO1xyXG5cclxuICB0YWJsZUNvbHVtbnM6IHN0cmluZ1tdO1xyXG5cclxuICB0YWJsZUNvbHVtbnNNYXA6IE1hcDxzdHJpbmcsIE1hdFNlbGVjdFRhYmxlQ29sdW1uPjtcclxuXHJcbiAgdGFibGVBY3RpdmVSb3c6IG51bWJlcjtcclxuXHJcbiAgZmlsdGVyZWRPdXRSb3dzOiB7IFtrZXk6IHN0cmluZ106IE1hdFNlbGVjdFRhYmxlUm93IH07XHJcblxyXG4gIGNvbXBsZXRlUm93TGlzdDogTWF0U2VsZWN0VGFibGVSb3dbXSA9IFtdO1xyXG5cclxuICBvdmVyYWxsU2VhcmNoVmlzaWJsZVN0YXRlOiBib29sZWFuO1xyXG5cclxuICBvdmVyYWxsRmlsdGVyQ29udHJvbDogRm9ybUNvbnRyb2w7XHJcblxyXG4gIHByaXZhdGUgZmlsdGVyQ29udHJvbHM6IEZvcm1Hcm91cDtcclxuXHJcbiAgcHJpdmF0ZSBjb21wbGV0ZVZhbHVlTGlzdDogYW55W10gPSBbXTtcclxuXHJcbiAgcHJpdmF0ZSBjb250cm9sVmFsdWVBY2Nlc3NvcktleXM6IHN0cmluZ1tdID0gW1xyXG4gICAgJ2Zvcm1Db250cm9sJyxcclxuICAgICdmb3JtQ29udHJvbE5hbWUnLFxyXG4gICAgJ2Zvcm1Hcm91cCcsXHJcbiAgICAnZm9ybUdyb3VwTmFtZScsXHJcbiAgICAnZm9ybUFycmF5JyxcclxuICAgICdmb3JtQXJyYXlOYW1lJ1xyXG4gIF07XHJcblxyXG4gIC8qKiBTdWJqZWN0IHRoYXQgZW1pdHMgd2hlbiB0aGUgY29tcG9uZW50IGhhcyBiZWVuIGRlc3Ryb3llZC4gKi9cclxuICBwcml2YXRlIF9vbkRlc3Ryb3kgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xyXG5cclxuICBwcml2YXRlIF9vbk9wdGlvbnNDaGFuZ2UgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xyXG5cclxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGNkOiBDaGFuZ2VEZXRlY3RvclJlZikge1xyXG4gICAgdGhpcy50YWJsZUNvbHVtbnNNYXAgPSBuZXcgTWFwKCk7XHJcbiAgICB0aGlzLmZpbHRlckNvbnRyb2xzID0gbmV3IEZvcm1Hcm91cCh7fSk7XHJcbiAgICB0aGlzLm92ZXJhbGxGaWx0ZXJDb250cm9sID0gbmV3IEZvcm1Db250cm9sKCcnKTtcclxuICB9XHJcblxyXG4gIG5nT25Jbml0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5tdWx0aXBsZSA9IHRoaXMubXVsdGlwbGUgfHwgZmFsc2U7XHJcbiAgICB0aGlzLm1hdFNlbGVjdC5vcGVuZWRDaGFuZ2VcclxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX29uRGVzdHJveSkpXHJcbiAgICAgIC5zdWJzY3JpYmUob3BlbmVkID0+IHtcclxuICAgICAgICBpZiAodGhpcy5yZXNldEZpbHRlcnNPbk9wZW4gIT09IGZhbHNlIHx8ICF0aGlzLm1hdE9wdGlvbnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICB0aGlzLnJlc2V0RmlsdGVycygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLm92ZXJhbGxTZWFyY2hWaXNpYmxlU3RhdGUgPSB0aGlzLm92ZXJhbGxTZWFyY2hWaXNpYmxlO1xyXG4gICAgICAgIGlmICh0aGlzLnJlc2V0U29ydE9uT3BlbiAhPT0gZmFsc2UpIHtcclxuICAgICAgICAgIHRoaXMuc29ydC5zb3J0KHtpZDogJycsIHN0YXJ0OiAnYXNjJywgZGlzYWJsZUNsZWFyOiBmYWxzZX0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIW9wZW5lZCkge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5vdmVyYWxsU2VhcmNoRW5hYmxlZCkge1xyXG4gICAgICAgICAgdGhpcy5wcm94eU1hdFNlbGVjdFNlYXJjaENvbmZpZ3VyYXRpb24odGhpcy5tYXRTZWxlY3RTZWFyY2hDb25maWd1cmF0b3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBUb0RvOiBnZXQgcmlkIG9mIHRoaXMgd29ya2Fyb3VuZCAodXBkYXRlcyBoZWFkZXIgcm93IFtvdGhlcndpc2Ugc29ydCBtZWNoYW5pc20gcHJvZHVjZXMgZ2xpdGNoZXNdKVxyXG4gICAgICAgICh0aGlzLnRhYmxlIGFzIGFueSkuX2hlYWRlclJvd0RlZkNoYW5nZWQgPSB0cnVlO1xyXG4gICAgICAgIC8vIERpc2FibGUgc29ydCBidXR0b25zIHRvIHByZXZlbnQgc29ydGluZyBjaGFuZ2Ugb24gU1BBQ0Uga2V5IHByZXNzZWQgaW4gZmlsdGVyIGZpZWxkXHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiBbXS5mb3JFYWNoLmNhbGwoXHJcbiAgICAgICAgICB0aGlzLnRhYmxlUmVmLm5hdGl2ZUVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnYnV0dG9uLm1hdC1zb3J0LWhlYWRlci1idXR0b24nKSxcclxuICAgICAgICAgIChlKSA9PiBlLmRpc2FibGVkID0gdHJ1ZSlcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICAvLyBQYXRjaCB0aGUgaGVpZ2h0IG9mIHRoZSBwYW5lbCB0byBpbmNsdWRlIHRoZSBoZWlnaHQgb2YgdGhlIGhlYWRlciBhbmQgZm9vdGVyXHJcbiAgICAgICAgY29uc3QgcGFuZWxFbGVtZW50OiBIVE1MRGl2RWxlbWVudCA9IHRoaXMubWF0U2VsZWN0LnBhbmVsLm5hdGl2ZUVsZW1lbnQ7XHJcbiAgICAgICAgY29uc3QgcGFuZWxIZWlnaHQgPSBwYW5lbEVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xyXG4gICAgICAgIGxldCB0YWJsZUFkZGl0aW9uYWxIZWlnaHQgPSAwO1xyXG4gICAgICAgIHRoaXMudGFibGVcclxuICAgICAgICAgIC5fZ2V0UmVuZGVyZWRSb3dzKHRoaXMudGFibGUuX2hlYWRlclJvd091dGxldClcclxuICAgICAgICAgIC5jb25jYXQodGhpcy50YWJsZS5fZ2V0UmVuZGVyZWRSb3dzKHRoaXMudGFibGUuX2Zvb3RlclJvd091dGxldCkpXHJcbiAgICAgICAgICAuZm9yRWFjaChyb3cgPT4gdGFibGVBZGRpdGlvbmFsSGVpZ2h0ICs9IHJvdy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQpO1xyXG4gICAgICAgIGlmICghaXNOYU4ocGFuZWxIZWlnaHQpKSB7XHJcbiAgICAgICAgICBwYW5lbEVsZW1lbnQuc3R5bGUubWF4SGVpZ2h0ID0gYCR7cGFuZWxIZWlnaHQgKyB0YWJsZUFkZGl0aW9uYWxIZWlnaHR9cHhgO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLm1hdFNlbGVjdFNlYXJjaENvbmZpZ3VyYXRvci5kaXNhYmxlU2Nyb2xsVG9BY3RpdmVPbk9wdGlvbnNDaGFuZ2VkXHJcbiAgICAgICAgICAmJiAhaXNOdWxsT3JVbmRlZmluZWQodGhpcy5tYXRTZWxlY3QuX2tleU1hbmFnZXIpICYmIHRoaXMuY29tcGxldGVSb3dMaXN0Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBmaXJzdFZhbHVlID0gYCR7dGhpcy5jb21wbGV0ZVJvd0xpc3RbMF0uaWR9YDtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnRhYmxlRGF0YVNvdXJjZS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgIGlmIChgJHt0aGlzLnRhYmxlRGF0YVNvdXJjZVtpXS5pZH1gID09PSBmaXJzdFZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1hdFNlbGVjdC5fa2V5TWFuYWdlci5jaGFuZ2UucGlwZSh0YWtlVW50aWwodGhpcy5fb25EZXN0cm95KSwgdGFrZSgxKSkuc3Vic2NyaWJlKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgdGhpcy5tYXRTZWxlY3QuX2tleU1hbmFnZXIuc2V0QWN0aXZlSXRlbShpKTtcclxuICAgICAgICAgICAgICAgICAgdGhpcy5jZC5kZXRlY3RDaGFuZ2VzKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICB9XHJcblxyXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcclxuICAgIG1lcmdlKC4uLltcclxuICAgICAgdGhpcy5zb3J0LnNvcnRDaGFuZ2UsXHJcbiAgICAgIHRoaXMuZmlsdGVyQ29udHJvbHMudmFsdWVDaGFuZ2VzLFxyXG4gICAgICB0aGlzLm92ZXJhbGxGaWx0ZXJDb250cm9sLnZhbHVlQ2hhbmdlc1xyXG4gICAgXSlcclxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX29uRGVzdHJveSksIGRlYm91bmNlVGltZSgxMDApKVxyXG4gICAgICAuc3Vic2NyaWJlKCgpID0+IHtcclxuICAgICAgICBjb25zdCBkYXRhQ2xvbmU6IE1hdFNlbGVjdFRhYmxlUm93W10gPSBbLi4udGhpcy5kYXRhU291cmNlLmRhdGFdO1xyXG5cclxuICAgICAgICAvLyBBcHBseSBmaWx0ZXJpbmdcclxuICAgICAgICBpZiAodGhpcy5vdmVyYWxsU2VhcmNoRW5hYmxlZCAmJiB0aGlzLm92ZXJhbGxTZWFyY2hWaXNpYmxlU3RhdGUpIHtcclxuICAgICAgICAgIHRoaXMuYXBwbHlPdmVyYWxsRmlsdGVyKGRhdGFDbG9uZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuYXBwbHlDb2x1bW5MZXZlbEZpbHRlcnMoZGF0YUNsb25lKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEluaGVyaXQgZGVmYXVsdCBzb3J0aW5nIG9wdGlvbnMgaWYgc29ydCBub3Qgc3BlY2lmaWVkXHJcbiAgICAgICAgaWYgKCF0aGlzLnNvcnQuYWN0aXZlICYmICFpc051bGxPclVuZGVmaW5lZCh0aGlzLmRlZmF1bHRTb3J0KSAmJiB0aGlzLmRlZmF1bHRTb3J0LmFjdGl2ZSkge1xyXG4gICAgICAgICAgdGhpcy5zb3J0LmFjdGl2ZSA9IHRoaXMuZGVmYXVsdFNvcnQuYWN0aXZlO1xyXG4gICAgICAgICAgdGhpcy5zb3J0LmRpcmVjdGlvbiA9IHRoaXMuZGVmYXVsdFNvcnQuZGlyZWN0aW9uO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQXBwbHkgZGVmYXVsdCBvciBtYW51YWwgc29ydGluZ1xyXG4gICAgICAgIHRoaXMudGFibGVEYXRhU291cmNlID0gIXRoaXMuc29ydC5hY3RpdmUgP1xyXG4gICAgICAgICAgZGF0YUNsb25lIDogdGhpcy5zb3J0RGF0YShkYXRhQ2xvbmUsIHRoaXMuc29ydC5hY3RpdmUsIHRoaXMuc29ydC5kaXJlY3Rpb24pO1xyXG5cclxuICAgICAgICB0aGlzLmNkLmRldGVjdENoYW5nZXMoKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgLy8gTWFudWFsbHkgc29ydCBkYXRhIGZvciB0aGlzLm1hdFNlbGVjdC5vcHRpb25zIChRdWVyeUxpc3Q8TWF0T3B0aW9uPikgYW5kIG5vdGlmeSBtYXRTZWxlY3Qub3B0aW9ucyBvZiBjaGFuZ2VzXHJcbiAgICAvLyBJdCdzIGltcG9ydGFudCB0byBrZWVwIHRoaXMubWF0U2VsZWN0Lm9wdGlvbnMgb3JkZXIgc3luY2hyb25pemVkIHdpdGggZGF0YSBpbiB0aGUgdGFibGVcclxuICAgIC8vICAgICBiZWNhdXNlIHRoaXMubWF0U2VsZWN0Lm9wdGlvbnMgKFF1ZXJ5TGlzdDxNYXRPcHRpb24+KSBkb2Vzbid0IHVwZGF0ZSBpdCdzIHN0YXRlIGFmdGVyIHRhYmxlIGRhdGEgaXMgY2hhbmdlZFxyXG4gICAgdGhpcy5tYXRPcHRpb25zLmNoYW5nZXMuc3Vic2NyaWJlKCgpID0+IHtcclxuICAgICAgY29uc3Qgb3B0aW9uczogeyBba2V5OiBzdHJpbmddOiBNYXRPcHRpb24gfSA9IHt9O1xyXG4gICAgICB0aGlzLm1hdE9wdGlvbnMudG9BcnJheSgpXHJcbiAgICAgICAgLmZpbHRlcihvcHRpb24gPT4gIWlzTnVsbE9yVW5kZWZpbmVkKG9wdGlvbikpXHJcbiAgICAgICAgLmZvckVhY2gob3B0aW9uID0+IG9wdGlvbnNbYCR7b3B0aW9uLnZhbHVlfWBdID0gb3B0aW9uKTtcclxuICAgICAgdGhpcy5tYXRTZWxlY3Qub3B0aW9ucy5yZXNldCh0aGlzLnRhYmxlRGF0YVNvdXJjZVxyXG4gICAgICAgIC5maWx0ZXIocm93ID0+ICFpc051bGxPclVuZGVmaW5lZChvcHRpb25zW2Ake3Jvdy5pZH1gXSkpXHJcbiAgICAgICAgLm1hcChyb3cgPT4gb3B0aW9uc1tgJHtyb3cuaWR9YF0pKTtcclxuICAgICAgdGhpcy5tYXRTZWxlY3Qub3B0aW9ucy5ub3RpZnlPbkNoYW5nZXMoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGlmICghaXNOdWxsT3JVbmRlZmluZWQodGhpcy5tYXRTZWxlY3QuX2tleU1hbmFnZXIpKSB7XHJcbiAgICAgIC8vIFN1YnNjcmliZSBvbiBLZXlNYW5hZ2VyIGNoYW5nZXMgdG8gaGlnaGxpZ2h0IHRoZSB0YWJsZSByb3dzIGFjY29yZGluZ2x5XHJcbiAgICAgIHRoaXMubWF0U2VsZWN0Ll9rZXlNYW5hZ2VyLmNoYW5nZVxyXG4gICAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLl9vbkRlc3Ryb3kpKVxyXG4gICAgICAgIC5zdWJzY3JpYmUoYWN0aXZlUm93ID0+IHRoaXMudGFibGVBY3RpdmVSb3cgPSBhY3RpdmVSb3cpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XHJcbiAgICB0aGlzLl9vbkRlc3Ryb3kubmV4dCgpO1xyXG4gICAgdGhpcy5fb25EZXN0cm95LmNvbXBsZXRlKCk7XHJcbiAgfVxyXG5cclxuICByZWdpc3Rlck9uQ2hhbmdlKGZuOiAodmFsdWU6IGFueSkgPT4gdm9pZCk6IHZvaWQge1xyXG4gICAgY29uc3QgcHJveHlGbjogKHZhbHVlOiBhbnkpID0+IHZvaWQgPSAodmFsdWU6IGFueSkgPT4ge1xyXG4gICAgICAvLyBUb0RvOiByZWZhY3RvciAtIGNvbXBhcmlzb24gbWVjaGFuaXNtIGlzbid0IG9wdGltaXplZC4gZmlsdGVyZWRPdXRSb3dzIGlzIGEgbWFwIGJ1dCBjb21wbGV0ZVZhbHVlTGlzdCBpcyBhbiBhcnJheVxyXG4gICAgICBpZiAodGhpcy5tdWx0aXBsZSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSB0aGlzLmNvbXBsZXRlVmFsdWVMaXN0Lmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICBpZiAodGhpcy5maWx0ZXJlZE91dFJvd3NbYCR7dGhpcy5jb21wbGV0ZVZhbHVlTGlzdFtpXX1gXSA9PT0gdW5kZWZpbmVkICYmIHZhbHVlLmluZGV4T2YodGhpcy5jb21wbGV0ZVZhbHVlTGlzdFtpXSkgPT09IC0xKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29tcGxldGVWYWx1ZUxpc3Quc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB2YWx1ZVxyXG4gICAgICAgICAgLmZpbHRlcihjaG9pY2UgPT4gdGhpcy5jb21wbGV0ZVZhbHVlTGlzdC5pbmRleE9mKGNob2ljZSkgPT09IC0xKVxyXG4gICAgICAgICAgLmZvckVhY2goY2hvaWNlID0+IHRoaXMuY29tcGxldGVWYWx1ZUxpc3QucHVzaChjaG9pY2UpKTtcclxuICAgICAgICB0aGlzLm1hdFNlbGVjdC52YWx1ZSA9IHRoaXMuY29tcGxldGVWYWx1ZUxpc3Q7XHJcbiAgICAgICAgZm4odGhpcy5jb21wbGV0ZVZhbHVlTGlzdCk7XHJcbiAgICAgICAgdGhpcy5jb21wbGV0ZVJvd0xpc3Quc3BsaWNlKDApO1xyXG4gICAgICAgIHRoaXMuZGF0YVNvdXJjZS5kYXRhXHJcbiAgICAgICAgICAuZmlsdGVyKHJvdyA9PiB0aGlzLmNvbXBsZXRlVmFsdWVMaXN0LmluZGV4T2Yocm93LmlkKSAhPT0gLTEpXHJcbiAgICAgICAgICAuZm9yRWFjaChyb3cgPT4gdGhpcy5jb21wbGV0ZVJvd0xpc3QucHVzaChyb3cpKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBmbih2YWx1ZSk7XHJcbiAgICAgICAgdGhpcy5jb21wbGV0ZVJvd0xpc3Quc3BsaWNlKDApO1xyXG4gICAgICAgIHRoaXMuZGF0YVNvdXJjZS5kYXRhXHJcbiAgICAgICAgICAuZmlsdGVyKHJvdyA9PiByb3cuaWQgPT09IHZhbHVlKVxyXG4gICAgICAgICAgLmZvckVhY2gocm93ID0+IHRoaXMuY29tcGxldGVSb3dMaXN0LnB1c2gocm93KSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICB0aGlzLm1hdFNlbGVjdC5yZWdpc3Rlck9uQ2hhbmdlKHByb3h5Rm4pO1xyXG4gIH1cclxuXHJcbiAgcmVnaXN0ZXJPblRvdWNoZWQoZm46ICgpID0+IHt9KTogdm9pZCB7XHJcbiAgICB0aGlzLm1hdFNlbGVjdC5yZWdpc3Rlck9uVG91Y2hlZChmbik7XHJcbiAgfVxyXG5cclxuICBzZXREaXNhYmxlZFN0YXRlKGlzRGlzYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgIHRoaXMubWF0U2VsZWN0LnNldERpc2FibGVkU3RhdGUoaXNEaXNhYmxlZCk7XHJcbiAgfVxyXG5cclxuICB3cml0ZVZhbHVlKHZhbHVlOiBhbnkpOiB2b2lkIHtcclxuICAgIHRoaXMudXBkYXRlQ29tcGxldGVSb3dMaXN0KHZhbHVlKTtcclxuICAgIHRoaXMubWF0U2VsZWN0LndyaXRlVmFsdWUodmFsdWUpO1xyXG4gICAgaWYgKHRoaXMubWF0U2VsZWN0LnZhbHVlICE9PSB2YWx1ZSkge1xyXG4gICAgICB0aGlzLm1hdFNlbGVjdC52YWx1ZSA9IHZhbHVlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcyk6IHZvaWQge1xyXG5cclxuICAgIGlmICghaXNOdWxsT3JVbmRlZmluZWQoY2hhbmdlcy5yZXNldEZpbHRlcnNPbk9wZW4pICYmIGNoYW5nZXMucmVzZXRGaWx0ZXJzT25PcGVuLmN1cnJlbnRWYWx1ZSAhPT0gZmFsc2UpIHtcclxuICAgICAgdGhpcy5yZXNldEZpbHRlcnMoKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKGNoYW5nZXMuZGF0YVNvdXJjZSkpIHtcclxuICAgICAgdGhpcy51cGRhdGVDb21wbGV0ZVJvd0xpc3QodGhpcy5jb21wbGV0ZVJvd0xpc3QubWFwKHJvdyA9PiByb3cuaWQpKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBQcm94eSBASW5wdXQgYmluZGluZ3MgdG8gTWF0U2VsZWN0XHJcbiAgICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKGNoYW5nZXMubWF0U2VsZWN0Q29uZmlndXJhdG9yKSkge1xyXG4gICAgICBjb25zdCBjb25maWd1cmF0aW9uID0gY2hhbmdlcy5tYXRTZWxlY3RDb25maWd1cmF0b3IuY3VycmVudFZhbHVlO1xyXG4gICAgICBPYmplY3Qua2V5cyhjb25maWd1cmF0aW9uKVxyXG4gICAgICAgIC5maWx0ZXIoa2V5ID0+ICFbJ211bHRpcGxlJywgJ3BhbmVsQ2xhc3MnXS5pbmNsdWRlcyhrZXkpICYmICF0aGlzLmNvbnRyb2xWYWx1ZUFjY2Vzc29yS2V5cy5pbmNsdWRlcyhrZXkpKVxyXG4gICAgICAgIC5mb3JFYWNoKGtleSA9PiB0aGlzLm1hdFNlbGVjdFtrZXldID0gY29uZmlndXJhdGlvbltrZXldKTtcclxuICAgICAgY29uc3QgcGFuZWxDbGFzczogc3RyaW5nW10gPSBbXTtcclxuICAgICAgcGFuZWxDbGFzcy5wdXNoKCdtYXQtc2VsZWN0LXNlYXJjaC10YWJsZS1wYW5lbCcpO1xyXG4gICAgICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKGNvbmZpZ3VyYXRpb24ucGFuZWxDbGFzcykpIHtcclxuICAgICAgICBwYW5lbENsYXNzLnB1c2goY29uZmlndXJhdGlvbi5wYW5lbENsYXNzKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAodGhpcy5vdmVyYWxsU2VhcmNoRW5hYmxlZCkge1xyXG4gICAgICAgIHBhbmVsQ2xhc3MucHVzaCgnbWF0LXNlbGVjdC1zZWFyY2gtcGFuZWwnKTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLm1hdFNlbGVjdC5wYW5lbENsYXNzID0gcGFuZWxDbGFzcztcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKGNoYW5nZXMubWF0U2VsZWN0U2VhcmNoQ29uZmlndXJhdG9yKSkge1xyXG4gICAgICB0aGlzLnByb3h5TWF0U2VsZWN0U2VhcmNoQ29uZmlndXJhdGlvbihjaGFuZ2VzLm1hdFNlbGVjdFNlYXJjaENvbmZpZ3VyYXRvci5jdXJyZW50VmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghaXNOdWxsT3JVbmRlZmluZWQoY2hhbmdlcy5kYXRhU291cmNlKVxyXG4gICAgICAmJiAhaXNOdWxsT3JVbmRlZmluZWQoY2hhbmdlcy5kYXRhU291cmNlLmN1cnJlbnRWYWx1ZSlcclxuICAgICAgJiYgaXNBcnJheShjaGFuZ2VzLmRhdGFTb3VyY2UuY3VycmVudFZhbHVlLmRhdGEpKSB7XHJcbiAgICAgIHRoaXMudGFibGVEYXRhU291cmNlID0gWy4uLmNoYW5nZXMuZGF0YVNvdXJjZS5jdXJyZW50VmFsdWUuZGF0YV07XHJcbiAgICAgIHRoaXMudGFibGVDb2x1bW5zID0gWydfc2VsZWN0aW9uJywgLi4uY2hhbmdlcy5kYXRhU291cmNlLmN1cnJlbnRWYWx1ZS5jb2x1bW5zLm1hcChjb2x1bW4gPT4gY29sdW1uLmtleSldO1xyXG4gICAgICB0aGlzLnRhYmxlQ29sdW1uc01hcC5jbGVhcigpO1xyXG4gICAgICBjaGFuZ2VzLmRhdGFTb3VyY2UuY3VycmVudFZhbHVlLmNvbHVtbnMuZm9yRWFjaChjb2x1bW4gPT4gdGhpcy50YWJsZUNvbHVtbnNNYXAuc2V0KGNvbHVtbi5rZXksIGNvbHVtbikpO1xyXG4gICAgICB0aGlzLmFwcGx5UHJveHlUb0FycmF5KGNoYW5nZXMuZGF0YVNvdXJjZS5jdXJyZW50VmFsdWUuZGF0YSwgKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuX29uT3B0aW9uc0NoYW5nZS5uZXh0KCk7XHJcbiAgICAgIH0pO1xyXG4gICAgICB0aGlzLl9vbk9wdGlvbnNDaGFuZ2UubmV4dCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZW11bGF0ZU1hdE9wdGlvbkNsaWNrKGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCB7XHJcbiAgICBpZiAoZXZlbnQuY29tcG9zZWRQYXRoKClcclxuICAgICAgLmZpbHRlcihldCA9PiBldCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KVxyXG4gICAgICAuc29tZSgoZXQ6IEhUTUxFbGVtZW50KSA9PiBldC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdtYXQtb3B0aW9uJykpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgaWYgKCEoZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGxldCByb3dFbGVtZW50ID0gZXZlbnQudGFyZ2V0O1xyXG4gICAgd2hpbGUgKHJvd0VsZW1lbnQgIT0gbnVsbCAmJiByb3dFbGVtZW50IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgJiYgcm93RWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgIT09ICd0cicpIHtcclxuICAgICAgcm93RWxlbWVudCA9IHJvd0VsZW1lbnQucGFyZW50RWxlbWVudDtcclxuICAgIH1cclxuICAgIGlmIChyb3dFbGVtZW50ID09PSBudWxsKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGNvbnN0IGNoaWxkT3B0aW9uOiBIVE1MRWxlbWVudCA9IHJvd0VsZW1lbnQucXVlcnlTZWxlY3RvcignbWF0LW9wdGlvbicpO1xyXG4gICAgaWYgKCFjaGlsZE9wdGlvbikge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBjaGlsZE9wdGlvbi5jbGljaygpO1xyXG4gIH1cclxuXHJcblxyXG4gIGZpbHRlckZvcm1Db250cm9sKGtleTogc3RyaW5nKTogRm9ybUNvbnRyb2wge1xyXG4gICAgaWYgKCF0aGlzLmZpbHRlckNvbnRyb2xzLmNvbnRhaW5zKGtleSkpIHtcclxuICAgICAgdGhpcy5maWx0ZXJDb250cm9scy5yZWdpc3RlckNvbnRyb2woa2V5LCBuZXcgRm9ybUNvbnRyb2woJycpKTtcclxuICAgIH1cclxuICAgIHJldHVybiA8Rm9ybUNvbnRyb2w+dGhpcy5maWx0ZXJDb250cm9scy5nZXQoa2V5KTtcclxuICB9XHJcblxyXG4gIHNpbXBsZVRyaWdnZXJMYWJlbEZuKHZhbHVlOiBNYXRTZWxlY3RUYWJsZVJvd1tdKTogc3RyaW5nIHtcclxuICAgIHJldHVybiB2YWx1ZS5tYXAocm93ID0+IHtcclxuICAgICAgaWYgKGlzTnVsbE9yVW5kZWZpbmVkKHJvdykpIHtcclxuICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGlzTnVsbE9yVW5kZWZpbmVkKHRoaXMuY3VzdG9tVHJpZ2dlckxhYmVsVGVtcGxhdGUpXHJcbiAgICAgICAgfHwgdHlwZW9mIHRoaXMuY3VzdG9tVHJpZ2dlckxhYmVsVGVtcGxhdGUgIT09ICdzdHJpbmcnXHJcbiAgICAgICAgfHwgdGhpcy5jdXN0b21UcmlnZ2VyTGFiZWxUZW1wbGF0ZS50cmltKCkubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuIGAke3Jvdy5pZH1gO1xyXG4gICAgICB9XHJcbiAgICAgIGxldCBhdExlYXN0UGFydGlhbFN1YnN0aXR1dGlvbiA9IGZhbHNlO1xyXG4gICAgICBjb25zdCBzdWJzdGl0dXRpb246IHN0cmluZyA9IHRoaXMuY3VzdG9tVHJpZ2dlckxhYmVsVGVtcGxhdGUucmVwbGFjZSgvWyRdezF9W3tdezF9KFtefV0rKVt9XXsxfT8vZywgKF8sIGtleSkgPT5cclxuICAgICAgICAhaXNOdWxsT3JVbmRlZmluZWQocm93W2tleV0pICYmIChhdExlYXN0UGFydGlhbFN1YnN0aXR1dGlvbiA9IHRydWUpID8gcm93W2tleV0gOiAnJyk7XHJcbiAgICAgIGlmIChhdExlYXN0UGFydGlhbFN1YnN0aXR1dGlvbiA9PT0gZmFsc2UpIHtcclxuICAgICAgICByZXR1cm4gYCR7cm93LmlkfWA7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHN1YnN0aXR1dGlvbi50cmltKCk7XHJcbiAgICB9KS5qb2luKCcsICcpO1xyXG4gIH1cclxuXHJcbiAgdG9nZ2xlT3ZlcmFsbFNlYXJjaCgpOiB2b2lkIHtcclxuICAgIHRoaXMub3ZlcmFsbFNlYXJjaFZpc2libGVTdGF0ZSA9ICF0aGlzLm92ZXJhbGxTZWFyY2hWaXNpYmxlU3RhdGU7XHJcbiAgICB0aGlzLnJlc2V0RmlsdGVycygpO1xyXG4gICAgaWYgKHRoaXMub3ZlcmFsbFNlYXJjaFZpc2libGVTdGF0ZSkge1xyXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMubWF0U2VsZWN0U2VhcmNoLl9mb2N1cygpKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgdXBkYXRlQ29tcGxldGVSb3dMaXN0KHZhbHVlOiBhbnlbXSk6IHZvaWQge1xyXG4gICAgdGhpcy5jb21wbGV0ZVJvd0xpc3Quc3BsaWNlKDApO1xyXG4gICAgaWYgKCFpc051bGxPclVuZGVmaW5lZCh2YWx1ZSkpIHtcclxuICAgICAgY29uc3QgdmFsdWVBcnJheTogYW55W10gPSAhaXNBcnJheSh2YWx1ZSkgPyBbdmFsdWVdIDogdmFsdWU7XHJcbiAgICAgIHZhbHVlQXJyYXkuZm9yRWFjaChpdGVtID0+IHtcclxuICAgICAgICBjb25zdCByb3dGb3VuZCA9IHRoaXMuZGF0YVNvdXJjZS5kYXRhLmZpbmQocm93ID0+IHJvdy5pZCA9PT0gaXRlbSk7XHJcbiAgICAgICAgaWYgKHJvd0ZvdW5kID09PSBudWxsKSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuY29tcGxldGVSb3dMaXN0LnB1c2gocm93Rm91bmQpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgcHJveHlNYXRTZWxlY3RTZWFyY2hDb25maWd1cmF0aW9uKGNvbmZpZ3VyYXRpb246IHsgW2tleTogc3RyaW5nXTogYW55IH0pOiB2b2lkIHtcclxuICAgIGlmIChpc051bGxPclVuZGVmaW5lZCh0aGlzLm1hdFNlbGVjdFNlYXJjaCkpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFByb3h5IEBJbnB1dCBiaW5kaW5ncyB0byBOZ3hNYXRTZWxlY3RTZWFyY2hcclxuICAgIE9iamVjdC5rZXlzKGNvbmZpZ3VyYXRpb24pXHJcbiAgICAgIC5maWx0ZXIoa2V5ID0+ICFbJ2NsZWFyU2VhcmNoSW5wdXQnXS5pbmNsdWRlcyhrZXkpICYmICF0aGlzLmNvbnRyb2xWYWx1ZUFjY2Vzc29yS2V5cy5pbmNsdWRlcyhrZXkpKVxyXG4gICAgICAuZm9yRWFjaChrZXkgPT4gdGhpcy5tYXRTZWxlY3RTZWFyY2hba2V5XSA9IGNvbmZpZ3VyYXRpb25ba2V5XSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFwcGx5Q29sdW1uTGV2ZWxGaWx0ZXJzKGRhdGE6IE1hdFNlbGVjdFRhYmxlUm93W10pOiB2b2lkIHtcclxuICAgIHRoaXMuZmlsdGVyZWRPdXRSb3dzID0ge307XHJcbiAgICBjb25zdCBmaWx0ZXJzOiB7IFtrZXk6IHN0cmluZ106IHsgZmlsdGVyOiBNYXRTZWxlY3RUYWJsZUZpbHRlciwgdmFsdWU6IGFueSB9IH0gPSB7fTtcclxuICAgIE9iamVjdC5rZXlzKHRoaXMuZmlsdGVyQ29udHJvbHMuY29udHJvbHMpXHJcbiAgICAgIC5maWx0ZXIoa2V5ID0+IHRoaXMudGFibGVDb2x1bW5zTWFwLmhhcyhrZXkpXHJcbiAgICAgICAgJiYgIWlzTnVsbE9yVW5kZWZpbmVkKHRoaXMudGFibGVDb2x1bW5zTWFwLmdldChrZXkpLmZpbHRlcilcclxuICAgICAgICAvLyBJZiBmaWx0ZXIgaXMgZW5hYmxlZFxyXG4gICAgICAgICYmIHRoaXMudGFibGVDb2x1bW5zTWFwLmdldChrZXkpLmZpbHRlci5lbmFibGVkICE9PSBmYWxzZSlcclxuICAgICAgLmZpbHRlcihrZXkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5maWx0ZXJDb250cm9scy5nZXQoa2V5KS52YWx1ZTtcclxuICAgICAgICByZXR1cm4gIWlzTnVsbE9yVW5kZWZpbmVkKHZhbHVlKVxyXG4gICAgICAgICAgLy8gSWYgYW4gYXJyYXkgLSBjaGVjayBpdCdzIG5vdCBlbXB0eVxyXG4gICAgICAgICAgJiYgKChpc0FycmF5KHZhbHVlKSAmJiB2YWx1ZS5sZW5ndGggPiAwKVxyXG4gICAgICAgICAgICAvLyBJZiBzdHJpbmcgLSBjaGVjayB0aGF0IG5vdCBibGFua1xyXG4gICAgICAgICAgICB8fCAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB2YWx1ZS50cmltKCkubGVuZ3RoID4gMClcclxuICAgICAgICAgICAgLy8gSWYgbnVtYmVyIC0gY2hlY2sgdGhhdCB0b1N0cmluZygpIGlzIG5vdCBibGFua1xyXG4gICAgICAgICAgICB8fCAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiBgJHt2YWx1ZX1gLnRyaW0oKS5sZW5ndGggPiAwKSk7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5mb3JFYWNoKGtleSA9PiBmaWx0ZXJzW2tleV0gPSB7XHJcbiAgICAgICAgZmlsdGVyOiB0aGlzLnRhYmxlQ29sdW1uc01hcC5nZXQoa2V5KS5maWx0ZXIsXHJcbiAgICAgICAgdmFsdWU6IHRoaXMuZmlsdGVyQ29udHJvbHMuZ2V0KGtleSkudmFsdWVcclxuICAgICAgfSk7XHJcbiAgICBjb25zdCBmaWx0ZXJLZXlzOiBzdHJpbmdbXSA9IE9iamVjdC5rZXlzKGZpbHRlcnMpO1xyXG4gICAgZm9yIChsZXQgaSA9IGRhdGEubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgZm9yIChsZXQgayA9IDA7IGsgPCBmaWx0ZXJLZXlzLmxlbmd0aDsgaysrKSB7XHJcbiAgICAgICAgY29uc3QgZmlsdGVyS2V5OiBzdHJpbmcgPSBmaWx0ZXJLZXlzW2tdO1xyXG4gICAgICAgIGNvbnN0IHJvdzogTWF0U2VsZWN0VGFibGVSb3cgPSBkYXRhW2ldO1xyXG4gICAgICAgIGNvbnN0IGNlbGxWYWx1ZTogYW55ID0gcm93W2ZpbHRlcktleV07XHJcbiAgICAgICAgaWYgKGlzTnVsbE9yVW5kZWZpbmVkKGNlbGxWYWx1ZSkpIHtcclxuICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBmaWx0ZXIgPSBmaWx0ZXJzW2ZpbHRlcktleV07XHJcbiAgICAgICAgY29uc3QgY29tcGFyYXRvciA9IGZpbHRlci5maWx0ZXIuY29tcGFyYXRvcjtcclxuICAgICAgICBpZiAodHlwZW9mIGZpbHRlci5maWx0ZXIuY29tcGFyYXRvckZuID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICBpZiAoIWZpbHRlci5maWx0ZXIuY29tcGFyYXRvckZuLmNhbGwobnVsbCwgY2VsbFZhbHVlLCBmaWx0ZXIudmFsdWUsIHJvdykpIHtcclxuICAgICAgICAgICAgZGF0YS5zcGxpY2UoaSwgMSkuZm9yRWFjaChpdGVtID0+IHRoaXMuZmlsdGVyZWRPdXRSb3dzW2Ake2l0ZW0uaWR9YF0gPSBpdGVtKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmIChpc051bGxPclVuZGVmaW5lZChjb21wYXJhdG9yKSB8fCBjb21wYXJhdG9yID09PSAnZXF1YWxzJykge1xyXG4gICAgICAgICAgaWYgKGZpbHRlci52YWx1ZSAhPT0gY2VsbFZhbHVlKSB7XHJcbiAgICAgICAgICAgIGRhdGEuc3BsaWNlKGksIDEpLmZvckVhY2goaXRlbSA9PiB0aGlzLmZpbHRlcmVkT3V0Um93c1tgJHtpdGVtLmlkfWBdID0gaXRlbSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGNlbGxWYWx1ZSA9PT0gJ3N0cmluZycgJiYgdHlwZW9mIGZpbHRlci52YWx1ZSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgIGNvbnN0IGNlbGxWYWx1ZUxDOiBzdHJpbmcgPSBgJHtjZWxsVmFsdWV9YC50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgY29uc3QgZmlsdGVyVmFsdWVMQzogc3RyaW5nID0gZmlsdGVyLnZhbHVlLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICBpZiAoaXNOdWxsT3JVbmRlZmluZWQoY29tcGFyYXRvcikgfHwgY29tcGFyYXRvciA9PT0gJ2VxdWFsc0lnbm9yZUNhc2UnKSB7XHJcbiAgICAgICAgICAgIGlmIChmaWx0ZXJWYWx1ZUxDICE9PSBjZWxsVmFsdWVMQykge1xyXG4gICAgICAgICAgICAgIGRhdGEuc3BsaWNlKGksIDEpLmZvckVhY2goaXRlbSA9PiB0aGlzLmZpbHRlcmVkT3V0Um93c1tgJHtpdGVtLmlkfWBdID0gaXRlbSk7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSBpZiAoY29tcGFyYXRvciA9PT0gJ2NvbnRhaW5zJykge1xyXG4gICAgICAgICAgICBpZiAoY2VsbFZhbHVlLmluZGV4T2YoZmlsdGVyLnZhbHVlKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICBkYXRhLnNwbGljZShpLCAxKS5mb3JFYWNoKGl0ZW0gPT4gdGhpcy5maWx0ZXJlZE91dFJvd3NbYCR7aXRlbS5pZH1gXSA9IGl0ZW0pO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGNvbXBhcmF0b3IgPT09ICdjb250YWluc0lnbm9yZUNhc2UnKSB7XHJcbiAgICAgICAgICAgIGlmIChjZWxsVmFsdWVMQy5pbmRleE9mKGZpbHRlclZhbHVlTEMpID09PSAtMSkge1xyXG4gICAgICAgICAgICAgIGRhdGEuc3BsaWNlKGksIDEpLmZvckVhY2goaXRlbSA9PiB0aGlzLmZpbHRlcmVkT3V0Um93c1tgJHtpdGVtLmlkfWBdID0gaXRlbSk7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSBpZiAoY29tcGFyYXRvciA9PT0gJ3N0YXJ0c1dpdGgnKSB7XHJcbiAgICAgICAgICAgIGlmICghY2VsbFZhbHVlLnN0YXJ0c1dpdGgoZmlsdGVyLnZhbHVlKSkge1xyXG4gICAgICAgICAgICAgIGRhdGEuc3BsaWNlKGksIDEpLmZvckVhY2goaXRlbSA9PiB0aGlzLmZpbHRlcmVkT3V0Um93c1tgJHtpdGVtLmlkfWBdID0gaXRlbSk7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSBpZiAoY29tcGFyYXRvciA9PT0gJ3N0YXJ0c1dpdGhJZ25vcmVDYXNlJykge1xyXG4gICAgICAgICAgICBpZiAoIWNlbGxWYWx1ZUxDLnN0YXJ0c1dpdGgoZmlsdGVyVmFsdWVMQykpIHtcclxuICAgICAgICAgICAgICBkYXRhLnNwbGljZShpLCAxKS5mb3JFYWNoKGl0ZW0gPT4gdGhpcy5maWx0ZXJlZE91dFJvd3NbYCR7aXRlbS5pZH1gXSA9IGl0ZW0pO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFwcGx5T3ZlcmFsbEZpbHRlcihkYXRhOiBNYXRTZWxlY3RUYWJsZVJvd1tdKTogdm9pZCB7XHJcbiAgICB0aGlzLmZpbHRlcmVkT3V0Um93cyA9IHt9O1xyXG4gICAgaWYgKGlzTnVsbE9yVW5kZWZpbmVkKHRoaXMub3ZlcmFsbEZpbHRlckNvbnRyb2wudmFsdWUpKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGNvbnN0IGZpbHRlclZhbHVlTEM6IHN0cmluZyA9IHRoaXMub3ZlcmFsbEZpbHRlckNvbnRyb2wudmFsdWUudG9Mb3dlckNhc2UoKTtcclxuICAgIGlmIChmaWx0ZXJWYWx1ZUxDLnRyaW0oKS5sZW5ndGggPT09IDApIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgZm9yIChsZXQgaSA9IGRhdGEubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgY29uc3Qgcm93OiBNYXRTZWxlY3RUYWJsZVJvdyA9IGRhdGFbaV07XHJcbiAgICAgIGxldCByb3dTaG91bGRCZUZpbHRlcmVkID0gdHJ1ZTtcclxuICAgICAgZm9yIChsZXQgaiA9IHRoaXMuZGF0YVNvdXJjZS5jb2x1bW5zLmxlbmd0aCAtIDE7IGogPj0gMDsgai0tKSB7XHJcbiAgICAgICAgY29uc3Qga2V5OiBzdHJpbmcgPSB0aGlzLmRhdGFTb3VyY2UuY29sdW1uc1tqXS5rZXk7XHJcbiAgICAgICAgY29uc3QgY2VsbFZhbHVlOiBhbnkgPSByb3dba2V5XTtcclxuICAgICAgICBpZiAoaXNOdWxsT3JVbmRlZmluZWQoY2VsbFZhbHVlKSkge1xyXG4gICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGNlbGxWYWx1ZUxDOiBzdHJpbmcgPSBgJHtjZWxsVmFsdWV9YC50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgIGlmIChjZWxsVmFsdWVMQy5pbmRleE9mKGZpbHRlclZhbHVlTEMpICE9PSAtMSkge1xyXG4gICAgICAgICAgcm93U2hvdWxkQmVGaWx0ZXJlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChyb3dTaG91bGRCZUZpbHRlcmVkKSB7XHJcbiAgICAgICAgZGF0YS5zcGxpY2UoaSwgMSkuZm9yRWFjaChpdGVtID0+IHRoaXMuZmlsdGVyZWRPdXRSb3dzW2Ake2l0ZW0uaWR9YF0gPSBpdGVtKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhcHBseVByb3h5VG9BcnJheShhcnJheTogYW55W10sIGNhbGxiYWNrOiAoKSA9PiB2b2lkKTogdm9pZCB7XHJcbiAgICBbJ3BvcCcsICdwdXNoJywgJ3JldmVyc2UnLCAnc2hpZnQnLCAndW5zaGlmdCcsICdzcGxpY2UnLCAnc29ydCddLmZvckVhY2goKG1ldGhvZE5hbWUpID0+IHtcclxuICAgICAgYXJyYXlbbWV0aG9kTmFtZV0gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgY29uc3QgcmVzID0gQXJyYXkucHJvdG90eXBlW21ldGhvZE5hbWVdLmFwcGx5KGFycmF5LCBhcmd1bWVudHMpOyAvLyBjYWxsIG5vcm1hbCBiZWhhdmlvdXJcclxuICAgICAgICBjYWxsYmFjay5hcHBseShhcnJheSwgYXJndW1lbnRzKTsgLy8gZmluYWxseSBjYWxsIHRoZSBjYWxsYmFjayBzdXBwbGllZFxyXG4gICAgICAgIHJldHVybiByZXM7XHJcbiAgICAgIH07XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcmVzZXRGaWx0ZXJzKCk6IHZvaWQge1xyXG4gICAgdGhpcy5vdmVyYWxsRmlsdGVyQ29udHJvbC5zZXRWYWx1ZSgnJyk7XHJcbiAgICBPYmplY3Qua2V5cyh0aGlzLmZpbHRlckNvbnRyb2xzLmNvbnRyb2xzKVxyXG4gICAgICAuZm9yRWFjaChrZXkgPT4gdGhpcy5maWx0ZXJDb250cm9scy5nZXQoa2V5KS5zZXRWYWx1ZSgnJykpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGFrZW4gZnJvbSB7QHNlZSBNYXRUYWJsZURhdGFTb3VyY2Ujc29ydGluZ0RhdGFBY2Nlc3Nvcn1cclxuICAgKlxyXG4gICAqIEBwYXJhbSBkYXRhXHJcbiAgICogQHBhcmFtIHNvcnRIZWFkZXJJZFxyXG4gICAqL1xyXG4gIHByaXZhdGUgc29ydGluZ0RhdGFBY2Nlc3NvcihkYXRhOiBNYXRTZWxlY3RUYWJsZVJvdywgYWN0aXZlOiBzdHJpbmcpOiBzdHJpbmcgfCBudW1iZXIgfCBEYXRlIHtcclxuXHJcbiAgICBjb25zdCB2YWx1ZSA9IChkYXRhIGFzIHsgW2tleTogc3RyaW5nXTogYW55IH0pW2FjdGl2ZV07XHJcblxyXG4gICAgaWYgKF9pc051bWJlclZhbHVlKHZhbHVlKSkge1xyXG4gICAgICBjb25zdCBudW1iZXJWYWx1ZSA9IE51bWJlcih2YWx1ZSk7XHJcblxyXG4gICAgICAvLyBOdW1iZXJzIGJleW9uZCBgTUFYX1NBRkVfSU5URUdFUmAgY2FuJ3QgYmUgY29tcGFyZWQgcmVsaWFibHkgc28gd2VcclxuICAgICAgLy8gbGVhdmUgdGhlbSBhcyBzdHJpbmdzLiBGb3IgbW9yZSBpbmZvOiBodHRwczovL2dvby5nbC95NXZiU2dcclxuICAgICAgcmV0dXJuIG51bWJlclZhbHVlIDwgTUFYX1NBRkVfSU5URUdFUiA/IG51bWJlclZhbHVlIDogdmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG4gIH1cclxuXHJcblxyXG4gIHByaXZhdGUgc29ydERhdGEoZGF0YTogTWF0U2VsZWN0VGFibGVSb3dbXSwgYWN0aXZlOiBzdHJpbmcsIGRpcmVjdGlvbjogU29ydERpcmVjdGlvbik6IE1hdFNlbGVjdFRhYmxlUm93W10ge1xyXG4gICAgaWYgKCFhY3RpdmUgfHwgZGlyZWN0aW9uID09PSAnJykge1xyXG4gICAgICByZXR1cm4gZGF0YTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZGF0YS5zb3J0KChhLCBiKSA9PiB7XHJcbiAgICAgIGxldCBhVmFsdWUgPSB0aGlzLnNvcnRpbmdEYXRhQWNjZXNzb3IoYSwgYWN0aXZlKTtcclxuICAgICAgbGV0IGJWYWx1ZSA9IHRoaXMuc29ydGluZ0RhdGFBY2Nlc3NvcihiLCBhY3RpdmUpO1xyXG5cclxuICAgICAgLy8gQm90aCBudWxsL3VuZGVmaW5lZC9lcXVhbCB2YWx1ZSBjaGVja1xyXG4gICAgICBpZiAoYVZhbHVlID09PSBiVmFsdWUpIHtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gT25lIG51bGwgdmFsdWUgY2hlY2tcclxuICAgICAgaWYgKGlzTnVsbE9yVW5kZWZpbmVkKGFWYWx1ZSkgJiYgIWlzTnVsbE9yVW5kZWZpbmVkKGJWYWx1ZSkpIHtcclxuICAgICAgICByZXR1cm4gLTE7XHJcbiAgICAgIH0gZWxzZSBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKGFWYWx1ZSkgJiYgaXNOdWxsT3JVbmRlZmluZWQoYlZhbHVlKSkge1xyXG4gICAgICAgIHJldHVybiAxO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoYVZhbHVlIGluc3RhbmNlb2YgRGF0ZSkge1xyXG4gICAgICAgIGFWYWx1ZSA9IGFWYWx1ZS5nZXRUaW1lKCk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGJWYWx1ZSBpbnN0YW5jZW9mIERhdGUpIHtcclxuICAgICAgICBiVmFsdWUgPSBiVmFsdWUuZ2V0VGltZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBVc2VyIGxvY2FsZUNvbXBhcmUgZm9yIHN0cmluZ3NcclxuICAgICAgaWYgKGlzU3RyaW5nKGFWYWx1ZSkgJiYgaXNTdHJpbmcoYlZhbHVlKSkge1xyXG4gICAgICAgIHJldHVybiAoPHN0cmluZz5hVmFsdWUpLmxvY2FsZUNvbXBhcmUoPHN0cmluZz5iVmFsdWUpICogKHRoaXMuc29ydC5kaXJlY3Rpb24gPT09ICdhc2MnID8gMSA6IC0xKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gVHJ5IHRvIGNvbnZlcnQgdG8gYSBOdW1iZXIgdHlwZVxyXG4gICAgICBhVmFsdWUgPSBpc05hTig8bnVtYmVyPmFWYWx1ZSkgPyBgJHthVmFsdWV9YCA6ICthVmFsdWU7XHJcbiAgICAgIGJWYWx1ZSA9IGlzTmFOKDxudW1iZXI+YlZhbHVlKSA/IGAke2JWYWx1ZX1gIDogK2JWYWx1ZTtcclxuXHJcbiAgICAgIC8vIGlmIG9uZSBpcyBudW1iZXIgYW5kIG90aGVyIGlzIFN0cmluZ1xyXG4gICAgICBpZiAoaXNTdHJpbmcoYVZhbHVlKSAmJiBpc051bWJlcihiVmFsdWUpKSB7XHJcbiAgICAgICAgcmV0dXJuICgxKSAqICh0aGlzLnNvcnQuZGlyZWN0aW9uID09PSAnYXNjJyA/IDEgOiAtMSk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGlzTnVtYmVyKGFWYWx1ZSkgJiYgaXNTdHJpbmcoYlZhbHVlKSkge1xyXG4gICAgICAgIHJldHVybiAoLTEpICogKHRoaXMuc29ydC5kaXJlY3Rpb24gPT09ICdhc2MnID8gMSA6IC0xKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQ29tcGFyZSBhcyBOdW1iZXJzIG90aGVyd2lzZVxyXG4gICAgICByZXR1cm4gKGFWYWx1ZSA+IGJWYWx1ZSA/IDEgOiAtMSkgKiAodGhpcy5zb3J0LmRpcmVjdGlvbiA9PT0gJ2FzYycgPyAxIDogLTEpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxufVxyXG4iXX0=