/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import * as tslib_1 from "tslib";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, forwardRef, Input, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { merge, Subject } from 'rxjs';
import { MatOption, MatSelect, MatSort, MatTable } from '@angular/material';
import { isArray, isNullOrUndefined } from 'util';
import { _isNumberValue } from '@angular/cdk/coercion';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { MatSelectSearchComponent } from 'ngx-mat-select-search';
/** @type {?} */
var MAX_SAFE_INTEGER = 9007199254740991;
var MatSelectTableComponent = /** @class */ (function () {
    function MatSelectTableComponent(cd) {
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
    MatSelectTableComponent.prototype.ngOnInit = /**
     * @return {?}
     */
    function () {
        var _this = this;
        this.multiple = this.multiple || false;
        this.matSelect.openedChange
            .pipe(takeUntil(this._onDestroy))
            .subscribe((/**
         * @param {?} opened
         * @return {?}
         */
        function (opened) {
            if (_this.resetFiltersOnOpen !== false || !_this.matOptions.length) {
                _this.resetFilters();
            }
            if (!opened) {
                return;
            }
            _this.overallSearchVisibleState = _this.overallSearchVisible;
            if (_this.resetSortOnOpen !== false) {
                _this.sort.sort({ id: '', start: 'asc', disableClear: false });
            }
            if (_this.overallSearchEnabled) {
                _this.proxyMatSelectSearchConfiguration(_this.matSelectSearchConfigurator);
            }
            // ToDo: get rid of this workaround (updates header row [otherwise sort mechanism produces glitches])
            ((/** @type {?} */ (_this.table)))._headerRowDefChanged = true;
            // Disable sort buttons to prevent sorting change on SPACE key pressed in filter field
            setTimeout((/**
             * @return {?}
             */
            function () { return [].forEach.call(_this.tableRef.nativeElement.querySelectorAll('button.mat-sort-header-button'), (/**
             * @param {?} e
             * @return {?}
             */
            function (e) { return e.disabled = true; })); }));
            // Patch the height of the panel to include the height of the header and footer
            /** @type {?} */
            var panelElement = _this.matSelect.panel.nativeElement;
            /** @type {?} */
            var panelHeight = panelElement.getBoundingClientRect().height;
            /** @type {?} */
            var tableAdditionalHeight = 0;
            _this.table
                ._getRenderedRows(_this.table._headerRowOutlet)
                .concat(_this.table._getRenderedRows(_this.table._footerRowOutlet))
                .forEach((/**
             * @param {?} row
             * @return {?}
             */
            function (row) { return tableAdditionalHeight += row.getBoundingClientRect().height; }));
            if (!isNaN(panelHeight)) {
                panelElement.style.maxHeight = panelHeight + tableAdditionalHeight + "px";
            }
        }));
    };
    /**
     * @return {?}
     */
    MatSelectTableComponent.prototype.ngAfterViewInit = /**
     * @return {?}
     */
    function () {
        var _this = this;
        merge.apply(void 0, tslib_1.__spread([
            this.sort.sortChange,
            this.filterControls.valueChanges,
            this.overallFilterControl.valueChanges
        ])).pipe(takeUntil(this._onDestroy), debounceTime(100))
            .subscribe((/**
         * @return {?}
         */
        function () {
            /** @type {?} */
            var dataClone = tslib_1.__spread(_this.dataSource.data);
            // Apply filtering
            if (_this.overallSearchEnabled && _this.overallSearchVisibleState) {
                _this.applyOverallFilter(dataClone);
            }
            else {
                _this.applyColumnLevelFilters(dataClone);
            }
            // Apply sorting
            _this.tableDataSource = !_this.sort.direction ? dataClone : _this.sortData(dataClone, _this.sort);
            _this.cd.detectChanges();
        }));
        // Manually sort data for this.matSelect.options (QueryList<MatOption>) and notify matSelect.options of changes
        // It's important to keep this.matSelect.options order synchronized with data in the table
        //     because this.matSelect.options (QueryList<MatOption>) doesn't update it's state after table data is changed
        this.matOptions.changes.subscribe((/**
         * @return {?}
         */
        function () {
            /** @type {?} */
            var options = {};
            _this.matOptions.toArray()
                .filter((/**
             * @param {?} option
             * @return {?}
             */
            function (option) { return !isNullOrUndefined(option); }))
                .forEach((/**
             * @param {?} option
             * @return {?}
             */
            function (option) { return options["" + option.value] = option; }));
            _this.matSelect.options.reset(_this.tableDataSource
                .filter((/**
             * @param {?} row
             * @return {?}
             */
            function (row) { return !isNullOrUndefined(options["" + row.id]); }))
                .map((/**
             * @param {?} row
             * @return {?}
             */
            function (row) { return options["" + row.id]; })));
            _this.matSelect.options.notifyOnChanges();
        }));
        if (!isNullOrUndefined(this.matSelect._keyManager)) {
            // Subscribe on KeyManager changes to highlight the table rows accordingly
            this.matSelect._keyManager.change
                .pipe(takeUntil(this._onDestroy))
                .subscribe((/**
             * @param {?} activeRow
             * @return {?}
             */
            function (activeRow) { return _this.tableActiveRow = activeRow; }));
        }
    };
    /**
     * @return {?}
     */
    MatSelectTableComponent.prototype.ngOnDestroy = /**
     * @return {?}
     */
    function () {
        this._onDestroy.next();
        this._onDestroy.complete();
    };
    /**
     * @param {?} fn
     * @return {?}
     */
    MatSelectTableComponent.prototype.registerOnChange = /**
     * @param {?} fn
     * @return {?}
     */
    function (fn) {
        var _this = this;
        /** @type {?} */
        var proxyFn = (/**
         * @param {?} value
         * @return {?}
         */
        function (value) {
            // ToDo: refactor - comparison mechanism isn't optimized. filteredOutRows is a map but completeValueList is an array
            if (_this.multiple === true) {
                for (var i = _this.completeValueList.length - 1; i >= 0; i--) {
                    if (_this.filteredOutRows["" + _this.completeValueList[i]] === undefined && value.indexOf(_this.completeValueList[i]) === -1) {
                        _this.completeValueList.splice(i, 1);
                    }
                }
                value
                    .filter((/**
                 * @param {?} choice
                 * @return {?}
                 */
                function (choice) { return _this.completeValueList.indexOf(choice) === -1; }))
                    .forEach((/**
                 * @param {?} choice
                 * @return {?}
                 */
                function (choice) { return _this.completeValueList.push(choice); }));
                _this.matSelect.value = _this.completeValueList;
                fn(_this.completeValueList);
                _this.completeRowList.splice(0);
                _this.dataSource.data
                    .filter((/**
                 * @param {?} row
                 * @return {?}
                 */
                function (row) { return _this.completeValueList.indexOf(row.id) !== -1; }))
                    .forEach((/**
                 * @param {?} row
                 * @return {?}
                 */
                function (row) { return _this.completeRowList.push(row); }));
            }
            else {
                fn(value);
                _this.completeRowList.splice(0);
                _this.dataSource.data
                    .filter((/**
                 * @param {?} row
                 * @return {?}
                 */
                function (row) { return row.id === value; }))
                    .forEach((/**
                 * @param {?} row
                 * @return {?}
                 */
                function (row) { return _this.completeRowList.push(row); }));
            }
        });
        this.matSelect.registerOnChange(proxyFn);
    };
    /**
     * @param {?} fn
     * @return {?}
     */
    MatSelectTableComponent.prototype.registerOnTouched = /**
     * @param {?} fn
     * @return {?}
     */
    function (fn) {
        this.matSelect.registerOnTouched(fn);
    };
    /**
     * @param {?} isDisabled
     * @return {?}
     */
    MatSelectTableComponent.prototype.setDisabledState = /**
     * @param {?} isDisabled
     * @return {?}
     */
    function (isDisabled) {
        this.matSelect.setDisabledState(isDisabled);
    };
    /**
     * @param {?} value
     * @return {?}
     */
    MatSelectTableComponent.prototype.writeValue = /**
     * @param {?} value
     * @return {?}
     */
    function (value) {
        this.updateCompleteRowList(value);
        this.matSelect.writeValue(value);
        if (this.matSelect.value !== value) {
            this.matSelect.value = value;
        }
    };
    /**
     * @param {?} changes
     * @return {?}
     */
    MatSelectTableComponent.prototype.ngOnChanges = /**
     * @param {?} changes
     * @return {?}
     */
    function (changes) {
        var _this = this;
        if (!isNullOrUndefined(changes.resetFiltersOnOpen) && changes.resetFiltersOnOpen.currentValue !== false) {
            this.resetFilters();
        }
        if (!isNullOrUndefined(changes.dataSource)) {
            this.updateCompleteRowList(this.completeRowList.map((/**
             * @param {?} row
             * @return {?}
             */
            function (row) { return row.id; })));
        }
        // Proxy @Input bindings to MatSelect
        if (!isNullOrUndefined(changes.matSelectConfigurator)) {
            /** @type {?} */
            var configuration_1 = changes.matSelectConfigurator.currentValue;
            Object.keys(configuration_1)
                .filter((/**
             * @param {?} key
             * @return {?}
             */
            function (key) { return !['multiple', 'panelClass'].includes(key) && !_this.controlValueAccessorKeys.includes(key); }))
                .forEach((/**
             * @param {?} key
             * @return {?}
             */
            function (key) { return _this.matSelect[key] = configuration_1[key]; }));
            /** @type {?} */
            var panelClass = [];
            if (!isNullOrUndefined(configuration_1.panelClass)) {
                panelClass.push(configuration_1.panelClass);
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
            this.tableDataSource = tslib_1.__spread(changes.dataSource.currentValue.data);
            this.tableColumns = tslib_1.__spread(['_selection'], changes.dataSource.currentValue.columns.map((/**
             * @param {?} column
             * @return {?}
             */
            function (column) { return column.key; })));
            this.tableColumnsMap.clear();
            changes.dataSource.currentValue.columns.forEach((/**
             * @param {?} column
             * @return {?}
             */
            function (column) { return _this.tableColumnsMap.set(column.key, column); }));
            this.applyProxyToArray(changes.dataSource.currentValue.data, (/**
             * @return {?}
             */
            function () {
                _this._onOptionsChange.next();
            }));
            this._onOptionsChange.next();
        }
    };
    /**
     * @param {?} event
     * @return {?}
     */
    MatSelectTableComponent.prototype.emulateMatOptionClick = /**
     * @param {?} event
     * @return {?}
     */
    function (event) {
        if (event.composedPath()
            .filter((/**
         * @param {?} et
         * @return {?}
         */
        function (et) { return et instanceof HTMLElement; }))
            .some((/**
         * @param {?} et
         * @return {?}
         */
        function (et) { return et.tagName.toLowerCase() === 'mat-option'; }))) {
            return;
        }
        if (!(event.target instanceof HTMLElement)) {
            return;
        }
        /** @type {?} */
        var rowElement = event.target;
        while (rowElement != null && rowElement instanceof HTMLElement && rowElement.tagName.toLowerCase() !== 'tr') {
            rowElement = rowElement.parentElement;
        }
        if (rowElement === null) {
            return;
        }
        /** @type {?} */
        var childOption = rowElement.querySelector('mat-option');
        if (!childOption) {
            return;
        }
        childOption.click();
    };
    /**
     * @param {?} key
     * @return {?}
     */
    MatSelectTableComponent.prototype.filterFormControl = /**
     * @param {?} key
     * @return {?}
     */
    function (key) {
        if (!this.filterControls.contains(key)) {
            this.filterControls.registerControl(key, new FormControl(''));
        }
        return (/** @type {?} */ (this.filterControls.get(key)));
    };
    /**
     * @param {?} value
     * @return {?}
     */
    MatSelectTableComponent.prototype.simpleTriggerLabelFn = /**
     * @param {?} value
     * @return {?}
     */
    function (value) {
        var _this = this;
        return value.map((/**
         * @param {?} row
         * @return {?}
         */
        function (row) {
            if (isNullOrUndefined(row)) {
                return '';
            }
            if (isNullOrUndefined(_this.customTriggerLabelTemplate)
                || typeof _this.customTriggerLabelTemplate !== 'string'
                || _this.customTriggerLabelTemplate.trim().length === 0) {
                return "" + row.id;
            }
            /** @type {?} */
            var atLeastPartialSubstitution = false;
            /** @type {?} */
            var substitution = _this.customTriggerLabelTemplate.replace(/[$]{1}[{]{1}([^}]+)[}]{1}?/g, (/**
             * @param {?} _
             * @param {?} key
             * @return {?}
             */
            function (_, key) {
                return !isNullOrUndefined(row[key]) && (atLeastPartialSubstitution = true) ? row[key] : '';
            }));
            if (atLeastPartialSubstitution === false) {
                return "" + row.id;
            }
            return substitution.trim();
        })).join(', ');
    };
    /**
     * @return {?}
     */
    MatSelectTableComponent.prototype.toggleOverallSearch = /**
     * @return {?}
     */
    function () {
        var _this = this;
        this.overallSearchVisibleState = !this.overallSearchVisibleState;
        this.resetFilters();
        if (this.overallSearchVisibleState) {
            setTimeout((/**
             * @return {?}
             */
            function () { return _this.matSelectSearch._focus(); }));
        }
    };
    /**
     * @private
     * @param {?} value
     * @return {?}
     */
    MatSelectTableComponent.prototype.updateCompleteRowList = /**
     * @private
     * @param {?} value
     * @return {?}
     */
    function (value) {
        var _this = this;
        this.completeRowList.splice(0);
        if (!isNullOrUndefined(value)) {
            /** @type {?} */
            var valueArray = !isArray(value) ? [value] : value;
            valueArray.forEach((/**
             * @param {?} item
             * @return {?}
             */
            function (item) {
                /** @type {?} */
                var rowFound = _this.dataSource.data.find((/**
                 * @param {?} row
                 * @return {?}
                 */
                function (row) { return row.id === item; }));
                if (rowFound === null) {
                    return;
                }
                _this.completeRowList.push(rowFound);
            }));
        }
    };
    /**
     * @private
     * @param {?} configuration
     * @return {?}
     */
    MatSelectTableComponent.prototype.proxyMatSelectSearchConfiguration = /**
     * @private
     * @param {?} configuration
     * @return {?}
     */
    function (configuration) {
        var _this = this;
        if (isNullOrUndefined(this.matSelectSearch)) {
            return;
        }
        // Proxy @Input bindings to NgxMatSelectSearch
        Object.keys(configuration)
            .filter((/**
         * @param {?} key
         * @return {?}
         */
        function (key) { return !['clearSearchInput'].includes(key) && !_this.controlValueAccessorKeys.includes(key); }))
            .forEach((/**
         * @param {?} key
         * @return {?}
         */
        function (key) { return _this.matSelectSearch[key] = configuration[key]; }));
    };
    /**
     * @private
     * @param {?} data
     * @return {?}
     */
    MatSelectTableComponent.prototype.applyColumnLevelFilters = /**
     * @private
     * @param {?} data
     * @return {?}
     */
    function (data) {
        var _this = this;
        this.filteredOutRows = {};
        /** @type {?} */
        var filters = {};
        Object.keys(this.filterControls.controls)
            .filter((/**
         * @param {?} key
         * @return {?}
         */
        function (key) { return _this.tableColumnsMap.has(key)
            && !isNullOrUndefined(_this.tableColumnsMap.get(key).filter)
            // If filter is enabled
            && _this.tableColumnsMap.get(key).filter.enabled !== false; }))
            .filter((/**
         * @param {?} key
         * @return {?}
         */
        function (key) {
            /** @type {?} */
            var value = _this.filterControls.get(key).value;
            return !isNullOrUndefined(value)
                // If an array - check it's not empty
                && ((isArray(value) && value.length > 0)
                    // If string - check that not blank
                    || (typeof value === 'string' && value.trim().length > 0)
                    // If number - check that toString() is not blank
                    || (typeof value === 'number' && ("" + value).trim().length > 0));
        }))
            .forEach((/**
         * @param {?} key
         * @return {?}
         */
        function (key) { return filters[key] = {
            filter: _this.tableColumnsMap.get(key).filter,
            value: _this.filterControls.get(key).value
        }; }));
        /** @type {?} */
        var filterKeys = Object.keys(filters);
        for (var i = data.length - 1; i >= 0; i--) {
            for (var k = 0; k < filterKeys.length; k++) {
                /** @type {?} */
                var filterKey = filterKeys[k];
                /** @type {?} */
                var row = data[i];
                /** @type {?} */
                var cellValue = row[filterKey];
                if (isNullOrUndefined(cellValue)) {
                    continue;
                }
                /** @type {?} */
                var filter = filters[filterKey];
                /** @type {?} */
                var comparator = filter.filter.comparator;
                if (typeof filter.filter.comparatorFn === 'function') {
                    if (!filter.filter.comparatorFn.call(null, cellValue, filter.value, row)) {
                        data.splice(i, 1).forEach((/**
                         * @param {?} item
                         * @return {?}
                         */
                        function (item) { return _this.filteredOutRows["" + item.id] = item; }));
                        break;
                    }
                }
                else if (isNullOrUndefined(comparator) || comparator === 'equals') {
                    if (filter.value !== cellValue) {
                        data.splice(i, 1).forEach((/**
                         * @param {?} item
                         * @return {?}
                         */
                        function (item) { return _this.filteredOutRows["" + item.id] = item; }));
                        break;
                    }
                }
                else if (typeof cellValue === 'string' && typeof filter.value === 'string') {
                    /** @type {?} */
                    var cellValueLC = ("" + cellValue).toLowerCase();
                    /** @type {?} */
                    var filterValueLC = filter.value.toLowerCase();
                    if (isNullOrUndefined(comparator) || comparator === 'equalsIgnoreCase') {
                        if (filterValueLC !== cellValueLC) {
                            data.splice(i, 1).forEach((/**
                             * @param {?} item
                             * @return {?}
                             */
                            function (item) { return _this.filteredOutRows["" + item.id] = item; }));
                            break;
                        }
                    }
                    else if (comparator === 'contains') {
                        if (cellValue.indexOf(filter.value) === -1) {
                            data.splice(i, 1).forEach((/**
                             * @param {?} item
                             * @return {?}
                             */
                            function (item) { return _this.filteredOutRows["" + item.id] = item; }));
                            break;
                        }
                    }
                    else if (comparator === 'containsIgnoreCase') {
                        if (cellValueLC.indexOf(filterValueLC) === -1) {
                            data.splice(i, 1).forEach((/**
                             * @param {?} item
                             * @return {?}
                             */
                            function (item) { return _this.filteredOutRows["" + item.id] = item; }));
                            break;
                        }
                    }
                    else if (comparator === 'startsWith') {
                        if (!cellValue.startsWith(filter.value)) {
                            data.splice(i, 1).forEach((/**
                             * @param {?} item
                             * @return {?}
                             */
                            function (item) { return _this.filteredOutRows["" + item.id] = item; }));
                            break;
                        }
                    }
                    else if (comparator === 'startsWithIgnoreCase') {
                        if (!cellValueLC.startsWith(filterValueLC)) {
                            data.splice(i, 1).forEach((/**
                             * @param {?} item
                             * @return {?}
                             */
                            function (item) { return _this.filteredOutRows["" + item.id] = item; }));
                            break;
                        }
                    }
                }
            }
        }
    };
    /**
     * @private
     * @param {?} data
     * @return {?}
     */
    MatSelectTableComponent.prototype.applyOverallFilter = /**
     * @private
     * @param {?} data
     * @return {?}
     */
    function (data) {
        var _this = this;
        this.filteredOutRows = {};
        if (isNullOrUndefined(this.overallFilterControl.value)) {
            return;
        }
        /** @type {?} */
        var filterValueLC = this.overallFilterControl.value.toLowerCase();
        if (filterValueLC.trim().length === 0) {
            return;
        }
        for (var i = data.length - 1; i >= 0; i--) {
            /** @type {?} */
            var row = data[i];
            /** @type {?} */
            var rowShouldBeFiltered = true;
            for (var j = this.dataSource.columns.length - 1; j >= 0; j--) {
                /** @type {?} */
                var key = this.dataSource.columns[j].key;
                /** @type {?} */
                var cellValue = row[key];
                if (isNullOrUndefined(cellValue)) {
                    continue;
                }
                /** @type {?} */
                var cellValueLC = ("" + cellValue).toLowerCase();
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
                function (item) { return _this.filteredOutRows["" + item.id] = item; }));
            }
        }
    };
    /**
     * @private
     * @param {?} array
     * @param {?} callback
     * @return {?}
     */
    MatSelectTableComponent.prototype.applyProxyToArray = /**
     * @private
     * @param {?} array
     * @param {?} callback
     * @return {?}
     */
    function (array, callback) {
        ['pop', 'push', 'reverse', 'shift', 'unshift', 'splice', 'sort'].forEach((/**
         * @param {?} methodName
         * @return {?}
         */
        function (methodName) {
            array[methodName] = (/**
             * @return {?}
             */
            function () {
                /** @type {?} */
                var res = Array.prototype[methodName].apply(array, arguments);
                callback.apply(array, arguments); // finally call the callback supplied
                return res;
            });
        }));
    };
    /**
     * @private
     * @return {?}
     */
    MatSelectTableComponent.prototype.resetFilters = /**
     * @private
     * @return {?}
     */
    function () {
        var _this = this;
        this.overallFilterControl.setValue('');
        Object.keys(this.filterControls.controls)
            .forEach((/**
         * @param {?} key
         * @return {?}
         */
        function (key) { return _this.filterControls.get(key).setValue(''); }));
    };
    /**
     * Taken from {@see MatTableDataSource#sortingDataAccessor}
     *
     * @param data
     * @param sortHeaderId
     */
    /**
     * Taken from {\@see MatTableDataSource#sortingDataAccessor}
     *
     * @private
     * @param {?} data
     * @param {?} sortHeaderId
     * @return {?}
     */
    MatSelectTableComponent.prototype.sortingDataAccessor = /**
     * Taken from {\@see MatTableDataSource#sortingDataAccessor}
     *
     * @private
     * @param {?} data
     * @param {?} sortHeaderId
     * @return {?}
     */
    function (data, sortHeaderId) {
        /** @type {?} */
        var value = ((/** @type {?} */ (data)))[sortHeaderId];
        if (_isNumberValue(value)) {
            /** @type {?} */
            var numberValue = Number(value);
            // Numbers beyond `MAX_SAFE_INTEGER` can't be compared reliably so we
            // leave them as strings. For more info: https://goo.gl/y5vbSg
            return numberValue < MAX_SAFE_INTEGER ? numberValue : value;
        }
        return value;
    };
    /**
     * Taken from {@see MatTableDataSource#sortData}
     *
     * @param data
     * @param sort
     */
    /**
     * Taken from {\@see MatTableDataSource#sortData}
     *
     * @private
     * @param {?} data
     * @param {?} sort
     * @return {?}
     */
    MatSelectTableComponent.prototype.sortData = /**
     * Taken from {\@see MatTableDataSource#sortData}
     *
     * @private
     * @param {?} data
     * @param {?} sort
     * @return {?}
     */
    function (data, sort) {
        var _this = this;
        /** @type {?} */
        var active = sort.active;
        /** @type {?} */
        var direction = sort.direction;
        if (!active || direction === '') {
            return data;
        }
        return data.sort((/**
         * @param {?} a
         * @param {?} b
         * @return {?}
         */
        function (a, b) {
            /** @type {?} */
            var valueA = _this.sortingDataAccessor(a, active);
            /** @type {?} */
            var valueB = _this.sortingDataAccessor(b, active);
            // If both valueA and valueB exist (truthy), then compare the two. Otherwise, check if
            // one value exists while the other doesn't. In this case, existing value should come first.
            // This avoids inconsistent results when comparing values to undefined/null.
            // If neither value exists, return 0 (equal).
            /** @type {?} */
            var comparatorResult = 0;
            if (valueA != null && valueB != null) {
                // Check if one value is greater than the other; if equal, comparatorResult should remain 0.
                if (valueA > valueB) {
                    comparatorResult = 1;
                }
                else if (valueA < valueB) {
                    comparatorResult = -1;
                }
            }
            else if (valueA != null) {
                comparatorResult = 1;
            }
            else if (valueB != null) {
                comparatorResult = -1;
            }
            return comparatorResult * (direction === 'asc' ? 1 : -1);
        }));
    };
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
                            function () { return MatSelectTableComponent; })),
                            multi: true
                        }
                    ],
                    styles: [":host{display:block}:host mat-form-field{width:100%}::ng-deep .mat-select-panel{overflow-x:auto!important}::ng-deep .mat-select-panel .overall-search-toggle{z-index:102;position:absolute;left:13px;top:17px;cursor:pointer}::ng-deep .mat-select-panel ngx-mat-select-search{position:absolute;z-index:101}::ng-deep .mat-select-panel ngx-mat-select-search.hidden{display:none}::ng-deep .mat-select-panel ngx-mat-select-search .mat-select-search-inner{height:56px}::ng-deep .mat-select-panel ngx-mat-select-search .mat-select-search-inner .mat-select-search-input{margin-left:26px}::ng-deep .mat-select-panel table{width:100%}::ng-deep .mat-select-panel table tr{cursor:pointer}::ng-deep .mat-select-panel table tr.active{background:rgba(0,0,0,.04)}::ng-deep .mat-select-panel table tr td{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}::ng-deep .mat-select-panel table tr th ::ng-deep .mat-sort-header-container{height:55px}::ng-deep .mat-select-panel table tr th ::ng-deep .mat-sort-header-container mat-form-field .mat-form-field-infix{width:initial}::ng-deep .mat-select-panel table tr td mat-option,::ng-deep .mat-select-panel table tr th mat-option{background:0 0!important}::ng-deep .mat-select-panel table tr td.selection,::ng-deep .mat-select-panel table tr th.selection{width:56px;padding:0;margin:0}::ng-deep .mat-select-panel table tr td.selection.hidden mat-option,::ng-deep .mat-select-panel table tr th.selection.hidden mat-option{visibility:hidden}"]
                }] }
    ];
    /** @nocollapse */
    MatSelectTableComponent.ctorParameters = function () { return [
        { type: ChangeDetectorRef }
    ]; };
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
        matSelect: [{ type: ViewChild, args: ['componentSelect',] }],
        matSelectSearch: [{ type: ViewChild, args: [MatSelectSearchComponent,] }],
        sort: [{ type: ViewChild, args: [MatSort,] }],
        table: [{ type: ViewChild, args: [MatTable,] }],
        tableRef: [{ type: ViewChild, args: ['table', { read: ElementRef },] }],
        matOptions: [{ type: ViewChildren, args: [MatOption,] }]
    };
    return MatSelectTableComponent;
}());
export { MatSelectTableComponent };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0LXNlbGVjdC10YWJsZS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9uZ3gtbWF0LXNlbGVjdC10YWJsZS8iLCJzb3VyY2VzIjpbIm1hdC1zZWxlY3QtdGFibGUuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsT0FBTyxFQUVMLHVCQUF1QixFQUN2QixpQkFBaUIsRUFDakIsU0FBUyxFQUNULFVBQVUsRUFDVixVQUFVLEVBQ1YsS0FBSyxFQUlMLFNBQVMsRUFFVCxTQUFTLEVBQ1QsWUFBWSxFQUNiLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBdUIsV0FBVyxFQUFFLFNBQVMsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQy9GLE9BQU8sRUFBQyxLQUFLLEVBQUUsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ3BDLE9BQU8sRUFBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQXFCLE1BQU0sbUJBQW1CLENBQUM7QUFDOUYsT0FBTyxFQUFDLE9BQU8sRUFBRSxpQkFBaUIsRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUdoRCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDckQsT0FBTyxFQUFDLFlBQVksRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUd2RCxPQUFPLEVBQUMsd0JBQXdCLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQzs7SUFFekQsZ0JBQWdCLEdBQUcsZ0JBQWdCO0FBRXpDO0lBNEdFLGlDQUFvQixFQUFxQjtRQUFyQixPQUFFLEdBQUYsRUFBRSxDQUFtQjtRQXhCekMsb0JBQWUsR0FBd0IsRUFBRSxDQUFDO1FBUWxDLHNCQUFpQixHQUFVLEVBQUUsQ0FBQztRQUU5Qiw2QkFBd0IsR0FBYTtZQUMzQyxhQUFhO1lBQ2IsaUJBQWlCO1lBQ2pCLFdBQVc7WUFDWCxlQUFlO1lBQ2YsV0FBVztZQUNYLGVBQWU7U0FDaEIs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RDs7Ozs7SUFFM0Qsa0RBQXVGOzs7OztJQUV2Rix1Q0FBMEM7Ozs7O0lBRTFDLHdDQUFnRTs7Ozs7SUFFaEUsMkNBQXFFOzs7OztJQUVyRSw2Q0FBa0U7O0lBRWxFLGtEQUFxQzs7SUFFckMsK0NBQXVCOztJQUV2QixrREFBbUQ7O0lBRW5ELGlEQUF1Qjs7SUFFdkIsa0RBQXNEOztJQUV0RCxrREFBMEM7O0lBRTFDLDREQUFtQzs7SUFFbkMsdURBQWtDOzs7OztJQUVsQyxpREFBa0M7Ozs7O0lBRWxDLG9EQUFzQzs7Ozs7SUFFdEMsMkRBT0U7Ozs7OztJQUdGLDZDQUF5Qzs7Ozs7SUFFekMsbURBQStDOzs7OztJQUVuQyxxQ0FBNkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xyXG4gIEFmdGVyVmlld0luaXQsXHJcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXHJcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXHJcbiAgQ29tcG9uZW50LFxyXG4gIEVsZW1lbnRSZWYsXHJcbiAgZm9yd2FyZFJlZixcclxuICBJbnB1dCxcclxuICBPbkNoYW5nZXMsXHJcbiAgT25EZXN0cm95LFxyXG4gIE9uSW5pdCxcclxuICBRdWVyeUxpc3QsXHJcbiAgU2ltcGxlQ2hhbmdlcyxcclxuICBWaWV3Q2hpbGQsXHJcbiAgVmlld0NoaWxkcmVuXHJcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7Q29udHJvbFZhbHVlQWNjZXNzb3IsIEZvcm1Db250cm9sLCBGb3JtR3JvdXAsIE5HX1ZBTFVFX0FDQ0VTU09SfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XHJcbmltcG9ydCB7bWVyZ2UsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQge01hdE9wdGlvbiwgTWF0U2VsZWN0LCBNYXRTb3J0LCBNYXRUYWJsZSwgTWF0VGFibGVEYXRhU291cmNlfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbCc7XHJcbmltcG9ydCB7aXNBcnJheSwgaXNOdWxsT3JVbmRlZmluZWR9IGZyb20gJ3V0aWwnO1xyXG5pbXBvcnQge01hdFNlbGVjdFRhYmxlRGF0YVNvdXJjZX0gZnJvbSAnLi9NYXRTZWxlY3RUYWJsZURhdGFTb3VyY2UnO1xyXG5pbXBvcnQge01hdFNlbGVjdFRhYmxlUm93fSBmcm9tICcuL01hdFNlbGVjdFRhYmxlUm93JztcclxuaW1wb3J0IHtfaXNOdW1iZXJWYWx1ZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcclxuaW1wb3J0IHtkZWJvdW5jZVRpbWUsIHRha2VVbnRpbH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG5pbXBvcnQge01hdFNlbGVjdFRhYmxlQ29sdW1ufSBmcm9tICcuL01hdFNlbGVjdFRhYmxlQ29sdW1uJztcclxuaW1wb3J0IHtNYXRTZWxlY3RUYWJsZUZpbHRlcn0gZnJvbSAnLi9NYXRTZWxlY3RUYWJsZUZpbHRlcic7XHJcbmltcG9ydCB7TWF0U2VsZWN0U2VhcmNoQ29tcG9uZW50fSBmcm9tICduZ3gtbWF0LXNlbGVjdC1zZWFyY2gnO1xyXG5cclxuY29uc3QgTUFYX1NBRkVfSU5URUdFUiA9IDkwMDcxOTkyNTQ3NDA5OTE7XHJcblxyXG5AQ29tcG9uZW50KHtcclxuICBzZWxlY3RvcjogJ25neC1tYXQtc2VsZWN0LXRhYmxlJyxcclxuICB0ZW1wbGF0ZVVybDogJy4vbWF0LXNlbGVjdC10YWJsZS5jb21wb25lbnQuaHRtbCcsXHJcbiAgc3R5bGVVcmxzOiBbJy4vbWF0LXNlbGVjdC10YWJsZS5jb21wb25lbnQuc2NzcyddLFxyXG4gIGV4cG9ydEFzOiAnbmd4LW1hdC1zZWxlY3QtdGFibGUnLFxyXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxyXG4gIHByb3ZpZGVyczogW1xyXG4gICAge1xyXG4gICAgICBwcm92aWRlOiBOR19WQUxVRV9BQ0NFU1NPUixcclxuICAgICAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gTWF0U2VsZWN0VGFibGVDb21wb25lbnQpLFxyXG4gICAgICBtdWx0aTogdHJ1ZVxyXG4gICAgfVxyXG4gIF1cclxufSlcclxuZXhwb3J0IGNsYXNzIE1hdFNlbGVjdFRhYmxlQ29tcG9uZW50IGltcGxlbWVudHMgQ29udHJvbFZhbHVlQWNjZXNzb3IsIE9uSW5pdCwgQWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95LCBPbkNoYW5nZXMge1xyXG5cclxuICAvKiogRGF0YSBTb3VyY2UgZm9yIHRoZSB0YWJsZSAqL1xyXG4gIEBJbnB1dCgpIGRhdGFTb3VyY2U6IE1hdFNlbGVjdFRhYmxlRGF0YVNvdXJjZTxNYXRTZWxlY3RUYWJsZVJvdz47XHJcblxyXG4gIC8qKlxyXG4gICAqIE11bHRpcGxlL1NpbmdsZSBtb2RlIGZvciB7QHNlZSBNYXRTZWxlY3QjbXVsdGlwbGV9IHRvIGluaXRpYWxpemUuXHJcbiAgICogTkI6IHN3aXRjaGluZyBiZXR3ZWVuIG1vZGVzIGluIHJ1bnRpbWUgaXMgbm90IHN1cHBvcnRlZCBieSB7QHNlZSBNYXRTZWxlY3R9XHJcbiAgICovXHJcbiAgQElucHV0KCkgbXVsdGlwbGU6IGJvb2xlYW47XHJcblxyXG4gIC8qKiBXaGV0aGVyIG9yIG5vdCBvdmVyYWxsIHNlYXJjaCBtb2RlIGVuYWJsZWQuIFNlZSB7QHNlZSBNYXRTZWxlY3RUYWJsZUNvbXBvbmVudH0gKi9cclxuICBASW5wdXQoKSBvdmVyYWxsU2VhcmNoRW5hYmxlZDogYm9vbGVhbjtcclxuXHJcbiAgLyoqIERlZmF1bHQgaXMgdHJ1ZSAqL1xyXG4gIEBJbnB1dCgpIG92ZXJhbGxTZWFyY2hWaXNpYmxlOiBib29sZWFuO1xyXG5cclxuICAvKiogV2hldGhlciBvciBub3Qgc2hvdWxkIHtAc2VlIE1hdFNlbGVjdFRhYmxlQ29tcG9uZW50fSBiZSB2aXNpYmxlIG9uIG9wZW4uIERlZmF1bHQgaXMgdHJ1ZSAqL1xyXG4gIEBJbnB1dCgpIHJlc2V0U29ydE9uT3BlbjogYm9vbGVhbjtcclxuXHJcbiAgLyoqIFdoZXRoZXIgb3Igbm90IHByZXZpb3VzIHNlYXJjaCBzaG91bGQgYmUgY2xlYXJlZCBvbiBvcGVuLiBEZWZhdWx0IGlzIHRydWUgKi9cclxuICBASW5wdXQoKSByZXNldEZpbHRlcnNPbk9wZW46IGJvb2xlYW47XHJcblxyXG4gIC8qKlxyXG4gICAqIEZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSB0aGUgZGVmYXVsdCBsYWJlbFxyXG4gICAqL1xyXG4gIEBJbnB1dCgpIGN1c3RvbVRyaWdnZXJMYWJlbEZuOiAodmFsdWU6IE1hdFNlbGVjdFRhYmxlUm93W10pID0+IHN0cmluZztcclxuXHJcbiAgLyoqXHJcbiAgICogVGVtcGxhdGUgdG8gY3VzdG9taXplIHRoZSBkZWZhdWx0IHRyaWdnZXIgbGFiZWwuIEhhcyBsZXNzZXIgcHJpb3JpdHkgdGhhbiB7QHNlZSBNYXRTZWxlY3RUYWJsZUNvbXBvbmVudCNjdXN0b21UcmlnZ2VyTGFiZWxGbn0uXHJcbiAgICogU3Vic3RpdHV0aW9uIGlzIGNhc2Ugc2Vuc2l0aXZlLlxyXG4gICAqIEV4YW1wbGU6ICR7bmFtZX0gJHtpZH0gLSAke2FkZHJlc3N9XHJcbiAgICovXHJcbiAgQElucHV0KCkgY3VzdG9tVHJpZ2dlckxhYmVsVGVtcGxhdGU6IHN0cmluZztcclxuXHJcbiAgLyoqXHJcbiAgICoge0BzZWUgTWF0U2VsZWN0fSBwcm94eSBpbnB1dHMgY29uZmlndXJhdG9yXHJcbiAgICoge0BzZWUgTWF0U2VsZWN0I211bHRpcGxlfSBnZXRzIHZhbHVlIGZyb20ge0BzZWUgTWF0U2VsZWN0VGFibGVDb21wb25lbnQjbXVsdGlwbGV9XHJcbiAgICovXHJcbiAgQElucHV0KCkgbWF0U2VsZWN0Q29uZmlndXJhdG9yOiB7IFtrZXk6IHN0cmluZ106IGFueSB9O1xyXG5cclxuICAvKipcclxuICAgKiB7QHNlZSBNYXRTZWxlY3RTZWFyY2hDb21wb25lbnR9IHByb3h5IGlucHV0cyBjb25maWd1cmF0b3JcclxuICAgKiB7QHNlZSBNYXRTZWxlY3RTZWFyY2hDb21wb25lbnQjY2xlYXJTZWFyY2hJbnB1dH0gZ2V0cyB2YWx1ZSBmcm9tIHtAc2VlIE1hdFNlbGVjdFRhYmxlQ29tcG9uZW50I3Jlc2V0RmlsdGVyc09uT3Blbn1cclxuICAgKiB7QHNlZSBNYXRTZWxlY3RTZWFyY2hDb21wb25lbnR9IHtAc2VlIENvbnRyb2xWYWx1ZUFjY2Vzc29yfSBnZXRzIHZhbHVlIGZyb20ge0BzZWUgTWF0U2VsZWN0VGFibGVDb21wb25lbnQjb3ZlcmFsbEZpbHRlckNvbnRyb2x9XHJcbiAgICovXHJcbiAgQElucHV0KCkgbWF0U2VsZWN0U2VhcmNoQ29uZmlndXJhdG9yOiB7IFtrZXk6IHN0cmluZ106IGFueSB9O1xyXG5cclxuICBAVmlld0NoaWxkKCdjb21wb25lbnRTZWxlY3QnKSBwcml2YXRlIG1hdFNlbGVjdDogTWF0U2VsZWN0O1xyXG5cclxuICBAVmlld0NoaWxkKE1hdFNlbGVjdFNlYXJjaENvbXBvbmVudCkgcHJpdmF0ZSBtYXRTZWxlY3RTZWFyY2g6IE1hdFNlbGVjdFNlYXJjaENvbXBvbmVudDtcclxuXHJcbiAgQFZpZXdDaGlsZChNYXRTb3J0KSBwcml2YXRlIHNvcnQ6IE1hdFNvcnQ7XHJcblxyXG4gIEBWaWV3Q2hpbGQoTWF0VGFibGUpIHByaXZhdGUgdGFibGU6IE1hdFRhYmxlPE1hdFNlbGVjdFRhYmxlUm93PjtcclxuXHJcbiAgQFZpZXdDaGlsZCgndGFibGUnLCB7cmVhZDogRWxlbWVudFJlZn0pIHByaXZhdGUgdGFibGVSZWY6IEVsZW1lbnRSZWY7XHJcblxyXG4gIEBWaWV3Q2hpbGRyZW4oTWF0T3B0aW9uKSBwcml2YXRlIG1hdE9wdGlvbnM6IFF1ZXJ5TGlzdDxNYXRPcHRpb24+O1xyXG5cclxuICB0YWJsZURhdGFTb3VyY2U6IE1hdFNlbGVjdFRhYmxlUm93W107XHJcblxyXG4gIHRhYmxlQ29sdW1uczogc3RyaW5nW107XHJcblxyXG4gIHRhYmxlQ29sdW1uc01hcDogTWFwPHN0cmluZywgTWF0U2VsZWN0VGFibGVDb2x1bW4+O1xyXG5cclxuICB0YWJsZUFjdGl2ZVJvdzogbnVtYmVyO1xyXG5cclxuICBmaWx0ZXJlZE91dFJvd3M6IHsgW2tleTogc3RyaW5nXTogTWF0U2VsZWN0VGFibGVSb3cgfTtcclxuXHJcbiAgY29tcGxldGVSb3dMaXN0OiBNYXRTZWxlY3RUYWJsZVJvd1tdID0gW107XHJcblxyXG4gIG92ZXJhbGxTZWFyY2hWaXNpYmxlU3RhdGU6IGJvb2xlYW47XHJcblxyXG4gIG92ZXJhbGxGaWx0ZXJDb250cm9sOiBGb3JtQ29udHJvbDtcclxuXHJcbiAgcHJpdmF0ZSBmaWx0ZXJDb250cm9sczogRm9ybUdyb3VwO1xyXG5cclxuICBwcml2YXRlIGNvbXBsZXRlVmFsdWVMaXN0OiBhbnlbXSA9IFtdO1xyXG5cclxuICBwcml2YXRlIGNvbnRyb2xWYWx1ZUFjY2Vzc29yS2V5czogc3RyaW5nW10gPSBbXHJcbiAgICAnZm9ybUNvbnRyb2wnLFxyXG4gICAgJ2Zvcm1Db250cm9sTmFtZScsXHJcbiAgICAnZm9ybUdyb3VwJyxcclxuICAgICdmb3JtR3JvdXBOYW1lJyxcclxuICAgICdmb3JtQXJyYXknLFxyXG4gICAgJ2Zvcm1BcnJheU5hbWUnXHJcbiAgXTtcclxuXHJcbiAgLyoqIFN1YmplY3QgdGhhdCBlbWl0cyB3aGVuIHRoZSBjb21wb25lbnQgaGFzIGJlZW4gZGVzdHJveWVkLiAqL1xyXG4gIHByaXZhdGUgX29uRGVzdHJveSA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XHJcblxyXG4gIHByaXZhdGUgX29uT3B0aW9uc0NoYW5nZSA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgY2Q6IENoYW5nZURldGVjdG9yUmVmKSB7XHJcbiAgICB0aGlzLnRhYmxlQ29sdW1uc01hcCA9IG5ldyBNYXAoKTtcclxuICAgIHRoaXMuZmlsdGVyQ29udHJvbHMgPSBuZXcgRm9ybUdyb3VwKHt9KTtcclxuICAgIHRoaXMub3ZlcmFsbEZpbHRlckNvbnRyb2wgPSBuZXcgRm9ybUNvbnRyb2woJycpO1xyXG4gIH1cclxuXHJcbiAgbmdPbkluaXQoKTogdm9pZCB7XHJcbiAgICB0aGlzLm11bHRpcGxlID0gdGhpcy5tdWx0aXBsZSB8fCBmYWxzZTtcclxuICAgIHRoaXMubWF0U2VsZWN0Lm9wZW5lZENoYW5nZVxyXG4gICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5fb25EZXN0cm95KSlcclxuICAgICAgLnN1YnNjcmliZShvcGVuZWQgPT4ge1xyXG4gICAgICAgIGlmICh0aGlzLnJlc2V0RmlsdGVyc09uT3BlbiAhPT0gZmFsc2UgfHwgIXRoaXMubWF0T3B0aW9ucy5sZW5ndGgpIHtcclxuICAgICAgICAgIHRoaXMucmVzZXRGaWx0ZXJzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghb3BlbmVkKSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMub3ZlcmFsbFNlYXJjaFZpc2libGVTdGF0ZSA9IHRoaXMub3ZlcmFsbFNlYXJjaFZpc2libGU7XHJcbiAgICAgICAgaWYgKHRoaXMucmVzZXRTb3J0T25PcGVuICE9PSBmYWxzZSkge1xyXG4gICAgICAgICAgdGhpcy5zb3J0LnNvcnQoe2lkOiAnJywgc3RhcnQ6ICdhc2MnLCBkaXNhYmxlQ2xlYXI6IGZhbHNlfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLm92ZXJhbGxTZWFyY2hFbmFibGVkKSB7XHJcbiAgICAgICAgICB0aGlzLnByb3h5TWF0U2VsZWN0U2VhcmNoQ29uZmlndXJhdGlvbih0aGlzLm1hdFNlbGVjdFNlYXJjaENvbmZpZ3VyYXRvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIFRvRG86IGdldCByaWQgb2YgdGhpcyB3b3JrYXJvdW5kICh1cGRhdGVzIGhlYWRlciByb3cgW290aGVyd2lzZSBzb3J0IG1lY2hhbmlzbSBwcm9kdWNlcyBnbGl0Y2hlc10pXHJcbiAgICAgICAgKHRoaXMudGFibGUgYXMgYW55KS5faGVhZGVyUm93RGVmQ2hhbmdlZCA9IHRydWU7XHJcbiAgICAgICAgLy8gRGlzYWJsZSBzb3J0IGJ1dHRvbnMgdG8gcHJldmVudCBzb3J0aW5nIGNoYW5nZSBvbiBTUEFDRSBrZXkgcHJlc3NlZCBpbiBmaWx0ZXIgZmllbGRcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IFtdLmZvckVhY2guY2FsbChcclxuICAgICAgICAgIHRoaXMudGFibGVSZWYubmF0aXZlRWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCdidXR0b24ubWF0LXNvcnQtaGVhZGVyLWJ1dHRvbicpLFxyXG4gICAgICAgICAgKGUpID0+IGUuZGlzYWJsZWQgPSB0cnVlKVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIC8vIFBhdGNoIHRoZSBoZWlnaHQgb2YgdGhlIHBhbmVsIHRvIGluY2x1ZGUgdGhlIGhlaWdodCBvZiB0aGUgaGVhZGVyIGFuZCBmb290ZXJcclxuICAgICAgICBjb25zdCBwYW5lbEVsZW1lbnQ6IEhUTUxEaXZFbGVtZW50ID0gdGhpcy5tYXRTZWxlY3QucGFuZWwubmF0aXZlRWxlbWVudDtcclxuICAgICAgICBjb25zdCBwYW5lbEhlaWdodCA9IHBhbmVsRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQ7XHJcbiAgICAgICAgbGV0IHRhYmxlQWRkaXRpb25hbEhlaWdodCA9IDA7XHJcbiAgICAgICAgdGhpcy50YWJsZVxyXG4gICAgICAgICAgLl9nZXRSZW5kZXJlZFJvd3ModGhpcy50YWJsZS5faGVhZGVyUm93T3V0bGV0KVxyXG4gICAgICAgICAgLmNvbmNhdCh0aGlzLnRhYmxlLl9nZXRSZW5kZXJlZFJvd3ModGhpcy50YWJsZS5fZm9vdGVyUm93T3V0bGV0KSlcclxuICAgICAgICAgIC5mb3JFYWNoKHJvdyA9PiB0YWJsZUFkZGl0aW9uYWxIZWlnaHQgKz0gcm93LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodCk7XHJcbiAgICAgICAgaWYgKCFpc05hTihwYW5lbEhlaWdodCkpIHtcclxuICAgICAgICAgIHBhbmVsRWxlbWVudC5zdHlsZS5tYXhIZWlnaHQgPSBgJHtwYW5lbEhlaWdodCArIHRhYmxlQWRkaXRpb25hbEhlaWdodH1weGA7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICB9XHJcblxyXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcclxuICAgIG1lcmdlKC4uLltcclxuICAgICAgdGhpcy5zb3J0LnNvcnRDaGFuZ2UsXHJcbiAgICAgIHRoaXMuZmlsdGVyQ29udHJvbHMudmFsdWVDaGFuZ2VzLFxyXG4gICAgICB0aGlzLm92ZXJhbGxGaWx0ZXJDb250cm9sLnZhbHVlQ2hhbmdlc1xyXG4gICAgXSlcclxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX29uRGVzdHJveSksIGRlYm91bmNlVGltZSgxMDApKVxyXG4gICAgICAuc3Vic2NyaWJlKCgpID0+IHtcclxuICAgICAgICBjb25zdCBkYXRhQ2xvbmU6IE1hdFNlbGVjdFRhYmxlUm93W10gPSBbLi4udGhpcy5kYXRhU291cmNlLmRhdGFdO1xyXG5cclxuICAgICAgICAvLyBBcHBseSBmaWx0ZXJpbmdcclxuICAgICAgICBpZiAodGhpcy5vdmVyYWxsU2VhcmNoRW5hYmxlZCAmJiB0aGlzLm92ZXJhbGxTZWFyY2hWaXNpYmxlU3RhdGUpIHtcclxuICAgICAgICAgIHRoaXMuYXBwbHlPdmVyYWxsRmlsdGVyKGRhdGFDbG9uZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuYXBwbHlDb2x1bW5MZXZlbEZpbHRlcnMoZGF0YUNsb25lKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEFwcGx5IHNvcnRpbmdcclxuICAgICAgICB0aGlzLnRhYmxlRGF0YVNvdXJjZSA9ICF0aGlzLnNvcnQuZGlyZWN0aW9uID8gZGF0YUNsb25lIDogdGhpcy5zb3J0RGF0YShkYXRhQ2xvbmUsIHRoaXMuc29ydCk7XHJcblxyXG4gICAgICAgIHRoaXMuY2QuZGV0ZWN0Q2hhbmdlcygpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAvLyBNYW51YWxseSBzb3J0IGRhdGEgZm9yIHRoaXMubWF0U2VsZWN0Lm9wdGlvbnMgKFF1ZXJ5TGlzdDxNYXRPcHRpb24+KSBhbmQgbm90aWZ5IG1hdFNlbGVjdC5vcHRpb25zIG9mIGNoYW5nZXNcclxuICAgIC8vIEl0J3MgaW1wb3J0YW50IHRvIGtlZXAgdGhpcy5tYXRTZWxlY3Qub3B0aW9ucyBvcmRlciBzeW5jaHJvbml6ZWQgd2l0aCBkYXRhIGluIHRoZSB0YWJsZVxyXG4gICAgLy8gICAgIGJlY2F1c2UgdGhpcy5tYXRTZWxlY3Qub3B0aW9ucyAoUXVlcnlMaXN0PE1hdE9wdGlvbj4pIGRvZXNuJ3QgdXBkYXRlIGl0J3Mgc3RhdGUgYWZ0ZXIgdGFibGUgZGF0YSBpcyBjaGFuZ2VkXHJcbiAgICB0aGlzLm1hdE9wdGlvbnMuY2hhbmdlcy5zdWJzY3JpYmUoKCkgPT4ge1xyXG4gICAgICBjb25zdCBvcHRpb25zOiB7IFtrZXk6IHN0cmluZ106IE1hdE9wdGlvbiB9ID0ge307XHJcbiAgICAgIHRoaXMubWF0T3B0aW9ucy50b0FycmF5KClcclxuICAgICAgICAuZmlsdGVyKG9wdGlvbiA9PiAhaXNOdWxsT3JVbmRlZmluZWQob3B0aW9uKSlcclxuICAgICAgICAuZm9yRWFjaChvcHRpb24gPT4gb3B0aW9uc1tgJHtvcHRpb24udmFsdWV9YF0gPSBvcHRpb24pO1xyXG4gICAgICB0aGlzLm1hdFNlbGVjdC5vcHRpb25zLnJlc2V0KHRoaXMudGFibGVEYXRhU291cmNlXHJcbiAgICAgICAgLmZpbHRlcihyb3cgPT4gIWlzTnVsbE9yVW5kZWZpbmVkKG9wdGlvbnNbYCR7cm93LmlkfWBdKSlcclxuICAgICAgICAubWFwKHJvdyA9PiBvcHRpb25zW2Ake3Jvdy5pZH1gXSkpO1xyXG4gICAgICB0aGlzLm1hdFNlbGVjdC5vcHRpb25zLm5vdGlmeU9uQ2hhbmdlcygpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKCFpc051bGxPclVuZGVmaW5lZCh0aGlzLm1hdFNlbGVjdC5fa2V5TWFuYWdlcikpIHtcclxuICAgICAgLy8gU3Vic2NyaWJlIG9uIEtleU1hbmFnZXIgY2hhbmdlcyB0byBoaWdobGlnaHQgdGhlIHRhYmxlIHJvd3MgYWNjb3JkaW5nbHlcclxuICAgICAgdGhpcy5tYXRTZWxlY3QuX2tleU1hbmFnZXIuY2hhbmdlXHJcbiAgICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX29uRGVzdHJveSkpXHJcbiAgICAgICAgLnN1YnNjcmliZShhY3RpdmVSb3cgPT4gdGhpcy50YWJsZUFjdGl2ZVJvdyA9IGFjdGl2ZVJvdyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcclxuICAgIHRoaXMuX29uRGVzdHJveS5uZXh0KCk7XHJcbiAgICB0aGlzLl9vbkRlc3Ryb3kuY29tcGxldGUoKTtcclxuICB9XHJcblxyXG4gIHJlZ2lzdGVyT25DaGFuZ2UoZm46ICh2YWx1ZTogYW55KSA9PiB2b2lkKTogdm9pZCB7XHJcbiAgICBjb25zdCBwcm94eUZuOiAodmFsdWU6IGFueSkgPT4gdm9pZCA9ICh2YWx1ZTogYW55KSA9PiB7XHJcbiAgICAgIC8vIFRvRG86IHJlZmFjdG9yIC0gY29tcGFyaXNvbiBtZWNoYW5pc20gaXNuJ3Qgb3B0aW1pemVkLiBmaWx0ZXJlZE91dFJvd3MgaXMgYSBtYXAgYnV0IGNvbXBsZXRlVmFsdWVMaXN0IGlzIGFuIGFycmF5XHJcbiAgICAgIGlmICh0aGlzLm11bHRpcGxlID09PSB0cnVlKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IHRoaXMuY29tcGxldGVWYWx1ZUxpc3QubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgIGlmICh0aGlzLmZpbHRlcmVkT3V0Um93c1tgJHt0aGlzLmNvbXBsZXRlVmFsdWVMaXN0W2ldfWBdID09PSB1bmRlZmluZWQgJiYgdmFsdWUuaW5kZXhPZih0aGlzLmNvbXBsZXRlVmFsdWVMaXN0W2ldKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgdGhpcy5jb21wbGV0ZVZhbHVlTGlzdC5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhbHVlXHJcbiAgICAgICAgICAuZmlsdGVyKGNob2ljZSA9PiB0aGlzLmNvbXBsZXRlVmFsdWVMaXN0LmluZGV4T2YoY2hvaWNlKSA9PT0gLTEpXHJcbiAgICAgICAgICAuZm9yRWFjaChjaG9pY2UgPT4gdGhpcy5jb21wbGV0ZVZhbHVlTGlzdC5wdXNoKGNob2ljZSkpO1xyXG4gICAgICAgIHRoaXMubWF0U2VsZWN0LnZhbHVlID0gdGhpcy5jb21wbGV0ZVZhbHVlTGlzdDtcclxuICAgICAgICBmbih0aGlzLmNvbXBsZXRlVmFsdWVMaXN0KTtcclxuICAgICAgICB0aGlzLmNvbXBsZXRlUm93TGlzdC5zcGxpY2UoMCk7XHJcbiAgICAgICAgdGhpcy5kYXRhU291cmNlLmRhdGFcclxuICAgICAgICAgIC5maWx0ZXIocm93ID0+IHRoaXMuY29tcGxldGVWYWx1ZUxpc3QuaW5kZXhPZihyb3cuaWQpICE9PSAtMSlcclxuICAgICAgICAgIC5mb3JFYWNoKHJvdyA9PiB0aGlzLmNvbXBsZXRlUm93TGlzdC5wdXNoKHJvdykpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGZuKHZhbHVlKTtcclxuICAgICAgICB0aGlzLmNvbXBsZXRlUm93TGlzdC5zcGxpY2UoMCk7XHJcbiAgICAgICAgdGhpcy5kYXRhU291cmNlLmRhdGFcclxuICAgICAgICAgIC5maWx0ZXIocm93ID0+IHJvdy5pZCA9PT0gdmFsdWUpXHJcbiAgICAgICAgICAuZm9yRWFjaChyb3cgPT4gdGhpcy5jb21wbGV0ZVJvd0xpc3QucHVzaChyb3cpKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIHRoaXMubWF0U2VsZWN0LnJlZ2lzdGVyT25DaGFuZ2UocHJveHlGbik7XHJcbiAgfVxyXG5cclxuICByZWdpc3Rlck9uVG91Y2hlZChmbjogKCkgPT4ge30pOiB2b2lkIHtcclxuICAgIHRoaXMubWF0U2VsZWN0LnJlZ2lzdGVyT25Ub3VjaGVkKGZuKTtcclxuICB9XHJcblxyXG4gIHNldERpc2FibGVkU3RhdGUoaXNEaXNhYmxlZDogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgdGhpcy5tYXRTZWxlY3Quc2V0RGlzYWJsZWRTdGF0ZShpc0Rpc2FibGVkKTtcclxuICB9XHJcblxyXG4gIHdyaXRlVmFsdWUodmFsdWU6IGFueSk6IHZvaWQge1xyXG4gICAgdGhpcy51cGRhdGVDb21wbGV0ZVJvd0xpc3QodmFsdWUpO1xyXG4gICAgdGhpcy5tYXRTZWxlY3Qud3JpdGVWYWx1ZSh2YWx1ZSk7XHJcbiAgICBpZiAodGhpcy5tYXRTZWxlY3QudmFsdWUgIT09IHZhbHVlKSB7XHJcbiAgICAgIHRoaXMubWF0U2VsZWN0LnZhbHVlID0gdmFsdWU7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKTogdm9pZCB7XHJcblxyXG4gICAgaWYgKCFpc051bGxPclVuZGVmaW5lZChjaGFuZ2VzLnJlc2V0RmlsdGVyc09uT3BlbikgJiYgY2hhbmdlcy5yZXNldEZpbHRlcnNPbk9wZW4uY3VycmVudFZhbHVlICE9PSBmYWxzZSkge1xyXG4gICAgICB0aGlzLnJlc2V0RmlsdGVycygpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghaXNOdWxsT3JVbmRlZmluZWQoY2hhbmdlcy5kYXRhU291cmNlKSkge1xyXG4gICAgICB0aGlzLnVwZGF0ZUNvbXBsZXRlUm93TGlzdCh0aGlzLmNvbXBsZXRlUm93TGlzdC5tYXAocm93ID0+IHJvdy5pZCkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFByb3h5IEBJbnB1dCBiaW5kaW5ncyB0byBNYXRTZWxlY3RcclxuICAgIGlmICghaXNOdWxsT3JVbmRlZmluZWQoY2hhbmdlcy5tYXRTZWxlY3RDb25maWd1cmF0b3IpKSB7XHJcbiAgICAgIGNvbnN0IGNvbmZpZ3VyYXRpb24gPSBjaGFuZ2VzLm1hdFNlbGVjdENvbmZpZ3VyYXRvci5jdXJyZW50VmFsdWU7XHJcbiAgICAgIE9iamVjdC5rZXlzKGNvbmZpZ3VyYXRpb24pXHJcbiAgICAgICAgLmZpbHRlcihrZXkgPT4gIVsnbXVsdGlwbGUnLCAncGFuZWxDbGFzcyddLmluY2x1ZGVzKGtleSkgJiYgIXRoaXMuY29udHJvbFZhbHVlQWNjZXNzb3JLZXlzLmluY2x1ZGVzKGtleSkpXHJcbiAgICAgICAgLmZvckVhY2goa2V5ID0+IHRoaXMubWF0U2VsZWN0W2tleV0gPSBjb25maWd1cmF0aW9uW2tleV0pO1xyXG4gICAgICBjb25zdCBwYW5lbENsYXNzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKGNvbmZpZ3VyYXRpb24ucGFuZWxDbGFzcykpIHtcclxuICAgICAgICBwYW5lbENsYXNzLnB1c2goY29uZmlndXJhdGlvbi5wYW5lbENsYXNzKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAodGhpcy5vdmVyYWxsU2VhcmNoRW5hYmxlZCkge1xyXG4gICAgICAgIHBhbmVsQ2xhc3MucHVzaCgnbWF0LXNlbGVjdC1zZWFyY2gtcGFuZWwnKTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLm1hdFNlbGVjdC5wYW5lbENsYXNzID0gcGFuZWxDbGFzcztcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKGNoYW5nZXMubWF0U2VsZWN0U2VhcmNoQ29uZmlndXJhdG9yKSkge1xyXG4gICAgICB0aGlzLnByb3h5TWF0U2VsZWN0U2VhcmNoQ29uZmlndXJhdGlvbihjaGFuZ2VzLm1hdFNlbGVjdFNlYXJjaENvbmZpZ3VyYXRvci5jdXJyZW50VmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghaXNOdWxsT3JVbmRlZmluZWQoY2hhbmdlcy5kYXRhU291cmNlKVxyXG4gICAgICAmJiAhaXNOdWxsT3JVbmRlZmluZWQoY2hhbmdlcy5kYXRhU291cmNlLmN1cnJlbnRWYWx1ZSlcclxuICAgICAgJiYgaXNBcnJheShjaGFuZ2VzLmRhdGFTb3VyY2UuY3VycmVudFZhbHVlLmRhdGEpKSB7XHJcbiAgICAgIHRoaXMudGFibGVEYXRhU291cmNlID0gWy4uLmNoYW5nZXMuZGF0YVNvdXJjZS5jdXJyZW50VmFsdWUuZGF0YV07XHJcbiAgICAgIHRoaXMudGFibGVDb2x1bW5zID0gWydfc2VsZWN0aW9uJywgLi4uY2hhbmdlcy5kYXRhU291cmNlLmN1cnJlbnRWYWx1ZS5jb2x1bW5zLm1hcChjb2x1bW4gPT4gY29sdW1uLmtleSldO1xyXG4gICAgICB0aGlzLnRhYmxlQ29sdW1uc01hcC5jbGVhcigpO1xyXG4gICAgICBjaGFuZ2VzLmRhdGFTb3VyY2UuY3VycmVudFZhbHVlLmNvbHVtbnMuZm9yRWFjaChjb2x1bW4gPT4gdGhpcy50YWJsZUNvbHVtbnNNYXAuc2V0KGNvbHVtbi5rZXksIGNvbHVtbikpO1xyXG4gICAgICB0aGlzLmFwcGx5UHJveHlUb0FycmF5KGNoYW5nZXMuZGF0YVNvdXJjZS5jdXJyZW50VmFsdWUuZGF0YSwgKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuX29uT3B0aW9uc0NoYW5nZS5uZXh0KCk7XHJcbiAgICAgIH0pO1xyXG4gICAgICB0aGlzLl9vbk9wdGlvbnNDaGFuZ2UubmV4dCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZW11bGF0ZU1hdE9wdGlvbkNsaWNrKGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCB7XHJcbiAgICBpZiAoZXZlbnQuY29tcG9zZWRQYXRoKClcclxuICAgICAgLmZpbHRlcihldCA9PiBldCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KVxyXG4gICAgICAuc29tZSgoZXQ6IEhUTUxFbGVtZW50KSA9PiBldC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdtYXQtb3B0aW9uJykpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgaWYgKCEoZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGxldCByb3dFbGVtZW50ID0gZXZlbnQudGFyZ2V0O1xyXG4gICAgd2hpbGUgKHJvd0VsZW1lbnQgIT0gbnVsbCAmJiByb3dFbGVtZW50IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgJiYgcm93RWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgIT09ICd0cicpIHtcclxuICAgICAgcm93RWxlbWVudCA9IHJvd0VsZW1lbnQucGFyZW50RWxlbWVudDtcclxuICAgIH1cclxuICAgIGlmIChyb3dFbGVtZW50ID09PSBudWxsKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGNvbnN0IGNoaWxkT3B0aW9uOiBIVE1MRWxlbWVudCA9IHJvd0VsZW1lbnQucXVlcnlTZWxlY3RvcignbWF0LW9wdGlvbicpO1xyXG4gICAgaWYgKCFjaGlsZE9wdGlvbikge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBjaGlsZE9wdGlvbi5jbGljaygpO1xyXG4gIH1cclxuXHJcblxyXG4gIGZpbHRlckZvcm1Db250cm9sKGtleTogc3RyaW5nKTogRm9ybUNvbnRyb2wge1xyXG4gICAgaWYgKCF0aGlzLmZpbHRlckNvbnRyb2xzLmNvbnRhaW5zKGtleSkpIHtcclxuICAgICAgdGhpcy5maWx0ZXJDb250cm9scy5yZWdpc3RlckNvbnRyb2woa2V5LCBuZXcgRm9ybUNvbnRyb2woJycpKTtcclxuICAgIH1cclxuICAgIHJldHVybiA8Rm9ybUNvbnRyb2w+dGhpcy5maWx0ZXJDb250cm9scy5nZXQoa2V5KTtcclxuICB9XHJcblxyXG4gIHNpbXBsZVRyaWdnZXJMYWJlbEZuKHZhbHVlOiBNYXRTZWxlY3RUYWJsZVJvd1tdKTogc3RyaW5nIHtcclxuICAgIHJldHVybiB2YWx1ZS5tYXAocm93ID0+IHtcclxuICAgICAgaWYgKGlzTnVsbE9yVW5kZWZpbmVkKHJvdykpIHtcclxuICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGlzTnVsbE9yVW5kZWZpbmVkKHRoaXMuY3VzdG9tVHJpZ2dlckxhYmVsVGVtcGxhdGUpXHJcbiAgICAgICAgfHwgdHlwZW9mIHRoaXMuY3VzdG9tVHJpZ2dlckxhYmVsVGVtcGxhdGUgIT09ICdzdHJpbmcnXHJcbiAgICAgICAgfHwgdGhpcy5jdXN0b21UcmlnZ2VyTGFiZWxUZW1wbGF0ZS50cmltKCkubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuIGAke3Jvdy5pZH1gO1xyXG4gICAgICB9XHJcbiAgICAgIGxldCBhdExlYXN0UGFydGlhbFN1YnN0aXR1dGlvbiA9IGZhbHNlO1xyXG4gICAgICBjb25zdCBzdWJzdGl0dXRpb246IHN0cmluZyA9IHRoaXMuY3VzdG9tVHJpZ2dlckxhYmVsVGVtcGxhdGUucmVwbGFjZSgvWyRdezF9W3tdezF9KFtefV0rKVt9XXsxfT8vZywgKF8sIGtleSkgPT5cclxuICAgICAgICAhaXNOdWxsT3JVbmRlZmluZWQocm93W2tleV0pICYmIChhdExlYXN0UGFydGlhbFN1YnN0aXR1dGlvbiA9IHRydWUpID8gcm93W2tleV0gOiAnJyk7XHJcbiAgICAgIGlmIChhdExlYXN0UGFydGlhbFN1YnN0aXR1dGlvbiA9PT0gZmFsc2UpIHtcclxuICAgICAgICByZXR1cm4gYCR7cm93LmlkfWA7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHN1YnN0aXR1dGlvbi50cmltKCk7XHJcbiAgICB9KS5qb2luKCcsICcpO1xyXG4gIH1cclxuXHJcbiAgdG9nZ2xlT3ZlcmFsbFNlYXJjaCgpOiB2b2lkIHtcclxuICAgIHRoaXMub3ZlcmFsbFNlYXJjaFZpc2libGVTdGF0ZSA9ICF0aGlzLm92ZXJhbGxTZWFyY2hWaXNpYmxlU3RhdGU7XHJcbiAgICB0aGlzLnJlc2V0RmlsdGVycygpO1xyXG4gICAgaWYgKHRoaXMub3ZlcmFsbFNlYXJjaFZpc2libGVTdGF0ZSkge1xyXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMubWF0U2VsZWN0U2VhcmNoLl9mb2N1cygpKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgdXBkYXRlQ29tcGxldGVSb3dMaXN0KHZhbHVlOiBhbnlbXSk6IHZvaWQge1xyXG4gICAgdGhpcy5jb21wbGV0ZVJvd0xpc3Quc3BsaWNlKDApO1xyXG4gICAgaWYgKCFpc051bGxPclVuZGVmaW5lZCh2YWx1ZSkpIHtcclxuICAgICAgY29uc3QgdmFsdWVBcnJheTogYW55W10gPSAhaXNBcnJheSh2YWx1ZSkgPyBbdmFsdWVdIDogdmFsdWU7XHJcbiAgICAgIHZhbHVlQXJyYXkuZm9yRWFjaChpdGVtID0+IHtcclxuICAgICAgICBjb25zdCByb3dGb3VuZCA9IHRoaXMuZGF0YVNvdXJjZS5kYXRhLmZpbmQocm93ID0+IHJvdy5pZCA9PT0gaXRlbSk7XHJcbiAgICAgICAgaWYgKHJvd0ZvdW5kID09PSBudWxsKSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuY29tcGxldGVSb3dMaXN0LnB1c2gocm93Rm91bmQpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgcHJveHlNYXRTZWxlY3RTZWFyY2hDb25maWd1cmF0aW9uKGNvbmZpZ3VyYXRpb246IHsgW2tleTogc3RyaW5nXTogYW55IH0pOiB2b2lkIHtcclxuICAgIGlmIChpc051bGxPclVuZGVmaW5lZCh0aGlzLm1hdFNlbGVjdFNlYXJjaCkpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFByb3h5IEBJbnB1dCBiaW5kaW5ncyB0byBOZ3hNYXRTZWxlY3RTZWFyY2hcclxuICAgIE9iamVjdC5rZXlzKGNvbmZpZ3VyYXRpb24pXHJcbiAgICAgIC5maWx0ZXIoa2V5ID0+ICFbJ2NsZWFyU2VhcmNoSW5wdXQnXS5pbmNsdWRlcyhrZXkpICYmICF0aGlzLmNvbnRyb2xWYWx1ZUFjY2Vzc29yS2V5cy5pbmNsdWRlcyhrZXkpKVxyXG4gICAgICAuZm9yRWFjaChrZXkgPT4gdGhpcy5tYXRTZWxlY3RTZWFyY2hba2V5XSA9IGNvbmZpZ3VyYXRpb25ba2V5XSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFwcGx5Q29sdW1uTGV2ZWxGaWx0ZXJzKGRhdGE6IE1hdFNlbGVjdFRhYmxlUm93W10pOiB2b2lkIHtcclxuICAgIHRoaXMuZmlsdGVyZWRPdXRSb3dzID0ge307XHJcbiAgICBjb25zdCBmaWx0ZXJzOiB7IFtrZXk6IHN0cmluZ106IHsgZmlsdGVyOiBNYXRTZWxlY3RUYWJsZUZpbHRlciwgdmFsdWU6IGFueSB9IH0gPSB7fTtcclxuICAgIE9iamVjdC5rZXlzKHRoaXMuZmlsdGVyQ29udHJvbHMuY29udHJvbHMpXHJcbiAgICAgIC5maWx0ZXIoa2V5ID0+IHRoaXMudGFibGVDb2x1bW5zTWFwLmhhcyhrZXkpXHJcbiAgICAgICAgJiYgIWlzTnVsbE9yVW5kZWZpbmVkKHRoaXMudGFibGVDb2x1bW5zTWFwLmdldChrZXkpLmZpbHRlcilcclxuICAgICAgICAvLyBJZiBmaWx0ZXIgaXMgZW5hYmxlZFxyXG4gICAgICAgICYmIHRoaXMudGFibGVDb2x1bW5zTWFwLmdldChrZXkpLmZpbHRlci5lbmFibGVkICE9PSBmYWxzZSlcclxuICAgICAgLmZpbHRlcihrZXkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5maWx0ZXJDb250cm9scy5nZXQoa2V5KS52YWx1ZTtcclxuICAgICAgICByZXR1cm4gIWlzTnVsbE9yVW5kZWZpbmVkKHZhbHVlKVxyXG4gICAgICAgICAgLy8gSWYgYW4gYXJyYXkgLSBjaGVjayBpdCdzIG5vdCBlbXB0eVxyXG4gICAgICAgICAgJiYgKChpc0FycmF5KHZhbHVlKSAmJiB2YWx1ZS5sZW5ndGggPiAwKVxyXG4gICAgICAgICAgICAvLyBJZiBzdHJpbmcgLSBjaGVjayB0aGF0IG5vdCBibGFua1xyXG4gICAgICAgICAgICB8fCAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB2YWx1ZS50cmltKCkubGVuZ3RoID4gMClcclxuICAgICAgICAgICAgLy8gSWYgbnVtYmVyIC0gY2hlY2sgdGhhdCB0b1N0cmluZygpIGlzIG5vdCBibGFua1xyXG4gICAgICAgICAgICB8fCAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiBgJHt2YWx1ZX1gLnRyaW0oKS5sZW5ndGggPiAwKSk7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5mb3JFYWNoKGtleSA9PiBmaWx0ZXJzW2tleV0gPSB7XHJcbiAgICAgICAgZmlsdGVyOiB0aGlzLnRhYmxlQ29sdW1uc01hcC5nZXQoa2V5KS5maWx0ZXIsXHJcbiAgICAgICAgdmFsdWU6IHRoaXMuZmlsdGVyQ29udHJvbHMuZ2V0KGtleSkudmFsdWVcclxuICAgICAgfSk7XHJcbiAgICBjb25zdCBmaWx0ZXJLZXlzOiBzdHJpbmdbXSA9IE9iamVjdC5rZXlzKGZpbHRlcnMpO1xyXG4gICAgZm9yIChsZXQgaSA9IGRhdGEubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgZm9yIChsZXQgayA9IDA7IGsgPCBmaWx0ZXJLZXlzLmxlbmd0aDsgaysrKSB7XHJcbiAgICAgICAgY29uc3QgZmlsdGVyS2V5OiBzdHJpbmcgPSBmaWx0ZXJLZXlzW2tdO1xyXG4gICAgICAgIGNvbnN0IHJvdzogTWF0U2VsZWN0VGFibGVSb3cgPSBkYXRhW2ldO1xyXG4gICAgICAgIGNvbnN0IGNlbGxWYWx1ZTogYW55ID0gcm93W2ZpbHRlcktleV07XHJcbiAgICAgICAgaWYgKGlzTnVsbE9yVW5kZWZpbmVkKGNlbGxWYWx1ZSkpIHtcclxuICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBmaWx0ZXIgPSBmaWx0ZXJzW2ZpbHRlcktleV07XHJcbiAgICAgICAgY29uc3QgY29tcGFyYXRvciA9IGZpbHRlci5maWx0ZXIuY29tcGFyYXRvcjtcclxuICAgICAgICBpZiAodHlwZW9mIGZpbHRlci5maWx0ZXIuY29tcGFyYXRvckZuID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICBpZiAoIWZpbHRlci5maWx0ZXIuY29tcGFyYXRvckZuLmNhbGwobnVsbCwgY2VsbFZhbHVlLCBmaWx0ZXIudmFsdWUsIHJvdykpIHtcclxuICAgICAgICAgICAgZGF0YS5zcGxpY2UoaSwgMSkuZm9yRWFjaChpdGVtID0+IHRoaXMuZmlsdGVyZWRPdXRSb3dzW2Ake2l0ZW0uaWR9YF0gPSBpdGVtKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmIChpc051bGxPclVuZGVmaW5lZChjb21wYXJhdG9yKSB8fCBjb21wYXJhdG9yID09PSAnZXF1YWxzJykge1xyXG4gICAgICAgICAgaWYgKGZpbHRlci52YWx1ZSAhPT0gY2VsbFZhbHVlKSB7XHJcbiAgICAgICAgICAgIGRhdGEuc3BsaWNlKGksIDEpLmZvckVhY2goaXRlbSA9PiB0aGlzLmZpbHRlcmVkT3V0Um93c1tgJHtpdGVtLmlkfWBdID0gaXRlbSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGNlbGxWYWx1ZSA9PT0gJ3N0cmluZycgJiYgdHlwZW9mIGZpbHRlci52YWx1ZSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgIGNvbnN0IGNlbGxWYWx1ZUxDOiBzdHJpbmcgPSBgJHtjZWxsVmFsdWV9YC50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgY29uc3QgZmlsdGVyVmFsdWVMQzogc3RyaW5nID0gZmlsdGVyLnZhbHVlLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICBpZiAoaXNOdWxsT3JVbmRlZmluZWQoY29tcGFyYXRvcikgfHwgY29tcGFyYXRvciA9PT0gJ2VxdWFsc0lnbm9yZUNhc2UnKSB7XHJcbiAgICAgICAgICAgIGlmIChmaWx0ZXJWYWx1ZUxDICE9PSBjZWxsVmFsdWVMQykge1xyXG4gICAgICAgICAgICAgIGRhdGEuc3BsaWNlKGksIDEpLmZvckVhY2goaXRlbSA9PiB0aGlzLmZpbHRlcmVkT3V0Um93c1tgJHtpdGVtLmlkfWBdID0gaXRlbSk7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSBpZiAoY29tcGFyYXRvciA9PT0gJ2NvbnRhaW5zJykge1xyXG4gICAgICAgICAgICBpZiAoY2VsbFZhbHVlLmluZGV4T2YoZmlsdGVyLnZhbHVlKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICBkYXRhLnNwbGljZShpLCAxKS5mb3JFYWNoKGl0ZW0gPT4gdGhpcy5maWx0ZXJlZE91dFJvd3NbYCR7aXRlbS5pZH1gXSA9IGl0ZW0pO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGNvbXBhcmF0b3IgPT09ICdjb250YWluc0lnbm9yZUNhc2UnKSB7XHJcbiAgICAgICAgICAgIGlmIChjZWxsVmFsdWVMQy5pbmRleE9mKGZpbHRlclZhbHVlTEMpID09PSAtMSkge1xyXG4gICAgICAgICAgICAgIGRhdGEuc3BsaWNlKGksIDEpLmZvckVhY2goaXRlbSA9PiB0aGlzLmZpbHRlcmVkT3V0Um93c1tgJHtpdGVtLmlkfWBdID0gaXRlbSk7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSBpZiAoY29tcGFyYXRvciA9PT0gJ3N0YXJ0c1dpdGgnKSB7XHJcbiAgICAgICAgICAgIGlmICghY2VsbFZhbHVlLnN0YXJ0c1dpdGgoZmlsdGVyLnZhbHVlKSkge1xyXG4gICAgICAgICAgICAgIGRhdGEuc3BsaWNlKGksIDEpLmZvckVhY2goaXRlbSA9PiB0aGlzLmZpbHRlcmVkT3V0Um93c1tgJHtpdGVtLmlkfWBdID0gaXRlbSk7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSBpZiAoY29tcGFyYXRvciA9PT0gJ3N0YXJ0c1dpdGhJZ25vcmVDYXNlJykge1xyXG4gICAgICAgICAgICBpZiAoIWNlbGxWYWx1ZUxDLnN0YXJ0c1dpdGgoZmlsdGVyVmFsdWVMQykpIHtcclxuICAgICAgICAgICAgICBkYXRhLnNwbGljZShpLCAxKS5mb3JFYWNoKGl0ZW0gPT4gdGhpcy5maWx0ZXJlZE91dFJvd3NbYCR7aXRlbS5pZH1gXSA9IGl0ZW0pO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFwcGx5T3ZlcmFsbEZpbHRlcihkYXRhOiBNYXRTZWxlY3RUYWJsZVJvd1tdKTogdm9pZCB7XHJcbiAgICB0aGlzLmZpbHRlcmVkT3V0Um93cyA9IHt9O1xyXG4gICAgaWYgKGlzTnVsbE9yVW5kZWZpbmVkKHRoaXMub3ZlcmFsbEZpbHRlckNvbnRyb2wudmFsdWUpKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGNvbnN0IGZpbHRlclZhbHVlTEM6IHN0cmluZyA9IHRoaXMub3ZlcmFsbEZpbHRlckNvbnRyb2wudmFsdWUudG9Mb3dlckNhc2UoKTtcclxuICAgIGlmIChmaWx0ZXJWYWx1ZUxDLnRyaW0oKS5sZW5ndGggPT09IDApIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgZm9yIChsZXQgaSA9IGRhdGEubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgY29uc3Qgcm93OiBNYXRTZWxlY3RUYWJsZVJvdyA9IGRhdGFbaV07XHJcbiAgICAgIGxldCByb3dTaG91bGRCZUZpbHRlcmVkID0gdHJ1ZTtcclxuICAgICAgZm9yIChsZXQgaiA9IHRoaXMuZGF0YVNvdXJjZS5jb2x1bW5zLmxlbmd0aCAtIDE7IGogPj0gMDsgai0tKSB7XHJcbiAgICAgICAgY29uc3Qga2V5OiBzdHJpbmcgPSB0aGlzLmRhdGFTb3VyY2UuY29sdW1uc1tqXS5rZXk7XHJcbiAgICAgICAgY29uc3QgY2VsbFZhbHVlOiBhbnkgPSByb3dba2V5XTtcclxuICAgICAgICBpZiAoaXNOdWxsT3JVbmRlZmluZWQoY2VsbFZhbHVlKSkge1xyXG4gICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGNlbGxWYWx1ZUxDOiBzdHJpbmcgPSBgJHtjZWxsVmFsdWV9YC50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgIGlmIChjZWxsVmFsdWVMQy5pbmRleE9mKGZpbHRlclZhbHVlTEMpICE9PSAtMSkge1xyXG4gICAgICAgICAgcm93U2hvdWxkQmVGaWx0ZXJlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChyb3dTaG91bGRCZUZpbHRlcmVkKSB7XHJcbiAgICAgICAgZGF0YS5zcGxpY2UoaSwgMSkuZm9yRWFjaChpdGVtID0+IHRoaXMuZmlsdGVyZWRPdXRSb3dzW2Ake2l0ZW0uaWR9YF0gPSBpdGVtKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhcHBseVByb3h5VG9BcnJheShhcnJheTogYW55W10sIGNhbGxiYWNrOiAoKSA9PiB2b2lkKTogdm9pZCB7XHJcbiAgICBbJ3BvcCcsICdwdXNoJywgJ3JldmVyc2UnLCAnc2hpZnQnLCAndW5zaGlmdCcsICdzcGxpY2UnLCAnc29ydCddLmZvckVhY2goKG1ldGhvZE5hbWUpID0+IHtcclxuICAgICAgYXJyYXlbbWV0aG9kTmFtZV0gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgY29uc3QgcmVzID0gQXJyYXkucHJvdG90eXBlW21ldGhvZE5hbWVdLmFwcGx5KGFycmF5LCBhcmd1bWVudHMpOyAvLyBjYWxsIG5vcm1hbCBiZWhhdmlvdXJcclxuICAgICAgICBjYWxsYmFjay5hcHBseShhcnJheSwgYXJndW1lbnRzKTsgLy8gZmluYWxseSBjYWxsIHRoZSBjYWxsYmFjayBzdXBwbGllZFxyXG4gICAgICAgIHJldHVybiByZXM7XHJcbiAgICAgIH07XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcmVzZXRGaWx0ZXJzKCk6IHZvaWQge1xyXG4gICAgdGhpcy5vdmVyYWxsRmlsdGVyQ29udHJvbC5zZXRWYWx1ZSgnJyk7XHJcbiAgICBPYmplY3Qua2V5cyh0aGlzLmZpbHRlckNvbnRyb2xzLmNvbnRyb2xzKVxyXG4gICAgICAuZm9yRWFjaChrZXkgPT4gdGhpcy5maWx0ZXJDb250cm9scy5nZXQoa2V5KS5zZXRWYWx1ZSgnJykpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGFrZW4gZnJvbSB7QHNlZSBNYXRUYWJsZURhdGFTb3VyY2Ujc29ydGluZ0RhdGFBY2Nlc3Nvcn1cclxuICAgKlxyXG4gICAqIEBwYXJhbSBkYXRhXHJcbiAgICogQHBhcmFtIHNvcnRIZWFkZXJJZFxyXG4gICAqL1xyXG4gIHByaXZhdGUgc29ydGluZ0RhdGFBY2Nlc3NvcihkYXRhOiBNYXRTZWxlY3RUYWJsZVJvdywgc29ydEhlYWRlcklkOiBzdHJpbmcpOiBzdHJpbmcgfCBudW1iZXIge1xyXG4gICAgY29uc3QgdmFsdWUgPSAoZGF0YSBhcyB7IFtrZXk6IHN0cmluZ106IGFueSB9KVtzb3J0SGVhZGVySWRdO1xyXG5cclxuICAgIGlmIChfaXNOdW1iZXJWYWx1ZSh2YWx1ZSkpIHtcclxuICAgICAgY29uc3QgbnVtYmVyVmFsdWUgPSBOdW1iZXIodmFsdWUpO1xyXG5cclxuICAgICAgLy8gTnVtYmVycyBiZXlvbmQgYE1BWF9TQUZFX0lOVEVHRVJgIGNhbid0IGJlIGNvbXBhcmVkIHJlbGlhYmx5IHNvIHdlXHJcbiAgICAgIC8vIGxlYXZlIHRoZW0gYXMgc3RyaW5ncy4gRm9yIG1vcmUgaW5mbzogaHR0cHM6Ly9nb28uZ2wveTV2YlNnXHJcbiAgICAgIHJldHVybiBudW1iZXJWYWx1ZSA8IE1BWF9TQUZFX0lOVEVHRVIgPyBudW1iZXJWYWx1ZSA6IHZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB2YWx1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRha2VuIGZyb20ge0BzZWUgTWF0VGFibGVEYXRhU291cmNlI3NvcnREYXRhfVxyXG4gICAqXHJcbiAgICogQHBhcmFtIGRhdGFcclxuICAgKiBAcGFyYW0gc29ydFxyXG4gICAqL1xyXG4gIHByaXZhdGUgc29ydERhdGEoZGF0YTogTWF0U2VsZWN0VGFibGVSb3dbXSwgc29ydDogTWF0U29ydCk6IE1hdFNlbGVjdFRhYmxlUm93W10ge1xyXG4gICAgY29uc3QgYWN0aXZlID0gc29ydC5hY3RpdmU7XHJcbiAgICBjb25zdCBkaXJlY3Rpb24gPSBzb3J0LmRpcmVjdGlvbjtcclxuICAgIGlmICghYWN0aXZlIHx8IGRpcmVjdGlvbiA9PT0gJycpIHtcclxuICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGRhdGEuc29ydCgoYSwgYikgPT4ge1xyXG4gICAgICBjb25zdCB2YWx1ZUEgPSB0aGlzLnNvcnRpbmdEYXRhQWNjZXNzb3IoYSwgYWN0aXZlKTtcclxuICAgICAgY29uc3QgdmFsdWVCID0gdGhpcy5zb3J0aW5nRGF0YUFjY2Vzc29yKGIsIGFjdGl2ZSk7XHJcblxyXG4gICAgICAvLyBJZiBib3RoIHZhbHVlQSBhbmQgdmFsdWVCIGV4aXN0ICh0cnV0aHkpLCB0aGVuIGNvbXBhcmUgdGhlIHR3by4gT3RoZXJ3aXNlLCBjaGVjayBpZlxyXG4gICAgICAvLyBvbmUgdmFsdWUgZXhpc3RzIHdoaWxlIHRoZSBvdGhlciBkb2Vzbid0LiBJbiB0aGlzIGNhc2UsIGV4aXN0aW5nIHZhbHVlIHNob3VsZCBjb21lIGZpcnN0LlxyXG4gICAgICAvLyBUaGlzIGF2b2lkcyBpbmNvbnNpc3RlbnQgcmVzdWx0cyB3aGVuIGNvbXBhcmluZyB2YWx1ZXMgdG8gdW5kZWZpbmVkL251bGwuXHJcbiAgICAgIC8vIElmIG5laXRoZXIgdmFsdWUgZXhpc3RzLCByZXR1cm4gMCAoZXF1YWwpLlxyXG4gICAgICBsZXQgY29tcGFyYXRvclJlc3VsdCA9IDA7XHJcbiAgICAgIGlmICh2YWx1ZUEgIT0gbnVsbCAmJiB2YWx1ZUIgIT0gbnVsbCkge1xyXG4gICAgICAgIC8vIENoZWNrIGlmIG9uZSB2YWx1ZSBpcyBncmVhdGVyIHRoYW4gdGhlIG90aGVyOyBpZiBlcXVhbCwgY29tcGFyYXRvclJlc3VsdCBzaG91bGQgcmVtYWluIDAuXHJcbiAgICAgICAgaWYgKHZhbHVlQSA+IHZhbHVlQikge1xyXG4gICAgICAgICAgY29tcGFyYXRvclJlc3VsdCA9IDE7XHJcbiAgICAgICAgfSBlbHNlIGlmICh2YWx1ZUEgPCB2YWx1ZUIpIHtcclxuICAgICAgICAgIGNvbXBhcmF0b3JSZXN1bHQgPSAtMTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSBpZiAodmFsdWVBICE9IG51bGwpIHtcclxuICAgICAgICBjb21wYXJhdG9yUmVzdWx0ID0gMTtcclxuICAgICAgfSBlbHNlIGlmICh2YWx1ZUIgIT0gbnVsbCkge1xyXG4gICAgICAgIGNvbXBhcmF0b3JSZXN1bHQgPSAtMTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIGNvbXBhcmF0b3JSZXN1bHQgKiAoZGlyZWN0aW9uID09PSAnYXNjJyA/IDEgOiAtMSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG59XHJcbiJdfQ==