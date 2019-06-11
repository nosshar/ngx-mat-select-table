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
            /**
             * Manual scrolling implementation.
             * Currently MatOption height less than the row height (42 < 48).
             * ToDo: find why {@see MatSelectSearchComponent#adjustScrollTopToFitActiveOptionIntoView()} sets incorrect scrollTop value.
             */
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
            // Apply default sorting
            _this.tableDataSource = isNullOrUndefined(_this.defaultSort) || !_this.defaultSort.active ?
                dataClone : _this.sortData(dataClone, _this.defaultSort.active, _this.defaultSort.direction);
            // Apply manual sorting
            _this.tableDataSource = !_this.sort.direction ?
                _this.tableDataSource : _this.sortData(_this.tableDataSource, _this.sort.active, _this.sort.direction);
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
            panelClass.push('mat-select-search-table-panel');
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
     * @param {?} active
     * @return {?}
     */
    MatSelectTableComponent.prototype.sortingDataAccessor = /**
     * Taken from {\@see MatTableDataSource#sortingDataAccessor}
     *
     * @private
     * @param {?} data
     * @param {?} active
     * @return {?}
     */
    function (data, active) {
        /** @type {?} */
        var value = ((/** @type {?} */ (data)))[active];
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
     * @private
     * @param {?} data
     * @param {?} active
     * @param {?} direction
     * @return {?}
     */
    MatSelectTableComponent.prototype.sortData = /**
     * @private
     * @param {?} data
     * @param {?} active
     * @param {?} direction
     * @return {?}
     */
    function (data, active, direction) {
        var _this = this;
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
                    styles: [":host{display:block}:host mat-form-field{width:100%}::ng-deep .mat-select-panel.mat-select-search-table-panel{overflow-x:auto!important}::ng-deep .mat-select-panel.mat-select-search-table-panel .overall-search-toggle{z-index:102;position:absolute;left:13px;top:17px;cursor:pointer}::ng-deep .mat-select-panel.mat-select-search-table-panel ngx-mat-select-search{position:absolute;z-index:101}::ng-deep .mat-select-panel.mat-select-search-table-panel ngx-mat-select-search.hidden{display:none}::ng-deep .mat-select-panel.mat-select-search-table-panel ngx-mat-select-search .mat-select-search-inner{height:56px}::ng-deep .mat-select-panel.mat-select-search-table-panel ngx-mat-select-search .mat-select-search-inner .mat-select-search-input{margin-left:26px;width:calc(100% - 26px)}::ng-deep .mat-select-panel.mat-select-search-table-panel table{width:100%}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr{cursor:pointer}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr.active{background:rgba(0,0,0,.04)}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr td{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th ::ng-deep .mat-sort-header-container{height:55px}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th ::ng-deep .mat-sort-header-container mat-form-field .mat-form-field-infix{width:initial}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr td mat-option,::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th mat-option{background:0 0!important}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr td.selection,::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th.selection{width:56px;padding:0;margin:0}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr td.selection.hidden mat-option,::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th.selection.hidden mat-option{visibility:hidden}"]
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
        defaultSort: [{ type: Input }],
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0LXNlbGVjdC10YWJsZS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9uZ3gtbWF0LXNlbGVjdC10YWJsZS8iLCJzb3VyY2VzIjpbIm1hdC1zZWxlY3QtdGFibGUuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsT0FBTyxFQUVMLHVCQUF1QixFQUN2QixpQkFBaUIsRUFDakIsU0FBUyxFQUNULFVBQVUsRUFDVixVQUFVLEVBQ1YsS0FBSyxFQUlMLFNBQVMsRUFFVCxTQUFTLEVBQ1QsWUFBWSxFQUNiLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBdUIsV0FBVyxFQUFFLFNBQVMsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQy9GLE9BQU8sRUFBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUMzQyxPQUFPLEVBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFzQixxQkFBcUIsRUFBc0IsTUFBTSxtQkFBbUIsQ0FBQztBQUMxSSxPQUFPLEVBQUMsT0FBTyxFQUFFLGlCQUFpQixFQUFDLE1BQU0sTUFBTSxDQUFDO0FBR2hELE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUNyRCxPQUFPLEVBQUMsUUFBUSxFQUFFLFlBQVksRUFBRSxvQkFBb0IsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFHN0YsT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0sdUJBQXVCLENBQUM7O0lBRXpELGdCQUFnQixHQUFHLGdCQUFnQjtBQUV6QztJQWlIRSxpQ0FBb0IsRUFBcUI7UUFBckIsT0FBRSxHQUFGLEVBQUUsQ0FBbUI7UUF4QnpDLG9CQUFlLEdBQXdCLEVBQUUsQ0FBQztRQVFsQyxzQkFBaUIsR0FBVSxFQUFFLENBQUM7UUFFOUIsNkJBQXdCLEdBQWE7WUFDM0MsYUFBYTtZQUNi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O0lBRW5DLHFDQUE2QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XHJcbiAgQWZ0ZXJWaWV3SW5pdCxcclxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcclxuICBDaGFuZ2VEZXRlY3RvclJlZixcclxuICBDb21wb25lbnQsXHJcbiAgRWxlbWVudFJlZixcclxuICBmb3J3YXJkUmVmLFxyXG4gIElucHV0LFxyXG4gIE9uQ2hhbmdlcyxcclxuICBPbkRlc3Ryb3ksXHJcbiAgT25Jbml0LFxyXG4gIFF1ZXJ5TGlzdCxcclxuICBTaW1wbGVDaGFuZ2VzLFxyXG4gIFZpZXdDaGlsZCxcclxuICBWaWV3Q2hpbGRyZW5cclxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHtDb250cm9sVmFsdWVBY2Nlc3NvciwgRm9ybUNvbnRyb2wsIEZvcm1Hcm91cCwgTkdfVkFMVUVfQUNDRVNTT1J9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcclxuaW1wb3J0IHttZXJnZSwgU3ViamVjdCwgdGltZXJ9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQge01hdE9wdGlvbiwgTWF0U2VsZWN0LCBNYXRTb3J0LCBNYXRUYWJsZSwgTWF0VGFibGVEYXRhU291cmNlLCBTRUxFQ1RfSVRFTV9IRUlHSFRfRU0sIFNvcnQsIFNvcnREaXJlY3Rpb259IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsJztcclxuaW1wb3J0IHtpc0FycmF5LCBpc051bGxPclVuZGVmaW5lZH0gZnJvbSAndXRpbCc7XHJcbmltcG9ydCB7TWF0U2VsZWN0VGFibGVEYXRhU291cmNlfSBmcm9tICcuL01hdFNlbGVjdFRhYmxlRGF0YVNvdXJjZSc7XHJcbmltcG9ydCB7TWF0U2VsZWN0VGFibGVSb3d9IGZyb20gJy4vTWF0U2VsZWN0VGFibGVSb3cnO1xyXG5pbXBvcnQge19pc051bWJlclZhbHVlfSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xyXG5pbXBvcnQge2RlYm91bmNlLCBkZWJvdW5jZVRpbWUsIGRpc3RpbmN0VW50aWxDaGFuZ2VkLCB0YWtlLCB0YWtlVW50aWx9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcclxuaW1wb3J0IHtNYXRTZWxlY3RUYWJsZUNvbHVtbn0gZnJvbSAnLi9NYXRTZWxlY3RUYWJsZUNvbHVtbic7XHJcbmltcG9ydCB7TWF0U2VsZWN0VGFibGVGaWx0ZXJ9IGZyb20gJy4vTWF0U2VsZWN0VGFibGVGaWx0ZXInO1xyXG5pbXBvcnQge01hdFNlbGVjdFNlYXJjaENvbXBvbmVudH0gZnJvbSAnbmd4LW1hdC1zZWxlY3Qtc2VhcmNoJztcclxuXHJcbmNvbnN0IE1BWF9TQUZFX0lOVEVHRVIgPSA5MDA3MTk5MjU0NzQwOTkxO1xyXG5cclxuQENvbXBvbmVudCh7XHJcbiAgc2VsZWN0b3I6ICduZ3gtbWF0LXNlbGVjdC10YWJsZScsXHJcbiAgdGVtcGxhdGVVcmw6ICcuL21hdC1zZWxlY3QtdGFibGUuY29tcG9uZW50Lmh0bWwnLFxyXG4gIHN0eWxlVXJsczogWycuL21hdC1zZWxlY3QtdGFibGUuY29tcG9uZW50LnNjc3MnXSxcclxuICBleHBvcnRBczogJ25neC1tYXQtc2VsZWN0LXRhYmxlJyxcclxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcclxuICBwcm92aWRlcnM6IFtcclxuICAgIHtcclxuICAgICAgcHJvdmlkZTogTkdfVkFMVUVfQUNDRVNTT1IsXHJcbiAgICAgIHVzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IE1hdFNlbGVjdFRhYmxlQ29tcG9uZW50KSxcclxuICAgICAgbXVsdGk6IHRydWVcclxuICAgIH1cclxuICBdXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBNYXRTZWxlY3RUYWJsZUNvbXBvbmVudCBpbXBsZW1lbnRzIENvbnRyb2xWYWx1ZUFjY2Vzc29yLCBPbkluaXQsIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSwgT25DaGFuZ2VzIHtcclxuXHJcbiAgLyoqIERhdGEgU291cmNlIGZvciB0aGUgdGFibGUgKi9cclxuICBASW5wdXQoKSBkYXRhU291cmNlOiBNYXRTZWxlY3RUYWJsZURhdGFTb3VyY2U8TWF0U2VsZWN0VGFibGVSb3c+O1xyXG5cclxuICAvKipcclxuICAgKiBNdWx0aXBsZS9TaW5nbGUgbW9kZSBmb3Ige0BzZWUgTWF0U2VsZWN0I211bHRpcGxlfSB0byBpbml0aWFsaXplLlxyXG4gICAqIE5COiBzd2l0Y2hpbmcgYmV0d2VlbiBtb2RlcyBpbiBydW50aW1lIGlzIG5vdCBzdXBwb3J0ZWQgYnkge0BzZWUgTWF0U2VsZWN0fVxyXG4gICAqL1xyXG4gIEBJbnB1dCgpIG11bHRpcGxlOiBib29sZWFuO1xyXG5cclxuICAvKiogV2hldGhlciBvciBub3Qgb3ZlcmFsbCBzZWFyY2ggbW9kZSBlbmFibGVkLiBTZWUge0BzZWUgTWF0U2VsZWN0VGFibGVDb21wb25lbnR9ICovXHJcbiAgQElucHV0KCkgb3ZlcmFsbFNlYXJjaEVuYWJsZWQ6IGJvb2xlYW47XHJcblxyXG4gIC8qKiBEZWZhdWx0IGlzIHRydWUgKi9cclxuICBASW5wdXQoKSBvdmVyYWxsU2VhcmNoVmlzaWJsZTogYm9vbGVhbjtcclxuXHJcbiAgLyoqIFdoZXRoZXIgb3Igbm90IHNob3VsZCB7QHNlZSBNYXRTZWxlY3RUYWJsZUNvbXBvbmVudH0gYmUgdmlzaWJsZSBvbiBvcGVuLiBEZWZhdWx0IGlzIHRydWUgKi9cclxuICBASW5wdXQoKSByZXNldFNvcnRPbk9wZW46IGJvb2xlYW47XHJcblxyXG4gIC8qKiBXaGV0aGVyIG9yIG5vdCBwcmV2aW91cyBzZWFyY2ggc2hvdWxkIGJlIGNsZWFyZWQgb24gb3Blbi4gRGVmYXVsdCBpcyB0cnVlICovXHJcbiAgQElucHV0KCkgcmVzZXRGaWx0ZXJzT25PcGVuOiBib29sZWFuO1xyXG5cclxuICAvKipcclxuICAgKiBGdW5jdGlvbiB0byBjdXN0b21pemUgdGhlIGRlZmF1bHQgbGFiZWxcclxuICAgKi9cclxuICBASW5wdXQoKSBjdXN0b21UcmlnZ2VyTGFiZWxGbjogKHZhbHVlOiBNYXRTZWxlY3RUYWJsZVJvd1tdKSA9PiBzdHJpbmc7XHJcblxyXG4gIC8qKlxyXG4gICAqIFRlbXBsYXRlIHRvIGN1c3RvbWl6ZSB0aGUgZGVmYXVsdCB0cmlnZ2VyIGxhYmVsLiBIYXMgbGVzc2VyIHByaW9yaXR5IHRoYW4ge0BzZWUgTWF0U2VsZWN0VGFibGVDb21wb25lbnQjY3VzdG9tVHJpZ2dlckxhYmVsRm59LlxyXG4gICAqIFN1YnN0aXR1dGlvbiBpcyBjYXNlIHNlbnNpdGl2ZS5cclxuICAgKiBFeGFtcGxlOiAke25hbWV9ICR7aWR9IC0gJHthZGRyZXNzfVxyXG4gICAqL1xyXG4gIEBJbnB1dCgpIGN1c3RvbVRyaWdnZXJMYWJlbFRlbXBsYXRlOiBzdHJpbmc7XHJcblxyXG4gIC8qKlxyXG4gICAqIHtAc2VlIE1hdFNlbGVjdH0gcHJveHkgaW5wdXRzIGNvbmZpZ3VyYXRvclxyXG4gICAqIHtAc2VlIE1hdFNlbGVjdCNtdWx0aXBsZX0gZ2V0cyB2YWx1ZSBmcm9tIHtAc2VlIE1hdFNlbGVjdFRhYmxlQ29tcG9uZW50I211bHRpcGxlfVxyXG4gICAqL1xyXG4gIEBJbnB1dCgpIG1hdFNlbGVjdENvbmZpZ3VyYXRvcjogeyBba2V5OiBzdHJpbmddOiBhbnkgfTtcclxuXHJcbiAgLyoqXHJcbiAgICoge0BzZWUgTWF0U2VsZWN0U2VhcmNoQ29tcG9uZW50fSBwcm94eSBpbnB1dHMgY29uZmlndXJhdG9yXHJcbiAgICoge0BzZWUgTWF0U2VsZWN0U2VhcmNoQ29tcG9uZW50I2NsZWFyU2VhcmNoSW5wdXR9IGdldHMgdmFsdWUgZnJvbSB7QHNlZSBNYXRTZWxlY3RUYWJsZUNvbXBvbmVudCNyZXNldEZpbHRlcnNPbk9wZW59XHJcbiAgICoge0BzZWUgTWF0U2VsZWN0U2VhcmNoQ29tcG9uZW50fSB7QHNlZSBDb250cm9sVmFsdWVBY2Nlc3Nvcn0gZ2V0cyB2YWx1ZSBmcm9tIHtAc2VlIE1hdFNlbGVjdFRhYmxlQ29tcG9uZW50I292ZXJhbGxGaWx0ZXJDb250cm9sfVxyXG4gICAqL1xyXG4gIEBJbnB1dCgpIG1hdFNlbGVjdFNlYXJjaENvbmZpZ3VyYXRvcjogeyBba2V5OiBzdHJpbmddOiBhbnkgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQXBwbHkgZGVmYXVsdCBzb3J0aW5nXHJcbiAgICovXHJcbiAgQElucHV0KCkgZGVmYXVsdFNvcnQ6IFNvcnQ7XHJcblxyXG4gIEBWaWV3Q2hpbGQoJ2NvbXBvbmVudFNlbGVjdCcpIHByaXZhdGUgbWF0U2VsZWN0OiBNYXRTZWxlY3Q7XHJcblxyXG4gIEBWaWV3Q2hpbGQoTWF0U2VsZWN0U2VhcmNoQ29tcG9uZW50KSBwcml2YXRlIG1hdFNlbGVjdFNlYXJjaDogTWF0U2VsZWN0U2VhcmNoQ29tcG9uZW50O1xyXG5cclxuICBAVmlld0NoaWxkKE1hdFNvcnQpIHByaXZhdGUgc29ydDogTWF0U29ydDtcclxuXHJcbiAgQFZpZXdDaGlsZChNYXRUYWJsZSkgcHJpdmF0ZSB0YWJsZTogTWF0VGFibGU8TWF0U2VsZWN0VGFibGVSb3c+O1xyXG5cclxuICBAVmlld0NoaWxkKCd0YWJsZScsIHtyZWFkOiBFbGVtZW50UmVmfSkgcHJpdmF0ZSB0YWJsZVJlZjogRWxlbWVudFJlZjtcclxuXHJcbiAgQFZpZXdDaGlsZHJlbihNYXRPcHRpb24pIHByaXZhdGUgbWF0T3B0aW9uczogUXVlcnlMaXN0PE1hdE9wdGlvbj47XHJcblxyXG4gIHRhYmxlRGF0YVNvdXJjZTogTWF0U2VsZWN0VGFibGVSb3dbXTtcclxuXHJcbiAgdGFibGVDb2x1bW5zOiBzdHJpbmdbXTtcclxuXHJcbiAgdGFibGVDb2x1bW5zTWFwOiBNYXA8c3RyaW5nLCBNYXRTZWxlY3RUYWJsZUNvbHVtbj47XHJcblxyXG4gIHRhYmxlQWN0aXZlUm93OiBudW1iZXI7XHJcblxyXG4gIGZpbHRlcmVkT3V0Um93czogeyBba2V5OiBzdHJpbmddOiBNYXRTZWxlY3RUYWJsZVJvdyB9O1xyXG5cclxuICBjb21wbGV0ZVJvd0xpc3Q6IE1hdFNlbGVjdFRhYmxlUm93W10gPSBbXTtcclxuXHJcbiAgb3ZlcmFsbFNlYXJjaFZpc2libGVTdGF0ZTogYm9vbGVhbjtcclxuXHJcbiAgb3ZlcmFsbEZpbHRlckNvbnRyb2w6IEZvcm1Db250cm9sO1xyXG5cclxuICBwcml2YXRlIGZpbHRlckNvbnRyb2xzOiBGb3JtR3JvdXA7XHJcblxyXG4gIHByaXZhdGUgY29tcGxldGVWYWx1ZUxpc3Q6IGFueVtdID0gW107XHJcblxyXG4gIHByaXZhdGUgY29udHJvbFZhbHVlQWNjZXNzb3JLZXlzOiBzdHJpbmdbXSA9IFtcclxuICAgICdmb3JtQ29udHJvbCcsXHJcbiAgICAnZm9ybUNvbnRyb2xOYW1lJyxcclxuICAgICdmb3JtR3JvdXAnLFxyXG4gICAgJ2Zvcm1Hcm91cE5hbWUnLFxyXG4gICAgJ2Zvcm1BcnJheScsXHJcbiAgICAnZm9ybUFycmF5TmFtZSdcclxuICBdO1xyXG5cclxuICAvKiogU3ViamVjdCB0aGF0IGVtaXRzIHdoZW4gdGhlIGNvbXBvbmVudCBoYXMgYmVlbiBkZXN0cm95ZWQuICovXHJcbiAgcHJpdmF0ZSBfb25EZXN0cm95ID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcclxuXHJcbiAgcHJpdmF0ZSBfb25PcHRpb25zQ2hhbmdlID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcclxuXHJcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBjZDogQ2hhbmdlRGV0ZWN0b3JSZWYpIHtcclxuICAgIHRoaXMudGFibGVDb2x1bW5zTWFwID0gbmV3IE1hcCgpO1xyXG4gICAgdGhpcy5maWx0ZXJDb250cm9scyA9IG5ldyBGb3JtR3JvdXAoe30pO1xyXG4gICAgdGhpcy5vdmVyYWxsRmlsdGVyQ29udHJvbCA9IG5ldyBGb3JtQ29udHJvbCgnJyk7XHJcbiAgfVxyXG5cclxuICBuZ09uSW5pdCgpOiB2b2lkIHtcclxuICAgIHRoaXMubXVsdGlwbGUgPSB0aGlzLm11bHRpcGxlIHx8IGZhbHNlO1xyXG4gICAgdGhpcy5tYXRTZWxlY3Qub3BlbmVkQ2hhbmdlXHJcbiAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLl9vbkRlc3Ryb3kpKVxyXG4gICAgICAuc3Vic2NyaWJlKG9wZW5lZCA9PiB7XHJcbiAgICAgICAgaWYgKHRoaXMucmVzZXRGaWx0ZXJzT25PcGVuICE9PSBmYWxzZSB8fCAhdGhpcy5tYXRPcHRpb25zLmxlbmd0aCkge1xyXG4gICAgICAgICAgdGhpcy5yZXNldEZpbHRlcnMoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5vdmVyYWxsU2VhcmNoVmlzaWJsZVN0YXRlID0gdGhpcy5vdmVyYWxsU2VhcmNoVmlzaWJsZTtcclxuICAgICAgICBpZiAodGhpcy5yZXNldFNvcnRPbk9wZW4gIT09IGZhbHNlKSB7XHJcbiAgICAgICAgICB0aGlzLnNvcnQuc29ydCh7aWQ6ICcnLCBzdGFydDogJ2FzYycsIGRpc2FibGVDbGVhcjogZmFsc2V9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFvcGVuZWQpIHtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMub3ZlcmFsbFNlYXJjaEVuYWJsZWQpIHtcclxuICAgICAgICAgIHRoaXMucHJveHlNYXRTZWxlY3RTZWFyY2hDb25maWd1cmF0aW9uKHRoaXMubWF0U2VsZWN0U2VhcmNoQ29uZmlndXJhdG9yKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gVG9EbzogZ2V0IHJpZCBvZiB0aGlzIHdvcmthcm91bmQgKHVwZGF0ZXMgaGVhZGVyIHJvdyBbb3RoZXJ3aXNlIHNvcnQgbWVjaGFuaXNtIHByb2R1Y2VzIGdsaXRjaGVzXSlcclxuICAgICAgICAodGhpcy50YWJsZSBhcyBhbnkpLl9oZWFkZXJSb3dEZWZDaGFuZ2VkID0gdHJ1ZTtcclxuICAgICAgICAvLyBEaXNhYmxlIHNvcnQgYnV0dG9ucyB0byBwcmV2ZW50IHNvcnRpbmcgY2hhbmdlIG9uIFNQQUNFIGtleSBwcmVzc2VkIGluIGZpbHRlciBmaWVsZFxyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4gW10uZm9yRWFjaC5jYWxsKFxyXG4gICAgICAgICAgdGhpcy50YWJsZVJlZi5uYXRpdmVFbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2J1dHRvbi5tYXQtc29ydC1oZWFkZXItYnV0dG9uJyksXHJcbiAgICAgICAgICAoZSkgPT4gZS5kaXNhYmxlZCA9IHRydWUpXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgLy8gUGF0Y2ggdGhlIGhlaWdodCBvZiB0aGUgcGFuZWwgdG8gaW5jbHVkZSB0aGUgaGVpZ2h0IG9mIHRoZSBoZWFkZXIgYW5kIGZvb3RlclxyXG4gICAgICAgIGNvbnN0IHBhbmVsRWxlbWVudDogSFRNTERpdkVsZW1lbnQgPSB0aGlzLm1hdFNlbGVjdC5wYW5lbC5uYXRpdmVFbGVtZW50O1xyXG4gICAgICAgIGNvbnN0IHBhbmVsSGVpZ2h0ID0gcGFuZWxFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodDtcclxuICAgICAgICBsZXQgdGFibGVBZGRpdGlvbmFsSGVpZ2h0ID0gMDtcclxuICAgICAgICB0aGlzLnRhYmxlXHJcbiAgICAgICAgICAuX2dldFJlbmRlcmVkUm93cyh0aGlzLnRhYmxlLl9oZWFkZXJSb3dPdXRsZXQpXHJcbiAgICAgICAgICAuY29uY2F0KHRoaXMudGFibGUuX2dldFJlbmRlcmVkUm93cyh0aGlzLnRhYmxlLl9mb290ZXJSb3dPdXRsZXQpKVxyXG4gICAgICAgICAgLmZvckVhY2gocm93ID0+IHRhYmxlQWRkaXRpb25hbEhlaWdodCArPSByb3cuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0KTtcclxuICAgICAgICBpZiAoIWlzTmFOKHBhbmVsSGVpZ2h0KSkge1xyXG4gICAgICAgICAgcGFuZWxFbGVtZW50LnN0eWxlLm1heEhlaWdodCA9IGAke3BhbmVsSGVpZ2h0ICsgdGFibGVBZGRpdGlvbmFsSGVpZ2h0fXB4YDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5tYXRTZWxlY3RTZWFyY2hDb25maWd1cmF0b3IuZGlzYWJsZVNjcm9sbFRvQWN0aXZlT25PcHRpb25zQ2hhbmdlZFxyXG4gICAgICAgICAgJiYgIWlzTnVsbE9yVW5kZWZpbmVkKHRoaXMubWF0U2VsZWN0Ll9rZXlNYW5hZ2VyKSAmJiB0aGlzLmNvbXBsZXRlUm93TGlzdC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgZmlyc3RWYWx1ZSA9IGAke3RoaXMuY29tcGxldGVSb3dMaXN0WzBdLmlkfWA7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy50YWJsZURhdGFTb3VyY2UubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICBpZiAoYCR7dGhpcy50YWJsZURhdGFTb3VyY2VbaV0uaWR9YCA9PT0gZmlyc3RWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tYXRTZWxlY3QuX2tleU1hbmFnZXIuY2hhbmdlLnBpcGUodGFrZVVudGlsKHRoaXMuX29uRGVzdHJveSksIHRha2UoMSkpLnN1YnNjcmliZSgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgIHRoaXMubWF0U2VsZWN0Ll9rZXlNYW5hZ2VyLnNldEFjdGl2ZUl0ZW0oaSk7XHJcbiAgICAgICAgICAgICAgICAgIHRoaXMuY2QuZGV0ZWN0Q2hhbmdlcygpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogTWFudWFsIHNjcm9sbGluZyBpbXBsZW1lbnRhdGlvbi5cclxuICAgICAgICAgKiBDdXJyZW50bHkgTWF0T3B0aW9uIGhlaWdodCBsZXNzIHRoYW4gdGhlIHJvdyBoZWlnaHQgKDQyIDwgNDgpLlxyXG4gICAgICAgICAqIFRvRG86IGZpbmQgd2h5IHtAc2VlIE1hdFNlbGVjdFNlYXJjaENvbXBvbmVudCNhZGp1c3RTY3JvbGxUb3BUb0ZpdEFjdGl2ZU9wdGlvbkludG9WaWV3KCl9IHNldHMgaW5jb3JyZWN0IHNjcm9sbFRvcCB2YWx1ZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKHRoaXMubWF0U2VsZWN0Ll9rZXlNYW5hZ2VyKSkge1xyXG4gICAgICAgICAgdGhpcy5tYXRTZWxlY3QuX2tleU1hbmFnZXIuY2hhbmdlXHJcbiAgICAgICAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLl9vbkRlc3Ryb3kpLCBkZWJvdW5jZSgoKSA9PiB0aW1lcigxKSksIGRpc3RpbmN0VW50aWxDaGFuZ2VkKCkpXHJcbiAgICAgICAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xyXG4gICAgICAgICAgICAgIC8vIFRvRG86IDFlbSA9IDE2cHggaGFyZGNvZGUsIHNob3VsZCBiZSBjYWxjdWxhdGVkIGR5bmFtaWNhbGx5XHJcbiAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiBwYW5lbEVsZW1lbnQuc2Nyb2xsVG9wID0gdGhpcy5tYXRTZWxlY3QuX2tleU1hbmFnZXIuYWN0aXZlSXRlbUluZGV4ICogU0VMRUNUX0lURU1fSEVJR0hUX0VNICogMTYpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgbmdBZnRlclZpZXdJbml0KCk6IHZvaWQge1xyXG4gICAgbWVyZ2UoLi4uW1xyXG4gICAgICB0aGlzLnNvcnQuc29ydENoYW5nZSxcclxuICAgICAgdGhpcy5maWx0ZXJDb250cm9scy52YWx1ZUNoYW5nZXMsXHJcbiAgICAgIHRoaXMub3ZlcmFsbEZpbHRlckNvbnRyb2wudmFsdWVDaGFuZ2VzXHJcbiAgICBdKVxyXG4gICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5fb25EZXN0cm95KSwgZGVib3VuY2VUaW1lKDEwMCkpXHJcbiAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGRhdGFDbG9uZTogTWF0U2VsZWN0VGFibGVSb3dbXSA9IFsuLi50aGlzLmRhdGFTb3VyY2UuZGF0YV07XHJcblxyXG4gICAgICAgIC8vIEFwcGx5IGZpbHRlcmluZ1xyXG4gICAgICAgIGlmICh0aGlzLm92ZXJhbGxTZWFyY2hFbmFibGVkICYmIHRoaXMub3ZlcmFsbFNlYXJjaFZpc2libGVTdGF0ZSkge1xyXG4gICAgICAgICAgdGhpcy5hcHBseU92ZXJhbGxGaWx0ZXIoZGF0YUNsb25lKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5hcHBseUNvbHVtbkxldmVsRmlsdGVycyhkYXRhQ2xvbmUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQXBwbHkgZGVmYXVsdCBzb3J0aW5nXHJcbiAgICAgICAgdGhpcy50YWJsZURhdGFTb3VyY2UgPSBpc051bGxPclVuZGVmaW5lZCh0aGlzLmRlZmF1bHRTb3J0KSB8fCAhdGhpcy5kZWZhdWx0U29ydC5hY3RpdmUgP1xyXG4gICAgICAgICAgZGF0YUNsb25lIDogdGhpcy5zb3J0RGF0YShkYXRhQ2xvbmUsIHRoaXMuZGVmYXVsdFNvcnQuYWN0aXZlLCB0aGlzLmRlZmF1bHRTb3J0LmRpcmVjdGlvbik7XHJcbiAgICAgICAgLy8gQXBwbHkgbWFudWFsIHNvcnRpbmdcclxuICAgICAgICB0aGlzLnRhYmxlRGF0YVNvdXJjZSA9ICF0aGlzLnNvcnQuZGlyZWN0aW9uID9cclxuICAgICAgICAgIHRoaXMudGFibGVEYXRhU291cmNlIDogdGhpcy5zb3J0RGF0YSh0aGlzLnRhYmxlRGF0YVNvdXJjZSwgdGhpcy5zb3J0LmFjdGl2ZSwgdGhpcy5zb3J0LmRpcmVjdGlvbik7XHJcblxyXG4gICAgICAgIHRoaXMuY2QuZGV0ZWN0Q2hhbmdlcygpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAvLyBNYW51YWxseSBzb3J0IGRhdGEgZm9yIHRoaXMubWF0U2VsZWN0Lm9wdGlvbnMgKFF1ZXJ5TGlzdDxNYXRPcHRpb24+KSBhbmQgbm90aWZ5IG1hdFNlbGVjdC5vcHRpb25zIG9mIGNoYW5nZXNcclxuICAgIC8vIEl0J3MgaW1wb3J0YW50IHRvIGtlZXAgdGhpcy5tYXRTZWxlY3Qub3B0aW9ucyBvcmRlciBzeW5jaHJvbml6ZWQgd2l0aCBkYXRhIGluIHRoZSB0YWJsZVxyXG4gICAgLy8gICAgIGJlY2F1c2UgdGhpcy5tYXRTZWxlY3Qub3B0aW9ucyAoUXVlcnlMaXN0PE1hdE9wdGlvbj4pIGRvZXNuJ3QgdXBkYXRlIGl0J3Mgc3RhdGUgYWZ0ZXIgdGFibGUgZGF0YSBpcyBjaGFuZ2VkXHJcbiAgICB0aGlzLm1hdE9wdGlvbnMuY2hhbmdlcy5zdWJzY3JpYmUoKCkgPT4ge1xyXG4gICAgICBjb25zdCBvcHRpb25zOiB7IFtrZXk6IHN0cmluZ106IE1hdE9wdGlvbiB9ID0ge307XHJcbiAgICAgIHRoaXMubWF0T3B0aW9ucy50b0FycmF5KClcclxuICAgICAgICAuZmlsdGVyKG9wdGlvbiA9PiAhaXNOdWxsT3JVbmRlZmluZWQob3B0aW9uKSlcclxuICAgICAgICAuZm9yRWFjaChvcHRpb24gPT4gb3B0aW9uc1tgJHtvcHRpb24udmFsdWV9YF0gPSBvcHRpb24pO1xyXG4gICAgICB0aGlzLm1hdFNlbGVjdC5vcHRpb25zLnJlc2V0KHRoaXMudGFibGVEYXRhU291cmNlXHJcbiAgICAgICAgLmZpbHRlcihyb3cgPT4gIWlzTnVsbE9yVW5kZWZpbmVkKG9wdGlvbnNbYCR7cm93LmlkfWBdKSlcclxuICAgICAgICAubWFwKHJvdyA9PiBvcHRpb25zW2Ake3Jvdy5pZH1gXSkpO1xyXG4gICAgICB0aGlzLm1hdFNlbGVjdC5vcHRpb25zLm5vdGlmeU9uQ2hhbmdlcygpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKCFpc051bGxPclVuZGVmaW5lZCh0aGlzLm1hdFNlbGVjdC5fa2V5TWFuYWdlcikpIHtcclxuICAgICAgLy8gU3Vic2NyaWJlIG9uIEtleU1hbmFnZXIgY2hhbmdlcyB0byBoaWdobGlnaHQgdGhlIHRhYmxlIHJvd3MgYWNjb3JkaW5nbHlcclxuICAgICAgdGhpcy5tYXRTZWxlY3QuX2tleU1hbmFnZXIuY2hhbmdlXHJcbiAgICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX29uRGVzdHJveSkpXHJcbiAgICAgICAgLnN1YnNjcmliZShhY3RpdmVSb3cgPT4gdGhpcy50YWJsZUFjdGl2ZVJvdyA9IGFjdGl2ZVJvdyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcclxuICAgIHRoaXMuX29uRGVzdHJveS5uZXh0KCk7XHJcbiAgICB0aGlzLl9vbkRlc3Ryb3kuY29tcGxldGUoKTtcclxuICB9XHJcblxyXG4gIHJlZ2lzdGVyT25DaGFuZ2UoZm46ICh2YWx1ZTogYW55KSA9PiB2b2lkKTogdm9pZCB7XHJcbiAgICBjb25zdCBwcm94eUZuOiAodmFsdWU6IGFueSkgPT4gdm9pZCA9ICh2YWx1ZTogYW55KSA9PiB7XHJcbiAgICAgIC8vIFRvRG86IHJlZmFjdG9yIC0gY29tcGFyaXNvbiBtZWNoYW5pc20gaXNuJ3Qgb3B0aW1pemVkLiBmaWx0ZXJlZE91dFJvd3MgaXMgYSBtYXAgYnV0IGNvbXBsZXRlVmFsdWVMaXN0IGlzIGFuIGFycmF5XHJcbiAgICAgIGlmICh0aGlzLm11bHRpcGxlID09PSB0cnVlKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IHRoaXMuY29tcGxldGVWYWx1ZUxpc3QubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgIGlmICh0aGlzLmZpbHRlcmVkT3V0Um93c1tgJHt0aGlzLmNvbXBsZXRlVmFsdWVMaXN0W2ldfWBdID09PSB1bmRlZmluZWQgJiYgdmFsdWUuaW5kZXhPZih0aGlzLmNvbXBsZXRlVmFsdWVMaXN0W2ldKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgdGhpcy5jb21wbGV0ZVZhbHVlTGlzdC5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhbHVlXHJcbiAgICAgICAgICAuZmlsdGVyKGNob2ljZSA9PiB0aGlzLmNvbXBsZXRlVmFsdWVMaXN0LmluZGV4T2YoY2hvaWNlKSA9PT0gLTEpXHJcbiAgICAgICAgICAuZm9yRWFjaChjaG9pY2UgPT4gdGhpcy5jb21wbGV0ZVZhbHVlTGlzdC5wdXNoKGNob2ljZSkpO1xyXG4gICAgICAgIHRoaXMubWF0U2VsZWN0LnZhbHVlID0gdGhpcy5jb21wbGV0ZVZhbHVlTGlzdDtcclxuICAgICAgICBmbih0aGlzLmNvbXBsZXRlVmFsdWVMaXN0KTtcclxuICAgICAgICB0aGlzLmNvbXBsZXRlUm93TGlzdC5zcGxpY2UoMCk7XHJcbiAgICAgICAgdGhpcy5kYXRhU291cmNlLmRhdGFcclxuICAgICAgICAgIC5maWx0ZXIocm93ID0+IHRoaXMuY29tcGxldGVWYWx1ZUxpc3QuaW5kZXhPZihyb3cuaWQpICE9PSAtMSlcclxuICAgICAgICAgIC5mb3JFYWNoKHJvdyA9PiB0aGlzLmNvbXBsZXRlUm93TGlzdC5wdXNoKHJvdykpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGZuKHZhbHVlKTtcclxuICAgICAgICB0aGlzLmNvbXBsZXRlUm93TGlzdC5zcGxpY2UoMCk7XHJcbiAgICAgICAgdGhpcy5kYXRhU291cmNlLmRhdGFcclxuICAgICAgICAgIC5maWx0ZXIocm93ID0+IHJvdy5pZCA9PT0gdmFsdWUpXHJcbiAgICAgICAgICAuZm9yRWFjaChyb3cgPT4gdGhpcy5jb21wbGV0ZVJvd0xpc3QucHVzaChyb3cpKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIHRoaXMubWF0U2VsZWN0LnJlZ2lzdGVyT25DaGFuZ2UocHJveHlGbik7XHJcbiAgfVxyXG5cclxuICByZWdpc3Rlck9uVG91Y2hlZChmbjogKCkgPT4ge30pOiB2b2lkIHtcclxuICAgIHRoaXMubWF0U2VsZWN0LnJlZ2lzdGVyT25Ub3VjaGVkKGZuKTtcclxuICB9XHJcblxyXG4gIHNldERpc2FibGVkU3RhdGUoaXNEaXNhYmxlZDogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgdGhpcy5tYXRTZWxlY3Quc2V0RGlzYWJsZWRTdGF0ZShpc0Rpc2FibGVkKTtcclxuICB9XHJcblxyXG4gIHdyaXRlVmFsdWUodmFsdWU6IGFueSk6IHZvaWQge1xyXG4gICAgdGhpcy51cGRhdGVDb21wbGV0ZVJvd0xpc3QodmFsdWUpO1xyXG4gICAgdGhpcy5tYXRTZWxlY3Qud3JpdGVWYWx1ZSh2YWx1ZSk7XHJcbiAgICBpZiAodGhpcy5tYXRTZWxlY3QudmFsdWUgIT09IHZhbHVlKSB7XHJcbiAgICAgIHRoaXMubWF0U2VsZWN0LnZhbHVlID0gdmFsdWU7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKTogdm9pZCB7XHJcblxyXG4gICAgaWYgKCFpc051bGxPclVuZGVmaW5lZChjaGFuZ2VzLnJlc2V0RmlsdGVyc09uT3BlbikgJiYgY2hhbmdlcy5yZXNldEZpbHRlcnNPbk9wZW4uY3VycmVudFZhbHVlICE9PSBmYWxzZSkge1xyXG4gICAgICB0aGlzLnJlc2V0RmlsdGVycygpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghaXNOdWxsT3JVbmRlZmluZWQoY2hhbmdlcy5kYXRhU291cmNlKSkge1xyXG4gICAgICB0aGlzLnVwZGF0ZUNvbXBsZXRlUm93TGlzdCh0aGlzLmNvbXBsZXRlUm93TGlzdC5tYXAocm93ID0+IHJvdy5pZCkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFByb3h5IEBJbnB1dCBiaW5kaW5ncyB0byBNYXRTZWxlY3RcclxuICAgIGlmICghaXNOdWxsT3JVbmRlZmluZWQoY2hhbmdlcy5tYXRTZWxlY3RDb25maWd1cmF0b3IpKSB7XHJcbiAgICAgIGNvbnN0IGNvbmZpZ3VyYXRpb24gPSBjaGFuZ2VzLm1hdFNlbGVjdENvbmZpZ3VyYXRvci5jdXJyZW50VmFsdWU7XHJcbiAgICAgIE9iamVjdC5rZXlzKGNvbmZpZ3VyYXRpb24pXHJcbiAgICAgICAgLmZpbHRlcihrZXkgPT4gIVsnbXVsdGlwbGUnLCAncGFuZWxDbGFzcyddLmluY2x1ZGVzKGtleSkgJiYgIXRoaXMuY29udHJvbFZhbHVlQWNjZXNzb3JLZXlzLmluY2x1ZGVzKGtleSkpXHJcbiAgICAgICAgLmZvckVhY2goa2V5ID0+IHRoaXMubWF0U2VsZWN0W2tleV0gPSBjb25maWd1cmF0aW9uW2tleV0pO1xyXG4gICAgICBjb25zdCBwYW5lbENsYXNzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICBwYW5lbENsYXNzLnB1c2goJ21hdC1zZWxlY3Qtc2VhcmNoLXRhYmxlLXBhbmVsJyk7XHJcbiAgICAgIGlmICghaXNOdWxsT3JVbmRlZmluZWQoY29uZmlndXJhdGlvbi5wYW5lbENsYXNzKSkge1xyXG4gICAgICAgIHBhbmVsQ2xhc3MucHVzaChjb25maWd1cmF0aW9uLnBhbmVsQ2xhc3MpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh0aGlzLm92ZXJhbGxTZWFyY2hFbmFibGVkKSB7XHJcbiAgICAgICAgcGFuZWxDbGFzcy5wdXNoKCdtYXQtc2VsZWN0LXNlYXJjaC1wYW5lbCcpO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMubWF0U2VsZWN0LnBhbmVsQ2xhc3MgPSBwYW5lbENsYXNzO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghaXNOdWxsT3JVbmRlZmluZWQoY2hhbmdlcy5tYXRTZWxlY3RTZWFyY2hDb25maWd1cmF0b3IpKSB7XHJcbiAgICAgIHRoaXMucHJveHlNYXRTZWxlY3RTZWFyY2hDb25maWd1cmF0aW9uKGNoYW5nZXMubWF0U2VsZWN0U2VhcmNoQ29uZmlndXJhdG9yLmN1cnJlbnRWYWx1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFpc051bGxPclVuZGVmaW5lZChjaGFuZ2VzLmRhdGFTb3VyY2UpXHJcbiAgICAgICYmICFpc051bGxPclVuZGVmaW5lZChjaGFuZ2VzLmRhdGFTb3VyY2UuY3VycmVudFZhbHVlKVxyXG4gICAgICAmJiBpc0FycmF5KGNoYW5nZXMuZGF0YVNvdXJjZS5jdXJyZW50VmFsdWUuZGF0YSkpIHtcclxuICAgICAgdGhpcy50YWJsZURhdGFTb3VyY2UgPSBbLi4uY2hhbmdlcy5kYXRhU291cmNlLmN1cnJlbnRWYWx1ZS5kYXRhXTtcclxuICAgICAgdGhpcy50YWJsZUNvbHVtbnMgPSBbJ19zZWxlY3Rpb24nLCAuLi5jaGFuZ2VzLmRhdGFTb3VyY2UuY3VycmVudFZhbHVlLmNvbHVtbnMubWFwKGNvbHVtbiA9PiBjb2x1bW4ua2V5KV07XHJcbiAgICAgIHRoaXMudGFibGVDb2x1bW5zTWFwLmNsZWFyKCk7XHJcbiAgICAgIGNoYW5nZXMuZGF0YVNvdXJjZS5jdXJyZW50VmFsdWUuY29sdW1ucy5mb3JFYWNoKGNvbHVtbiA9PiB0aGlzLnRhYmxlQ29sdW1uc01hcC5zZXQoY29sdW1uLmtleSwgY29sdW1uKSk7XHJcbiAgICAgIHRoaXMuYXBwbHlQcm94eVRvQXJyYXkoY2hhbmdlcy5kYXRhU291cmNlLmN1cnJlbnRWYWx1ZS5kYXRhLCAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5fb25PcHRpb25zQ2hhbmdlLm5leHQoKTtcclxuICAgICAgfSk7XHJcbiAgICAgIHRoaXMuX29uT3B0aW9uc0NoYW5nZS5uZXh0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBlbXVsYXRlTWF0T3B0aW9uQ2xpY2soZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkIHtcclxuICAgIGlmIChldmVudC5jb21wb3NlZFBhdGgoKVxyXG4gICAgICAuZmlsdGVyKGV0ID0+IGV0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpXHJcbiAgICAgIC5zb21lKChldDogSFRNTEVsZW1lbnQpID0+IGV0LnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ21hdC1vcHRpb24nKSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBpZiAoIShldmVudC50YXJnZXQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgbGV0IHJvd0VsZW1lbnQgPSBldmVudC50YXJnZXQ7XHJcbiAgICB3aGlsZSAocm93RWxlbWVudCAhPSBudWxsICYmIHJvd0VsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCAmJiByb3dFbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKSAhPT0gJ3RyJykge1xyXG4gICAgICByb3dFbGVtZW50ID0gcm93RWxlbWVudC5wYXJlbnRFbGVtZW50O1xyXG4gICAgfVxyXG4gICAgaWYgKHJvd0VsZW1lbnQgPT09IG51bGwpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgY29uc3QgY2hpbGRPcHRpb246IEhUTUxFbGVtZW50ID0gcm93RWxlbWVudC5xdWVyeVNlbGVjdG9yKCdtYXQtb3B0aW9uJyk7XHJcbiAgICBpZiAoIWNoaWxkT3B0aW9uKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGNoaWxkT3B0aW9uLmNsaWNrKCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgZmlsdGVyRm9ybUNvbnRyb2woa2V5OiBzdHJpbmcpOiBGb3JtQ29udHJvbCB7XHJcbiAgICBpZiAoIXRoaXMuZmlsdGVyQ29udHJvbHMuY29udGFpbnMoa2V5KSkge1xyXG4gICAgICB0aGlzLmZpbHRlckNvbnRyb2xzLnJlZ2lzdGVyQ29udHJvbChrZXksIG5ldyBGb3JtQ29udHJvbCgnJykpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIDxGb3JtQ29udHJvbD50aGlzLmZpbHRlckNvbnRyb2xzLmdldChrZXkpO1xyXG4gIH1cclxuXHJcbiAgc2ltcGxlVHJpZ2dlckxhYmVsRm4odmFsdWU6IE1hdFNlbGVjdFRhYmxlUm93W10pOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIHZhbHVlLm1hcChyb3cgPT4ge1xyXG4gICAgICBpZiAoaXNOdWxsT3JVbmRlZmluZWQocm93KSkge1xyXG4gICAgICAgIHJldHVybiAnJztcclxuICAgICAgfVxyXG4gICAgICBpZiAoaXNOdWxsT3JVbmRlZmluZWQodGhpcy5jdXN0b21UcmlnZ2VyTGFiZWxUZW1wbGF0ZSlcclxuICAgICAgICB8fCB0eXBlb2YgdGhpcy5jdXN0b21UcmlnZ2VyTGFiZWxUZW1wbGF0ZSAhPT0gJ3N0cmluZydcclxuICAgICAgICB8fCB0aGlzLmN1c3RvbVRyaWdnZXJMYWJlbFRlbXBsYXRlLnRyaW0oKS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICByZXR1cm4gYCR7cm93LmlkfWA7XHJcbiAgICAgIH1cclxuICAgICAgbGV0IGF0TGVhc3RQYXJ0aWFsU3Vic3RpdHV0aW9uID0gZmFsc2U7XHJcbiAgICAgIGNvbnN0IHN1YnN0aXR1dGlvbjogc3RyaW5nID0gdGhpcy5jdXN0b21UcmlnZ2VyTGFiZWxUZW1wbGF0ZS5yZXBsYWNlKC9bJF17MX1be117MX0oW159XSspW31dezF9Py9nLCAoXywga2V5KSA9PlxyXG4gICAgICAgICFpc051bGxPclVuZGVmaW5lZChyb3dba2V5XSkgJiYgKGF0TGVhc3RQYXJ0aWFsU3Vic3RpdHV0aW9uID0gdHJ1ZSkgPyByb3dba2V5XSA6ICcnKTtcclxuICAgICAgaWYgKGF0TGVhc3RQYXJ0aWFsU3Vic3RpdHV0aW9uID09PSBmYWxzZSkge1xyXG4gICAgICAgIHJldHVybiBgJHtyb3cuaWR9YDtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gc3Vic3RpdHV0aW9uLnRyaW0oKTtcclxuICAgIH0pLmpvaW4oJywgJyk7XHJcbiAgfVxyXG5cclxuICB0b2dnbGVPdmVyYWxsU2VhcmNoKCk6IHZvaWQge1xyXG4gICAgdGhpcy5vdmVyYWxsU2VhcmNoVmlzaWJsZVN0YXRlID0gIXRoaXMub3ZlcmFsbFNlYXJjaFZpc2libGVTdGF0ZTtcclxuICAgIHRoaXMucmVzZXRGaWx0ZXJzKCk7XHJcbiAgICBpZiAodGhpcy5vdmVyYWxsU2VhcmNoVmlzaWJsZVN0YXRlKSB7XHJcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5tYXRTZWxlY3RTZWFyY2guX2ZvY3VzKCkpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB1cGRhdGVDb21wbGV0ZVJvd0xpc3QodmFsdWU6IGFueVtdKTogdm9pZCB7XHJcbiAgICB0aGlzLmNvbXBsZXRlUm93TGlzdC5zcGxpY2UoMCk7XHJcbiAgICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKHZhbHVlKSkge1xyXG4gICAgICBjb25zdCB2YWx1ZUFycmF5OiBhbnlbXSA9ICFpc0FycmF5KHZhbHVlKSA/IFt2YWx1ZV0gOiB2YWx1ZTtcclxuICAgICAgdmFsdWVBcnJheS5mb3JFYWNoKGl0ZW0gPT4ge1xyXG4gICAgICAgIGNvbnN0IHJvd0ZvdW5kID0gdGhpcy5kYXRhU291cmNlLmRhdGEuZmluZChyb3cgPT4gcm93LmlkID09PSBpdGVtKTtcclxuICAgICAgICBpZiAocm93Rm91bmQgPT09IG51bGwpIHtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jb21wbGV0ZVJvd0xpc3QucHVzaChyb3dGb3VuZCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBwcm94eU1hdFNlbGVjdFNlYXJjaENvbmZpZ3VyYXRpb24oY29uZmlndXJhdGlvbjogeyBba2V5OiBzdHJpbmddOiBhbnkgfSk6IHZvaWQge1xyXG4gICAgaWYgKGlzTnVsbE9yVW5kZWZpbmVkKHRoaXMubWF0U2VsZWN0U2VhcmNoKSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUHJveHkgQElucHV0IGJpbmRpbmdzIHRvIE5neE1hdFNlbGVjdFNlYXJjaFxyXG4gICAgT2JqZWN0LmtleXMoY29uZmlndXJhdGlvbilcclxuICAgICAgLmZpbHRlcihrZXkgPT4gIVsnY2xlYXJTZWFyY2hJbnB1dCddLmluY2x1ZGVzKGtleSkgJiYgIXRoaXMuY29udHJvbFZhbHVlQWNjZXNzb3JLZXlzLmluY2x1ZGVzKGtleSkpXHJcbiAgICAgIC5mb3JFYWNoKGtleSA9PiB0aGlzLm1hdFNlbGVjdFNlYXJjaFtrZXldID0gY29uZmlndXJhdGlvbltrZXldKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYXBwbHlDb2x1bW5MZXZlbEZpbHRlcnMoZGF0YTogTWF0U2VsZWN0VGFibGVSb3dbXSk6IHZvaWQge1xyXG4gICAgdGhpcy5maWx0ZXJlZE91dFJvd3MgPSB7fTtcclxuICAgIGNvbnN0IGZpbHRlcnM6IHsgW2tleTogc3RyaW5nXTogeyBmaWx0ZXI6IE1hdFNlbGVjdFRhYmxlRmlsdGVyLCB2YWx1ZTogYW55IH0gfSA9IHt9O1xyXG4gICAgT2JqZWN0LmtleXModGhpcy5maWx0ZXJDb250cm9scy5jb250cm9scylcclxuICAgICAgLmZpbHRlcihrZXkgPT4gdGhpcy50YWJsZUNvbHVtbnNNYXAuaGFzKGtleSlcclxuICAgICAgICAmJiAhaXNOdWxsT3JVbmRlZmluZWQodGhpcy50YWJsZUNvbHVtbnNNYXAuZ2V0KGtleSkuZmlsdGVyKVxyXG4gICAgICAgIC8vIElmIGZpbHRlciBpcyBlbmFibGVkXHJcbiAgICAgICAgJiYgdGhpcy50YWJsZUNvbHVtbnNNYXAuZ2V0KGtleSkuZmlsdGVyLmVuYWJsZWQgIT09IGZhbHNlKVxyXG4gICAgICAuZmlsdGVyKGtleSA9PiB7XHJcbiAgICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLmZpbHRlckNvbnRyb2xzLmdldChrZXkpLnZhbHVlO1xyXG4gICAgICAgIHJldHVybiAhaXNOdWxsT3JVbmRlZmluZWQodmFsdWUpXHJcbiAgICAgICAgICAvLyBJZiBhbiBhcnJheSAtIGNoZWNrIGl0J3Mgbm90IGVtcHR5XHJcbiAgICAgICAgICAmJiAoKGlzQXJyYXkodmFsdWUpICYmIHZhbHVlLmxlbmd0aCA+IDApXHJcbiAgICAgICAgICAgIC8vIElmIHN0cmluZyAtIGNoZWNrIHRoYXQgbm90IGJsYW5rXHJcbiAgICAgICAgICAgIHx8ICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHZhbHVlLnRyaW0oKS5sZW5ndGggPiAwKVxyXG4gICAgICAgICAgICAvLyBJZiBudW1iZXIgLSBjaGVjayB0aGF0IHRvU3RyaW5nKCkgaXMgbm90IGJsYW5rXHJcbiAgICAgICAgICAgIHx8ICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmIGAke3ZhbHVlfWAudHJpbSgpLmxlbmd0aCA+IDApKTtcclxuICAgICAgfSlcclxuICAgICAgLmZvckVhY2goa2V5ID0+IGZpbHRlcnNba2V5XSA9IHtcclxuICAgICAgICBmaWx0ZXI6IHRoaXMudGFibGVDb2x1bW5zTWFwLmdldChrZXkpLmZpbHRlcixcclxuICAgICAgICB2YWx1ZTogdGhpcy5maWx0ZXJDb250cm9scy5nZXQoa2V5KS52YWx1ZVxyXG4gICAgICB9KTtcclxuICAgIGNvbnN0IGZpbHRlcktleXM6IHN0cmluZ1tdID0gT2JqZWN0LmtleXMoZmlsdGVycyk7XHJcbiAgICBmb3IgKGxldCBpID0gZGF0YS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICBmb3IgKGxldCBrID0gMDsgayA8IGZpbHRlcktleXMubGVuZ3RoOyBrKyspIHtcclxuICAgICAgICBjb25zdCBmaWx0ZXJLZXk6IHN0cmluZyA9IGZpbHRlcktleXNba107XHJcbiAgICAgICAgY29uc3Qgcm93OiBNYXRTZWxlY3RUYWJsZVJvdyA9IGRhdGFbaV07XHJcbiAgICAgICAgY29uc3QgY2VsbFZhbHVlOiBhbnkgPSByb3dbZmlsdGVyS2V5XTtcclxuICAgICAgICBpZiAoaXNOdWxsT3JVbmRlZmluZWQoY2VsbFZhbHVlKSkge1xyXG4gICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGZpbHRlciA9IGZpbHRlcnNbZmlsdGVyS2V5XTtcclxuICAgICAgICBjb25zdCBjb21wYXJhdG9yID0gZmlsdGVyLmZpbHRlci5jb21wYXJhdG9yO1xyXG4gICAgICAgIGlmICh0eXBlb2YgZmlsdGVyLmZpbHRlci5jb21wYXJhdG9yRm4gPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgIGlmICghZmlsdGVyLmZpbHRlci5jb21wYXJhdG9yRm4uY2FsbChudWxsLCBjZWxsVmFsdWUsIGZpbHRlci52YWx1ZSwgcm93KSkge1xyXG4gICAgICAgICAgICBkYXRhLnNwbGljZShpLCAxKS5mb3JFYWNoKGl0ZW0gPT4gdGhpcy5maWx0ZXJlZE91dFJvd3NbYCR7aXRlbS5pZH1gXSA9IGl0ZW0pO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKGlzTnVsbE9yVW5kZWZpbmVkKGNvbXBhcmF0b3IpIHx8IGNvbXBhcmF0b3IgPT09ICdlcXVhbHMnKSB7XHJcbiAgICAgICAgICBpZiAoZmlsdGVyLnZhbHVlICE9PSBjZWxsVmFsdWUpIHtcclxuICAgICAgICAgICAgZGF0YS5zcGxpY2UoaSwgMSkuZm9yRWFjaChpdGVtID0+IHRoaXMuZmlsdGVyZWRPdXRSb3dzW2Ake2l0ZW0uaWR9YF0gPSBpdGVtKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgY2VsbFZhbHVlID09PSAnc3RyaW5nJyAmJiB0eXBlb2YgZmlsdGVyLnZhbHVlID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgY29uc3QgY2VsbFZhbHVlTEM6IHN0cmluZyA9IGAke2NlbGxWYWx1ZX1gLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICBjb25zdCBmaWx0ZXJWYWx1ZUxDOiBzdHJpbmcgPSBmaWx0ZXIudmFsdWUudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgIGlmIChpc051bGxPclVuZGVmaW5lZChjb21wYXJhdG9yKSB8fCBjb21wYXJhdG9yID09PSAnZXF1YWxzSWdub3JlQ2FzZScpIHtcclxuICAgICAgICAgICAgaWYgKGZpbHRlclZhbHVlTEMgIT09IGNlbGxWYWx1ZUxDKSB7XHJcbiAgICAgICAgICAgICAgZGF0YS5zcGxpY2UoaSwgMSkuZm9yRWFjaChpdGVtID0+IHRoaXMuZmlsdGVyZWRPdXRSb3dzW2Ake2l0ZW0uaWR9YF0gPSBpdGVtKTtcclxuICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIGlmIChjb21wYXJhdG9yID09PSAnY29udGFpbnMnKSB7XHJcbiAgICAgICAgICAgIGlmIChjZWxsVmFsdWUuaW5kZXhPZihmaWx0ZXIudmFsdWUpID09PSAtMSkge1xyXG4gICAgICAgICAgICAgIGRhdGEuc3BsaWNlKGksIDEpLmZvckVhY2goaXRlbSA9PiB0aGlzLmZpbHRlcmVkT3V0Um93c1tgJHtpdGVtLmlkfWBdID0gaXRlbSk7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSBpZiAoY29tcGFyYXRvciA9PT0gJ2NvbnRhaW5zSWdub3JlQ2FzZScpIHtcclxuICAgICAgICAgICAgaWYgKGNlbGxWYWx1ZUxDLmluZGV4T2YoZmlsdGVyVmFsdWVMQykgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgZGF0YS5zcGxpY2UoaSwgMSkuZm9yRWFjaChpdGVtID0+IHRoaXMuZmlsdGVyZWRPdXRSb3dzW2Ake2l0ZW0uaWR9YF0gPSBpdGVtKTtcclxuICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIGlmIChjb21wYXJhdG9yID09PSAnc3RhcnRzV2l0aCcpIHtcclxuICAgICAgICAgICAgaWYgKCFjZWxsVmFsdWUuc3RhcnRzV2l0aChmaWx0ZXIudmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgZGF0YS5zcGxpY2UoaSwgMSkuZm9yRWFjaChpdGVtID0+IHRoaXMuZmlsdGVyZWRPdXRSb3dzW2Ake2l0ZW0uaWR9YF0gPSBpdGVtKTtcclxuICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIGlmIChjb21wYXJhdG9yID09PSAnc3RhcnRzV2l0aElnbm9yZUNhc2UnKSB7XHJcbiAgICAgICAgICAgIGlmICghY2VsbFZhbHVlTEMuc3RhcnRzV2l0aChmaWx0ZXJWYWx1ZUxDKSkge1xyXG4gICAgICAgICAgICAgIGRhdGEuc3BsaWNlKGksIDEpLmZvckVhY2goaXRlbSA9PiB0aGlzLmZpbHRlcmVkT3V0Um93c1tgJHtpdGVtLmlkfWBdID0gaXRlbSk7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgYXBwbHlPdmVyYWxsRmlsdGVyKGRhdGE6IE1hdFNlbGVjdFRhYmxlUm93W10pOiB2b2lkIHtcclxuICAgIHRoaXMuZmlsdGVyZWRPdXRSb3dzID0ge307XHJcbiAgICBpZiAoaXNOdWxsT3JVbmRlZmluZWQodGhpcy5vdmVyYWxsRmlsdGVyQ29udHJvbC52YWx1ZSkpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgY29uc3QgZmlsdGVyVmFsdWVMQzogc3RyaW5nID0gdGhpcy5vdmVyYWxsRmlsdGVyQ29udHJvbC52YWx1ZS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgaWYgKGZpbHRlclZhbHVlTEMudHJpbSgpLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBmb3IgKGxldCBpID0gZGF0YS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICBjb25zdCByb3c6IE1hdFNlbGVjdFRhYmxlUm93ID0gZGF0YVtpXTtcclxuICAgICAgbGV0IHJvd1Nob3VsZEJlRmlsdGVyZWQgPSB0cnVlO1xyXG4gICAgICBmb3IgKGxldCBqID0gdGhpcy5kYXRhU291cmNlLmNvbHVtbnMubGVuZ3RoIC0gMTsgaiA+PSAwOyBqLS0pIHtcclxuICAgICAgICBjb25zdCBrZXk6IHN0cmluZyA9IHRoaXMuZGF0YVNvdXJjZS5jb2x1bW5zW2pdLmtleTtcclxuICAgICAgICBjb25zdCBjZWxsVmFsdWU6IGFueSA9IHJvd1trZXldO1xyXG4gICAgICAgIGlmIChpc051bGxPclVuZGVmaW5lZChjZWxsVmFsdWUpKSB7XHJcbiAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgY2VsbFZhbHVlTEM6IHN0cmluZyA9IGAke2NlbGxWYWx1ZX1gLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgaWYgKGNlbGxWYWx1ZUxDLmluZGV4T2YoZmlsdGVyVmFsdWVMQykgIT09IC0xKSB7XHJcbiAgICAgICAgICByb3dTaG91bGRCZUZpbHRlcmVkID0gZmFsc2U7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHJvd1Nob3VsZEJlRmlsdGVyZWQpIHtcclxuICAgICAgICBkYXRhLnNwbGljZShpLCAxKS5mb3JFYWNoKGl0ZW0gPT4gdGhpcy5maWx0ZXJlZE91dFJvd3NbYCR7aXRlbS5pZH1gXSA9IGl0ZW0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFwcGx5UHJveHlUb0FycmF5KGFycmF5OiBhbnlbXSwgY2FsbGJhY2s6ICgpID0+IHZvaWQpOiB2b2lkIHtcclxuICAgIFsncG9wJywgJ3B1c2gnLCAncmV2ZXJzZScsICdzaGlmdCcsICd1bnNoaWZ0JywgJ3NwbGljZScsICdzb3J0J10uZm9yRWFjaCgobWV0aG9kTmFtZSkgPT4ge1xyXG4gICAgICBhcnJheVttZXRob2ROYW1lXSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBjb25zdCByZXMgPSBBcnJheS5wcm90b3R5cGVbbWV0aG9kTmFtZV0uYXBwbHkoYXJyYXksIGFyZ3VtZW50cyk7IC8vIGNhbGwgbm9ybWFsIGJlaGF2aW91clxyXG4gICAgICAgIGNhbGxiYWNrLmFwcGx5KGFycmF5LCBhcmd1bWVudHMpOyAvLyBmaW5hbGx5IGNhbGwgdGhlIGNhbGxiYWNrIHN1cHBsaWVkXHJcbiAgICAgICAgcmV0dXJuIHJlcztcclxuICAgICAgfTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSByZXNldEZpbHRlcnMoKTogdm9pZCB7XHJcbiAgICB0aGlzLm92ZXJhbGxGaWx0ZXJDb250cm9sLnNldFZhbHVlKCcnKTtcclxuICAgIE9iamVjdC5rZXlzKHRoaXMuZmlsdGVyQ29udHJvbHMuY29udHJvbHMpXHJcbiAgICAgIC5mb3JFYWNoKGtleSA9PiB0aGlzLmZpbHRlckNvbnRyb2xzLmdldChrZXkpLnNldFZhbHVlKCcnKSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUYWtlbiBmcm9tIHtAc2VlIE1hdFRhYmxlRGF0YVNvdXJjZSNzb3J0aW5nRGF0YUFjY2Vzc29yfVxyXG4gICAqXHJcbiAgICogQHBhcmFtIGRhdGFcclxuICAgKiBAcGFyYW0gc29ydEhlYWRlcklkXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzb3J0aW5nRGF0YUFjY2Vzc29yKGRhdGE6IE1hdFNlbGVjdFRhYmxlUm93LCBhY3RpdmU6IHN0cmluZyk6IHN0cmluZyB8IG51bWJlciB7XHJcblxyXG4gICAgY29uc3QgdmFsdWUgPSAoZGF0YSBhcyB7IFtrZXk6IHN0cmluZ106IGFueSB9KVthY3RpdmVdO1xyXG5cclxuICAgIGlmIChfaXNOdW1iZXJWYWx1ZSh2YWx1ZSkpIHtcclxuICAgICAgY29uc3QgbnVtYmVyVmFsdWUgPSBOdW1iZXIodmFsdWUpO1xyXG5cclxuICAgICAgLy8gTnVtYmVycyBiZXlvbmQgYE1BWF9TQUZFX0lOVEVHRVJgIGNhbid0IGJlIGNvbXBhcmVkIHJlbGlhYmx5IHNvIHdlXHJcbiAgICAgIC8vIGxlYXZlIHRoZW0gYXMgc3RyaW5ncy4gRm9yIG1vcmUgaW5mbzogaHR0cHM6Ly9nb28uZ2wveTV2YlNnXHJcbiAgICAgIHJldHVybiBudW1iZXJWYWx1ZSA8IE1BWF9TQUZFX0lOVEVHRVIgPyBudW1iZXJWYWx1ZSA6IHZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB2YWx1ZTtcclxuICB9XHJcblxyXG5cclxuICBwcml2YXRlIHNvcnREYXRhKGRhdGE6IE1hdFNlbGVjdFRhYmxlUm93W10sIGFjdGl2ZTogc3RyaW5nLCBkaXJlY3Rpb246IFNvcnREaXJlY3Rpb24pOiBNYXRTZWxlY3RUYWJsZVJvd1tdIHtcclxuICAgIGlmICghYWN0aXZlIHx8IGRpcmVjdGlvbiA9PT0gJycpIHtcclxuICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGRhdGEuc29ydCgoYSwgYikgPT4ge1xyXG4gICAgICBjb25zdCB2YWx1ZUEgPSB0aGlzLnNvcnRpbmdEYXRhQWNjZXNzb3IoYSwgYWN0aXZlKTtcclxuICAgICAgY29uc3QgdmFsdWVCID0gdGhpcy5zb3J0aW5nRGF0YUFjY2Vzc29yKGIsIGFjdGl2ZSk7XHJcblxyXG5cclxuICAgICAgLy8gSWYgYm90aCB2YWx1ZUEgYW5kIHZhbHVlQiBleGlzdCAodHJ1dGh5KSwgdGhlbiBjb21wYXJlIHRoZSB0d28uIE90aGVyd2lzZSwgY2hlY2sgaWZcclxuICAgICAgLy8gb25lIHZhbHVlIGV4aXN0cyB3aGlsZSB0aGUgb3RoZXIgZG9lc24ndC4gSW4gdGhpcyBjYXNlLCBleGlzdGluZyB2YWx1ZSBzaG91bGQgY29tZSBmaXJzdC5cclxuICAgICAgLy8gVGhpcyBhdm9pZHMgaW5jb25zaXN0ZW50IHJlc3VsdHMgd2hlbiBjb21wYXJpbmcgdmFsdWVzIHRvIHVuZGVmaW5lZC9udWxsLlxyXG4gICAgICAvLyBJZiBuZWl0aGVyIHZhbHVlIGV4aXN0cywgcmV0dXJuIDAgKGVxdWFsKS5cclxuICAgICAgbGV0IGNvbXBhcmF0b3JSZXN1bHQgPSAwO1xyXG4gICAgICBpZiAodmFsdWVBICE9IG51bGwgJiYgdmFsdWVCICE9IG51bGwpIHtcclxuICAgICAgICAvLyBDaGVjayBpZiBvbmUgdmFsdWUgaXMgZ3JlYXRlciB0aGFuIHRoZSBvdGhlcjsgaWYgZXF1YWwsIGNvbXBhcmF0b3JSZXN1bHQgc2hvdWxkIHJlbWFpbiAwLlxyXG4gICAgICAgIGlmICh2YWx1ZUEgPiB2YWx1ZUIpIHtcclxuICAgICAgICAgIGNvbXBhcmF0b3JSZXN1bHQgPSAxO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodmFsdWVBIDwgdmFsdWVCKSB7XHJcbiAgICAgICAgICBjb21wYXJhdG9yUmVzdWx0ID0gLTE7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2UgaWYgKHZhbHVlQSAhPSBudWxsKSB7XHJcbiAgICAgICAgY29tcGFyYXRvclJlc3VsdCA9IDE7XHJcbiAgICAgIH0gZWxzZSBpZiAodmFsdWVCICE9IG51bGwpIHtcclxuICAgICAgICBjb21wYXJhdG9yUmVzdWx0ID0gLTE7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBjb21wYXJhdG9yUmVzdWx0ICogKGRpcmVjdGlvbiA9PT0gJ2FzYycgPyAxIDogLTEpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxufVxyXG4iXX0=