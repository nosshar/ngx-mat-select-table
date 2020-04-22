(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('rxjs'), require('util'), require('@angular/cdk/coercion'), require('rxjs/operators'), require('@angular/core'), require('@angular/common'), require('ngx-mat-select-search'), require('@angular/material'), require('@angular/forms')) :
    typeof define === 'function' && define.amd ? define('ngx-mat-select-table', ['exports', 'rxjs', 'util', '@angular/cdk/coercion', 'rxjs/operators', '@angular/core', '@angular/common', 'ngx-mat-select-search', '@angular/material', '@angular/forms'], factory) :
    (factory((global['ngx-mat-select-table'] = {}),global.rxjs,global.util,global.ng.cdk.coercion,global.rxjs.operators,global.ng.core,global.ng.common,global.ngxMatSelectSearch,global.ng.material,global.ng.forms));
}(this, (function (exports,rxjs,util,coercion,operators,core,common,ngxMatSelectSearch,material,forms) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m)
            return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
                ar.push(r.value);
        }
        catch (error) {
            e = { error: error };
        }
        finally {
            try {
                if (r && !r.done && (m = i["return"]))
                    m.call(i);
            }
            finally {
                if (e)
                    throw e.error;
            }
        }
        return ar;
    }
    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */
    /** @type {?} */
    var MAX_SAFE_INTEGER = 9007199254740991;
    var MatSelectTableComponent = /** @class */ (function () {
        function MatSelectTableComponent(cd) {
            this.cd = cd;
            this.nullRow = { id: null };
            this.close = new core.EventEmitter();
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
            this._onDestroy = new rxjs.Subject();
            this._onSelectOpen = new rxjs.Subject();
            this._onOptionsChange = new rxjs.Subject();
            this.tableColumnsMap = new Map();
            this.filterControls = new forms.FormGroup({});
            this.overallFilterControl = new forms.FormControl('');
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
                    .pipe(operators.takeUntil(this._onDestroy))
                    .subscribe(( /**
             * @param {?} opened
             * @return {?}
             */function (opened) {
                    if (_this.resetFiltersOnOpen !== false || !_this.matOptions.length) {
                        _this.resetFilters();
                    }
                    _this.overallSearchVisibleState = _this.overallSearchVisible;
                    if (_this.resetSortOnOpen !== false) {
                        _this.sort.sort({ id: '', start: 'asc', disableClear: false });
                    }
                    if (!opened) {
                        _this.close.emit(!opened);
                        return;
                    }
                    if (_this.overallSearchEnabled) {
                        _this.proxyMatSelectSearchConfiguration(_this.matSelectSearchConfigurator);
                    }
                    // ToDo: get rid of this workaround (updates header row [otherwise sort mechanism produces glitches])
                    (( /** @type {?} */(_this.table)))._headerRowDefChanged = true;
                    // Disable sort buttons to prevent sorting change on SPACE key pressed in filter field
                    setTimeout(( /**
                     * @return {?}
                     */function () {
                        return [].forEach.call(_this.tableRef.nativeElement.querySelectorAll('button.mat-sort-header-button'), ( /**
                         * @param {?} e
                         * @return {?}
                         */function (e) { return e.disabled = true; }));
                    }));
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
                        .forEach(( /**
                 * @param {?} row
                 * @return {?}
                 */function (row) { return tableAdditionalHeight += row.getBoundingClientRect().height; }));
                    if (!isNaN(panelHeight)) {
                        panelElement.style.maxHeight = panelHeight + tableAdditionalHeight + "px";
                    }
                    if (!_this.matSelectSearchConfigurator.disableScrollToActiveOnOptionsChanged
                        && !util.isNullOrUndefined(_this.matSelect._keyManager) && _this.completeRowList.length > 0) {
                        _this._onSelectOpen.pipe(operators.takeUntil(_this._onDestroy), operators.debounceTime(1), operators.take(1)).subscribe(( /**
                         * @return {?}
                         */function () {
                            /** @type {?} */
                            var firstValue = "" + _this.completeRowList[0].id;
                            for (var i = 0; i < _this.tableDataSource.length; i++) {
                                if ("" + _this.tableDataSource[i].id === firstValue) {
                                    _this.matSelect._keyManager.setActiveItem(i);
                                    try {
                                        _this.cd.detectChanges();
                                    }
                                    catch (ignored) {
                                    }
                                    break;
                                }
                            }
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
                rxjs.merge.apply(void 0, __spread([
                    this._onOptionsChange,
                    this.sort.sortChange,
                    this.filterControls.valueChanges,
                    this.overallFilterControl.valueChanges
                ])).pipe(operators.takeUntil(this._onDestroy), operators.debounceTime(100))
                    .subscribe(( /**
             * @return {?}
             */function () {
                    /** @type {?} */
                    var dataClone = __spread(((_this.dataSource || { data: [] }).data || []));
                    if (_this.addNullRow()) {
                        dataClone.unshift(_this.nullRow);
                    }
                    // Apply filtering
                    if (_this.overallSearchEnabled && _this.overallSearchVisibleState) {
                        _this.applyOverallFilter(dataClone);
                    }
                    else {
                        _this.applyColumnLevelFilters(dataClone);
                    }
                    // Inherit default sorting options if sort not specified
                    if (!_this.sort.active && !util.isNullOrUndefined(_this.defaultSort) && _this.defaultSort.active) {
                        _this.sort.active = _this.defaultSort.active;
                        _this.sort.direction = _this.defaultSort.direction;
                    }
                    // Apply default or manual sorting
                    _this.tableDataSource = !_this.sort.active ?
                        dataClone : _this.sortData(dataClone, _this.sort.active, _this.sort.direction);
                    try {
                        _this.cd.detectChanges();
                    }
                    catch (ignored) {
                    }
                    _this._onSelectOpen.next();
                }));
                // Manually sort data for this.matSelect.options (QueryList<MatOption>) and notify matSelect.options of changes
                // It's important to keep this.matSelect.options order synchronized with data in the table
                //     because this.matSelect.options (QueryList<MatOption>) doesn't update it's state after table data is changed
                this.matOptions.changes.subscribe(( /**
                 * @return {?}
                 */function () {
                    /** @type {?} */
                    var options = {};
                    _this.matOptions.toArray()
                        .filter(( /**
                 * @param {?} option
                 * @return {?}
                 */function (option) { return !util.isNullOrUndefined(option); }))
                        .forEach(( /**
                 * @param {?} option
                 * @return {?}
                 */function (option) { return options["" + option.value] = option; }));
                    _this.matSelect.options.reset(_this.tableDataSource
                        .filter(( /**
                 * @param {?} row
                 * @return {?}
                 */function (row) { return !util.isNullOrUndefined(options["" + row.id]); }))
                        .map(( /**
                 * @param {?} row
                 * @return {?}
                 */function (row) { return options["" + row.id]; })));
                    _this.matSelect.options.notifyOnChanges();
                }));
                if (!util.isNullOrUndefined(this.matSelect._keyManager)) {
                    // Subscribe on KeyManager changes to highlight the table rows accordingly
                    this.matSelect._keyManager.change
                        .pipe(operators.takeUntil(this._onDestroy))
                        .subscribe(( /**
                 * @param {?} activeRow
                 * @return {?}
                 */function (activeRow) { return _this.tableActiveRow = activeRow; }));
                }
            };
        /**
         * @return {?}
         */
        MatSelectTableComponent.prototype.ngOnDestroy = /**
         * @return {?}
         */
            function () {
                this._onSelectOpen.complete();
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
                var proxyFn = ( /**
                 * @param {?} value
                 * @return {?}
                 */function (value) {
                    // ToDo: refactor - comparison mechanism isn't optimized. filteredOutRows is a map but completeValueList is an array
                    if (_this.multiple === true) {
                        for (var i = _this.completeValueList.length - 1; i >= 0; i--) {
                            if (_this.filteredOutRows["" + _this.completeValueList[i]] === undefined && value.indexOf(_this.completeValueList[i]) === -1) {
                                _this.completeValueList.splice(i, 1);
                            }
                        }
                        value
                            .filter(( /**
                     * @param {?} choice
                     * @return {?}
                     */function (choice) { return _this.completeValueList.indexOf(choice) === -1; }))
                            .forEach(( /**
                     * @param {?} choice
                     * @return {?}
                     */function (choice) { return _this.completeValueList.push(choice); }));
                        _this.matSelect.value = _this.completeValueList;
                        fn(_this.completeValueList);
                        _this.completeRowList.splice(0);
                        ((_this.dataSource || { data: [] }).data || [])
                            .filter(( /**
                     * @param {?} row
                     * @return {?}
                     */function (row) { return _this.completeValueList.indexOf(row.id) !== -1; }))
                            .forEach(( /**
                     * @param {?} row
                     * @return {?}
                     */function (row) { return _this.completeRowList.push(row); }));
                    }
                    else {
                        fn(value);
                        _this.completeRowList.splice(0);
                        ((_this.dataSource || { data: [] }).data || [])
                            .filter(( /**
                     * @param {?} row
                     * @return {?}
                     */function (row) { return row.id === value; }))
                            .forEach(( /**
                     * @param {?} row
                     * @return {?}
                     */function (row) { return _this.completeRowList.push(row); }));
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
                if (!util.isNullOrUndefined(changes.resetFiltersOnOpen) && changes.resetFiltersOnOpen.currentValue !== false) {
                    this.resetFilters();
                }
                if (!util.isNullOrUndefined(changes.dataSource)) {
                    this.updateCompleteRowList(this.completeRowList.map(( /**
                     * @param {?} row
                     * @return {?}
                     */function (row) { return row.id; })));
                }
                // Proxy @Input bindings to MatSelect
                if (!util.isNullOrUndefined(changes.matSelectConfigurator)) {
                    /** @type {?} */
                    var configuration_1 = changes.matSelectConfigurator.currentValue;
                    Object.keys(configuration_1)
                        .filter(( /**
                 * @param {?} key
                 * @return {?}
                 */function (key) { return !['multiple', 'panelClass'].includes(key) && !_this.controlValueAccessorKeys.includes(key); }))
                        .forEach(( /**
                 * @param {?} key
                 * @return {?}
                 */function (key) { return _this.matSelect[key] = configuration_1[key]; }));
                    /** @type {?} */
                    var panelClass = [];
                    panelClass.push('mat-select-search-table-panel');
                    if (!util.isNullOrUndefined(configuration_1.panelClass)) {
                        panelClass.push(configuration_1.panelClass);
                    }
                    if (this.overallSearchEnabled) {
                        panelClass.push('mat-select-search-panel');
                    }
                    this.matSelect.panelClass = panelClass;
                }
                if (!util.isNullOrUndefined(changes.matSelectSearchConfigurator)) {
                    this.proxyMatSelectSearchConfiguration(changes.matSelectSearchConfigurator.currentValue);
                }
                if (!util.isNullOrUndefined(changes.dataSource)
                    && !util.isNullOrUndefined(changes.dataSource.currentValue)
                    && util.isArray(changes.dataSource.currentValue.data)) {
                    this.tableDataSource = __spread(changes.dataSource.currentValue.data);
                    if (this.addNullRow()) {
                        this.tableDataSource.unshift(this.nullRow);
                    }
                    this.tableColumns = __spread(['_selection'], changes.dataSource.currentValue.columns.map(( /**
                     * @param {?} column
                     * @return {?}
                     */function (column) { return column.key; })));
                    this.tableColumnsMap.clear();
                    changes.dataSource.currentValue.columns.forEach(( /**
                     * @param {?} column
                     * @return {?}
                     */function (column) { return _this.tableColumnsMap.set(column.key, column); }));
                    this.applyProxyToArray(changes.dataSource.currentValue.data, ( /**
                     * @return {?}
                     */function () {
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
                    .filter(( /**
             * @param {?} et
             * @return {?}
             */function (et) { return et instanceof HTMLElement; }))
                    .some(( /**
             * @param {?} et
             * @return {?}
             */function (et) { return et.tagName.toLowerCase() === 'mat-option'; }))) {
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
                    this.filterControls.registerControl(key, new forms.FormControl(''));
                }
                return ( /** @type {?} */(this.filterControls.get(key)));
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
                if (!util.isNullOrUndefined(this.triggerLabelSort)) {
                    this.sortData(value, this.triggerLabelSort.active, this.triggerLabelSort.direction);
                }
                return value.map(( /**
                 * @param {?} row
                 * @return {?}
                 */function (row) {
                    if (util.isNullOrUndefined(row)) {
                        return '';
                    }
                    if (util.isNullOrUndefined(_this.customTriggerLabelTemplate)
                        || typeof _this.customTriggerLabelTemplate !== 'string'
                        || _this.customTriggerLabelTemplate.trim().length === 0) {
                        return "" + row.id;
                    }
                    /** @type {?} */
                    var atLeastPartialSubstitution = false;
                    /** @type {?} */
                    var substitution = _this.customTriggerLabelTemplate.replace(/[$]{1}[{]{1}([^}]+)[}]{1}?/g, ( /**
                     * @param {?} _
                     * @param {?} key
                     * @return {?}
                     */function (_, key) {
                        return !util.isNullOrUndefined(row[key]) && (atLeastPartialSubstitution = true) ? row[key] : '';
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
                    setTimeout(( /**
                     * @return {?}
                     */function () { return _this.matSelectSearch._focus(); }));
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
                this.completeValueList.splice(0);
                if (util.isNullOrUndefined(value)) {
                    return;
                }
                /** @type {?} */
                var valueArray = !util.isArray(value) ? [value] : value;
                valueArray
                    .filter(( /**
             * @param {?} valueId
             * @return {?}
             */function (valueId) { return !util.isNullOrUndefined(valueId); }))
                    .forEach(( /**
             * @param {?} valueId
             * @return {?}
             */function (valueId) {
                    ((_this.dataSource || { data: [] }).data || [])
                        .filter(( /**
                 * @param {?} row
                 * @return {?}
                 */function (row) { return !util.isNullOrUndefined(row) && !util.isNullOrUndefined(row.id) && row.id === valueId; }))
                        .forEach(( /**
                 * @param {?} row
                 * @return {?}
                 */function (row) {
                        _this.completeRowList.push(row);
                        _this.completeValueList.push(row.id);
                    }));
                }));
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
                if (util.isNullOrUndefined(this.matSelectSearch)) {
                    return;
                }
                // Proxy @Input bindings to NgxMatSelectSearch
                Object.keys(configuration)
                    .filter(( /**
             * @param {?} key
             * @return {?}
             */function (key) { return !['clearSearchInput'].includes(key) && !_this.controlValueAccessorKeys.includes(key); }))
                    .forEach(( /**
             * @param {?} key
             * @return {?}
             */function (key) { return _this.matSelectSearch[key] = configuration[key]; }));
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
                    .filter(( /**
             * @param {?} key
             * @return {?}
             */function (key) {
                    return _this.tableColumnsMap.has(key)
                        && !util.isNullOrUndefined(_this.tableColumnsMap.get(key).filter)
                        // If filter is enabled
                        && _this.tableColumnsMap.get(key).filter.enabled !== false;
                }))
                    .filter(( /**
             * @param {?} key
             * @return {?}
             */function (key) {
                    /** @type {?} */
                    var value = _this.filterControls.get(key).value;
                    return !util.isNullOrUndefined(value)
                        // If an array - check it's not empty
                        && ((util.isArray(value) && value.length > 0)
                            // If string - check that not blank
                            || (typeof value === 'string' && value.trim().length > 0)
                            // If number - check that toString() is not blank
                            || (typeof value === 'number' && ("" + value).trim().length > 0));
                }))
                    .forEach(( /**
             * @param {?} key
             * @return {?}
             */function (key) {
                    return filters[key] = {
                        filter: _this.tableColumnsMap.get(key).filter,
                        value: _this.filterControls.get(key).value
                    };
                }));
                /** @type {?} */
                var filterKeys = Object.keys(filters);
                for (var i = data.length - 1; i >= 0; i--) {
                    for (var k = 0; k < filterKeys.length; k++) {
                        /** @type {?} */
                        var filterKey = filterKeys[k];
                        /** @type {?} */
                        var row = data[i];
                        if (util.isNullOrUndefined(row)) {
                            return;
                        }
                        /** @type {?} */
                        var cellValue = row[filterKey];
                        if (util.isNullOrUndefined(cellValue)) {
                            data.splice(i, 1).forEach(( /**
                             * @param {?} item
                             * @return {?}
                             */function (item) { return _this.filteredOutRows["" + item.id] = item; }));
                            continue;
                        }
                        /** @type {?} */
                        var filter = filters[filterKey];
                        /** @type {?} */
                        var comparator = filter.filter.comparator;
                        if (typeof filter.filter.comparatorFn === 'function') {
                            if (!filter.filter.comparatorFn.call(null, cellValue, filter.value, row)) {
                                data.splice(i, 1).forEach(( /**
                                 * @param {?} item
                                 * @return {?}
                                 */function (item) { return _this.filteredOutRows["" + item.id] = item; }));
                                break;
                            }
                        }
                        else if (util.isNullOrUndefined(comparator) || comparator === 'equals') {
                            if (filter.value !== cellValue) {
                                data.splice(i, 1).forEach(( /**
                                 * @param {?} item
                                 * @return {?}
                                 */function (item) { return _this.filteredOutRows["" + item.id] = item; }));
                                break;
                            }
                        }
                        else if (typeof cellValue === 'string' && typeof filter.value === 'string') {
                            /** @type {?} */
                            var cellValueLC = ("" + cellValue).toLowerCase();
                            /** @type {?} */
                            var filterValueLC = filter.value.toLowerCase();
                            if (util.isNullOrUndefined(comparator) || comparator === 'equalsIgnoreCase') {
                                if (filterValueLC !== cellValueLC) {
                                    data.splice(i, 1).forEach(( /**
                                     * @param {?} item
                                     * @return {?}
                                     */function (item) { return _this.filteredOutRows["" + item.id] = item; }));
                                    break;
                                }
                            }
                            else if (comparator === 'contains') {
                                if (cellValue.indexOf(filter.value) === -1) {
                                    data.splice(i, 1).forEach(( /**
                                     * @param {?} item
                                     * @return {?}
                                     */function (item) { return _this.filteredOutRows["" + item.id] = item; }));
                                    break;
                                }
                            }
                            else if (comparator === 'containsIgnoreCase') {
                                if (cellValueLC.indexOf(filterValueLC) === -1) {
                                    data.splice(i, 1).forEach(( /**
                                     * @param {?} item
                                     * @return {?}
                                     */function (item) { return _this.filteredOutRows["" + item.id] = item; }));
                                    break;
                                }
                            }
                            else if (comparator === 'startsWith') {
                                if (!cellValue.startsWith(filter.value)) {
                                    data.splice(i, 1).forEach(( /**
                                     * @param {?} item
                                     * @return {?}
                                     */function (item) { return _this.filteredOutRows["" + item.id] = item; }));
                                    break;
                                }
                            }
                            else if (comparator === 'startsWithIgnoreCase') {
                                if (!cellValueLC.startsWith(filterValueLC)) {
                                    data.splice(i, 1).forEach(( /**
                                     * @param {?} item
                                     * @return {?}
                                     */function (item) { return _this.filteredOutRows["" + item.id] = item; }));
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
                if (util.isNullOrUndefined(this.overallFilterControl.value)) {
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
                        if (util.isNullOrUndefined(cellValue)) {
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
                        data.splice(i, 1).forEach(( /**
                         * @param {?} item
                         * @return {?}
                         */function (item) { return _this.filteredOutRows["" + item.id] = item; }));
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
                ['pop', 'push', 'reverse', 'shift', 'unshift', 'splice', 'sort'].forEach(( /**
                 * @param {?} methodName
                 * @return {?}
                 */function (methodName) {
                    array[methodName] = ( /**
                     * @return {?}
                     */function () {
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
                    .forEach(( /**
             * @param {?} key
             * @return {?}
             */function (key) { return _this.filterControls.get(key).setValue(''); }));
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
                var value = (( /** @type {?} */(data)))[active];
                if (coercion._isNumberValue(value)) {
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
                return data.sort(( /**
                 * @param {?} a
                 * @param {?} b
                 * @return {?}
                 */function (a, b) {
                    /** @type {?} */
                    var aValue = _this.sortingDataAccessor(a, active);
                    /** @type {?} */
                    var bValue = _this.sortingDataAccessor(b, active);
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
                    if (util.isNullOrUndefined(aValue) && !util.isNullOrUndefined(bValue)) {
                        return -1;
                    }
                    else if (!util.isNullOrUndefined(aValue) && util.isNullOrUndefined(bValue)) {
                        return 1;
                    }
                    if (aValue instanceof Date) {
                        aValue = aValue.getTime();
                    }
                    if (bValue instanceof Date) {
                        bValue = bValue.getTime();
                    }
                    // User localeCompare for strings
                    if (util.isString(aValue) && util.isString(bValue)) {
                        return (( /** @type {?} */(aValue))).localeCompare(( /** @type {?} */(bValue))) * (direction === 'asc' ? 1 : -1);
                    }
                    // Try to convert to a Number type
                    aValue = isNaN(( /** @type {?} */(aValue))) ? "" + aValue : +aValue;
                    bValue = isNaN(( /** @type {?} */(bValue))) ? "" + bValue : +bValue;
                    // if one is number and other is String
                    if (util.isString(aValue) && util.isNumber(bValue)) {
                        return (1) * (direction === 'asc' ? 1 : -1);
                    }
                    if (util.isNumber(aValue) && util.isString(bValue)) {
                        return (-1) * (direction === 'asc' ? 1 : -1);
                    }
                    // Compare as Numbers otherwise
                    return (aValue > bValue ? 1 : -1) * (direction === 'asc' ? 1 : -1);
                }));
            };
        /**
         * @return {?}
         */
        MatSelectTableComponent.prototype.addNullRow = /**
         * @return {?}
         */
            function () {
                return !this.multiple && !util.isNullOrUndefined(this.labelForNullValue);
            };
        MatSelectTableComponent.decorators = [
            { type: core.Component, args: [{
                        selector: 'ngx-mat-select-table',
                        template: "<mat-form-field>\r\n  <mat-select #componentSelect\r\n              [multiple]=\"multiple\"\r\n              disableRipple>\r\n\r\n    <mat-select-trigger>\r\n      <ng-container *ngIf=\"!customTriggerLabelFn\">{{simpleTriggerLabelFn(completeRowList)}}</ng-container>\r\n      <ng-container *ngIf=\"customTriggerLabelFn\">{{customTriggerLabelFn(completeRowList)}}</ng-container>\r\n    </mat-select-trigger>\r\n\r\n    <ngx-mat-select-search *ngIf=\"overallSearchEnabled\"\r\n                           [formControl]=\"overallFilterControl\"\r\n                           [clearSearchInput]=\"resetFiltersOnOpen\"\r\n                           [ngClass]=\"{hidden: overallSearchVisibleState !== true}\">\r\n      <mat-icon *ngIf=\"matSelectSearchConfigurator?.clearIcon\"\r\n                ngxMatSelectSearchClear\r\n                color=\"primary\">{{matSelectSearchConfigurator.clearIcon}}</mat-icon>\r\n    </ngx-mat-select-search>\r\n    <mat-icon *ngIf=\"overallSearchEnabled\"\r\n              (click)=\"toggleOverallSearch()\"\r\n              class=\"overall-search-toggle\"\r\n              color=\"primary\">{{overallSearchVisibleState ? 'arrow_back' : 'search'}}</mat-icon>\r\n\r\n    <table #table\r\n           mat-table\r\n           matSort\r\n           [dataSource]=\"tableDataSource\">\r\n\r\n      <ng-container *ngFor=\"let columnKey of tableColumns; let i = index\"\r\n                    [matColumnDef]=\"columnKey\"\r\n                    [ngSwitch]=\"columnKey\">\r\n\r\n        <ng-container *ngSwitchCase=\"'_selection'\">\r\n          <th mat-header-cell *matHeaderCellDef [ngClass]=\"{selection: true, hidden: !multiple}\"></th>\r\n          <td mat-cell *matCellDef=\"let row\" [ngClass]=\"{selection: true, hidden: !multiple}\">\r\n            <mat-option [value]=\"row.id\"></mat-option>\r\n          </td>\r\n        </ng-container>\r\n\r\n        <ng-container *ngSwitchDefault>\r\n          <th mat-header-cell\r\n              mat-sort-header\r\n              [disabled]=\"!tableColumnsMap.get(columnKey).sortable\"\r\n              *matHeaderCellDef>\r\n            <!-- Header cell -->\r\n            <ng-container [ngSwitch]=\"tableColumnsMap.get(columnKey).filter?.type\">\r\n              <ng-container *ngSwitchCase=\"'string'\"\r\n                            [ngTemplateOutlet]=\"filterTypeString\"\r\n                            [ngTemplateOutletContext]=\"{column: tableColumnsMap.get(columnKey)}\"></ng-container>\r\n\r\n              <div *ngSwitchDefault>{{tableColumnsMap.get(columnKey).name}}</div>\r\n            </ng-container>\r\n          </th>\r\n          <td mat-cell *matCellDef=\"let row\"\r\n              [colSpan]=\"addNullRow() && row.id === null && i === 1 ? tableColumns.length : 1\"\r\n              [ngStyle]=\"{display: addNullRow() && row.id === null && i !== 1 ? 'none' : ''}\"\r\n          >\r\n            {{addNullRow() && row.id === null && i === 1 ? labelForNullValue : row[columnKey]}}\r\n          </td>\r\n        </ng-container>\r\n\r\n      </ng-container>\r\n\r\n      <tr mat-header-row *matHeaderRowDef=\"tableColumns; sticky: true\"></tr>\r\n      <tr mat-row *matRowDef=\"let row; columns: tableColumns; let i = index\"\r\n          (click)=\"emulateMatOptionClick($event)\"\r\n          [ngClass]=\"{active: i === tableActiveRow}\"></tr>\r\n    </table>\r\n\r\n  </mat-select>\r\n</mat-form-field>\r\n\r\n<ng-template #filterTypeString\r\n             let-column='column'>\r\n  <mat-form-field\r\n    (click)=\"$event.stopPropagation()\"\r\n    class=\"filter\">\r\n    <input matInput\r\n           [formControl]=\"filterFormControl(column.key)\"\r\n           (keydown)=\"$event.stopPropagation()\"\r\n           (keyup)=\"$event.stopPropagation()\"\r\n           (keypress)=\"$event.stopPropagation()\"\r\n           [placeholder]=\"column.name\"/>\r\n  </mat-form-field>\r\n</ng-template>\r\n",
                        exportAs: 'ngx-mat-select-table',
                        changeDetection: core.ChangeDetectionStrategy.OnPush,
                        providers: [
                            {
                                provide: forms.NG_VALUE_ACCESSOR,
                                useExisting: core.forwardRef(( /**
                                 * @return {?}
                                 */function () { return MatSelectTableComponent; })),
                                multi: true
                            }
                        ],
                        styles: [":host{display:block}:host mat-form-field{width:100%}::ng-deep .mat-select-panel.mat-select-search-table-panel{overflow-x:auto!important}::ng-deep .mat-select-panel.mat-select-search-table-panel .overall-search-toggle{z-index:102;position:absolute;left:13px;top:17px;cursor:pointer}::ng-deep .mat-select-panel.mat-select-search-table-panel ngx-mat-select-search{position:absolute;z-index:101}::ng-deep .mat-select-panel.mat-select-search-table-panel ngx-mat-select-search.hidden{display:none}::ng-deep .mat-select-panel.mat-select-search-table-panel ngx-mat-select-search .mat-select-search-inner{height:56px}::ng-deep .mat-select-panel.mat-select-search-table-panel ngx-mat-select-search .mat-select-search-inner .mat-select-search-input{margin-left:26px;width:calc(100% - 26px)}::ng-deep .mat-select-panel.mat-select-search-table-panel table{width:100%}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr{cursor:pointer;height:48px;max-height:48px}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr mat-option{height:48px;max-height:48px}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr.active{background:rgba(0,0,0,.04)}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr td{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;border-bottom:0!important;box-shadow:inset 0 -1px 0 0 rgba(0,0,0,.12)}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th ::ng-deep .mat-sort-header-container{height:55px}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th ::ng-deep .mat-sort-header-container mat-form-field .mat-form-field-infix{width:initial}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th[aria-sort] ::ng-deep .mat-sort-header-arrow{opacity:1!important}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr td mat-option,::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th mat-option{background:0 0!important}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr td.selection,::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th.selection{width:56px;padding:0;margin:0}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr td.selection.hidden mat-option,::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th.selection.hidden mat-option{visibility:hidden}"]
                    }] }
        ];
        /** @nocollapse */
        MatSelectTableComponent.ctorParameters = function () {
            return [
                { type: core.ChangeDetectorRef }
            ];
        };
        MatSelectTableComponent.propDecorators = {
            dataSource: [{ type: core.Input }],
            multiple: [{ type: core.Input }],
            overallSearchEnabled: [{ type: core.Input }],
            overallSearchVisible: [{ type: core.Input }],
            resetSortOnOpen: [{ type: core.Input }],
            resetFiltersOnOpen: [{ type: core.Input }],
            customTriggerLabelFn: [{ type: core.Input }],
            triggerLabelSort: [{ type: core.Input }],
            customTriggerLabelTemplate: [{ type: core.Input }],
            labelForNullValue: [{ type: core.Input }],
            matSelectConfigurator: [{ type: core.Input }],
            matSelectSearchConfigurator: [{ type: core.Input }],
            defaultSort: [{ type: core.Input }],
            close: [{ type: core.Output }],
            matSelect: [{ type: core.ViewChild, args: ['componentSelect',] }],
            matSelectSearch: [{ type: core.ViewChild, args: [ngxMatSelectSearch.MatSelectSearchComponent,] }],
            sort: [{ type: core.ViewChild, args: [material.MatSort,] }],
            table: [{ type: core.ViewChild, args: [material.MatTable,] }],
            tableRef: [{ type: core.ViewChild, args: ['table', { read: core.ElementRef },] }],
            matOptions: [{ type: core.ViewChildren, args: [material.MatOption,] }]
        };
        return MatSelectTableComponent;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */
    var NgxMatSelectTableModule = /** @class */ (function () {
        function NgxMatSelectTableModule() {
        }
        NgxMatSelectTableModule.decorators = [
            { type: core.NgModule, args: [{
                        declarations: [
                            MatSelectTableComponent
                        ],
                        imports: [
                            common.CommonModule,
                            forms.FormsModule,
                            forms.ReactiveFormsModule,
                            material.MatSelectModule,
                            material.MatSortModule,
                            material.MatOptionModule,
                            material.MatCommonModule,
                            material.MatTableModule,
                            material.MatInputModule,
                            material.MatIconModule,
                            ngxMatSelectSearch.NgxMatSelectSearchModule
                        ],
                        providers: [],
                        bootstrap: [MatSelectTableComponent],
                        exports: [MatSelectTableComponent]
                    },] }
        ];
        return NgxMatSelectTableModule;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */

    exports.MatSelectTableComponent = MatSelectTableComponent;
    exports.NgxMatSelectTableModule = NgxMatSelectTableModule;

    Object.defineProperty(exports, '__esModule', { value: true });

})));

//# sourceMappingURL=ngx-mat-select-table.umd.js.map