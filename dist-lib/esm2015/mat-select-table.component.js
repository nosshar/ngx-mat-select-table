/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, forwardRef, Input, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
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
        /**
         * Subject that emits when the component has been destroyed.
         */
        this._onDestroy = new Subject();
        this._onSelectOpen = new Subject();
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
                this.close.emit(!opened);
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
                this._onSelectOpen.pipe(takeUntil(this._onDestroy), debounceTime(1), take(1)).subscribe((/**
                 * @return {?}
                 */
                () => {
                    /** @type {?} */
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
                }));
            }
        }));
    }
    /**
     * @return {?}
     */
    ngAfterViewInit() {
        merge(...[
            this._onOptionsChange,
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
        this._onSelectOpen.complete();
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
                ((this.dataSource || { data: [] }).data || [])
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
                ((this.dataSource || { data: [] }).data || [])
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
            if (this.addNullRow()) {
                this.tableDataSource.unshift(this.nullRow);
            }
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
        if (!isNullOrUndefined(this.triggerLabelSort)) {
            this.sortData(value, this.triggerLabelSort.active, this.triggerLabelSort.direction);
        }
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
        this.completeValueList.splice(0);
        if (isNullOrUndefined(value)) {
            return;
        }
        /** @type {?} */
        const valueArray = !isArray(value) ? [value] : value;
        valueArray
            .filter((/**
         * @param {?} valueId
         * @return {?}
         */
        valueId => !isNullOrUndefined(valueId)))
            .forEach((/**
         * @param {?} valueId
         * @return {?}
         */
        valueId => {
            ((this.dataSource || { data: [] }).data || [])
                .filter((/**
             * @param {?} row
             * @return {?}
             */
            row => !isNullOrUndefined(row) && !isNullOrUndefined(row.id) && row.id === valueId))
                .forEach((/**
             * @param {?} row
             * @return {?}
             */
            row => {
                this.completeRowList.push(row);
                this.completeValueList.push(row.id);
            }));
        }));
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
                if (isNullOrUndefined(row)) {
                    return;
                }
                /** @type {?} */
                const cellValue = row[filterKey];
                if (isNullOrUndefined(cellValue)) {
                    data.splice(i, 1).forEach((/**
                     * @param {?} item
                     * @return {?}
                     */
                    item => this.filteredOutRows[`${item.id}`] = item));
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
                return ((/** @type {?} */ (aValue))).localeCompare((/** @type {?} */ (bValue))) * (direction === 'asc' ? 1 : -1);
            }
            // Try to convert to a Number type
            aValue = isNaN((/** @type {?} */ (aValue))) ? `${aValue}` : +aValue;
            bValue = isNaN((/** @type {?} */ (bValue))) ? `${bValue}` : +bValue;
            // if one is number and other is String
            if (isString(aValue) && isNumber(bValue)) {
                return (1) * (direction === 'asc' ? 1 : -1);
            }
            if (isNumber(aValue) && isString(bValue)) {
                return (-1) * (direction === 'asc' ? 1 : -1);
            }
            // Compare as Numbers otherwise
            return (aValue > bValue ? 1 : -1) * (direction === 'asc' ? 1 : -1);
        }));
    }
    /**
     * @return {?}
     */
    addNullRow() {
        return !this.multiple && !isNullOrUndefined(this.labelForNullValue);
    }
}
MatSelectTableComponent.decorators = [
    { type: Component, args: [{
                selector: 'ngx-mat-select-table',
                template: "<mat-form-field>\r\n  <mat-select #componentSelect\r\n              [multiple]=\"multiple\"\r\n              disableRipple>\r\n\r\n    <mat-select-trigger>\r\n      <ng-container *ngIf=\"!customTriggerLabelFn\">{{simpleTriggerLabelFn(completeRowList)}}</ng-container>\r\n      <ng-container *ngIf=\"customTriggerLabelFn\">{{customTriggerLabelFn(completeRowList)}}</ng-container>\r\n    </mat-select-trigger>\r\n\r\n    <ngx-mat-select-search *ngIf=\"overallSearchEnabled\"\r\n                           [formControl]=\"overallFilterControl\"\r\n                           [clearSearchInput]=\"resetFiltersOnOpen\"\r\n                           [ngClass]=\"{hidden: overallSearchVisibleState !== true}\">\r\n      <mat-icon *ngIf=\"matSelectSearchConfigurator?.clearIcon\"\r\n                ngxMatSelectSearchClear\r\n                color=\"primary\">{{matSelectSearchConfigurator.clearIcon}}</mat-icon>\r\n    </ngx-mat-select-search>\r\n    <mat-icon *ngIf=\"overallSearchEnabled\"\r\n              (click)=\"toggleOverallSearch()\"\r\n              class=\"overall-search-toggle\"\r\n              color=\"primary\">{{overallSearchVisibleState ? 'arrow_back' : 'search'}}</mat-icon>\r\n\r\n    <table #table\r\n           mat-table\r\n           matSort\r\n           [dataSource]=\"tableDataSource\">\r\n\r\n      <ng-container *ngFor=\"let columnKey of tableColumns; let i = index\"\r\n                    [matColumnDef]=\"columnKey\"\r\n                    [ngSwitch]=\"columnKey\">\r\n\r\n        <ng-container *ngSwitchCase=\"'_selection'\">\r\n          <th mat-header-cell *matHeaderCellDef [ngClass]=\"{selection: true, hidden: !multiple}\"></th>\r\n          <td mat-cell *matCellDef=\"let row\" [ngClass]=\"{selection: true, hidden: !multiple}\">\r\n            <mat-option [value]=\"row.id\"></mat-option>\r\n          </td>\r\n        </ng-container>\r\n\r\n        <ng-container *ngSwitchDefault>\r\n          <th mat-header-cell\r\n              mat-sort-header\r\n              [disabled]=\"!tableColumnsMap.get(columnKey).sortable\"\r\n              *matHeaderCellDef>\r\n            <!-- Header cell -->\r\n            <ng-container [ngSwitch]=\"tableColumnsMap.get(columnKey).filter?.type\">\r\n              <ng-container *ngSwitchCase=\"'string'\"\r\n                            [ngTemplateOutlet]=\"filterTypeString\"\r\n                            [ngTemplateOutletContext]=\"{column: tableColumnsMap.get(columnKey)}\"></ng-container>\r\n\r\n              <div *ngSwitchDefault>{{tableColumnsMap.get(columnKey).name}}</div>\r\n            </ng-container>\r\n          </th>\r\n          <td mat-cell *matCellDef=\"let row\"\r\n              [colSpan]=\"addNullRow() && row.id === null && i === 1 ? tableColumns.length : 1\"\r\n              [ngStyle]=\"{display: addNullRow() && row.id === null && i !== 1 ? 'none' : ''}\"\r\n          >\r\n            {{addNullRow() && row.id === null && i === 1 ? labelForNullValue : row[columnKey]}}\r\n          </td>\r\n        </ng-container>\r\n\r\n      </ng-container>\r\n\r\n      <tr mat-header-row *matHeaderRowDef=\"tableColumns; sticky: true\"></tr>\r\n      <tr mat-row *matRowDef=\"let row; columns: tableColumns; let i = index\"\r\n          (click)=\"emulateMatOptionClick($event)\"\r\n          [ngClass]=\"{active: i === tableActiveRow}\"></tr>\r\n    </table>\r\n\r\n  </mat-select>\r\n</mat-form-field>\r\n\r\n<ng-template #filterTypeString\r\n             let-column='column'>\r\n  <mat-form-field\r\n    (click)=\"$event.stopPropagation()\"\r\n    class=\"filter\">\r\n    <input matInput\r\n           [formControl]=\"filterFormControl(column.key)\"\r\n           (keydown)=\"$event.stopPropagation()\"\r\n           (keyup)=\"$event.stopPropagation()\"\r\n           (keypress)=\"$event.stopPropagation()\"\r\n           [placeholder]=\"column.name\"/>\r\n  </mat-form-field>\r\n</ng-template>\r\n",
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
                styles: [":host{display:block}:host mat-form-field{width:100%}::ng-deep .mat-select-panel.mat-select-search-table-panel{overflow-x:auto!important}::ng-deep .mat-select-panel.mat-select-search-table-panel .overall-search-toggle{z-index:102;position:absolute;left:13px;top:17px;cursor:pointer}::ng-deep .mat-select-panel.mat-select-search-table-panel ngx-mat-select-search{position:absolute;z-index:101}::ng-deep .mat-select-panel.mat-select-search-table-panel ngx-mat-select-search.hidden{display:none}::ng-deep .mat-select-panel.mat-select-search-table-panel ngx-mat-select-search .mat-select-search-inner{height:56px}::ng-deep .mat-select-panel.mat-select-search-table-panel ngx-mat-select-search .mat-select-search-inner .mat-select-search-input{margin-left:26px;width:calc(100% - 26px)}::ng-deep .mat-select-panel.mat-select-search-table-panel table{width:100%}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr{cursor:pointer;height:48px;max-height:48px}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr mat-option{height:48px;max-height:48px}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr.active{background:rgba(0,0,0,.04)}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr td{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;border-bottom:0!important;box-shadow:inset 0 -1px 0 0 rgba(0,0,0,.12)}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th ::ng-deep .mat-sort-header-container{height:55px}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th ::ng-deep .mat-sort-header-container mat-form-field .mat-form-field-infix{width:initial}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th[aria-sort] ::ng-deep .mat-sort-header-arrow{opacity:1!important}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr td mat-option,::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th mat-option{background:0 0!important}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr td.selection,::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th.selection{width:56px;padding:0;margin:0}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr td.selection.hidden mat-option,::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th.selection.hidden mat-option{visibility:hidden}"]
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
    triggerLabelSort: [{ type: Input }],
    customTriggerLabelTemplate: [{ type: Input }],
    labelForNullValue: [{ type: Input }],
    matSelectConfigurator: [{ type: Input }],
    matSelectSearchConfigurator: [{ type: Input }],
    defaultSort: [{ type: Input }],
    close: [{ type: Output }],
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
     * Sort option for values in the customTriggerLabelFn in Multiple mode.
     * @type {?}
     */
    MatSelectTableComponent.prototype.triggerLabelSort;
    /**
     * Template to customize the default trigger label. Has lesser priority than {\@see MatSelectTableComponent#customTriggerLabelFn}.
     * Substitution is case sensitive.
     * Example: ${name} ${id} - ${address}
     * @type {?}
     */
    MatSelectTableComponent.prototype.customTriggerLabelTemplate;
    /** @type {?} */
    MatSelectTableComponent.prototype.labelForNullValue;
    /**
     * @type {?}
     * @private
     */
    MatSelectTableComponent.prototype.nullRow;
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
    /** @type {?} */
    MatSelectTableComponent.prototype.close;
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
    MatSelectTableComponent.prototype._onSelectOpen;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0LXNlbGVjdC10YWJsZS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9uZ3gtbWF0LXNlbGVjdC10YWJsZS8iLCJzb3VyY2VzIjpbIm1hdC1zZWxlY3QtdGFibGUuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxPQUFPLEVBRUwsdUJBQXVCLEVBQ3ZCLGlCQUFpQixFQUNqQixTQUFTLEVBQ1QsVUFBVSxFQUFFLFlBQVksRUFDeEIsVUFBVSxFQUNWLEtBQUssRUFHRyxNQUFNLEVBQ2QsU0FBUyxFQUVULFNBQVMsRUFDVCxZQUFZLEVBQ2IsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUF1QixXQUFXLEVBQUUsU0FBUyxFQUFFLGlCQUFpQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDL0YsT0FBTyxFQUFDLEtBQUssRUFBRSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDcEMsT0FBTyxFQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBMEMsTUFBTSxtQkFBbUIsQ0FBQztBQUNuSCxPQUFPLEVBQUMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFHcEUsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ3JELE9BQU8sRUFBQyxZQUFZLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRzdELE9BQU8sRUFBQyx3QkFBd0IsRUFBQyxNQUFNLHVCQUF1QixDQUFDOztNQUV6RCxnQkFBZ0IsR0FBRyxnQkFBZ0I7QUFnQnpDLE1BQU0sT0FBTyx1QkFBdUI7Ozs7SUErR2xDLFlBQW9CLEVBQXFCO1FBQXJCLE9BQUUsR0FBRixFQUFFLENBQW1CO1FBdEVqQyxZQUFPLEdBQXNCLEVBQUMsRUFBRSxFQUFFLElBQUksRUFBQyxDQUFDO1FBb0J0QyxVQUFLLEdBQTBCLElBQUksWUFB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S0FBSzswQkFLTCxLQUFLO29CQUVMLE1BQU07d0JBRU4sU0FBUyxTQUFDLGlCQUFpQjs4QkFFM0IsU0FBUyxTQUFDLHdCQUF3QjttQkFFbEMsU0FBUyxTQUFDLE9BQU87b0JBRWpCLFNBQVMsU0FBQyxRQUFRO3VCQUVsQixTQUFTLFNBQUMsT0FBTyxFQUFFLEVBQUMsSUFBSSxFQUFFLFVBQVUsRUFBQzt5QkFFckMsWUFBWSxTQUFDLFNBQVM7Ozs7Ozs7SUF0RXZCLDZDQUFpRTs7Ozs7O0lBTWpFLDJDQUEyQjs7Ozs7SUFHM0IsdURBQXVDOzs7OztJQUd2Qyx1REFBdUM7Ozs7O0lBR3ZDLGtEQUFrQzs7Ozs7SUFHbEMscURBQXFDOzs7OztJQUtyQyx1REFBc0U7Ozs7O0lBS3RFLG1EQUFnQzs7Ozs7OztJQU9oQyw2REFBNEM7O0lBRTVDLG9EQUFtQzs7Ozs7SUFDbkMsMENBQWdEOzs7Ozs7SUFNaEQsd0RBQXVEOzs7Ozs7O0lBT3ZELDhEQUE2RDs7Ozs7SUFLN0QsOENBQTJCOztJQUUzQix3Q0FBNEQ7Ozs7O0lBRTVELDRDQUEyRDs7Ozs7SUFFM0Qsa0RBQXVGOzs7OztJQUV2Rix1Q0FBMEM7Ozs7O0lBRTFDLHdDQUFnRTs7Ozs7SUFFaEUsMkNBQXFFOzs7OztJQUVyRSw2Q0FBa0U7O0lBRWxFLGtEQUFxQzs7SUFFckMsK0NBQXVCOztJQUV2QixrREFBbUQ7O0lBRW5ELGlEQUF1Qjs7SUFFdkIsa0RBQXNEOztJQUV0RCxrREFBMEM7O0lBRTFDLDREQUFtQzs7SUFFbkMsdURBQWtDOzs7OztJQUVsQyxpREFBa0M7Ozs7O0lBRWxDLG9EQUFzQzs7Ozs7SUFFdEMsMkRBT0U7Ozs7OztJQUdGLDZDQUF5Qzs7Ozs7SUFFekMsZ0RBQTRDOzs7OztJQUU1QyxtREFBK0M7Ozs7O0lBRW5DLHFDQUE2QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XHJcbiAgQWZ0ZXJWaWV3SW5pdCxcclxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcclxuICBDaGFuZ2VEZXRlY3RvclJlZixcclxuICBDb21wb25lbnQsXHJcbiAgRWxlbWVudFJlZiwgRXZlbnRFbWl0dGVyLFxyXG4gIGZvcndhcmRSZWYsXHJcbiAgSW5wdXQsXHJcbiAgT25DaGFuZ2VzLFxyXG4gIE9uRGVzdHJveSxcclxuICBPbkluaXQsIE91dHB1dCxcclxuICBRdWVyeUxpc3QsXHJcbiAgU2ltcGxlQ2hhbmdlcyxcclxuICBWaWV3Q2hpbGQsXHJcbiAgVmlld0NoaWxkcmVuXHJcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7Q29udHJvbFZhbHVlQWNjZXNzb3IsIEZvcm1Db250cm9sLCBGb3JtR3JvdXAsIE5HX1ZBTFVFX0FDQ0VTU09SfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XHJcbmltcG9ydCB7bWVyZ2UsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQge01hdE9wdGlvbiwgTWF0U2VsZWN0LCBNYXRTb3J0LCBNYXRUYWJsZSwgTWF0VGFibGVEYXRhU291cmNlLCBTb3J0LCBTb3J0RGlyZWN0aW9ufSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbCc7XHJcbmltcG9ydCB7aXNBcnJheSwgaXNOdWxsT3JVbmRlZmluZWQsIGlzTnVtYmVyLCBpc1N0cmluZ30gZnJvbSAndXRpbCc7XHJcbmltcG9ydCB7TWF0U2VsZWN0VGFibGVEYXRhU291cmNlfSBmcm9tICcuL01hdFNlbGVjdFRhYmxlRGF0YVNvdXJjZSc7XHJcbmltcG9ydCB7TWF0U2VsZWN0VGFibGVSb3d9IGZyb20gJy4vTWF0U2VsZWN0VGFibGVSb3cnO1xyXG5pbXBvcnQge19pc051bWJlclZhbHVlfSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xyXG5pbXBvcnQge2RlYm91bmNlVGltZSwgdGFrZSwgdGFrZVVudGlsfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XHJcbmltcG9ydCB7TWF0U2VsZWN0VGFibGVDb2x1bW59IGZyb20gJy4vTWF0U2VsZWN0VGFibGVDb2x1bW4nO1xyXG5pbXBvcnQge01hdFNlbGVjdFRhYmxlRmlsdGVyfSBmcm9tICcuL01hdFNlbGVjdFRhYmxlRmlsdGVyJztcclxuaW1wb3J0IHtNYXRTZWxlY3RTZWFyY2hDb21wb25lbnR9IGZyb20gJ25neC1tYXQtc2VsZWN0LXNlYXJjaCc7XHJcblxyXG5jb25zdCBNQVhfU0FGRV9JTlRFR0VSID0gOTAwNzE5OTI1NDc0MDk5MTtcclxuXHJcbkBDb21wb25lbnQoe1xyXG4gIHNlbGVjdG9yOiAnbmd4LW1hdC1zZWxlY3QtdGFibGUnLFxyXG4gIHRlbXBsYXRlVXJsOiAnLi9tYXQtc2VsZWN0LXRhYmxlLmNvbXBvbmVudC5odG1sJyxcclxuICBzdHlsZVVybHM6IFsnLi9tYXQtc2VsZWN0LXRhYmxlLmNvbXBvbmVudC5zY3NzJ10sXHJcbiAgZXhwb3J0QXM6ICduZ3gtbWF0LXNlbGVjdC10YWJsZScsXHJcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXHJcbiAgcHJvdmlkZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIHByb3ZpZGU6IE5HX1ZBTFVFX0FDQ0VTU09SLFxyXG4gICAgICB1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBNYXRTZWxlY3RUYWJsZUNvbXBvbmVudCksXHJcbiAgICAgIG11bHRpOiB0cnVlXHJcbiAgICB9XHJcbiAgXVxyXG59KVxyXG5leHBvcnQgY2xhc3MgTWF0U2VsZWN0VGFibGVDb21wb25lbnQgaW1wbGVtZW50cyBDb250cm9sVmFsdWVBY2Nlc3NvciwgT25Jbml0LCBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3ksIE9uQ2hhbmdlcyB7XHJcblxyXG4gIC8qKiBEYXRhIFNvdXJjZSBmb3IgdGhlIHRhYmxlICovXHJcbiAgQElucHV0KCkgZGF0YVNvdXJjZTogTWF0U2VsZWN0VGFibGVEYXRhU291cmNlPE1hdFNlbGVjdFRhYmxlUm93PjtcclxuXHJcbiAgLyoqXHJcbiAgICogTXVsdGlwbGUvU2luZ2xlIG1vZGUgZm9yIHtAc2VlIE1hdFNlbGVjdCNtdWx0aXBsZX0gdG8gaW5pdGlhbGl6ZS5cclxuICAgKiBOQjogc3dpdGNoaW5nIGJldHdlZW4gbW9kZXMgaW4gcnVudGltZSBpcyBub3Qgc3VwcG9ydGVkIGJ5IHtAc2VlIE1hdFNlbGVjdH1cclxuICAgKi9cclxuICBASW5wdXQoKSBtdWx0aXBsZTogYm9vbGVhbjtcclxuXHJcbiAgLyoqIFdoZXRoZXIgb3Igbm90IG92ZXJhbGwgc2VhcmNoIG1vZGUgZW5hYmxlZC4gU2VlIHtAc2VlIE1hdFNlbGVjdFRhYmxlQ29tcG9uZW50fSAqL1xyXG4gIEBJbnB1dCgpIG92ZXJhbGxTZWFyY2hFbmFibGVkOiBib29sZWFuO1xyXG5cclxuICAvKiogRGVmYXVsdCBpcyB0cnVlICovXHJcbiAgQElucHV0KCkgb3ZlcmFsbFNlYXJjaFZpc2libGU6IGJvb2xlYW47XHJcblxyXG4gIC8qKiBXaGV0aGVyIG9yIG5vdCBzaG91bGQge0BzZWUgTWF0U2VsZWN0VGFibGVDb21wb25lbnR9IGJlIHZpc2libGUgb24gb3Blbi4gRGVmYXVsdCBpcyB0cnVlICovXHJcbiAgQElucHV0KCkgcmVzZXRTb3J0T25PcGVuOiBib29sZWFuO1xyXG5cclxuICAvKiogV2hldGhlciBvciBub3QgcHJldmlvdXMgc2VhcmNoIHNob3VsZCBiZSBjbGVhcmVkIG9uIG9wZW4uIERlZmF1bHQgaXMgdHJ1ZSAqL1xyXG4gIEBJbnB1dCgpIHJlc2V0RmlsdGVyc09uT3BlbjogYm9vbGVhbjtcclxuXHJcbiAgLyoqXHJcbiAgICogRnVuY3Rpb24gdG8gY3VzdG9taXplIHRoZSBkZWZhdWx0IGxhYmVsXHJcbiAgICovXHJcbiAgQElucHV0KCkgY3VzdG9tVHJpZ2dlckxhYmVsRm46ICh2YWx1ZTogTWF0U2VsZWN0VGFibGVSb3dbXSkgPT4gc3RyaW5nO1xyXG5cclxuICAvKipcclxuICAgKiBTb3J0IG9wdGlvbiBmb3IgdmFsdWVzIGluIHRoZSBjdXN0b21UcmlnZ2VyTGFiZWxGbiBpbiBNdWx0aXBsZSBtb2RlLlxyXG4gICAgKi9cclxuICBASW5wdXQoKSB0cmlnZ2VyTGFiZWxTb3J0OiBTb3J0O1xyXG5cclxuICAvKipcclxuICAgKiBUZW1wbGF0ZSB0byBjdXN0b21pemUgdGhlIGRlZmF1bHQgdHJpZ2dlciBsYWJlbC4gSGFzIGxlc3NlciBwcmlvcml0eSB0aGFuIHtAc2VlIE1hdFNlbGVjdFRhYmxlQ29tcG9uZW50I2N1c3RvbVRyaWdnZXJMYWJlbEZufS5cclxuICAgKiBTdWJzdGl0dXRpb24gaXMgY2FzZSBzZW5zaXRpdmUuXHJcbiAgICogRXhhbXBsZTogJHtuYW1lfSAke2lkfSAtICR7YWRkcmVzc31cclxuICAgKi9cclxuICBASW5wdXQoKSBjdXN0b21UcmlnZ2VyTGFiZWxUZW1wbGF0ZTogc3RyaW5nO1xyXG5cclxuICBASW5wdXQoKSBsYWJlbEZvck51bGxWYWx1ZTogc3RyaW5nO1xyXG4gIHByaXZhdGUgbnVsbFJvdzogTWF0U2VsZWN0VGFibGVSb3cgPSB7aWQ6IG51bGx9O1xyXG5cclxuICAvKipcclxuICAgKiB7QHNlZSBNYXRTZWxlY3R9IHByb3h5IGlucHV0cyBjb25maWd1cmF0b3JcclxuICAgKiB7QHNlZSBNYXRTZWxlY3QjbXVsdGlwbGV9IGdldHMgdmFsdWUgZnJvbSB7QHNlZSBNYXRTZWxlY3RUYWJsZUNvbXBvbmVudCNtdWx0aXBsZX1cclxuICAgKi9cclxuICBASW5wdXQoKSBtYXRTZWxlY3RDb25maWd1cmF0b3I6IHsgW2tleTogc3RyaW5nXTogYW55IH07XHJcblxyXG4gIC8qKlxyXG4gICAqIHtAc2VlIE1hdFNlbGVjdFNlYXJjaENvbXBvbmVudH0gcHJveHkgaW5wdXRzIGNvbmZpZ3VyYXRvclxyXG4gICAqIHtAc2VlIE1hdFNlbGVjdFNlYXJjaENvbXBvbmVudCNjbGVhclNlYXJjaElucHV0fSBnZXRzIHZhbHVlIGZyb20ge0BzZWUgTWF0U2VsZWN0VGFibGVDb21wb25lbnQjcmVzZXRGaWx0ZXJzT25PcGVufVxyXG4gICAqIHtAc2VlIE1hdFNlbGVjdFNlYXJjaENvbXBvbmVudH0ge0BzZWUgQ29udHJvbFZhbHVlQWNjZXNzb3J9IGdldHMgdmFsdWUgZnJvbSB7QHNlZSBNYXRTZWxlY3RUYWJsZUNvbXBvbmVudCNvdmVyYWxsRmlsdGVyQ29udHJvbH1cclxuICAgKi9cclxuICBASW5wdXQoKSBtYXRTZWxlY3RTZWFyY2hDb25maWd1cmF0b3I6IHsgW2tleTogc3RyaW5nXTogYW55IH07XHJcblxyXG4gIC8qKlxyXG4gICAqIEFwcGx5IGRlZmF1bHQgc29ydGluZ1xyXG4gICAqL1xyXG4gIEBJbnB1dCgpIGRlZmF1bHRTb3J0OiBTb3J0O1xyXG5cclxuICBAT3V0cHV0KCkgY2xvc2U6IEV2ZW50RW1pdHRlcjxib29sZWFuPiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuXHJcbiAgQFZpZXdDaGlsZCgnY29tcG9uZW50U2VsZWN0JykgcHJpdmF0ZSBtYXRTZWxlY3Q6IE1hdFNlbGVjdDtcclxuXHJcbiAgQFZpZXdDaGlsZChNYXRTZWxlY3RTZWFyY2hDb21wb25lbnQpIHByaXZhdGUgbWF0U2VsZWN0U2VhcmNoOiBNYXRTZWxlY3RTZWFyY2hDb21wb25lbnQ7XHJcblxyXG4gIEBWaWV3Q2hpbGQoTWF0U29ydCkgcHJpdmF0ZSBzb3J0OiBNYXRTb3J0O1xyXG5cclxuICBAVmlld0NoaWxkKE1hdFRhYmxlKSBwcml2YXRlIHRhYmxlOiBNYXRUYWJsZTxNYXRTZWxlY3RUYWJsZVJvdz47XHJcblxyXG4gIEBWaWV3Q2hpbGQoJ3RhYmxlJywge3JlYWQ6IEVsZW1lbnRSZWZ9KSBwcml2YXRlIHRhYmxlUmVmOiBFbGVtZW50UmVmO1xyXG5cclxuICBAVmlld0NoaWxkcmVuKE1hdE9wdGlvbikgcHJpdmF0ZSBtYXRPcHRpb25zOiBRdWVyeUxpc3Q8TWF0T3B0aW9uPjtcclxuXHJcbiAgdGFibGVEYXRhU291cmNlOiBNYXRTZWxlY3RUYWJsZVJvd1tdO1xyXG5cclxuICB0YWJsZUNvbHVtbnM6IHN0cmluZ1tdO1xyXG5cclxuICB0YWJsZUNvbHVtbnNNYXA6IE1hcDxzdHJpbmcsIE1hdFNlbGVjdFRhYmxlQ29sdW1uPjtcclxuXHJcbiAgdGFibGVBY3RpdmVSb3c6IG51bWJlcjtcclxuXHJcbiAgZmlsdGVyZWRPdXRSb3dzOiB7IFtrZXk6IHN0cmluZ106IE1hdFNlbGVjdFRhYmxlUm93IH07XHJcblxyXG4gIGNvbXBsZXRlUm93TGlzdDogTWF0U2VsZWN0VGFibGVSb3dbXSA9IFtdO1xyXG5cclxuICBvdmVyYWxsU2VhcmNoVmlzaWJsZVN0YXRlOiBib29sZWFuO1xyXG5cclxuICBvdmVyYWxsRmlsdGVyQ29udHJvbDogRm9ybUNvbnRyb2w7XHJcblxyXG4gIHByaXZhdGUgZmlsdGVyQ29udHJvbHM6IEZvcm1Hcm91cDtcclxuXHJcbiAgcHJpdmF0ZSBjb21wbGV0ZVZhbHVlTGlzdDogYW55W10gPSBbXTtcclxuXHJcbiAgcHJpdmF0ZSBjb250cm9sVmFsdWVBY2Nlc3NvcktleXM6IHN0cmluZ1tdID0gW1xyXG4gICAgJ2Zvcm1Db250cm9sJyxcclxuICAgICdmb3JtQ29udHJvbE5hbWUnLFxyXG4gICAgJ2Zvcm1Hcm91cCcsXHJcbiAgICAnZm9ybUdyb3VwTmFtZScsXHJcbiAgICAnZm9ybUFycmF5JyxcclxuICAgICdmb3JtQXJyYXlOYW1lJ1xyXG4gIF07XHJcblxyXG4gIC8qKiBTdWJqZWN0IHRoYXQgZW1pdHMgd2hlbiB0aGUgY29tcG9uZW50IGhhcyBiZWVuIGRlc3Ryb3llZC4gKi9cclxuICBwcml2YXRlIF9vbkRlc3Ryb3kgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xyXG5cclxuICBwcml2YXRlIF9vblNlbGVjdE9wZW4gPSBuZXcgU3ViamVjdDx2b2lkPigpO1xyXG5cclxuICBwcml2YXRlIF9vbk9wdGlvbnNDaGFuZ2UgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xyXG5cclxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGNkOiBDaGFuZ2VEZXRlY3RvclJlZikge1xyXG4gICAgdGhpcy50YWJsZUNvbHVtbnNNYXAgPSBuZXcgTWFwKCk7XHJcbiAgICB0aGlzLmZpbHRlckNvbnRyb2xzID0gbmV3IEZvcm1Hcm91cCh7fSk7XHJcbiAgICB0aGlzLm92ZXJhbGxGaWx0ZXJDb250cm9sID0gbmV3IEZvcm1Db250cm9sKCcnKTtcclxuICB9XHJcblxyXG4gIG5nT25Jbml0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5tdWx0aXBsZSA9IHRoaXMubXVsdGlwbGUgfHwgZmFsc2U7XHJcbiAgICB0aGlzLm1hdFNlbGVjdC5vcGVuZWRDaGFuZ2VcclxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX29uRGVzdHJveSkpXHJcbiAgICAgIC5zdWJzY3JpYmUob3BlbmVkID0+IHtcclxuICAgICAgICBpZiAodGhpcy5yZXNldEZpbHRlcnNPbk9wZW4gIT09IGZhbHNlIHx8ICF0aGlzLm1hdE9wdGlvbnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICB0aGlzLnJlc2V0RmlsdGVycygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLm92ZXJhbGxTZWFyY2hWaXNpYmxlU3RhdGUgPSB0aGlzLm92ZXJhbGxTZWFyY2hWaXNpYmxlO1xyXG4gICAgICAgIGlmICh0aGlzLnJlc2V0U29ydE9uT3BlbiAhPT0gZmFsc2UpIHtcclxuICAgICAgICAgIHRoaXMuc29ydC5zb3J0KHtpZDogJycsIHN0YXJ0OiAnYXNjJywgZGlzYWJsZUNsZWFyOiBmYWxzZX0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIW9wZW5lZCkge1xyXG4gICAgICAgICAgdGhpcy5jbG9zZS5lbWl0KCFvcGVuZWQpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5vdmVyYWxsU2VhcmNoRW5hYmxlZCkge1xyXG4gICAgICAgICAgdGhpcy5wcm94eU1hdFNlbGVjdFNlYXJjaENvbmZpZ3VyYXRpb24odGhpcy5tYXRTZWxlY3RTZWFyY2hDb25maWd1cmF0b3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBUb0RvOiBnZXQgcmlkIG9mIHRoaXMgd29ya2Fyb3VuZCAodXBkYXRlcyBoZWFkZXIgcm93IFtvdGhlcndpc2Ugc29ydCBtZWNoYW5pc20gcHJvZHVjZXMgZ2xpdGNoZXNdKVxyXG4gICAgICAgICh0aGlzLnRhYmxlIGFzIGFueSkuX2hlYWRlclJvd0RlZkNoYW5nZWQgPSB0cnVlO1xyXG4gICAgICAgIC8vIERpc2FibGUgc29ydCBidXR0b25zIHRvIHByZXZlbnQgc29ydGluZyBjaGFuZ2Ugb24gU1BBQ0Uga2V5IHByZXNzZWQgaW4gZmlsdGVyIGZpZWxkXHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiBbXS5mb3JFYWNoLmNhbGwoXHJcbiAgICAgICAgICB0aGlzLnRhYmxlUmVmLm5hdGl2ZUVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnYnV0dG9uLm1hdC1zb3J0LWhlYWRlci1idXR0b24nKSxcclxuICAgICAgICAgIChlKSA9PiBlLmRpc2FibGVkID0gdHJ1ZSlcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICAvLyBQYXRjaCB0aGUgaGVpZ2h0IG9mIHRoZSBwYW5lbCB0byBpbmNsdWRlIHRoZSBoZWlnaHQgb2YgdGhlIGhlYWRlciBhbmQgZm9vdGVyXHJcbiAgICAgICAgY29uc3QgcGFuZWxFbGVtZW50OiBIVE1MRGl2RWxlbWVudCA9IHRoaXMubWF0U2VsZWN0LnBhbmVsLm5hdGl2ZUVsZW1lbnQ7XHJcbiAgICAgICAgY29uc3QgcGFuZWxIZWlnaHQgPSBwYW5lbEVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xyXG4gICAgICAgIGxldCB0YWJsZUFkZGl0aW9uYWxIZWlnaHQgPSAwO1xyXG4gICAgICAgIHRoaXMudGFibGVcclxuICAgICAgICAgIC5fZ2V0UmVuZGVyZWRSb3dzKHRoaXMudGFibGUuX2hlYWRlclJvd091dGxldClcclxuICAgICAgICAgIC5jb25jYXQodGhpcy50YWJsZS5fZ2V0UmVuZGVyZWRSb3dzKHRoaXMudGFibGUuX2Zvb3RlclJvd091dGxldCkpXHJcbiAgICAgICAgICAuZm9yRWFjaChyb3cgPT4gdGFibGVBZGRpdGlvbmFsSGVpZ2h0ICs9IHJvdy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQpO1xyXG4gICAgICAgIGlmICghaXNOYU4ocGFuZWxIZWlnaHQpKSB7XHJcbiAgICAgICAgICBwYW5lbEVsZW1lbnQuc3R5bGUubWF4SGVpZ2h0ID0gYCR7cGFuZWxIZWlnaHQgKyB0YWJsZUFkZGl0aW9uYWxIZWlnaHR9cHhgO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLm1hdFNlbGVjdFNlYXJjaENvbmZpZ3VyYXRvci5kaXNhYmxlU2Nyb2xsVG9BY3RpdmVPbk9wdGlvbnNDaGFuZ2VkXHJcbiAgICAgICAgICAmJiAhaXNOdWxsT3JVbmRlZmluZWQodGhpcy5tYXRTZWxlY3QuX2tleU1hbmFnZXIpICYmIHRoaXMuY29tcGxldGVSb3dMaXN0Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgIHRoaXMuX29uU2VsZWN0T3Blbi5waXBlKHRha2VVbnRpbCh0aGlzLl9vbkRlc3Ryb3kpLCBkZWJvdW5jZVRpbWUoMSksIHRha2UoMSkpLnN1YnNjcmliZSgoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGZpcnN0VmFsdWUgPSBgJHt0aGlzLmNvbXBsZXRlUm93TGlzdFswXS5pZH1gO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMudGFibGVEYXRhU291cmNlLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGAke3RoaXMudGFibGVEYXRhU291cmNlW2ldLmlkfWAgPT09IGZpcnN0VmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubWF0U2VsZWN0Ll9rZXlNYW5hZ2VyLnNldEFjdGl2ZUl0ZW0oaSk7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICB0aGlzLmNkLmRldGVjdENoYW5nZXMoKTtcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGlnbm9yZWQpIHtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICB9XHJcblxyXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcclxuICAgIG1lcmdlKC4uLltcclxuICAgICAgdGhpcy5fb25PcHRpb25zQ2hhbmdlLFxyXG4gICAgICB0aGlzLnNvcnQuc29ydENoYW5nZSxcclxuICAgICAgdGhpcy5maWx0ZXJDb250cm9scy52YWx1ZUNoYW5nZXMsXHJcbiAgICAgIHRoaXMub3ZlcmFsbEZpbHRlckNvbnRyb2wudmFsdWVDaGFuZ2VzXHJcbiAgICBdKVxyXG4gICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5fb25EZXN0cm95KSwgZGVib3VuY2VUaW1lKDEwMCkpXHJcbiAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGRhdGFDbG9uZTogTWF0U2VsZWN0VGFibGVSb3dbXSA9IFsuLi4oKHRoaXMuZGF0YVNvdXJjZSB8fCB7ZGF0YTogW119KS5kYXRhIHx8IFtdKV07XHJcbiAgICAgICAgaWYgKHRoaXMuYWRkTnVsbFJvdygpKSB7XHJcbiAgICAgICAgICBkYXRhQ2xvbmUudW5zaGlmdCh0aGlzLm51bGxSb3cpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQXBwbHkgZmlsdGVyaW5nXHJcbiAgICAgICAgaWYgKHRoaXMub3ZlcmFsbFNlYXJjaEVuYWJsZWQgJiYgdGhpcy5vdmVyYWxsU2VhcmNoVmlzaWJsZVN0YXRlKSB7XHJcbiAgICAgICAgICB0aGlzLmFwcGx5T3ZlcmFsbEZpbHRlcihkYXRhQ2xvbmUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmFwcGx5Q29sdW1uTGV2ZWxGaWx0ZXJzKGRhdGFDbG9uZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJbmhlcml0IGRlZmF1bHQgc29ydGluZyBvcHRpb25zIGlmIHNvcnQgbm90IHNwZWNpZmllZFxyXG4gICAgICAgIGlmICghdGhpcy5zb3J0LmFjdGl2ZSAmJiAhaXNOdWxsT3JVbmRlZmluZWQodGhpcy5kZWZhdWx0U29ydCkgJiYgdGhpcy5kZWZhdWx0U29ydC5hY3RpdmUpIHtcclxuICAgICAgICAgIHRoaXMuc29ydC5hY3RpdmUgPSB0aGlzLmRlZmF1bHRTb3J0LmFjdGl2ZTtcclxuICAgICAgICAgIHRoaXMuc29ydC5kaXJlY3Rpb24gPSB0aGlzLmRlZmF1bHRTb3J0LmRpcmVjdGlvbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEFwcGx5IGRlZmF1bHQgb3IgbWFudWFsIHNvcnRpbmdcclxuICAgICAgICB0aGlzLnRhYmxlRGF0YVNvdXJjZSA9ICF0aGlzLnNvcnQuYWN0aXZlID9cclxuICAgICAgICAgIGRhdGFDbG9uZSA6IHRoaXMuc29ydERhdGEoZGF0YUNsb25lLCB0aGlzLnNvcnQuYWN0aXZlLCB0aGlzLnNvcnQuZGlyZWN0aW9uKTtcclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIHRoaXMuY2QuZGV0ZWN0Q2hhbmdlcygpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGlnbm9yZWQpIHtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX29uU2VsZWN0T3Blbi5uZXh0KCk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgIC8vIE1hbnVhbGx5IHNvcnQgZGF0YSBmb3IgdGhpcy5tYXRTZWxlY3Qub3B0aW9ucyAoUXVlcnlMaXN0PE1hdE9wdGlvbj4pIGFuZCBub3RpZnkgbWF0U2VsZWN0Lm9wdGlvbnMgb2YgY2hhbmdlc1xyXG4gICAgLy8gSXQncyBpbXBvcnRhbnQgdG8ga2VlcCB0aGlzLm1hdFNlbGVjdC5vcHRpb25zIG9yZGVyIHN5bmNocm9uaXplZCB3aXRoIGRhdGEgaW4gdGhlIHRhYmxlXHJcbiAgICAvLyAgICAgYmVjYXVzZSB0aGlzLm1hdFNlbGVjdC5vcHRpb25zIChRdWVyeUxpc3Q8TWF0T3B0aW9uPikgZG9lc24ndCB1cGRhdGUgaXQncyBzdGF0ZSBhZnRlciB0YWJsZSBkYXRhIGlzIGNoYW5nZWRcclxuICAgIHRoaXMubWF0T3B0aW9ucy5jaGFuZ2VzLnN1YnNjcmliZSgoKSA9PiB7XHJcbiAgICAgIGNvbnN0IG9wdGlvbnM6IHsgW2tleTogc3RyaW5nXTogTWF0T3B0aW9uIH0gPSB7fTtcclxuICAgICAgdGhpcy5tYXRPcHRpb25zLnRvQXJyYXkoKVxyXG4gICAgICAgIC5maWx0ZXIob3B0aW9uID0+ICFpc051bGxPclVuZGVmaW5lZChvcHRpb24pKVxyXG4gICAgICAgIC5mb3JFYWNoKG9wdGlvbiA9PiBvcHRpb25zW2Ake29wdGlvbi52YWx1ZX1gXSA9IG9wdGlvbik7XHJcbiAgICAgIHRoaXMubWF0U2VsZWN0Lm9wdGlvbnMucmVzZXQodGhpcy50YWJsZURhdGFTb3VyY2VcclxuICAgICAgICAuZmlsdGVyKHJvdyA9PiAhaXNOdWxsT3JVbmRlZmluZWQob3B0aW9uc1tgJHtyb3cuaWR9YF0pKVxyXG4gICAgICAgIC5tYXAocm93ID0+IG9wdGlvbnNbYCR7cm93LmlkfWBdKSk7XHJcbiAgICAgIHRoaXMubWF0U2VsZWN0Lm9wdGlvbnMubm90aWZ5T25DaGFuZ2VzKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKHRoaXMubWF0U2VsZWN0Ll9rZXlNYW5hZ2VyKSkge1xyXG4gICAgICAvLyBTdWJzY3JpYmUgb24gS2V5TWFuYWdlciBjaGFuZ2VzIHRvIGhpZ2hsaWdodCB0aGUgdGFibGUgcm93cyBhY2NvcmRpbmdseVxyXG4gICAgICB0aGlzLm1hdFNlbGVjdC5fa2V5TWFuYWdlci5jaGFuZ2VcclxuICAgICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5fb25EZXN0cm95KSlcclxuICAgICAgICAuc3Vic2NyaWJlKGFjdGl2ZVJvdyA9PiB0aGlzLnRhYmxlQWN0aXZlUm93ID0gYWN0aXZlUm93KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xyXG4gICAgdGhpcy5fb25TZWxlY3RPcGVuLmNvbXBsZXRlKCk7XHJcbiAgICB0aGlzLl9vbkRlc3Ryb3kubmV4dCgpO1xyXG4gICAgdGhpcy5fb25EZXN0cm95LmNvbXBsZXRlKCk7XHJcbiAgfVxyXG5cclxuICByZWdpc3Rlck9uQ2hhbmdlKGZuOiAodmFsdWU6IGFueSkgPT4gdm9pZCk6IHZvaWQge1xyXG4gICAgY29uc3QgcHJveHlGbjogKHZhbHVlOiBhbnkpID0+IHZvaWQgPSAodmFsdWU6IGFueSkgPT4ge1xyXG4gICAgICAvLyBUb0RvOiByZWZhY3RvciAtIGNvbXBhcmlzb24gbWVjaGFuaXNtIGlzbid0IG9wdGltaXplZC4gZmlsdGVyZWRPdXRSb3dzIGlzIGEgbWFwIGJ1dCBjb21wbGV0ZVZhbHVlTGlzdCBpcyBhbiBhcnJheVxyXG4gICAgICBpZiAodGhpcy5tdWx0aXBsZSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSB0aGlzLmNvbXBsZXRlVmFsdWVMaXN0Lmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICBpZiAodGhpcy5maWx0ZXJlZE91dFJvd3NbYCR7dGhpcy5jb21wbGV0ZVZhbHVlTGlzdFtpXX1gXSA9PT0gdW5kZWZpbmVkICYmIHZhbHVlLmluZGV4T2YodGhpcy5jb21wbGV0ZVZhbHVlTGlzdFtpXSkgPT09IC0xKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29tcGxldGVWYWx1ZUxpc3Quc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB2YWx1ZVxyXG4gICAgICAgICAgLmZpbHRlcihjaG9pY2UgPT4gdGhpcy5jb21wbGV0ZVZhbHVlTGlzdC5pbmRleE9mKGNob2ljZSkgPT09IC0xKVxyXG4gICAgICAgICAgLmZvckVhY2goY2hvaWNlID0+IHRoaXMuY29tcGxldGVWYWx1ZUxpc3QucHVzaChjaG9pY2UpKTtcclxuICAgICAgICB0aGlzLm1hdFNlbGVjdC52YWx1ZSA9IHRoaXMuY29tcGxldGVWYWx1ZUxpc3Q7XHJcbiAgICAgICAgZm4odGhpcy5jb21wbGV0ZVZhbHVlTGlzdCk7XHJcbiAgICAgICAgdGhpcy5jb21wbGV0ZVJvd0xpc3Quc3BsaWNlKDApO1xyXG4gICAgICAgICgodGhpcy5kYXRhU291cmNlIHx8IHtkYXRhOiBbXX0pLmRhdGEgfHwgW10pXHJcbiAgICAgICAgICAuZmlsdGVyKHJvdyA9PiB0aGlzLmNvbXBsZXRlVmFsdWVMaXN0LmluZGV4T2Yocm93LmlkKSAhPT0gLTEpXHJcbiAgICAgICAgICAuZm9yRWFjaChyb3cgPT4gdGhpcy5jb21wbGV0ZVJvd0xpc3QucHVzaChyb3cpKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBmbih2YWx1ZSk7XHJcbiAgICAgICAgdGhpcy5jb21wbGV0ZVJvd0xpc3Quc3BsaWNlKDApO1xyXG4gICAgICAgICgodGhpcy5kYXRhU291cmNlIHx8IHtkYXRhOiBbXX0pLmRhdGEgfHwgW10pXHJcbiAgICAgICAgICAuZmlsdGVyKHJvdyA9PiByb3cuaWQgPT09IHZhbHVlKVxyXG4gICAgICAgICAgLmZvckVhY2gocm93ID0+IHRoaXMuY29tcGxldGVSb3dMaXN0LnB1c2gocm93KSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICB0aGlzLm1hdFNlbGVjdC5yZWdpc3Rlck9uQ2hhbmdlKHByb3h5Rm4pO1xyXG4gIH1cclxuXHJcbiAgcmVnaXN0ZXJPblRvdWNoZWQoZm46ICgpID0+IHt9KTogdm9pZCB7XHJcbiAgICB0aGlzLm1hdFNlbGVjdC5yZWdpc3Rlck9uVG91Y2hlZChmbik7XHJcbiAgfVxyXG5cclxuICBzZXREaXNhYmxlZFN0YXRlKGlzRGlzYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgIHRoaXMubWF0U2VsZWN0LnNldERpc2FibGVkU3RhdGUoaXNEaXNhYmxlZCk7XHJcbiAgfVxyXG5cclxuICB3cml0ZVZhbHVlKHZhbHVlOiBhbnkpOiB2b2lkIHtcclxuICAgIHRoaXMudXBkYXRlQ29tcGxldGVSb3dMaXN0KHZhbHVlKTtcclxuICAgIHRoaXMubWF0U2VsZWN0LndyaXRlVmFsdWUodmFsdWUpO1xyXG4gICAgaWYgKHRoaXMubWF0U2VsZWN0LnZhbHVlICE9PSB2YWx1ZSkge1xyXG4gICAgICB0aGlzLm1hdFNlbGVjdC52YWx1ZSA9IHZhbHVlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcyk6IHZvaWQge1xyXG5cclxuICAgIGlmICghaXNOdWxsT3JVbmRlZmluZWQoY2hhbmdlcy5yZXNldEZpbHRlcnNPbk9wZW4pICYmIGNoYW5nZXMucmVzZXRGaWx0ZXJzT25PcGVuLmN1cnJlbnRWYWx1ZSAhPT0gZmFsc2UpIHtcclxuICAgICAgdGhpcy5yZXNldEZpbHRlcnMoKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKGNoYW5nZXMuZGF0YVNvdXJjZSkpIHtcclxuICAgICAgdGhpcy51cGRhdGVDb21wbGV0ZVJvd0xpc3QodGhpcy5jb21wbGV0ZVJvd0xpc3QubWFwKHJvdyA9PiByb3cuaWQpKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBQcm94eSBASW5wdXQgYmluZGluZ3MgdG8gTWF0U2VsZWN0XHJcbiAgICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKGNoYW5nZXMubWF0U2VsZWN0Q29uZmlndXJhdG9yKSkge1xyXG4gICAgICBjb25zdCBjb25maWd1cmF0aW9uID0gY2hhbmdlcy5tYXRTZWxlY3RDb25maWd1cmF0b3IuY3VycmVudFZhbHVlO1xyXG4gICAgICBPYmplY3Qua2V5cyhjb25maWd1cmF0aW9uKVxyXG4gICAgICAgIC5maWx0ZXIoa2V5ID0+ICFbJ211bHRpcGxlJywgJ3BhbmVsQ2xhc3MnXS5pbmNsdWRlcyhrZXkpICYmICF0aGlzLmNvbnRyb2xWYWx1ZUFjY2Vzc29yS2V5cy5pbmNsdWRlcyhrZXkpKVxyXG4gICAgICAgIC5mb3JFYWNoKGtleSA9PiB0aGlzLm1hdFNlbGVjdFtrZXldID0gY29uZmlndXJhdGlvbltrZXldKTtcclxuICAgICAgY29uc3QgcGFuZWxDbGFzczogc3RyaW5nW10gPSBbXTtcclxuICAgICAgcGFuZWxDbGFzcy5wdXNoKCdtYXQtc2VsZWN0LXNlYXJjaC10YWJsZS1wYW5lbCcpO1xyXG4gICAgICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKGNvbmZpZ3VyYXRpb24ucGFuZWxDbGFzcykpIHtcclxuICAgICAgICBwYW5lbENsYXNzLnB1c2goY29uZmlndXJhdGlvbi5wYW5lbENsYXNzKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAodGhpcy5vdmVyYWxsU2VhcmNoRW5hYmxlZCkge1xyXG4gICAgICAgIHBhbmVsQ2xhc3MucHVzaCgnbWF0LXNlbGVjdC1zZWFyY2gtcGFuZWwnKTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLm1hdFNlbGVjdC5wYW5lbENsYXNzID0gcGFuZWxDbGFzcztcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKGNoYW5nZXMubWF0U2VsZWN0U2VhcmNoQ29uZmlndXJhdG9yKSkge1xyXG4gICAgICB0aGlzLnByb3h5TWF0U2VsZWN0U2VhcmNoQ29uZmlndXJhdGlvbihjaGFuZ2VzLm1hdFNlbGVjdFNlYXJjaENvbmZpZ3VyYXRvci5jdXJyZW50VmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghaXNOdWxsT3JVbmRlZmluZWQoY2hhbmdlcy5kYXRhU291cmNlKVxyXG4gICAgICAmJiAhaXNOdWxsT3JVbmRlZmluZWQoY2hhbmdlcy5kYXRhU291cmNlLmN1cnJlbnRWYWx1ZSlcclxuICAgICAgJiYgaXNBcnJheShjaGFuZ2VzLmRhdGFTb3VyY2UuY3VycmVudFZhbHVlLmRhdGEpKSB7XHJcbiAgICAgIHRoaXMudGFibGVEYXRhU291cmNlID0gWy4uLmNoYW5nZXMuZGF0YVNvdXJjZS5jdXJyZW50VmFsdWUuZGF0YV07XHJcbiAgICAgIGlmICh0aGlzLmFkZE51bGxSb3coKSkge1xyXG4gICAgICAgIHRoaXMudGFibGVEYXRhU291cmNlLnVuc2hpZnQodGhpcy5udWxsUm93KTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLnRhYmxlQ29sdW1ucyA9IFsnX3NlbGVjdGlvbicsIC4uLmNoYW5nZXMuZGF0YVNvdXJjZS5jdXJyZW50VmFsdWUuY29sdW1ucy5tYXAoY29sdW1uID0+IGNvbHVtbi5rZXkpXTtcclxuICAgICAgdGhpcy50YWJsZUNvbHVtbnNNYXAuY2xlYXIoKTtcclxuICAgICAgY2hhbmdlcy5kYXRhU291cmNlLmN1cnJlbnRWYWx1ZS5jb2x1bW5zLmZvckVhY2goY29sdW1uID0+IHRoaXMudGFibGVDb2x1bW5zTWFwLnNldChjb2x1bW4ua2V5LCBjb2x1bW4pKTtcclxuICAgICAgdGhpcy5hcHBseVByb3h5VG9BcnJheShjaGFuZ2VzLmRhdGFTb3VyY2UuY3VycmVudFZhbHVlLmRhdGEsICgpID0+IHtcclxuICAgICAgICB0aGlzLl9vbk9wdGlvbnNDaGFuZ2UubmV4dCgpO1xyXG4gICAgICB9KTtcclxuICAgICAgdGhpcy5fb25PcHRpb25zQ2hhbmdlLm5leHQoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGVtdWxhdGVNYXRPcHRpb25DbGljayhldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xyXG4gICAgaWYgKGV2ZW50LmNvbXBvc2VkUGF0aCgpXHJcbiAgICAgIC5maWx0ZXIoZXQgPT4gZXQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudClcclxuICAgICAgLnNvbWUoKGV0OiBIVE1MRWxlbWVudCkgPT4gZXQudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnbWF0LW9wdGlvbicpKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGlmICghKGV2ZW50LnRhcmdldCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBsZXQgcm93RWxlbWVudCA9IGV2ZW50LnRhcmdldDtcclxuICAgIHdoaWxlIChyb3dFbGVtZW50ICE9IG51bGwgJiYgcm93RWxlbWVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50ICYmIHJvd0VsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpICE9PSAndHInKSB7XHJcbiAgICAgIHJvd0VsZW1lbnQgPSByb3dFbGVtZW50LnBhcmVudEVsZW1lbnQ7XHJcbiAgICB9XHJcbiAgICBpZiAocm93RWxlbWVudCA9PT0gbnVsbCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBjb25zdCBjaGlsZE9wdGlvbjogSFRNTEVsZW1lbnQgPSByb3dFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ21hdC1vcHRpb24nKTtcclxuICAgIGlmICghY2hpbGRPcHRpb24pIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgY2hpbGRPcHRpb24uY2xpY2soKTtcclxuICB9XHJcblxyXG5cclxuICBmaWx0ZXJGb3JtQ29udHJvbChrZXk6IHN0cmluZyk6IEZvcm1Db250cm9sIHtcclxuICAgIGlmICghdGhpcy5maWx0ZXJDb250cm9scy5jb250YWlucyhrZXkpKSB7XHJcbiAgICAgIHRoaXMuZmlsdGVyQ29udHJvbHMucmVnaXN0ZXJDb250cm9sKGtleSwgbmV3IEZvcm1Db250cm9sKCcnKSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gPEZvcm1Db250cm9sPnRoaXMuZmlsdGVyQ29udHJvbHMuZ2V0KGtleSk7XHJcbiAgfVxyXG5cclxuICBzaW1wbGVUcmlnZ2VyTGFiZWxGbih2YWx1ZTogTWF0U2VsZWN0VGFibGVSb3dbXSk6IHN0cmluZyB7XHJcbiAgICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKHRoaXMudHJpZ2dlckxhYmVsU29ydCkpIHtcclxuICAgICAgdGhpcy5zb3J0RGF0YSh2YWx1ZSwgdGhpcy50cmlnZ2VyTGFiZWxTb3J0LmFjdGl2ZSwgdGhpcy50cmlnZ2VyTGFiZWxTb3J0LmRpcmVjdGlvbik7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdmFsdWUubWFwKHJvdyA9PiB7XHJcbiAgICAgIGlmIChpc051bGxPclVuZGVmaW5lZChyb3cpKSB7XHJcbiAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChpc051bGxPclVuZGVmaW5lZCh0aGlzLmN1c3RvbVRyaWdnZXJMYWJlbFRlbXBsYXRlKVxyXG4gICAgICAgIHx8IHR5cGVvZiB0aGlzLmN1c3RvbVRyaWdnZXJMYWJlbFRlbXBsYXRlICE9PSAnc3RyaW5nJ1xyXG4gICAgICAgIHx8IHRoaXMuY3VzdG9tVHJpZ2dlckxhYmVsVGVtcGxhdGUudHJpbSgpLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIHJldHVybiBgJHtyb3cuaWR9YDtcclxuICAgICAgfVxyXG4gICAgICBsZXQgYXRMZWFzdFBhcnRpYWxTdWJzdGl0dXRpb24gPSBmYWxzZTtcclxuICAgICAgY29uc3Qgc3Vic3RpdHV0aW9uOiBzdHJpbmcgPSB0aGlzLmN1c3RvbVRyaWdnZXJMYWJlbFRlbXBsYXRlLnJlcGxhY2UoL1skXXsxfVt7XXsxfShbXn1dKylbfV17MX0/L2csIChfLCBrZXkpID0+XHJcbiAgICAgICAgIWlzTnVsbE9yVW5kZWZpbmVkKHJvd1trZXldKSAmJiAoYXRMZWFzdFBhcnRpYWxTdWJzdGl0dXRpb24gPSB0cnVlKSA/IHJvd1trZXldIDogJycpO1xyXG4gICAgICBpZiAoYXRMZWFzdFBhcnRpYWxTdWJzdGl0dXRpb24gPT09IGZhbHNlKSB7XHJcbiAgICAgICAgcmV0dXJuIGAke3Jvdy5pZH1gO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBzdWJzdGl0dXRpb24udHJpbSgpO1xyXG4gICAgfSkuam9pbignLCAnKTtcclxuICB9XHJcblxyXG4gIHRvZ2dsZU92ZXJhbGxTZWFyY2goKTogdm9pZCB7XHJcbiAgICB0aGlzLm92ZXJhbGxTZWFyY2hWaXNpYmxlU3RhdGUgPSAhdGhpcy5vdmVyYWxsU2VhcmNoVmlzaWJsZVN0YXRlO1xyXG4gICAgdGhpcy5yZXNldEZpbHRlcnMoKTtcclxuICAgIGlmICh0aGlzLm92ZXJhbGxTZWFyY2hWaXNpYmxlU3RhdGUpIHtcclxuICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLm1hdFNlbGVjdFNlYXJjaC5fZm9jdXMoKSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHVwZGF0ZUNvbXBsZXRlUm93TGlzdCh2YWx1ZTogYW55W10pOiB2b2lkIHtcclxuICAgIHRoaXMuY29tcGxldGVSb3dMaXN0LnNwbGljZSgwKTtcclxuICAgIHRoaXMuY29tcGxldGVWYWx1ZUxpc3Quc3BsaWNlKDApO1xyXG4gICAgaWYgKGlzTnVsbE9yVW5kZWZpbmVkKHZhbHVlKSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBjb25zdCB2YWx1ZUFycmF5OiBhbnlbXSA9ICFpc0FycmF5KHZhbHVlKSA/IFt2YWx1ZV0gOiB2YWx1ZTtcclxuICAgIHZhbHVlQXJyYXlcclxuICAgICAgLmZpbHRlcih2YWx1ZUlkID0+ICFpc051bGxPclVuZGVmaW5lZCh2YWx1ZUlkKSlcclxuICAgICAgLmZvckVhY2godmFsdWVJZCA9PiB7XHJcbiAgICAgICAgKCh0aGlzLmRhdGFTb3VyY2UgfHwge2RhdGE6IFtdfSkuZGF0YSB8fCBbXSlcclxuICAgICAgICAgIC5maWx0ZXIocm93ID0+ICFpc051bGxPclVuZGVmaW5lZChyb3cpICYmICFpc051bGxPclVuZGVmaW5lZChyb3cuaWQpICYmIHJvdy5pZCA9PT0gdmFsdWVJZClcclxuICAgICAgICAgIC5mb3JFYWNoKHJvdyA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuY29tcGxldGVSb3dMaXN0LnB1c2gocm93KTtcclxuICAgICAgICAgICAgdGhpcy5jb21wbGV0ZVZhbHVlTGlzdC5wdXNoKHJvdy5pZCk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHByb3h5TWF0U2VsZWN0U2VhcmNoQ29uZmlndXJhdGlvbihjb25maWd1cmF0aW9uOiB7IFtrZXk6IHN0cmluZ106IGFueSB9KTogdm9pZCB7XHJcbiAgICBpZiAoaXNOdWxsT3JVbmRlZmluZWQodGhpcy5tYXRTZWxlY3RTZWFyY2gpKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBQcm94eSBASW5wdXQgYmluZGluZ3MgdG8gTmd4TWF0U2VsZWN0U2VhcmNoXHJcbiAgICBPYmplY3Qua2V5cyhjb25maWd1cmF0aW9uKVxyXG4gICAgICAuZmlsdGVyKGtleSA9PiAhWydjbGVhclNlYXJjaElucHV0J10uaW5jbHVkZXMoa2V5KSAmJiAhdGhpcy5jb250cm9sVmFsdWVBY2Nlc3NvcktleXMuaW5jbHVkZXMoa2V5KSlcclxuICAgICAgLmZvckVhY2goa2V5ID0+IHRoaXMubWF0U2VsZWN0U2VhcmNoW2tleV0gPSBjb25maWd1cmF0aW9uW2tleV0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhcHBseUNvbHVtbkxldmVsRmlsdGVycyhkYXRhOiBNYXRTZWxlY3RUYWJsZVJvd1tdKTogdm9pZCB7XHJcbiAgICB0aGlzLmZpbHRlcmVkT3V0Um93cyA9IHt9O1xyXG4gICAgY29uc3QgZmlsdGVyczogeyBba2V5OiBzdHJpbmddOiB7IGZpbHRlcjogTWF0U2VsZWN0VGFibGVGaWx0ZXIsIHZhbHVlOiBhbnkgfSB9ID0ge307XHJcbiAgICBPYmplY3Qua2V5cyh0aGlzLmZpbHRlckNvbnRyb2xzLmNvbnRyb2xzKVxyXG4gICAgICAuZmlsdGVyKGtleSA9PiB0aGlzLnRhYmxlQ29sdW1uc01hcC5oYXMoa2V5KVxyXG4gICAgICAgICYmICFpc051bGxPclVuZGVmaW5lZCh0aGlzLnRhYmxlQ29sdW1uc01hcC5nZXQoa2V5KS5maWx0ZXIpXHJcbiAgICAgICAgLy8gSWYgZmlsdGVyIGlzIGVuYWJsZWRcclxuICAgICAgICAmJiB0aGlzLnRhYmxlQ29sdW1uc01hcC5nZXQoa2V5KS5maWx0ZXIuZW5hYmxlZCAhPT0gZmFsc2UpXHJcbiAgICAgIC5maWx0ZXIoa2V5ID0+IHtcclxuICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuZmlsdGVyQ29udHJvbHMuZ2V0KGtleSkudmFsdWU7XHJcbiAgICAgICAgcmV0dXJuICFpc051bGxPclVuZGVmaW5lZCh2YWx1ZSlcclxuICAgICAgICAgIC8vIElmIGFuIGFycmF5IC0gY2hlY2sgaXQncyBub3QgZW1wdHlcclxuICAgICAgICAgICYmICgoaXNBcnJheSh2YWx1ZSkgJiYgdmFsdWUubGVuZ3RoID4gMClcclxuICAgICAgICAgICAgLy8gSWYgc3RyaW5nIC0gY2hlY2sgdGhhdCBub3QgYmxhbmtcclxuICAgICAgICAgICAgfHwgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdmFsdWUudHJpbSgpLmxlbmd0aCA+IDApXHJcbiAgICAgICAgICAgIC8vIElmIG51bWJlciAtIGNoZWNrIHRoYXQgdG9TdHJpbmcoKSBpcyBub3QgYmxhbmtcclxuICAgICAgICAgICAgfHwgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgYCR7dmFsdWV9YC50cmltKCkubGVuZ3RoID4gMCkpO1xyXG4gICAgICB9KVxyXG4gICAgICAuZm9yRWFjaChrZXkgPT4gZmlsdGVyc1trZXldID0ge1xyXG4gICAgICAgIGZpbHRlcjogdGhpcy50YWJsZUNvbHVtbnNNYXAuZ2V0KGtleSkuZmlsdGVyLFxyXG4gICAgICAgIHZhbHVlOiB0aGlzLmZpbHRlckNvbnRyb2xzLmdldChrZXkpLnZhbHVlXHJcbiAgICAgIH0pO1xyXG4gICAgY29uc3QgZmlsdGVyS2V5czogc3RyaW5nW10gPSBPYmplY3Qua2V5cyhmaWx0ZXJzKTtcclxuICAgIGZvciAobGV0IGkgPSBkYXRhLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgIGZvciAobGV0IGsgPSAwOyBrIDwgZmlsdGVyS2V5cy5sZW5ndGg7IGsrKykge1xyXG4gICAgICAgIGNvbnN0IGZpbHRlcktleTogc3RyaW5nID0gZmlsdGVyS2V5c1trXTtcclxuICAgICAgICBjb25zdCByb3c6IE1hdFNlbGVjdFRhYmxlUm93ID0gZGF0YVtpXTtcclxuXHRcdGlmIChpc051bGxPclVuZGVmaW5lZChyb3cpKSB7XHJcblx0XHQgIHJldHVybjtcclxuXHRcdH1cclxuICAgICAgICBjb25zdCBjZWxsVmFsdWU6IGFueSA9IHJvd1tmaWx0ZXJLZXldO1xyXG4gICAgICAgIGlmIChpc051bGxPclVuZGVmaW5lZChjZWxsVmFsdWUpKSB7XHJcbiAgICAgICAgICBkYXRhLnNwbGljZShpLCAxKS5mb3JFYWNoKGl0ZW0gPT4gdGhpcy5maWx0ZXJlZE91dFJvd3NbYCR7aXRlbS5pZH1gXSA9IGl0ZW0pO1xyXG4gICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGZpbHRlciA9IGZpbHRlcnNbZmlsdGVyS2V5XTtcclxuICAgICAgICBjb25zdCBjb21wYXJhdG9yID0gZmlsdGVyLmZpbHRlci5jb21wYXJhdG9yO1xyXG4gICAgICAgIGlmICh0eXBlb2YgZmlsdGVyLmZpbHRlci5jb21wYXJhdG9yRm4gPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgIGlmICghZmlsdGVyLmZpbHRlci5jb21wYXJhdG9yRm4uY2FsbChudWxsLCBjZWxsVmFsdWUsIGZpbHRlci52YWx1ZSwgcm93KSkge1xyXG4gICAgICAgICAgICBkYXRhLnNwbGljZShpLCAxKS5mb3JFYWNoKGl0ZW0gPT4gdGhpcy5maWx0ZXJlZE91dFJvd3NbYCR7aXRlbS5pZH1gXSA9IGl0ZW0pO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKGlzTnVsbE9yVW5kZWZpbmVkKGNvbXBhcmF0b3IpIHx8IGNvbXBhcmF0b3IgPT09ICdlcXVhbHMnKSB7XHJcbiAgICAgICAgICBpZiAoZmlsdGVyLnZhbHVlICE9PSBjZWxsVmFsdWUpIHtcclxuICAgICAgICAgICAgZGF0YS5zcGxpY2UoaSwgMSkuZm9yRWFjaChpdGVtID0+IHRoaXMuZmlsdGVyZWRPdXRSb3dzW2Ake2l0ZW0uaWR9YF0gPSBpdGVtKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgY2VsbFZhbHVlID09PSAnc3RyaW5nJyAmJiB0eXBlb2YgZmlsdGVyLnZhbHVlID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgY29uc3QgY2VsbFZhbHVlTEM6IHN0cmluZyA9IGAke2NlbGxWYWx1ZX1gLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICBjb25zdCBmaWx0ZXJWYWx1ZUxDOiBzdHJpbmcgPSBmaWx0ZXIudmFsdWUudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgIGlmIChpc051bGxPclVuZGVmaW5lZChjb21wYXJhdG9yKSB8fCBjb21wYXJhdG9yID09PSAnZXF1YWxzSWdub3JlQ2FzZScpIHtcclxuICAgICAgICAgICAgaWYgKGZpbHRlclZhbHVlTEMgIT09IGNlbGxWYWx1ZUxDKSB7XHJcbiAgICAgICAgICAgICAgZGF0YS5zcGxpY2UoaSwgMSkuZm9yRWFjaChpdGVtID0+IHRoaXMuZmlsdGVyZWRPdXRSb3dzW2Ake2l0ZW0uaWR9YF0gPSBpdGVtKTtcclxuICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIGlmIChjb21wYXJhdG9yID09PSAnY29udGFpbnMnKSB7XHJcbiAgICAgICAgICAgIGlmIChjZWxsVmFsdWUuaW5kZXhPZihmaWx0ZXIudmFsdWUpID09PSAtMSkge1xyXG4gICAgICAgICAgICAgIGRhdGEuc3BsaWNlKGksIDEpLmZvckVhY2goaXRlbSA9PiB0aGlzLmZpbHRlcmVkT3V0Um93c1tgJHtpdGVtLmlkfWBdID0gaXRlbSk7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSBpZiAoY29tcGFyYXRvciA9PT0gJ2NvbnRhaW5zSWdub3JlQ2FzZScpIHtcclxuICAgICAgICAgICAgaWYgKGNlbGxWYWx1ZUxDLmluZGV4T2YoZmlsdGVyVmFsdWVMQykgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgZGF0YS5zcGxpY2UoaSwgMSkuZm9yRWFjaChpdGVtID0+IHRoaXMuZmlsdGVyZWRPdXRSb3dzW2Ake2l0ZW0uaWR9YF0gPSBpdGVtKTtcclxuICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIGlmIChjb21wYXJhdG9yID09PSAnc3RhcnRzV2l0aCcpIHtcclxuICAgICAgICAgICAgaWYgKCFjZWxsVmFsdWUuc3RhcnRzV2l0aChmaWx0ZXIudmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgZGF0YS5zcGxpY2UoaSwgMSkuZm9yRWFjaChpdGVtID0+IHRoaXMuZmlsdGVyZWRPdXRSb3dzW2Ake2l0ZW0uaWR9YF0gPSBpdGVtKTtcclxuICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIGlmIChjb21wYXJhdG9yID09PSAnc3RhcnRzV2l0aElnbm9yZUNhc2UnKSB7XHJcbiAgICAgICAgICAgIGlmICghY2VsbFZhbHVlTEMuc3RhcnRzV2l0aChmaWx0ZXJWYWx1ZUxDKSkge1xyXG4gICAgICAgICAgICAgIGRhdGEuc3BsaWNlKGksIDEpLmZvckVhY2goaXRlbSA9PiB0aGlzLmZpbHRlcmVkT3V0Um93c1tgJHtpdGVtLmlkfWBdID0gaXRlbSk7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgYXBwbHlPdmVyYWxsRmlsdGVyKGRhdGE6IE1hdFNlbGVjdFRhYmxlUm93W10pOiB2b2lkIHtcclxuICAgIHRoaXMuZmlsdGVyZWRPdXRSb3dzID0ge307XHJcbiAgICBpZiAoaXNOdWxsT3JVbmRlZmluZWQodGhpcy5vdmVyYWxsRmlsdGVyQ29udHJvbC52YWx1ZSkpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgY29uc3QgZmlsdGVyVmFsdWVMQzogc3RyaW5nID0gdGhpcy5vdmVyYWxsRmlsdGVyQ29udHJvbC52YWx1ZS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgaWYgKGZpbHRlclZhbHVlTEMudHJpbSgpLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBmb3IgKGxldCBpID0gZGF0YS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICBjb25zdCByb3c6IE1hdFNlbGVjdFRhYmxlUm93ID0gZGF0YVtpXTtcclxuICAgICAgbGV0IHJvd1Nob3VsZEJlRmlsdGVyZWQgPSB0cnVlO1xyXG4gICAgICBmb3IgKGxldCBqID0gdGhpcy5kYXRhU291cmNlLmNvbHVtbnMubGVuZ3RoIC0gMTsgaiA+PSAwOyBqLS0pIHtcclxuICAgICAgICBjb25zdCBrZXk6IHN0cmluZyA9IHRoaXMuZGF0YVNvdXJjZS5jb2x1bW5zW2pdLmtleTtcclxuICAgICAgICBjb25zdCBjZWxsVmFsdWU6IGFueSA9IHJvd1trZXldO1xyXG4gICAgICAgIGlmIChpc051bGxPclVuZGVmaW5lZChjZWxsVmFsdWUpKSB7XHJcbiAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgY2VsbFZhbHVlTEM6IHN0cmluZyA9IGAke2NlbGxWYWx1ZX1gLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgaWYgKGNlbGxWYWx1ZUxDLmluZGV4T2YoZmlsdGVyVmFsdWVMQykgIT09IC0xKSB7XHJcbiAgICAgICAgICByb3dTaG91bGRCZUZpbHRlcmVkID0gZmFsc2U7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHJvd1Nob3VsZEJlRmlsdGVyZWQpIHtcclxuICAgICAgICBkYXRhLnNwbGljZShpLCAxKS5mb3JFYWNoKGl0ZW0gPT4gdGhpcy5maWx0ZXJlZE91dFJvd3NbYCR7aXRlbS5pZH1gXSA9IGl0ZW0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFwcGx5UHJveHlUb0FycmF5KGFycmF5OiBhbnlbXSwgY2FsbGJhY2s6ICgpID0+IHZvaWQpOiB2b2lkIHtcclxuICAgIFsncG9wJywgJ3B1c2gnLCAncmV2ZXJzZScsICdzaGlmdCcsICd1bnNoaWZ0JywgJ3NwbGljZScsICdzb3J0J10uZm9yRWFjaCgobWV0aG9kTmFtZSkgPT4ge1xyXG4gICAgICBhcnJheVttZXRob2ROYW1lXSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBjb25zdCByZXMgPSBBcnJheS5wcm90b3R5cGVbbWV0aG9kTmFtZV0uYXBwbHkoYXJyYXksIGFyZ3VtZW50cyk7IC8vIGNhbGwgbm9ybWFsIGJlaGF2aW91clxyXG4gICAgICAgIGNhbGxiYWNrLmFwcGx5KGFycmF5LCBhcmd1bWVudHMpOyAvLyBmaW5hbGx5IGNhbGwgdGhlIGNhbGxiYWNrIHN1cHBsaWVkXHJcbiAgICAgICAgcmV0dXJuIHJlcztcclxuICAgICAgfTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSByZXNldEZpbHRlcnMoKTogdm9pZCB7XHJcbiAgICB0aGlzLm92ZXJhbGxGaWx0ZXJDb250cm9sLnNldFZhbHVlKCcnKTtcclxuICAgIE9iamVjdC5rZXlzKHRoaXMuZmlsdGVyQ29udHJvbHMuY29udHJvbHMpXHJcbiAgICAgIC5mb3JFYWNoKGtleSA9PiB0aGlzLmZpbHRlckNvbnRyb2xzLmdldChrZXkpLnNldFZhbHVlKCcnKSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUYWtlbiBmcm9tIHtAc2VlIE1hdFRhYmxlRGF0YVNvdXJjZSNzb3J0aW5nRGF0YUFjY2Vzc29yfVxyXG4gICAqXHJcbiAgICogQHBhcmFtIGRhdGFcclxuICAgKiBAcGFyYW0gc29ydEhlYWRlcklkXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzb3J0aW5nRGF0YUFjY2Vzc29yKGRhdGE6IE1hdFNlbGVjdFRhYmxlUm93LCBhY3RpdmU6IHN0cmluZyk6IHN0cmluZyB8IG51bWJlciB8IERhdGUge1xyXG5cclxuICAgIGNvbnN0IHZhbHVlID0gKGRhdGEgYXMgeyBba2V5OiBzdHJpbmddOiBhbnkgfSlbYWN0aXZlXTtcclxuXHJcbiAgICBpZiAoX2lzTnVtYmVyVmFsdWUodmFsdWUpKSB7XHJcbiAgICAgIGNvbnN0IG51bWJlclZhbHVlID0gTnVtYmVyKHZhbHVlKTtcclxuXHJcbiAgICAgIC8vIE51bWJlcnMgYmV5b25kIGBNQVhfU0FGRV9JTlRFR0VSYCBjYW4ndCBiZSBjb21wYXJlZCByZWxpYWJseSBzbyB3ZVxyXG4gICAgICAvLyBsZWF2ZSB0aGVtIGFzIHN0cmluZ3MuIEZvciBtb3JlIGluZm86IGh0dHBzOi8vZ29vLmdsL3k1dmJTZ1xyXG4gICAgICByZXR1cm4gbnVtYmVyVmFsdWUgPCBNQVhfU0FGRV9JTlRFR0VSID8gbnVtYmVyVmFsdWUgOiB2YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdmFsdWU7XHJcbiAgfVxyXG5cclxuXHJcbiAgcHJpdmF0ZSBzb3J0RGF0YShkYXRhOiBNYXRTZWxlY3RUYWJsZVJvd1tdLCBhY3RpdmU6IHN0cmluZywgZGlyZWN0aW9uOiBTb3J0RGlyZWN0aW9uKTogTWF0U2VsZWN0VGFibGVSb3dbXSB7XHJcbiAgICBpZiAoIWFjdGl2ZSB8fCBkaXJlY3Rpb24gPT09ICcnKSB7XHJcbiAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBkYXRhLnNvcnQoKGEsIGIpID0+IHtcclxuICAgICAgbGV0IGFWYWx1ZSA9IHRoaXMuc29ydGluZ0RhdGFBY2Nlc3NvcihhLCBhY3RpdmUpO1xyXG4gICAgICBsZXQgYlZhbHVlID0gdGhpcy5zb3J0aW5nRGF0YUFjY2Vzc29yKGIsIGFjdGl2ZSk7XHJcblxyXG4gICAgICBpZiAoYS5pZCA9PT0gbnVsbCkge1xyXG4gICAgICAgIHJldHVybiAtMTtcclxuICAgICAgfSBlbHNlIGlmIChiLmlkID09PSBudWxsKSB7XHJcbiAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEJvdGggbnVsbC91bmRlZmluZWQvZXF1YWwgdmFsdWUgY2hlY2tcclxuICAgICAgaWYgKGFWYWx1ZSA9PT0gYlZhbHVlKSB7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIE9uZSBudWxsIHZhbHVlIGNoZWNrXHJcbiAgICAgIGlmIChpc051bGxPclVuZGVmaW5lZChhVmFsdWUpICYmICFpc051bGxPclVuZGVmaW5lZChiVmFsdWUpKSB7XHJcbiAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICB9IGVsc2UgaWYgKCFpc051bGxPclVuZGVmaW5lZChhVmFsdWUpICYmIGlzTnVsbE9yVW5kZWZpbmVkKGJWYWx1ZSkpIHtcclxuICAgICAgICByZXR1cm4gMTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGFWYWx1ZSBpbnN0YW5jZW9mIERhdGUpIHtcclxuICAgICAgICBhVmFsdWUgPSBhVmFsdWUuZ2V0VGltZSgpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChiVmFsdWUgaW5zdGFuY2VvZiBEYXRlKSB7XHJcbiAgICAgICAgYlZhbHVlID0gYlZhbHVlLmdldFRpbWUoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gVXNlciBsb2NhbGVDb21wYXJlIGZvciBzdHJpbmdzXHJcbiAgICAgIGlmIChpc1N0cmluZyhhVmFsdWUpICYmIGlzU3RyaW5nKGJWYWx1ZSkpIHtcclxuICAgICAgICByZXR1cm4gKDxzdHJpbmc+YVZhbHVlKS5sb2NhbGVDb21wYXJlKDxzdHJpbmc+YlZhbHVlKSAqIChkaXJlY3Rpb24gPT09ICdhc2MnID8gMSA6IC0xKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gVHJ5IHRvIGNvbnZlcnQgdG8gYSBOdW1iZXIgdHlwZVxyXG4gICAgICBhVmFsdWUgPSBpc05hTig8bnVtYmVyPmFWYWx1ZSkgPyBgJHthVmFsdWV9YCA6ICthVmFsdWU7XHJcbiAgICAgIGJWYWx1ZSA9IGlzTmFOKDxudW1iZXI+YlZhbHVlKSA/IGAke2JWYWx1ZX1gIDogK2JWYWx1ZTtcclxuXHJcbiAgICAgIC8vIGlmIG9uZSBpcyBudW1iZXIgYW5kIG90aGVyIGlzIFN0cmluZ1xyXG4gICAgICBpZiAoaXNTdHJpbmcoYVZhbHVlKSAmJiBpc051bWJlcihiVmFsdWUpKSB7XHJcbiAgICAgICAgcmV0dXJuICgxKSAqIChkaXJlY3Rpb24gPT09ICdhc2MnID8gMSA6IC0xKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoaXNOdW1iZXIoYVZhbHVlKSAmJiBpc1N0cmluZyhiVmFsdWUpKSB7XHJcbiAgICAgICAgcmV0dXJuICgtMSkgKiAoZGlyZWN0aW9uID09PSAnYXNjJyA/IDEgOiAtMSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIENvbXBhcmUgYXMgTnVtYmVycyBvdGhlcndpc2VcclxuICAgICAgcmV0dXJuIChhVmFsdWUgPiBiVmFsdWUgPyAxIDogLTEpICogKGRpcmVjdGlvbiA9PT0gJ2FzYycgPyAxIDogLTEpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBhZGROdWxsUm93KCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuICF0aGlzLm11bHRpcGxlICYmICFpc051bGxPclVuZGVmaW5lZCh0aGlzLmxhYmVsRm9yTnVsbFZhbHVlKTtcclxuICB9XHJcbn1cclxuIl19