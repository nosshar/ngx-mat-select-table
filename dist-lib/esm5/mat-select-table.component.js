/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import * as tslib_1 from "tslib";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, forwardRef, Input, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { merge, Subject, timer } from 'rxjs';
import { MatOption, MatSelect, MatSort, MatTable, SELECT_ITEM_HEIGHT_EM } from '@angular/material';
import { isArray, isNullOrUndefined } from 'util';
import { _isNumberValue } from '@angular/cdk/coercion';
import { debounce, debounceTime, distinctUntilChanged, take, takeUntil } from 'rxjs/operators';
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
            _this.overallSearchVisibleState = _this.overallSearchVisible;
            if (_this.resetSortOnOpen !== false) {
                _this.sort.sort({ id: '', start: 'asc', disableClear: false });
            }
            if (!opened) {
                return;
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
            if (!_this.matSelectSearchConfigurator.disableScrollToActiveOnOptionsChanged
                && !isNullOrUndefined(_this.matSelect._keyManager) && _this.completeRowList.length > 0) {
                setTimeout((/**
                 * @return {?}
                 */
                function () {
                    /** @type {?} */
                    var firstValue = "" + _this.completeRowList[0].id;
                    var _loop_1 = function (i) {
                        if ("" + _this.tableDataSource[i].id === firstValue) {
                            _this.matSelect._keyManager.change.pipe(takeUntil(_this._onDestroy), take(1)).subscribe((/**
                             * @return {?}
                             */
                            function () {
                                _this.matSelect._keyManager.setActiveItem(i);
                                _this.cd.detectChanges();
                            }));
                            return "break";
                        }
                    };
                    for (var i = 0; i < _this.tableDataSource.length; i++) {
                        var state_1 = _loop_1(i);
                        if (state_1 === "break")
                            break;
                    }
                }));
            }
            // Manual scrolling implementation
            if (!isNullOrUndefined(_this.matSelect._keyManager)) {
                _this.matSelect._keyManager.change
                    .pipe(takeUntil(_this._onDestroy), debounce((/**
                 * @return {?}
                 */
                function () { return timer(1); })), distinctUntilChanged())
                    .subscribe((/**
                 * @return {?}
                 */
                function () {
                    // ToDo: 1em = 16px hardcode, should be calculated dynamically
                    setTimeout((/**
                     * @return {?}
                     */
                    function () { return panelElement.scrollTop = _this.matSelect._keyManager.activeItemIndex * SELECT_ITEM_HEIGHT_EM * 16; }));
                }));
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
                    styles: [":host{display:block}:host mat-form-field{width:100%}::ng-deep .mat-select-panel{overflow-x:auto!important}::ng-deep .mat-select-panel .overall-search-toggle{z-index:102;position:absolute;left:13px;top:17px;cursor:pointer}::ng-deep .mat-select-panel ngx-mat-select-search{position:absolute;z-index:101}::ng-deep .mat-select-panel ngx-mat-select-search.hidden{display:none}::ng-deep .mat-select-panel ngx-mat-select-search .mat-select-search-inner{height:56px}::ng-deep .mat-select-panel ngx-mat-select-search .mat-select-search-inner .mat-select-search-input{margin-left:26px;width:calc(100% - 26px)}::ng-deep .mat-select-panel table{width:100%}::ng-deep .mat-select-panel table tr{cursor:pointer}::ng-deep .mat-select-panel table tr.active{background:rgba(0,0,0,.04)}::ng-deep .mat-select-panel table tr td{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}::ng-deep .mat-select-panel table tr th ::ng-deep .mat-sort-header-container{height:55px}::ng-deep .mat-select-panel table tr th ::ng-deep .mat-sort-header-container mat-form-field .mat-form-field-infix{width:initial}::ng-deep .mat-select-panel table tr td mat-option,::ng-deep .mat-select-panel table tr th mat-option{background:0 0!important}::ng-deep .mat-select-panel table tr td.selection,::ng-deep .mat-select-panel table tr th.selection{width:56px;padding:0;margin:0}::ng-deep .mat-select-panel table tr td.selection.hidden mat-option,::ng-deep .mat-select-panel table tr th.selection.hidden mat-option{visibility:hidden}"]
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0LXNlbGVjdC10YWJsZS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9uZ3gtbWF0LXNlbGVjdC10YWJsZS8iLCJzb3VyY2VzIjpbIm1hdC1zZWxlY3QtdGFibGUuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsT0FBTyxFQUVMLHVCQUF1QixFQUN2QixpQkFBaUIsRUFDakIsU0FBUyxFQUNULFVBQVUsRUFDVixVQUFVLEVBQ1YsS0FBSyxFQUlMLFNBQVMsRUFFVCxTQUFTLEVBQ1QsWUFBWSxFQUNiLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBdUIsV0FBVyxFQUFFLFNBQVMsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQy9GLE9BQU8sRUFBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUMzQyxPQUFPLEVBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFzQixxQkFBcUIsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ3JILE9BQU8sRUFBQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFHaEQsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ3JELE9BQU8sRUFBQyxRQUFRLEVBQUUsWUFBWSxFQUFFLG9CQUFvQixFQUFFLElBQUksRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUc3RixPQUFPLEVBQUMsd0JBQXdCLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQzs7SUFFekQsZ0JBQWdCLEdBQUcsZ0JBQWdCO0FBRXpDO0lBNEdFLGlDQUFvQixFQUFxQjtRQUFyQixPQUFFLEdBQUYsRUFBRSxDQUFtQjtRQXhCekMsb0JBQWUsR0FBd0IsRUFBRSxDQUFDO1FBUWxDLHNCQUFpQixHQUFVLEVBQUUsQ0FBQztRQUU5Qiw2QkFBd0IsR0FBYTtZQUMzQyxhQUFhO1lBQ2Is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QUVsQixTQUFTLFNBQUMsT0FBTyxFQUFFLEVBQUMsSUFBSSxFQUFFLFVBQVUsRUFBQzs2QkFFckMsWUFBWSxTQUFDLFNBQVM7O0lBaWdCekIsOEJBQUM7Q0FBQSxBQXprQkQsSUF5a0JDO1NBM2pCWSx1QkFBdUI7Ozs7OztJQUdsQyw2Q0FBaUU7Ozs7OztJQU1qRSwyQ0FBMkI7Ozs7O0lBRzNCLHVEQUF1Qzs7Ozs7SUFHdkMsdURBQXVDOzs7OztJQUd2QyxrREFBa0M7Ozs7O0lBR2xDLHFEQUFxQzs7Ozs7SUFLckMsdURBQXNFOzs7Ozs7O0lBT3RFLDZEQUE0Qzs7Ozs7O0lBTTVDLHdEQUF1RDs7Ozs7OztJQU92RCw4REFBNkQ7Ozs7O0lBRTdELDRDQUEyRDs7Ozs7SUFFM0Qsa0RBQXVGOzs7OztJQUV2Rix1Q0FBMEM7Ozs7O0lBRTFDLHdDQUFnRTs7Ozs7SUFFaEUsMkNBQXFFOzs7OztJQUVyRSw2Q0FBa0U7O0lBRWxFLGtEQUFxQzs7SUFFckMsK0NBQXVCOztJQUV2QixrREFBbUQ7O0lBRW5ELGlEQUF1Qjs7SUFFdkIsa0RBQXNEOztJQUV0RCxrREFBMEM7O0lBRTFDLDREQUFtQzs7SUFFbkMsdURBQWtDOzs7OztJQUVsQyxpREFBa0M7Ozs7O0lBRWxDLG9EQUFzQzs7Ozs7SUFFdEMsMkRBT0U7Ozs7OztJQUdGLDZDQUF5Qzs7Ozs7SUFFekMsbURBQStDOzs7OztJQUVuQyxxQ0FBNkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xyXG4gIEFmdGVyVmlld0luaXQsXHJcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXHJcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXHJcbiAgQ29tcG9uZW50LFxyXG4gIEVsZW1lbnRSZWYsXHJcbiAgZm9yd2FyZFJlZixcclxuICBJbnB1dCxcclxuICBPbkNoYW5nZXMsXHJcbiAgT25EZXN0cm95LFxyXG4gIE9uSW5pdCxcclxuICBRdWVyeUxpc3QsXHJcbiAgU2ltcGxlQ2hhbmdlcyxcclxuICBWaWV3Q2hpbGQsXHJcbiAgVmlld0NoaWxkcmVuXHJcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7Q29udHJvbFZhbHVlQWNjZXNzb3IsIEZvcm1Db250cm9sLCBGb3JtR3JvdXAsIE5HX1ZBTFVFX0FDQ0VTU09SfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XHJcbmltcG9ydCB7bWVyZ2UsIFN1YmplY3QsIHRpbWVyfSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHtNYXRPcHRpb24sIE1hdFNlbGVjdCwgTWF0U29ydCwgTWF0VGFibGUsIE1hdFRhYmxlRGF0YVNvdXJjZSwgU0VMRUNUX0lURU1fSEVJR0hUX0VNfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbCc7XHJcbmltcG9ydCB7aXNBcnJheSwgaXNOdWxsT3JVbmRlZmluZWR9IGZyb20gJ3V0aWwnO1xyXG5pbXBvcnQge01hdFNlbGVjdFRhYmxlRGF0YVNvdXJjZX0gZnJvbSAnLi9NYXRTZWxlY3RUYWJsZURhdGFTb3VyY2UnO1xyXG5pbXBvcnQge01hdFNlbGVjdFRhYmxlUm93fSBmcm9tICcuL01hdFNlbGVjdFRhYmxlUm93JztcclxuaW1wb3J0IHtfaXNOdW1iZXJWYWx1ZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcclxuaW1wb3J0IHtkZWJvdW5jZSwgZGVib3VuY2VUaW1lLCBkaXN0aW5jdFVudGlsQ2hhbmdlZCwgdGFrZSwgdGFrZVVudGlsfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XHJcbmltcG9ydCB7TWF0U2VsZWN0VGFibGVDb2x1bW59IGZyb20gJy4vTWF0U2VsZWN0VGFibGVDb2x1bW4nO1xyXG5pbXBvcnQge01hdFNlbGVjdFRhYmxlRmlsdGVyfSBmcm9tICcuL01hdFNlbGVjdFRhYmxlRmlsdGVyJztcclxuaW1wb3J0IHtNYXRTZWxlY3RTZWFyY2hDb21wb25lbnR9IGZyb20gJ25neC1tYXQtc2VsZWN0LXNlYXJjaCc7XHJcblxyXG5jb25zdCBNQVhfU0FGRV9JTlRFR0VSID0gOTAwNzE5OTI1NDc0MDk5MTtcclxuXHJcbkBDb21wb25lbnQoe1xyXG4gIHNlbGVjdG9yOiAnbmd4LW1hdC1zZWxlY3QtdGFibGUnLFxyXG4gIHRlbXBsYXRlVXJsOiAnLi9tYXQtc2VsZWN0LXRhYmxlLmNvbXBvbmVudC5odG1sJyxcclxuICBzdHlsZVVybHM6IFsnLi9tYXQtc2VsZWN0LXRhYmxlLmNvbXBvbmVudC5zY3NzJ10sXHJcbiAgZXhwb3J0QXM6ICduZ3gtbWF0LXNlbGVjdC10YWJsZScsXHJcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXHJcbiAgcHJvdmlkZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIHByb3ZpZGU6IE5HX1ZBTFVFX0FDQ0VTU09SLFxyXG4gICAgICB1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBNYXRTZWxlY3RUYWJsZUNvbXBvbmVudCksXHJcbiAgICAgIG11bHRpOiB0cnVlXHJcbiAgICB9XHJcbiAgXVxyXG59KVxyXG5leHBvcnQgY2xhc3MgTWF0U2VsZWN0VGFibGVDb21wb25lbnQgaW1wbGVtZW50cyBDb250cm9sVmFsdWVBY2Nlc3NvciwgT25Jbml0LCBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3ksIE9uQ2hhbmdlcyB7XHJcblxyXG4gIC8qKiBEYXRhIFNvdXJjZSBmb3IgdGhlIHRhYmxlICovXHJcbiAgQElucHV0KCkgZGF0YVNvdXJjZTogTWF0U2VsZWN0VGFibGVEYXRhU291cmNlPE1hdFNlbGVjdFRhYmxlUm93PjtcclxuXHJcbiAgLyoqXHJcbiAgICogTXVsdGlwbGUvU2luZ2xlIG1vZGUgZm9yIHtAc2VlIE1hdFNlbGVjdCNtdWx0aXBsZX0gdG8gaW5pdGlhbGl6ZS5cclxuICAgKiBOQjogc3dpdGNoaW5nIGJldHdlZW4gbW9kZXMgaW4gcnVudGltZSBpcyBub3Qgc3VwcG9ydGVkIGJ5IHtAc2VlIE1hdFNlbGVjdH1cclxuICAgKi9cclxuICBASW5wdXQoKSBtdWx0aXBsZTogYm9vbGVhbjtcclxuXHJcbiAgLyoqIFdoZXRoZXIgb3Igbm90IG92ZXJhbGwgc2VhcmNoIG1vZGUgZW5hYmxlZC4gU2VlIHtAc2VlIE1hdFNlbGVjdFRhYmxlQ29tcG9uZW50fSAqL1xyXG4gIEBJbnB1dCgpIG92ZXJhbGxTZWFyY2hFbmFibGVkOiBib29sZWFuO1xyXG5cclxuICAvKiogRGVmYXVsdCBpcyB0cnVlICovXHJcbiAgQElucHV0KCkgb3ZlcmFsbFNlYXJjaFZpc2libGU6IGJvb2xlYW47XHJcblxyXG4gIC8qKiBXaGV0aGVyIG9yIG5vdCBzaG91bGQge0BzZWUgTWF0U2VsZWN0VGFibGVDb21wb25lbnR9IGJlIHZpc2libGUgb24gb3Blbi4gRGVmYXVsdCBpcyB0cnVlICovXHJcbiAgQElucHV0KCkgcmVzZXRTb3J0T25PcGVuOiBib29sZWFuO1xyXG5cclxuICAvKiogV2hldGhlciBvciBub3QgcHJldmlvdXMgc2VhcmNoIHNob3VsZCBiZSBjbGVhcmVkIG9uIG9wZW4uIERlZmF1bHQgaXMgdHJ1ZSAqL1xyXG4gIEBJbnB1dCgpIHJlc2V0RmlsdGVyc09uT3BlbjogYm9vbGVhbjtcclxuXHJcbiAgLyoqXHJcbiAgICogRnVuY3Rpb24gdG8gY3VzdG9taXplIHRoZSBkZWZhdWx0IGxhYmVsXHJcbiAgICovXHJcbiAgQElucHV0KCkgY3VzdG9tVHJpZ2dlckxhYmVsRm46ICh2YWx1ZTogTWF0U2VsZWN0VGFibGVSb3dbXSkgPT4gc3RyaW5nO1xyXG5cclxuICAvKipcclxuICAgKiBUZW1wbGF0ZSB0byBjdXN0b21pemUgdGhlIGRlZmF1bHQgdHJpZ2dlciBsYWJlbC4gSGFzIGxlc3NlciBwcmlvcml0eSB0aGFuIHtAc2VlIE1hdFNlbGVjdFRhYmxlQ29tcG9uZW50I2N1c3RvbVRyaWdnZXJMYWJlbEZufS5cclxuICAgKiBTdWJzdGl0dXRpb24gaXMgY2FzZSBzZW5zaXRpdmUuXHJcbiAgICogRXhhbXBsZTogJHtuYW1lfSAke2lkfSAtICR7YWRkcmVzc31cclxuICAgKi9cclxuICBASW5wdXQoKSBjdXN0b21UcmlnZ2VyTGFiZWxUZW1wbGF0ZTogc3RyaW5nO1xyXG5cclxuICAvKipcclxuICAgKiB7QHNlZSBNYXRTZWxlY3R9IHByb3h5IGlucHV0cyBjb25maWd1cmF0b3JcclxuICAgKiB7QHNlZSBNYXRTZWxlY3QjbXVsdGlwbGV9IGdldHMgdmFsdWUgZnJvbSB7QHNlZSBNYXRTZWxlY3RUYWJsZUNvbXBvbmVudCNtdWx0aXBsZX1cclxuICAgKi9cclxuICBASW5wdXQoKSBtYXRTZWxlY3RDb25maWd1cmF0b3I6IHsgW2tleTogc3RyaW5nXTogYW55IH07XHJcblxyXG4gIC8qKlxyXG4gICAqIHtAc2VlIE1hdFNlbGVjdFNlYXJjaENvbXBvbmVudH0gcHJveHkgaW5wdXRzIGNvbmZpZ3VyYXRvclxyXG4gICAqIHtAc2VlIE1hdFNlbGVjdFNlYXJjaENvbXBvbmVudCNjbGVhclNlYXJjaElucHV0fSBnZXRzIHZhbHVlIGZyb20ge0BzZWUgTWF0U2VsZWN0VGFibGVDb21wb25lbnQjcmVzZXRGaWx0ZXJzT25PcGVufVxyXG4gICAqIHtAc2VlIE1hdFNlbGVjdFNlYXJjaENvbXBvbmVudH0ge0BzZWUgQ29udHJvbFZhbHVlQWNjZXNzb3J9IGdldHMgdmFsdWUgZnJvbSB7QHNlZSBNYXRTZWxlY3RUYWJsZUNvbXBvbmVudCNvdmVyYWxsRmlsdGVyQ29udHJvbH1cclxuICAgKi9cclxuICBASW5wdXQoKSBtYXRTZWxlY3RTZWFyY2hDb25maWd1cmF0b3I6IHsgW2tleTogc3RyaW5nXTogYW55IH07XHJcblxyXG4gIEBWaWV3Q2hpbGQoJ2NvbXBvbmVudFNlbGVjdCcpIHByaXZhdGUgbWF0U2VsZWN0OiBNYXRTZWxlY3Q7XHJcblxyXG4gIEBWaWV3Q2hpbGQoTWF0U2VsZWN0U2VhcmNoQ29tcG9uZW50KSBwcml2YXRlIG1hdFNlbGVjdFNlYXJjaDogTWF0U2VsZWN0U2VhcmNoQ29tcG9uZW50O1xyXG5cclxuICBAVmlld0NoaWxkKE1hdFNvcnQpIHByaXZhdGUgc29ydDogTWF0U29ydDtcclxuXHJcbiAgQFZpZXdDaGlsZChNYXRUYWJsZSkgcHJpdmF0ZSB0YWJsZTogTWF0VGFibGU8TWF0U2VsZWN0VGFibGVSb3c+O1xyXG5cclxuICBAVmlld0NoaWxkKCd0YWJsZScsIHtyZWFkOiBFbGVtZW50UmVmfSkgcHJpdmF0ZSB0YWJsZVJlZjogRWxlbWVudFJlZjtcclxuXHJcbiAgQFZpZXdDaGlsZHJlbihNYXRPcHRpb24pIHByaXZhdGUgbWF0T3B0aW9uczogUXVlcnlMaXN0PE1hdE9wdGlvbj47XHJcblxyXG4gIHRhYmxlRGF0YVNvdXJjZTogTWF0U2VsZWN0VGFibGVSb3dbXTtcclxuXHJcbiAgdGFibGVDb2x1bW5zOiBzdHJpbmdbXTtcclxuXHJcbiAgdGFibGVDb2x1bW5zTWFwOiBNYXA8c3RyaW5nLCBNYXRTZWxlY3RUYWJsZUNvbHVtbj47XHJcblxyXG4gIHRhYmxlQWN0aXZlUm93OiBudW1iZXI7XHJcblxyXG4gIGZpbHRlcmVkT3V0Um93czogeyBba2V5OiBzdHJpbmddOiBNYXRTZWxlY3RUYWJsZVJvdyB9O1xyXG5cclxuICBjb21wbGV0ZVJvd0xpc3Q6IE1hdFNlbGVjdFRhYmxlUm93W10gPSBbXTtcclxuXHJcbiAgb3ZlcmFsbFNlYXJjaFZpc2libGVTdGF0ZTogYm9vbGVhbjtcclxuXHJcbiAgb3ZlcmFsbEZpbHRlckNvbnRyb2w6IEZvcm1Db250cm9sO1xyXG5cclxuICBwcml2YXRlIGZpbHRlckNvbnRyb2xzOiBGb3JtR3JvdXA7XHJcblxyXG4gIHByaXZhdGUgY29tcGxldGVWYWx1ZUxpc3Q6IGFueVtdID0gW107XHJcblxyXG4gIHByaXZhdGUgY29udHJvbFZhbHVlQWNjZXNzb3JLZXlzOiBzdHJpbmdbXSA9IFtcclxuICAgICdmb3JtQ29udHJvbCcsXHJcbiAgICAnZm9ybUNvbnRyb2xOYW1lJyxcclxuICAgICdmb3JtR3JvdXAnLFxyXG4gICAgJ2Zvcm1Hcm91cE5hbWUnLFxyXG4gICAgJ2Zvcm1BcnJheScsXHJcbiAgICAnZm9ybUFycmF5TmFtZSdcclxuICBdO1xyXG5cclxuICAvKiogU3ViamVjdCB0aGF0IGVtaXRzIHdoZW4gdGhlIGNvbXBvbmVudCBoYXMgYmVlbiBkZXN0cm95ZWQuICovXHJcbiAgcHJpdmF0ZSBfb25EZXN0cm95ID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcclxuXHJcbiAgcHJpdmF0ZSBfb25PcHRpb25zQ2hhbmdlID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcclxuXHJcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBjZDogQ2hhbmdlRGV0ZWN0b3JSZWYpIHtcclxuICAgIHRoaXMudGFibGVDb2x1bW5zTWFwID0gbmV3IE1hcCgpO1xyXG4gICAgdGhpcy5maWx0ZXJDb250cm9scyA9IG5ldyBGb3JtR3JvdXAoe30pO1xyXG4gICAgdGhpcy5vdmVyYWxsRmlsdGVyQ29udHJvbCA9IG5ldyBGb3JtQ29udHJvbCgnJyk7XHJcbiAgfVxyXG5cclxuICBuZ09uSW5pdCgpOiB2b2lkIHtcclxuICAgIHRoaXMubXVsdGlwbGUgPSB0aGlzLm11bHRpcGxlIHx8IGZhbHNlO1xyXG4gICAgdGhpcy5tYXRTZWxlY3Qub3BlbmVkQ2hhbmdlXHJcbiAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLl9vbkRlc3Ryb3kpKVxyXG4gICAgICAuc3Vic2NyaWJlKG9wZW5lZCA9PiB7XHJcbiAgICAgICAgaWYgKHRoaXMucmVzZXRGaWx0ZXJzT25PcGVuICE9PSBmYWxzZSB8fCAhdGhpcy5tYXRPcHRpb25zLmxlbmd0aCkge1xyXG4gICAgICAgICAgdGhpcy5yZXNldEZpbHRlcnMoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5vdmVyYWxsU2VhcmNoVmlzaWJsZVN0YXRlID0gdGhpcy5vdmVyYWxsU2VhcmNoVmlzaWJsZTtcclxuICAgICAgICBpZiAodGhpcy5yZXNldFNvcnRPbk9wZW4gIT09IGZhbHNlKSB7XHJcbiAgICAgICAgICB0aGlzLnNvcnQuc29ydCh7aWQ6ICcnLCBzdGFydDogJ2FzYycsIGRpc2FibGVDbGVhcjogZmFsc2V9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFvcGVuZWQpIHtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMub3ZlcmFsbFNlYXJjaEVuYWJsZWQpIHtcclxuICAgICAgICAgIHRoaXMucHJveHlNYXRTZWxlY3RTZWFyY2hDb25maWd1cmF0aW9uKHRoaXMubWF0U2VsZWN0U2VhcmNoQ29uZmlndXJhdG9yKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gVG9EbzogZ2V0IHJpZCBvZiB0aGlzIHdvcmthcm91bmQgKHVwZGF0ZXMgaGVhZGVyIHJvdyBbb3RoZXJ3aXNlIHNvcnQgbWVjaGFuaXNtIHByb2R1Y2VzIGdsaXRjaGVzXSlcclxuICAgICAgICAodGhpcy50YWJsZSBhcyBhbnkpLl9oZWFkZXJSb3dEZWZDaGFuZ2VkID0gdHJ1ZTtcclxuICAgICAgICAvLyBEaXNhYmxlIHNvcnQgYnV0dG9ucyB0byBwcmV2ZW50IHNvcnRpbmcgY2hhbmdlIG9uIFNQQUNFIGtleSBwcmVzc2VkIGluIGZpbHRlciBmaWVsZFxyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4gW10uZm9yRWFjaC5jYWxsKFxyXG4gICAgICAgICAgdGhpcy50YWJsZVJlZi5uYXRpdmVFbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2J1dHRvbi5tYXQtc29ydC1oZWFkZXItYnV0dG9uJyksXHJcbiAgICAgICAgICAoZSkgPT4gZS5kaXNhYmxlZCA9IHRydWUpXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgLy8gUGF0Y2ggdGhlIGhlaWdodCBvZiB0aGUgcGFuZWwgdG8gaW5jbHVkZSB0aGUgaGVpZ2h0IG9mIHRoZSBoZWFkZXIgYW5kIGZvb3RlclxyXG4gICAgICAgIGNvbnN0IHBhbmVsRWxlbWVudDogSFRNTERpdkVsZW1lbnQgPSB0aGlzLm1hdFNlbGVjdC5wYW5lbC5uYXRpdmVFbGVtZW50O1xyXG4gICAgICAgIGNvbnN0IHBhbmVsSGVpZ2h0ID0gcGFuZWxFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodDtcclxuICAgICAgICBsZXQgdGFibGVBZGRpdGlvbmFsSGVpZ2h0ID0gMDtcclxuICAgICAgICB0aGlzLnRhYmxlXHJcbiAgICAgICAgICAuX2dldFJlbmRlcmVkUm93cyh0aGlzLnRhYmxlLl9oZWFkZXJSb3dPdXRsZXQpXHJcbiAgICAgICAgICAuY29uY2F0KHRoaXMudGFibGUuX2dldFJlbmRlcmVkUm93cyh0aGlzLnRhYmxlLl9mb290ZXJSb3dPdXRsZXQpKVxyXG4gICAgICAgICAgLmZvckVhY2gocm93ID0+IHRhYmxlQWRkaXRpb25hbEhlaWdodCArPSByb3cuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0KTtcclxuICAgICAgICBpZiAoIWlzTmFOKHBhbmVsSGVpZ2h0KSkge1xyXG4gICAgICAgICAgcGFuZWxFbGVtZW50LnN0eWxlLm1heEhlaWdodCA9IGAke3BhbmVsSGVpZ2h0ICsgdGFibGVBZGRpdGlvbmFsSGVpZ2h0fXB4YDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5tYXRTZWxlY3RTZWFyY2hDb25maWd1cmF0b3IuZGlzYWJsZVNjcm9sbFRvQWN0aXZlT25PcHRpb25zQ2hhbmdlZFxyXG4gICAgICAgICAgJiYgIWlzTnVsbE9yVW5kZWZpbmVkKHRoaXMubWF0U2VsZWN0Ll9rZXlNYW5hZ2VyKSAmJiB0aGlzLmNvbXBsZXRlUm93TGlzdC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgZmlyc3RWYWx1ZSA9IGAke3RoaXMuY29tcGxldGVSb3dMaXN0WzBdLmlkfWA7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy50YWJsZURhdGFTb3VyY2UubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICBpZiAoYCR7dGhpcy50YWJsZURhdGFTb3VyY2VbaV0uaWR9YCA9PT0gZmlyc3RWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tYXRTZWxlY3QuX2tleU1hbmFnZXIuY2hhbmdlLnBpcGUodGFrZVVudGlsKHRoaXMuX29uRGVzdHJveSksIHRha2UoMSkpLnN1YnNjcmliZSgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgIHRoaXMubWF0U2VsZWN0Ll9rZXlNYW5hZ2VyLnNldEFjdGl2ZUl0ZW0oaSk7XHJcbiAgICAgICAgICAgICAgICAgIHRoaXMuY2QuZGV0ZWN0Q2hhbmdlcygpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gTWFudWFsIHNjcm9sbGluZyBpbXBsZW1lbnRhdGlvblxyXG4gICAgICAgIGlmICghaXNOdWxsT3JVbmRlZmluZWQodGhpcy5tYXRTZWxlY3QuX2tleU1hbmFnZXIpKSB7XHJcbiAgICAgICAgICB0aGlzLm1hdFNlbGVjdC5fa2V5TWFuYWdlci5jaGFuZ2VcclxuICAgICAgICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX29uRGVzdHJveSksIGRlYm91bmNlKCgpID0+IHRpbWVyKDEpKSwgZGlzdGluY3RVbnRpbENoYW5nZWQoKSlcclxuICAgICAgICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgLy8gVG9EbzogMWVtID0gMTZweCBoYXJkY29kZSwgc2hvdWxkIGJlIGNhbGN1bGF0ZWQgZHluYW1pY2FsbHlcclxuICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHBhbmVsRWxlbWVudC5zY3JvbGxUb3AgPSB0aGlzLm1hdFNlbGVjdC5fa2V5TWFuYWdlci5hY3RpdmVJdGVtSW5kZXggKiBTRUxFQ1RfSVRFTV9IRUlHSFRfRU0gKiAxNik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgfVxyXG5cclxuICBuZ0FmdGVyVmlld0luaXQoKTogdm9pZCB7XHJcbiAgICBtZXJnZSguLi5bXHJcbiAgICAgIHRoaXMuc29ydC5zb3J0Q2hhbmdlLFxyXG4gICAgICB0aGlzLmZpbHRlckNvbnRyb2xzLnZhbHVlQ2hhbmdlcyxcclxuICAgICAgdGhpcy5vdmVyYWxsRmlsdGVyQ29udHJvbC52YWx1ZUNoYW5nZXNcclxuICAgIF0pXHJcbiAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLl9vbkRlc3Ryb3kpLCBkZWJvdW5jZVRpbWUoMTAwKSlcclxuICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgZGF0YUNsb25lOiBNYXRTZWxlY3RUYWJsZVJvd1tdID0gWy4uLnRoaXMuZGF0YVNvdXJjZS5kYXRhXTtcclxuXHJcbiAgICAgICAgLy8gQXBwbHkgZmlsdGVyaW5nXHJcbiAgICAgICAgaWYgKHRoaXMub3ZlcmFsbFNlYXJjaEVuYWJsZWQgJiYgdGhpcy5vdmVyYWxsU2VhcmNoVmlzaWJsZVN0YXRlKSB7XHJcbiAgICAgICAgICB0aGlzLmFwcGx5T3ZlcmFsbEZpbHRlcihkYXRhQ2xvbmUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmFwcGx5Q29sdW1uTGV2ZWxGaWx0ZXJzKGRhdGFDbG9uZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBBcHBseSBzb3J0aW5nXHJcbiAgICAgICAgdGhpcy50YWJsZURhdGFTb3VyY2UgPSAhdGhpcy5zb3J0LmRpcmVjdGlvbiA/IGRhdGFDbG9uZSA6IHRoaXMuc29ydERhdGEoZGF0YUNsb25lLCB0aGlzLnNvcnQpO1xyXG5cclxuICAgICAgICB0aGlzLmNkLmRldGVjdENoYW5nZXMoKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgLy8gTWFudWFsbHkgc29ydCBkYXRhIGZvciB0aGlzLm1hdFNlbGVjdC5vcHRpb25zIChRdWVyeUxpc3Q8TWF0T3B0aW9uPikgYW5kIG5vdGlmeSBtYXRTZWxlY3Qub3B0aW9ucyBvZiBjaGFuZ2VzXHJcbiAgICAvLyBJdCdzIGltcG9ydGFudCB0byBrZWVwIHRoaXMubWF0U2VsZWN0Lm9wdGlvbnMgb3JkZXIgc3luY2hyb25pemVkIHdpdGggZGF0YSBpbiB0aGUgdGFibGVcclxuICAgIC8vICAgICBiZWNhdXNlIHRoaXMubWF0U2VsZWN0Lm9wdGlvbnMgKFF1ZXJ5TGlzdDxNYXRPcHRpb24+KSBkb2Vzbid0IHVwZGF0ZSBpdCdzIHN0YXRlIGFmdGVyIHRhYmxlIGRhdGEgaXMgY2hhbmdlZFxyXG4gICAgdGhpcy5tYXRPcHRpb25zLmNoYW5nZXMuc3Vic2NyaWJlKCgpID0+IHtcclxuICAgICAgY29uc3Qgb3B0aW9uczogeyBba2V5OiBzdHJpbmddOiBNYXRPcHRpb24gfSA9IHt9O1xyXG4gICAgICB0aGlzLm1hdE9wdGlvbnMudG9BcnJheSgpXHJcbiAgICAgICAgLmZpbHRlcihvcHRpb24gPT4gIWlzTnVsbE9yVW5kZWZpbmVkKG9wdGlvbikpXHJcbiAgICAgICAgLmZvckVhY2gob3B0aW9uID0+IG9wdGlvbnNbYCR7b3B0aW9uLnZhbHVlfWBdID0gb3B0aW9uKTtcclxuICAgICAgdGhpcy5tYXRTZWxlY3Qub3B0aW9ucy5yZXNldCh0aGlzLnRhYmxlRGF0YVNvdXJjZVxyXG4gICAgICAgIC5maWx0ZXIocm93ID0+ICFpc051bGxPclVuZGVmaW5lZChvcHRpb25zW2Ake3Jvdy5pZH1gXSkpXHJcbiAgICAgICAgLm1hcChyb3cgPT4gb3B0aW9uc1tgJHtyb3cuaWR9YF0pKTtcclxuICAgICAgdGhpcy5tYXRTZWxlY3Qub3B0aW9ucy5ub3RpZnlPbkNoYW5nZXMoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGlmICghaXNOdWxsT3JVbmRlZmluZWQodGhpcy5tYXRTZWxlY3QuX2tleU1hbmFnZXIpKSB7XHJcbiAgICAgIC8vIFN1YnNjcmliZSBvbiBLZXlNYW5hZ2VyIGNoYW5nZXMgdG8gaGlnaGxpZ2h0IHRoZSB0YWJsZSByb3dzIGFjY29yZGluZ2x5XHJcbiAgICAgIHRoaXMubWF0U2VsZWN0Ll9rZXlNYW5hZ2VyLmNoYW5nZVxyXG4gICAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLl9vbkRlc3Ryb3kpKVxyXG4gICAgICAgIC5zdWJzY3JpYmUoYWN0aXZlUm93ID0+IHRoaXMudGFibGVBY3RpdmVSb3cgPSBhY3RpdmVSb3cpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XHJcbiAgICB0aGlzLl9vbkRlc3Ryb3kubmV4dCgpO1xyXG4gICAgdGhpcy5fb25EZXN0cm95LmNvbXBsZXRlKCk7XHJcbiAgfVxyXG5cclxuICByZWdpc3Rlck9uQ2hhbmdlKGZuOiAodmFsdWU6IGFueSkgPT4gdm9pZCk6IHZvaWQge1xyXG4gICAgY29uc3QgcHJveHlGbjogKHZhbHVlOiBhbnkpID0+IHZvaWQgPSAodmFsdWU6IGFueSkgPT4ge1xyXG4gICAgICAvLyBUb0RvOiByZWZhY3RvciAtIGNvbXBhcmlzb24gbWVjaGFuaXNtIGlzbid0IG9wdGltaXplZC4gZmlsdGVyZWRPdXRSb3dzIGlzIGEgbWFwIGJ1dCBjb21wbGV0ZVZhbHVlTGlzdCBpcyBhbiBhcnJheVxyXG4gICAgICBpZiAodGhpcy5tdWx0aXBsZSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSB0aGlzLmNvbXBsZXRlVmFsdWVMaXN0Lmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICBpZiAodGhpcy5maWx0ZXJlZE91dFJvd3NbYCR7dGhpcy5jb21wbGV0ZVZhbHVlTGlzdFtpXX1gXSA9PT0gdW5kZWZpbmVkICYmIHZhbHVlLmluZGV4T2YodGhpcy5jb21wbGV0ZVZhbHVlTGlzdFtpXSkgPT09IC0xKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29tcGxldGVWYWx1ZUxpc3Quc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB2YWx1ZVxyXG4gICAgICAgICAgLmZpbHRlcihjaG9pY2UgPT4gdGhpcy5jb21wbGV0ZVZhbHVlTGlzdC5pbmRleE9mKGNob2ljZSkgPT09IC0xKVxyXG4gICAgICAgICAgLmZvckVhY2goY2hvaWNlID0+IHRoaXMuY29tcGxldGVWYWx1ZUxpc3QucHVzaChjaG9pY2UpKTtcclxuICAgICAgICB0aGlzLm1hdFNlbGVjdC52YWx1ZSA9IHRoaXMuY29tcGxldGVWYWx1ZUxpc3Q7XHJcbiAgICAgICAgZm4odGhpcy5jb21wbGV0ZVZhbHVlTGlzdCk7XHJcbiAgICAgICAgdGhpcy5jb21wbGV0ZVJvd0xpc3Quc3BsaWNlKDApO1xyXG4gICAgICAgIHRoaXMuZGF0YVNvdXJjZS5kYXRhXHJcbiAgICAgICAgICAuZmlsdGVyKHJvdyA9PiB0aGlzLmNvbXBsZXRlVmFsdWVMaXN0LmluZGV4T2Yocm93LmlkKSAhPT0gLTEpXHJcbiAgICAgICAgICAuZm9yRWFjaChyb3cgPT4gdGhpcy5jb21wbGV0ZVJvd0xpc3QucHVzaChyb3cpKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBmbih2YWx1ZSk7XHJcbiAgICAgICAgdGhpcy5jb21wbGV0ZVJvd0xpc3Quc3BsaWNlKDApO1xyXG4gICAgICAgIHRoaXMuZGF0YVNvdXJjZS5kYXRhXHJcbiAgICAgICAgICAuZmlsdGVyKHJvdyA9PiByb3cuaWQgPT09IHZhbHVlKVxyXG4gICAgICAgICAgLmZvckVhY2gocm93ID0+IHRoaXMuY29tcGxldGVSb3dMaXN0LnB1c2gocm93KSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICB0aGlzLm1hdFNlbGVjdC5yZWdpc3Rlck9uQ2hhbmdlKHByb3h5Rm4pO1xyXG4gIH1cclxuXHJcbiAgcmVnaXN0ZXJPblRvdWNoZWQoZm46ICgpID0+IHt9KTogdm9pZCB7XHJcbiAgICB0aGlzLm1hdFNlbGVjdC5yZWdpc3Rlck9uVG91Y2hlZChmbik7XHJcbiAgfVxyXG5cclxuICBzZXREaXNhYmxlZFN0YXRlKGlzRGlzYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgIHRoaXMubWF0U2VsZWN0LnNldERpc2FibGVkU3RhdGUoaXNEaXNhYmxlZCk7XHJcbiAgfVxyXG5cclxuICB3cml0ZVZhbHVlKHZhbHVlOiBhbnkpOiB2b2lkIHtcclxuICAgIHRoaXMudXBkYXRlQ29tcGxldGVSb3dMaXN0KHZhbHVlKTtcclxuICAgIHRoaXMubWF0U2VsZWN0LndyaXRlVmFsdWUodmFsdWUpO1xyXG4gICAgaWYgKHRoaXMubWF0U2VsZWN0LnZhbHVlICE9PSB2YWx1ZSkge1xyXG4gICAgICB0aGlzLm1hdFNlbGVjdC52YWx1ZSA9IHZhbHVlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcyk6IHZvaWQge1xyXG5cclxuICAgIGlmICghaXNOdWxsT3JVbmRlZmluZWQoY2hhbmdlcy5yZXNldEZpbHRlcnNPbk9wZW4pICYmIGNoYW5nZXMucmVzZXRGaWx0ZXJzT25PcGVuLmN1cnJlbnRWYWx1ZSAhPT0gZmFsc2UpIHtcclxuICAgICAgdGhpcy5yZXNldEZpbHRlcnMoKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKGNoYW5nZXMuZGF0YVNvdXJjZSkpIHtcclxuICAgICAgdGhpcy51cGRhdGVDb21wbGV0ZVJvd0xpc3QodGhpcy5jb21wbGV0ZVJvd0xpc3QubWFwKHJvdyA9PiByb3cuaWQpKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBQcm94eSBASW5wdXQgYmluZGluZ3MgdG8gTWF0U2VsZWN0XHJcbiAgICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKGNoYW5nZXMubWF0U2VsZWN0Q29uZmlndXJhdG9yKSkge1xyXG4gICAgICBjb25zdCBjb25maWd1cmF0aW9uID0gY2hhbmdlcy5tYXRTZWxlY3RDb25maWd1cmF0b3IuY3VycmVudFZhbHVlO1xyXG4gICAgICBPYmplY3Qua2V5cyhjb25maWd1cmF0aW9uKVxyXG4gICAgICAgIC5maWx0ZXIoa2V5ID0+ICFbJ211bHRpcGxlJywgJ3BhbmVsQ2xhc3MnXS5pbmNsdWRlcyhrZXkpICYmICF0aGlzLmNvbnRyb2xWYWx1ZUFjY2Vzc29yS2V5cy5pbmNsdWRlcyhrZXkpKVxyXG4gICAgICAgIC5mb3JFYWNoKGtleSA9PiB0aGlzLm1hdFNlbGVjdFtrZXldID0gY29uZmlndXJhdGlvbltrZXldKTtcclxuICAgICAgY29uc3QgcGFuZWxDbGFzczogc3RyaW5nW10gPSBbXTtcclxuICAgICAgaWYgKCFpc051bGxPclVuZGVmaW5lZChjb25maWd1cmF0aW9uLnBhbmVsQ2xhc3MpKSB7XHJcbiAgICAgICAgcGFuZWxDbGFzcy5wdXNoKGNvbmZpZ3VyYXRpb24ucGFuZWxDbGFzcyk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHRoaXMub3ZlcmFsbFNlYXJjaEVuYWJsZWQpIHtcclxuICAgICAgICBwYW5lbENsYXNzLnB1c2goJ21hdC1zZWxlY3Qtc2VhcmNoLXBhbmVsJyk7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5tYXRTZWxlY3QucGFuZWxDbGFzcyA9IHBhbmVsQ2xhc3M7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFpc051bGxPclVuZGVmaW5lZChjaGFuZ2VzLm1hdFNlbGVjdFNlYXJjaENvbmZpZ3VyYXRvcikpIHtcclxuICAgICAgdGhpcy5wcm94eU1hdFNlbGVjdFNlYXJjaENvbmZpZ3VyYXRpb24oY2hhbmdlcy5tYXRTZWxlY3RTZWFyY2hDb25maWd1cmF0b3IuY3VycmVudFZhbHVlKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKGNoYW5nZXMuZGF0YVNvdXJjZSlcclxuICAgICAgJiYgIWlzTnVsbE9yVW5kZWZpbmVkKGNoYW5nZXMuZGF0YVNvdXJjZS5jdXJyZW50VmFsdWUpXHJcbiAgICAgICYmIGlzQXJyYXkoY2hhbmdlcy5kYXRhU291cmNlLmN1cnJlbnRWYWx1ZS5kYXRhKSkge1xyXG4gICAgICB0aGlzLnRhYmxlRGF0YVNvdXJjZSA9IFsuLi5jaGFuZ2VzLmRhdGFTb3VyY2UuY3VycmVudFZhbHVlLmRhdGFdO1xyXG4gICAgICB0aGlzLnRhYmxlQ29sdW1ucyA9IFsnX3NlbGVjdGlvbicsIC4uLmNoYW5nZXMuZGF0YVNvdXJjZS5jdXJyZW50VmFsdWUuY29sdW1ucy5tYXAoY29sdW1uID0+IGNvbHVtbi5rZXkpXTtcclxuICAgICAgdGhpcy50YWJsZUNvbHVtbnNNYXAuY2xlYXIoKTtcclxuICAgICAgY2hhbmdlcy5kYXRhU291cmNlLmN1cnJlbnRWYWx1ZS5jb2x1bW5zLmZvckVhY2goY29sdW1uID0+IHRoaXMudGFibGVDb2x1bW5zTWFwLnNldChjb2x1bW4ua2V5LCBjb2x1bW4pKTtcclxuICAgICAgdGhpcy5hcHBseVByb3h5VG9BcnJheShjaGFuZ2VzLmRhdGFTb3VyY2UuY3VycmVudFZhbHVlLmRhdGEsICgpID0+IHtcclxuICAgICAgICB0aGlzLl9vbk9wdGlvbnNDaGFuZ2UubmV4dCgpO1xyXG4gICAgICB9KTtcclxuICAgICAgdGhpcy5fb25PcHRpb25zQ2hhbmdlLm5leHQoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGVtdWxhdGVNYXRPcHRpb25DbGljayhldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xyXG4gICAgaWYgKGV2ZW50LmNvbXBvc2VkUGF0aCgpXHJcbiAgICAgIC5maWx0ZXIoZXQgPT4gZXQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudClcclxuICAgICAgLnNvbWUoKGV0OiBIVE1MRWxlbWVudCkgPT4gZXQudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnbWF0LW9wdGlvbicpKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGlmICghKGV2ZW50LnRhcmdldCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBsZXQgcm93RWxlbWVudCA9IGV2ZW50LnRhcmdldDtcclxuICAgIHdoaWxlIChyb3dFbGVtZW50ICE9IG51bGwgJiYgcm93RWxlbWVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50ICYmIHJvd0VsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpICE9PSAndHInKSB7XHJcbiAgICAgIHJvd0VsZW1lbnQgPSByb3dFbGVtZW50LnBhcmVudEVsZW1lbnQ7XHJcbiAgICB9XHJcbiAgICBpZiAocm93RWxlbWVudCA9PT0gbnVsbCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBjb25zdCBjaGlsZE9wdGlvbjogSFRNTEVsZW1lbnQgPSByb3dFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ21hdC1vcHRpb24nKTtcclxuICAgIGlmICghY2hpbGRPcHRpb24pIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgY2hpbGRPcHRpb24uY2xpY2soKTtcclxuICB9XHJcblxyXG5cclxuICBmaWx0ZXJGb3JtQ29udHJvbChrZXk6IHN0cmluZyk6IEZvcm1Db250cm9sIHtcclxuICAgIGlmICghdGhpcy5maWx0ZXJDb250cm9scy5jb250YWlucyhrZXkpKSB7XHJcbiAgICAgIHRoaXMuZmlsdGVyQ29udHJvbHMucmVnaXN0ZXJDb250cm9sKGtleSwgbmV3IEZvcm1Db250cm9sKCcnKSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gPEZvcm1Db250cm9sPnRoaXMuZmlsdGVyQ29udHJvbHMuZ2V0KGtleSk7XHJcbiAgfVxyXG5cclxuICBzaW1wbGVUcmlnZ2VyTGFiZWxGbih2YWx1ZTogTWF0U2VsZWN0VGFibGVSb3dbXSk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gdmFsdWUubWFwKHJvdyA9PiB7XHJcbiAgICAgIGlmIChpc051bGxPclVuZGVmaW5lZChyb3cpKSB7XHJcbiAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChpc051bGxPclVuZGVmaW5lZCh0aGlzLmN1c3RvbVRyaWdnZXJMYWJlbFRlbXBsYXRlKVxyXG4gICAgICAgIHx8IHR5cGVvZiB0aGlzLmN1c3RvbVRyaWdnZXJMYWJlbFRlbXBsYXRlICE9PSAnc3RyaW5nJ1xyXG4gICAgICAgIHx8IHRoaXMuY3VzdG9tVHJpZ2dlckxhYmVsVGVtcGxhdGUudHJpbSgpLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIHJldHVybiBgJHtyb3cuaWR9YDtcclxuICAgICAgfVxyXG4gICAgICBsZXQgYXRMZWFzdFBhcnRpYWxTdWJzdGl0dXRpb24gPSBmYWxzZTtcclxuICAgICAgY29uc3Qgc3Vic3RpdHV0aW9uOiBzdHJpbmcgPSB0aGlzLmN1c3RvbVRyaWdnZXJMYWJlbFRlbXBsYXRlLnJlcGxhY2UoL1skXXsxfVt7XXsxfShbXn1dKylbfV17MX0/L2csIChfLCBrZXkpID0+XHJcbiAgICAgICAgIWlzTnVsbE9yVW5kZWZpbmVkKHJvd1trZXldKSAmJiAoYXRMZWFzdFBhcnRpYWxTdWJzdGl0dXRpb24gPSB0cnVlKSA/IHJvd1trZXldIDogJycpO1xyXG4gICAgICBpZiAoYXRMZWFzdFBhcnRpYWxTdWJzdGl0dXRpb24gPT09IGZhbHNlKSB7XHJcbiAgICAgICAgcmV0dXJuIGAke3Jvdy5pZH1gO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBzdWJzdGl0dXRpb24udHJpbSgpO1xyXG4gICAgfSkuam9pbignLCAnKTtcclxuICB9XHJcblxyXG4gIHRvZ2dsZU92ZXJhbGxTZWFyY2goKTogdm9pZCB7XHJcbiAgICB0aGlzLm92ZXJhbGxTZWFyY2hWaXNpYmxlU3RhdGUgPSAhdGhpcy5vdmVyYWxsU2VhcmNoVmlzaWJsZVN0YXRlO1xyXG4gICAgdGhpcy5yZXNldEZpbHRlcnMoKTtcclxuICAgIGlmICh0aGlzLm92ZXJhbGxTZWFyY2hWaXNpYmxlU3RhdGUpIHtcclxuICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLm1hdFNlbGVjdFNlYXJjaC5fZm9jdXMoKSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHVwZGF0ZUNvbXBsZXRlUm93TGlzdCh2YWx1ZTogYW55W10pOiB2b2lkIHtcclxuICAgIHRoaXMuY29tcGxldGVSb3dMaXN0LnNwbGljZSgwKTtcclxuICAgIGlmICghaXNOdWxsT3JVbmRlZmluZWQodmFsdWUpKSB7XHJcbiAgICAgIGNvbnN0IHZhbHVlQXJyYXk6IGFueVtdID0gIWlzQXJyYXkodmFsdWUpID8gW3ZhbHVlXSA6IHZhbHVlO1xyXG4gICAgICB2YWx1ZUFycmF5LmZvckVhY2goaXRlbSA9PiB7XHJcbiAgICAgICAgY29uc3Qgcm93Rm91bmQgPSB0aGlzLmRhdGFTb3VyY2UuZGF0YS5maW5kKHJvdyA9PiByb3cuaWQgPT09IGl0ZW0pO1xyXG4gICAgICAgIGlmIChyb3dGb3VuZCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmNvbXBsZXRlUm93TGlzdC5wdXNoKHJvd0ZvdW5kKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHByb3h5TWF0U2VsZWN0U2VhcmNoQ29uZmlndXJhdGlvbihjb25maWd1cmF0aW9uOiB7IFtrZXk6IHN0cmluZ106IGFueSB9KTogdm9pZCB7XHJcbiAgICBpZiAoaXNOdWxsT3JVbmRlZmluZWQodGhpcy5tYXRTZWxlY3RTZWFyY2gpKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBQcm94eSBASW5wdXQgYmluZGluZ3MgdG8gTmd4TWF0U2VsZWN0U2VhcmNoXHJcbiAgICBPYmplY3Qua2V5cyhjb25maWd1cmF0aW9uKVxyXG4gICAgICAuZmlsdGVyKGtleSA9PiAhWydjbGVhclNlYXJjaElucHV0J10uaW5jbHVkZXMoa2V5KSAmJiAhdGhpcy5jb250cm9sVmFsdWVBY2Nlc3NvcktleXMuaW5jbHVkZXMoa2V5KSlcclxuICAgICAgLmZvckVhY2goa2V5ID0+IHRoaXMubWF0U2VsZWN0U2VhcmNoW2tleV0gPSBjb25maWd1cmF0aW9uW2tleV0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhcHBseUNvbHVtbkxldmVsRmlsdGVycyhkYXRhOiBNYXRTZWxlY3RUYWJsZVJvd1tdKTogdm9pZCB7XHJcbiAgICB0aGlzLmZpbHRlcmVkT3V0Um93cyA9IHt9O1xyXG4gICAgY29uc3QgZmlsdGVyczogeyBba2V5OiBzdHJpbmddOiB7IGZpbHRlcjogTWF0U2VsZWN0VGFibGVGaWx0ZXIsIHZhbHVlOiBhbnkgfSB9ID0ge307XHJcbiAgICBPYmplY3Qua2V5cyh0aGlzLmZpbHRlckNvbnRyb2xzLmNvbnRyb2xzKVxyXG4gICAgICAuZmlsdGVyKGtleSA9PiB0aGlzLnRhYmxlQ29sdW1uc01hcC5oYXMoa2V5KVxyXG4gICAgICAgICYmICFpc051bGxPclVuZGVmaW5lZCh0aGlzLnRhYmxlQ29sdW1uc01hcC5nZXQoa2V5KS5maWx0ZXIpXHJcbiAgICAgICAgLy8gSWYgZmlsdGVyIGlzIGVuYWJsZWRcclxuICAgICAgICAmJiB0aGlzLnRhYmxlQ29sdW1uc01hcC5nZXQoa2V5KS5maWx0ZXIuZW5hYmxlZCAhPT0gZmFsc2UpXHJcbiAgICAgIC5maWx0ZXIoa2V5ID0+IHtcclxuICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuZmlsdGVyQ29udHJvbHMuZ2V0KGtleSkudmFsdWU7XHJcbiAgICAgICAgcmV0dXJuICFpc051bGxPclVuZGVmaW5lZCh2YWx1ZSlcclxuICAgICAgICAgIC8vIElmIGFuIGFycmF5IC0gY2hlY2sgaXQncyBub3QgZW1wdHlcclxuICAgICAgICAgICYmICgoaXNBcnJheSh2YWx1ZSkgJiYgdmFsdWUubGVuZ3RoID4gMClcclxuICAgICAgICAgICAgLy8gSWYgc3RyaW5nIC0gY2hlY2sgdGhhdCBub3QgYmxhbmtcclxuICAgICAgICAgICAgfHwgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdmFsdWUudHJpbSgpLmxlbmd0aCA+IDApXHJcbiAgICAgICAgICAgIC8vIElmIG51bWJlciAtIGNoZWNrIHRoYXQgdG9TdHJpbmcoKSBpcyBub3QgYmxhbmtcclxuICAgICAgICAgICAgfHwgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgYCR7dmFsdWV9YC50cmltKCkubGVuZ3RoID4gMCkpO1xyXG4gICAgICB9KVxyXG4gICAgICAuZm9yRWFjaChrZXkgPT4gZmlsdGVyc1trZXldID0ge1xyXG4gICAgICAgIGZpbHRlcjogdGhpcy50YWJsZUNvbHVtbnNNYXAuZ2V0KGtleSkuZmlsdGVyLFxyXG4gICAgICAgIHZhbHVlOiB0aGlzLmZpbHRlckNvbnRyb2xzLmdldChrZXkpLnZhbHVlXHJcbiAgICAgIH0pO1xyXG4gICAgY29uc3QgZmlsdGVyS2V5czogc3RyaW5nW10gPSBPYmplY3Qua2V5cyhmaWx0ZXJzKTtcclxuICAgIGZvciAobGV0IGkgPSBkYXRhLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgIGZvciAobGV0IGsgPSAwOyBrIDwgZmlsdGVyS2V5cy5sZW5ndGg7IGsrKykge1xyXG4gICAgICAgIGNvbnN0IGZpbHRlcktleTogc3RyaW5nID0gZmlsdGVyS2V5c1trXTtcclxuICAgICAgICBjb25zdCByb3c6IE1hdFNlbGVjdFRhYmxlUm93ID0gZGF0YVtpXTtcclxuICAgICAgICBjb25zdCBjZWxsVmFsdWU6IGFueSA9IHJvd1tmaWx0ZXJLZXldO1xyXG4gICAgICAgIGlmIChpc051bGxPclVuZGVmaW5lZChjZWxsVmFsdWUpKSB7XHJcbiAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgZmlsdGVyID0gZmlsdGVyc1tmaWx0ZXJLZXldO1xyXG4gICAgICAgIGNvbnN0IGNvbXBhcmF0b3IgPSBmaWx0ZXIuZmlsdGVyLmNvbXBhcmF0b3I7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBmaWx0ZXIuZmlsdGVyLmNvbXBhcmF0b3JGbiA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgaWYgKCFmaWx0ZXIuZmlsdGVyLmNvbXBhcmF0b3JGbi5jYWxsKG51bGwsIGNlbGxWYWx1ZSwgZmlsdGVyLnZhbHVlLCByb3cpKSB7XHJcbiAgICAgICAgICAgIGRhdGEuc3BsaWNlKGksIDEpLmZvckVhY2goaXRlbSA9PiB0aGlzLmZpbHRlcmVkT3V0Um93c1tgJHtpdGVtLmlkfWBdID0gaXRlbSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAoaXNOdWxsT3JVbmRlZmluZWQoY29tcGFyYXRvcikgfHwgY29tcGFyYXRvciA9PT0gJ2VxdWFscycpIHtcclxuICAgICAgICAgIGlmIChmaWx0ZXIudmFsdWUgIT09IGNlbGxWYWx1ZSkge1xyXG4gICAgICAgICAgICBkYXRhLnNwbGljZShpLCAxKS5mb3JFYWNoKGl0ZW0gPT4gdGhpcy5maWx0ZXJlZE91dFJvd3NbYCR7aXRlbS5pZH1gXSA9IGl0ZW0pO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBjZWxsVmFsdWUgPT09ICdzdHJpbmcnICYmIHR5cGVvZiBmaWx0ZXIudmFsdWUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICBjb25zdCBjZWxsVmFsdWVMQzogc3RyaW5nID0gYCR7Y2VsbFZhbHVlfWAudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgIGNvbnN0IGZpbHRlclZhbHVlTEM6IHN0cmluZyA9IGZpbHRlci52YWx1ZS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgaWYgKGlzTnVsbE9yVW5kZWZpbmVkKGNvbXBhcmF0b3IpIHx8IGNvbXBhcmF0b3IgPT09ICdlcXVhbHNJZ25vcmVDYXNlJykge1xyXG4gICAgICAgICAgICBpZiAoZmlsdGVyVmFsdWVMQyAhPT0gY2VsbFZhbHVlTEMpIHtcclxuICAgICAgICAgICAgICBkYXRhLnNwbGljZShpLCAxKS5mb3JFYWNoKGl0ZW0gPT4gdGhpcy5maWx0ZXJlZE91dFJvd3NbYCR7aXRlbS5pZH1gXSA9IGl0ZW0pO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGNvbXBhcmF0b3IgPT09ICdjb250YWlucycpIHtcclxuICAgICAgICAgICAgaWYgKGNlbGxWYWx1ZS5pbmRleE9mKGZpbHRlci52YWx1ZSkgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgZGF0YS5zcGxpY2UoaSwgMSkuZm9yRWFjaChpdGVtID0+IHRoaXMuZmlsdGVyZWRPdXRSb3dzW2Ake2l0ZW0uaWR9YF0gPSBpdGVtKTtcclxuICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIGlmIChjb21wYXJhdG9yID09PSAnY29udGFpbnNJZ25vcmVDYXNlJykge1xyXG4gICAgICAgICAgICBpZiAoY2VsbFZhbHVlTEMuaW5kZXhPZihmaWx0ZXJWYWx1ZUxDKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICBkYXRhLnNwbGljZShpLCAxKS5mb3JFYWNoKGl0ZW0gPT4gdGhpcy5maWx0ZXJlZE91dFJvd3NbYCR7aXRlbS5pZH1gXSA9IGl0ZW0pO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGNvbXBhcmF0b3IgPT09ICdzdGFydHNXaXRoJykge1xyXG4gICAgICAgICAgICBpZiAoIWNlbGxWYWx1ZS5zdGFydHNXaXRoKGZpbHRlci52YWx1ZSkpIHtcclxuICAgICAgICAgICAgICBkYXRhLnNwbGljZShpLCAxKS5mb3JFYWNoKGl0ZW0gPT4gdGhpcy5maWx0ZXJlZE91dFJvd3NbYCR7aXRlbS5pZH1gXSA9IGl0ZW0pO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGNvbXBhcmF0b3IgPT09ICdzdGFydHNXaXRoSWdub3JlQ2FzZScpIHtcclxuICAgICAgICAgICAgaWYgKCFjZWxsVmFsdWVMQy5zdGFydHNXaXRoKGZpbHRlclZhbHVlTEMpKSB7XHJcbiAgICAgICAgICAgICAgZGF0YS5zcGxpY2UoaSwgMSkuZm9yRWFjaChpdGVtID0+IHRoaXMuZmlsdGVyZWRPdXRSb3dzW2Ake2l0ZW0uaWR9YF0gPSBpdGVtKTtcclxuICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhcHBseU92ZXJhbGxGaWx0ZXIoZGF0YTogTWF0U2VsZWN0VGFibGVSb3dbXSk6IHZvaWQge1xyXG4gICAgdGhpcy5maWx0ZXJlZE91dFJvd3MgPSB7fTtcclxuICAgIGlmIChpc051bGxPclVuZGVmaW5lZCh0aGlzLm92ZXJhbGxGaWx0ZXJDb250cm9sLnZhbHVlKSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBjb25zdCBmaWx0ZXJWYWx1ZUxDOiBzdHJpbmcgPSB0aGlzLm92ZXJhbGxGaWx0ZXJDb250cm9sLnZhbHVlLnRvTG93ZXJDYXNlKCk7XHJcbiAgICBpZiAoZmlsdGVyVmFsdWVMQy50cmltKCkubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGZvciAobGV0IGkgPSBkYXRhLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgIGNvbnN0IHJvdzogTWF0U2VsZWN0VGFibGVSb3cgPSBkYXRhW2ldO1xyXG4gICAgICBsZXQgcm93U2hvdWxkQmVGaWx0ZXJlZCA9IHRydWU7XHJcbiAgICAgIGZvciAobGV0IGogPSB0aGlzLmRhdGFTb3VyY2UuY29sdW1ucy5sZW5ndGggLSAxOyBqID49IDA7IGotLSkge1xyXG4gICAgICAgIGNvbnN0IGtleTogc3RyaW5nID0gdGhpcy5kYXRhU291cmNlLmNvbHVtbnNbal0ua2V5O1xyXG4gICAgICAgIGNvbnN0IGNlbGxWYWx1ZTogYW55ID0gcm93W2tleV07XHJcbiAgICAgICAgaWYgKGlzTnVsbE9yVW5kZWZpbmVkKGNlbGxWYWx1ZSkpIHtcclxuICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBjZWxsVmFsdWVMQzogc3RyaW5nID0gYCR7Y2VsbFZhbHVlfWAudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICBpZiAoY2VsbFZhbHVlTEMuaW5kZXhPZihmaWx0ZXJWYWx1ZUxDKSAhPT0gLTEpIHtcclxuICAgICAgICAgIHJvd1Nob3VsZEJlRmlsdGVyZWQgPSBmYWxzZTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpZiAocm93U2hvdWxkQmVGaWx0ZXJlZCkge1xyXG4gICAgICAgIGRhdGEuc3BsaWNlKGksIDEpLmZvckVhY2goaXRlbSA9PiB0aGlzLmZpbHRlcmVkT3V0Um93c1tgJHtpdGVtLmlkfWBdID0gaXRlbSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgYXBwbHlQcm94eVRvQXJyYXkoYXJyYXk6IGFueVtdLCBjYWxsYmFjazogKCkgPT4gdm9pZCk6IHZvaWQge1xyXG4gICAgWydwb3AnLCAncHVzaCcsICdyZXZlcnNlJywgJ3NoaWZ0JywgJ3Vuc2hpZnQnLCAnc3BsaWNlJywgJ3NvcnQnXS5mb3JFYWNoKChtZXRob2ROYW1lKSA9PiB7XHJcbiAgICAgIGFycmF5W21ldGhvZE5hbWVdID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGNvbnN0IHJlcyA9IEFycmF5LnByb3RvdHlwZVttZXRob2ROYW1lXS5hcHBseShhcnJheSwgYXJndW1lbnRzKTsgLy8gY2FsbCBub3JtYWwgYmVoYXZpb3VyXHJcbiAgICAgICAgY2FsbGJhY2suYXBwbHkoYXJyYXksIGFyZ3VtZW50cyk7IC8vIGZpbmFsbHkgY2FsbCB0aGUgY2FsbGJhY2sgc3VwcGxpZWRcclxuICAgICAgICByZXR1cm4gcmVzO1xyXG4gICAgICB9O1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJlc2V0RmlsdGVycygpOiB2b2lkIHtcclxuICAgIHRoaXMub3ZlcmFsbEZpbHRlckNvbnRyb2wuc2V0VmFsdWUoJycpO1xyXG4gICAgT2JqZWN0LmtleXModGhpcy5maWx0ZXJDb250cm9scy5jb250cm9scylcclxuICAgICAgLmZvckVhY2goa2V5ID0+IHRoaXMuZmlsdGVyQ29udHJvbHMuZ2V0KGtleSkuc2V0VmFsdWUoJycpKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRha2VuIGZyb20ge0BzZWUgTWF0VGFibGVEYXRhU291cmNlI3NvcnRpbmdEYXRhQWNjZXNzb3J9XHJcbiAgICpcclxuICAgKiBAcGFyYW0gZGF0YVxyXG4gICAqIEBwYXJhbSBzb3J0SGVhZGVySWRcclxuICAgKi9cclxuICBwcml2YXRlIHNvcnRpbmdEYXRhQWNjZXNzb3IoZGF0YTogTWF0U2VsZWN0VGFibGVSb3csIHNvcnRIZWFkZXJJZDogc3RyaW5nKTogc3RyaW5nIHwgbnVtYmVyIHtcclxuICAgIGNvbnN0IHZhbHVlID0gKGRhdGEgYXMgeyBba2V5OiBzdHJpbmddOiBhbnkgfSlbc29ydEhlYWRlcklkXTtcclxuXHJcbiAgICBpZiAoX2lzTnVtYmVyVmFsdWUodmFsdWUpKSB7XHJcbiAgICAgIGNvbnN0IG51bWJlclZhbHVlID0gTnVtYmVyKHZhbHVlKTtcclxuXHJcbiAgICAgIC8vIE51bWJlcnMgYmV5b25kIGBNQVhfU0FGRV9JTlRFR0VSYCBjYW4ndCBiZSBjb21wYXJlZCByZWxpYWJseSBzbyB3ZVxyXG4gICAgICAvLyBsZWF2ZSB0aGVtIGFzIHN0cmluZ3MuIEZvciBtb3JlIGluZm86IGh0dHBzOi8vZ29vLmdsL3k1dmJTZ1xyXG4gICAgICByZXR1cm4gbnVtYmVyVmFsdWUgPCBNQVhfU0FGRV9JTlRFR0VSID8gbnVtYmVyVmFsdWUgOiB2YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdmFsdWU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUYWtlbiBmcm9tIHtAc2VlIE1hdFRhYmxlRGF0YVNvdXJjZSNzb3J0RGF0YX1cclxuICAgKlxyXG4gICAqIEBwYXJhbSBkYXRhXHJcbiAgICogQHBhcmFtIHNvcnRcclxuICAgKi9cclxuICBwcml2YXRlIHNvcnREYXRhKGRhdGE6IE1hdFNlbGVjdFRhYmxlUm93W10sIHNvcnQ6IE1hdFNvcnQpOiBNYXRTZWxlY3RUYWJsZVJvd1tdIHtcclxuICAgIGNvbnN0IGFjdGl2ZSA9IHNvcnQuYWN0aXZlO1xyXG4gICAgY29uc3QgZGlyZWN0aW9uID0gc29ydC5kaXJlY3Rpb247XHJcbiAgICBpZiAoIWFjdGl2ZSB8fCBkaXJlY3Rpb24gPT09ICcnKSB7XHJcbiAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBkYXRhLnNvcnQoKGEsIGIpID0+IHtcclxuICAgICAgY29uc3QgdmFsdWVBID0gdGhpcy5zb3J0aW5nRGF0YUFjY2Vzc29yKGEsIGFjdGl2ZSk7XHJcbiAgICAgIGNvbnN0IHZhbHVlQiA9IHRoaXMuc29ydGluZ0RhdGFBY2Nlc3NvcihiLCBhY3RpdmUpO1xyXG5cclxuICAgICAgLy8gSWYgYm90aCB2YWx1ZUEgYW5kIHZhbHVlQiBleGlzdCAodHJ1dGh5KSwgdGhlbiBjb21wYXJlIHRoZSB0d28uIE90aGVyd2lzZSwgY2hlY2sgaWZcclxuICAgICAgLy8gb25lIHZhbHVlIGV4aXN0cyB3aGlsZSB0aGUgb3RoZXIgZG9lc24ndC4gSW4gdGhpcyBjYXNlLCBleGlzdGluZyB2YWx1ZSBzaG91bGQgY29tZSBmaXJzdC5cclxuICAgICAgLy8gVGhpcyBhdm9pZHMgaW5jb25zaXN0ZW50IHJlc3VsdHMgd2hlbiBjb21wYXJpbmcgdmFsdWVzIHRvIHVuZGVmaW5lZC9udWxsLlxyXG4gICAgICAvLyBJZiBuZWl0aGVyIHZhbHVlIGV4aXN0cywgcmV0dXJuIDAgKGVxdWFsKS5cclxuICAgICAgbGV0IGNvbXBhcmF0b3JSZXN1bHQgPSAwO1xyXG4gICAgICBpZiAodmFsdWVBICE9IG51bGwgJiYgdmFsdWVCICE9IG51bGwpIHtcclxuICAgICAgICAvLyBDaGVjayBpZiBvbmUgdmFsdWUgaXMgZ3JlYXRlciB0aGFuIHRoZSBvdGhlcjsgaWYgZXF1YWwsIGNvbXBhcmF0b3JSZXN1bHQgc2hvdWxkIHJlbWFpbiAwLlxyXG4gICAgICAgIGlmICh2YWx1ZUEgPiB2YWx1ZUIpIHtcclxuICAgICAgICAgIGNvbXBhcmF0b3JSZXN1bHQgPSAxO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodmFsdWVBIDwgdmFsdWVCKSB7XHJcbiAgICAgICAgICBjb21wYXJhdG9yUmVzdWx0ID0gLTE7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2UgaWYgKHZhbHVlQSAhPSBudWxsKSB7XHJcbiAgICAgICAgY29tcGFyYXRvclJlc3VsdCA9IDE7XHJcbiAgICAgIH0gZWxzZSBpZiAodmFsdWVCICE9IG51bGwpIHtcclxuICAgICAgICBjb21wYXJhdG9yUmVzdWx0ID0gLTE7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBjb21wYXJhdG9yUmVzdWx0ICogKGRpcmVjdGlvbiA9PT0gJ2FzYycgPyAxIDogLTEpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxufVxyXG4iXX0=