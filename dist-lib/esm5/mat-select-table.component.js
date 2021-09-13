import * as tslib_1 from "tslib";
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, forwardRef, Input, OnChanges, OnDestroy, OnInit, Output, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { merge, Subject } from 'rxjs';
import { MatOption } from '@angular/material/core';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { isArray, isNullOrUndefined, isNumber, isString } from 'util';
import { _isNumberValue } from '@angular/cdk/coercion';
import { debounceTime, take, takeUntil } from 'rxjs/operators';
import { MatSelectSearchComponent } from 'ngx-mat-select-search';
var MAX_SAFE_INTEGER = 9007199254740991;
var MatSelectTableComponent = /** @class */ (function () {
    function MatSelectTableComponent(cd) {
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
    MatSelectTableComponent_1 = MatSelectTableComponent;
    MatSelectTableComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.multiple = this.multiple || false;
        this.matSelect.openedChange
            .pipe(takeUntil(this._onDestroy))
            .subscribe(function (opened) {
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
            _this.table._headerRowDefChanged = true;
            // Disable sort buttons to prevent sorting change on SPACE key pressed in filter field
            setTimeout(function () { return [].forEach.call(_this.tableRef.nativeElement.querySelectorAll('button.mat-sort-header-button'), function (e) { return e.disabled = true; }); });
            // Patch the height of the panel to include the height of the header and footer
            var panelElement = _this.matSelect.panel.nativeElement;
            var panelHeight = panelElement.getBoundingClientRect().height;
            var tableAdditionalHeight = 0;
            _this.table
                ._getRenderedRows(_this.table._headerRowOutlet)
                .concat(_this.table._getRenderedRows(_this.table._footerRowOutlet))
                .forEach(function (row) { return tableAdditionalHeight += row.getBoundingClientRect().height; });
            if (!isNaN(panelHeight)) {
                panelElement.style.maxHeight = panelHeight + tableAdditionalHeight + "px";
            }
            if (!_this.matSelectSearchConfigurator.disableScrollToActiveOnOptionsChanged
                && !isNullOrUndefined(_this.matSelect._keyManager) && _this.completeRowList.length > 0) {
                _this._onSelectOpen.pipe(takeUntil(_this._onDestroy), debounceTime(1), take(1)).subscribe(function () {
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
                });
            }
        });
        this.matSelect.valueChange
            .pipe(takeUntil(this._onDestroy))
            .subscribe(function (value) {
            if (!_this.multiple) {
                return;
            }
            if (isArray(value) && value.length > 1 && value.some(function (v) { return v === ''; })) {
                _this.writeValue(value.filter(function (v) { return v !== ''; }));
                try {
                    _this.cd.detectChanges();
                }
                catch (ignored) {
                }
            }
            if (isArray(value) && value.length === 0) {
                _this.checkAndResetSelection();
            }
        });
    };
    MatSelectTableComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        merge.apply(void 0, tslib_1.__spread([
            this._onOptionsChange,
            this.sort.sortChange,
            this.filterControls.valueChanges,
            this.overallFilterControl.valueChanges
        ])).pipe(takeUntil(this._onDestroy), debounceTime(100))
            .subscribe(function () {
            var dataClone = tslib_1.__spread(((_this.dataSource || { data: [] }).data || []));
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
            if (!_this.sort.active && !isNullOrUndefined(_this.defaultSort) && _this.defaultSort.active) {
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
        });
        // Manually sort data for this.matSelect.options (QueryList<MatOption>) and notify matSelect.options of changes
        // It's important to keep this.matSelect.options order synchronized with data in the table
        //     because this.matSelect.options (QueryList<MatOption>) doesn't update it's state after table data is changed
        this.matOptions.changes.subscribe(function () {
            var options = {};
            _this.matOptions.toArray()
                .filter(function (option) { return !isNullOrUndefined(option); })
                .forEach(function (option) { return options["" + option.value] = option; });
            _this.matSelect.options.reset(_this.tableDataSource
                .filter(function (row) { return !isNullOrUndefined(options["" + row.id]); })
                .map(function (row) { return options["" + row.id]; }));
            _this.matSelect.options.notifyOnChanges();
        });
        if (!isNullOrUndefined(this.matSelect._keyManager)) {
            // Subscribe on KeyManager changes to highlight the table rows accordingly
            this.matSelect._keyManager.change
                .pipe(takeUntil(this._onDestroy))
                .subscribe(function (activeRow) { return _this.tableActiveRow = activeRow; });
        }
    };
    MatSelectTableComponent.prototype.ngOnDestroy = function () {
        this._onSelectOpen.complete();
        this._onDestroy.next();
        this._onDestroy.complete();
    };
    MatSelectTableComponent.prototype.registerOnChange = function (fn) {
        var _this = this;
        var proxyFn = function (value) {
            // ToDo: refactor - comparison mechanism isn't optimized. filteredOutRows is a map but completeValueList is an array
            if (_this.multiple === true) {
                for (var i = _this.completeValueList.length - 1; i >= 0; i--) {
                    if (_this.filteredOutRows["" + _this.completeValueList[i]] === undefined && value.indexOf(_this.completeValueList[i]) === -1) {
                        _this.completeValueList.splice(i, 1);
                    }
                }
                value
                    .filter(function (choice) { return _this.completeValueList.indexOf(choice) === -1; })
                    .forEach(function (choice) { return _this.completeValueList.push(choice); });
                _this.matSelect.value = _this.completeValueList;
                fn(_this.completeValueList);
                _this.completeRowList.splice(0);
                ((_this.dataSource || { data: [] }).data || [])
                    .filter(function (row) { return _this.completeValueList.indexOf(row.id) !== -1; })
                    .forEach(function (row) { return _this.completeRowList.push(row); });
            }
            else {
                fn(value);
                _this.completeRowList.splice(0);
                ((_this.dataSource || { data: [] }).data || [])
                    .filter(function (row) { return row.id === value; })
                    .forEach(function (row) { return _this.completeRowList.push(row); });
            }
        };
        this.matSelect.registerOnChange(proxyFn);
    };
    MatSelectTableComponent.prototype.registerOnTouched = function (fn) {
        this.matSelect.registerOnTouched(fn);
    };
    MatSelectTableComponent.prototype.setDisabledState = function (isDisabled) {
        this.matSelect.setDisabledState(isDisabled);
    };
    MatSelectTableComponent.prototype.writeValue = function (value) {
        this.updateCompleteRowList(value);
        this.matSelect.writeValue(value);
        if (this.matSelect.value !== value) {
            this.matSelect.value = value;
        }
    };
    MatSelectTableComponent.prototype.ngOnChanges = function (changes) {
        var _this = this;
        if (!isNullOrUndefined(changes.resetFiltersOnOpen) && changes.resetFiltersOnOpen.currentValue !== false) {
            this.resetFilters();
        }
        if (!isNullOrUndefined(changes.dataSource)) {
            this.updateCompleteRowList(this.completeRowList.map(function (row) { return row.id; }));
        }
        // Proxy @Input bindings to MatSelect
        if (!isNullOrUndefined(changes.matSelectConfigurator)) {
            var configuration_1 = changes.matSelectConfigurator.currentValue;
            Object.keys(configuration_1)
                .filter(function (key) { return !['multiple', 'panelClass'].includes(key) && !_this.controlValueAccessorKeys.includes(key); })
                .forEach(function (key) { return _this.matSelect[key] = configuration_1[key]; });
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
            if (this.addNullRow()) {
                this.tableDataSource.unshift(this.nullRow);
            }
            this.tableColumns = tslib_1.__spread(['_selection'], changes.dataSource.currentValue.columns.map(function (column) { return column.key; }));
            this.tableColumnsMap.clear();
            changes.dataSource.currentValue.columns.forEach(function (column) { return _this.tableColumnsMap.set(column.key, column); });
            this.applyProxyToArray(changes.dataSource.currentValue.data, function () {
                _this._onOptionsChange.next();
            });
            this._onOptionsChange.next();
        }
    };
    MatSelectTableComponent.prototype.emulateMatOptionClick = function (event) {
        if (event.composedPath()
            .filter(function (et) { return et instanceof HTMLElement; })
            .some(function (et) { return et.tagName.toLowerCase() === 'mat-option'; })) {
            return;
        }
        if (!(event.target instanceof HTMLElement)) {
            return;
        }
        var rowElement = event.target;
        while (rowElement != null && rowElement instanceof HTMLElement && rowElement.tagName.toLowerCase() !== 'tr') {
            rowElement = rowElement.parentElement;
        }
        if (rowElement === null) {
            return;
        }
        var childOption = rowElement.querySelector('mat-option');
        if (!childOption) {
            return;
        }
        childOption.click();
    };
    MatSelectTableComponent.prototype.filterFormControl = function (key) {
        if (!this.filterControls.contains(key)) {
            this.filterControls.registerControl(key, new FormControl(''));
        }
        return this.filterControls.get(key);
    };
    MatSelectTableComponent.prototype.simpleTriggerLabelFn = function (value) {
        var _this = this;
        if (!isNullOrUndefined(this.triggerLabelSort)) {
            this.sortData(value, this.triggerLabelSort.active, this.triggerLabelSort.direction);
        }
        return value.map(function (row) {
            if (isNullOrUndefined(row)) {
                return '';
            }
            if (isNullOrUndefined(_this.customTriggerLabelTemplate)
                || typeof _this.customTriggerLabelTemplate !== 'string'
                || _this.customTriggerLabelTemplate.trim().length === 0) {
                return "" + row.id;
            }
            var atLeastPartialSubstitution = false;
            var substitution = _this.customTriggerLabelTemplate.replace(/[$]{1}[{]{1}([^}]+)[}]{1}?/g, function (_, key) {
                return !isNullOrUndefined(row[key]) && (atLeastPartialSubstitution = true) ? row[key] : '';
            });
            if (atLeastPartialSubstitution === false) {
                return "" + row.id;
            }
            return substitution.trim();
        }).join(', ');
    };
    MatSelectTableComponent.prototype.toggleOverallSearch = function () {
        var _this = this;
        this.overallSearchVisibleState = !this.overallSearchVisibleState;
        this.resetFilters();
        if (this.overallSearchVisibleState) {
            setTimeout(function () { return _this.matSelectSearch._focus(); });
        }
    };
    MatSelectTableComponent.prototype.updateCompleteRowList = function (value) {
        var _this = this;
        this.completeRowList.splice(0);
        this.completeValueList.splice(0);
        if (isNullOrUndefined(value)) {
            return;
        }
        var valueArray = !isArray(value) ? [value] : value;
        valueArray
            .filter(function (valueId) { return !isNullOrUndefined(valueId); })
            .forEach(function (valueId) {
            ((_this.dataSource || { data: [] }).data || [])
                .filter(function (row) { return !isNullOrUndefined(row) && !isNullOrUndefined(row.id) && row.id === valueId; })
                .forEach(function (row) {
                _this.completeRowList.push(row);
                _this.completeValueList.push(row.id);
            });
        });
    };
    MatSelectTableComponent.prototype.proxyMatSelectSearchConfiguration = function (configuration) {
        var _this = this;
        if (isNullOrUndefined(this.matSelectSearch)) {
            return;
        }
        // Proxy @Input bindings to NgxMatSelectSearch
        Object.keys(configuration)
            .filter(function (key) { return !['clearSearchInput'].includes(key) && !_this.controlValueAccessorKeys.includes(key); })
            .forEach(function (key) { return _this.matSelectSearch[key] = configuration[key]; });
    };
    MatSelectTableComponent.prototype.applyColumnLevelFilters = function (data) {
        var _this = this;
        this.filteredOutRows = {};
        var filters = {};
        Object.keys(this.filterControls.controls)
            .filter(function (key) { return _this.tableColumnsMap.has(key)
            && !isNullOrUndefined(_this.tableColumnsMap.get(key).filter)
            // If filter is enabled
            && _this.tableColumnsMap.get(key).filter.enabled !== false; })
            .filter(function (key) {
            var value = _this.filterControls.get(key).value;
            return !isNullOrUndefined(value)
                // If an array - check it's not empty
                && ((isArray(value) && value.length > 0)
                    // If string - check that not blank
                    || (typeof value === 'string' && value.trim().length > 0)
                    // If number - check that toString() is not blank
                    || (typeof value === 'number' && ("" + value).trim().length > 0));
        })
            .forEach(function (key) { return filters[key] = {
            filter: _this.tableColumnsMap.get(key).filter,
            value: _this.filterControls.get(key).value
        }; });
        var filterKeys = Object.keys(filters);
        for (var i = data.length - 1; i >= 0; i--) {
            for (var k = 0; k < filterKeys.length; k++) {
                var filterKey = filterKeys[k];
                var row = data[i];
                if (isNullOrUndefined(row)) {
                    continue;
                }
                var cellValue = row[filterKey];
                if (isNullOrUndefined(cellValue)) {
                    data.splice(i, 1).forEach(function (item) { return _this.filteredOutRows["" + item.id] = item; });
                    continue;
                }
                var filter = filters[filterKey];
                var comparator = filter.filter.comparator;
                if (typeof filter.filter.comparatorFn === 'function') {
                    if (!filter.filter.comparatorFn.call(null, cellValue, filter.value, row)) {
                        data.splice(i, 1).forEach(function (item) { return _this.filteredOutRows["" + item.id] = item; });
                        break;
                    }
                }
                else if (isNullOrUndefined(comparator) || comparator === 'equals') {
                    if (filter.value !== cellValue) {
                        data.splice(i, 1).forEach(function (item) { return _this.filteredOutRows["" + item.id] = item; });
                        break;
                    }
                }
                else if (typeof cellValue === 'string' && typeof filter.value === 'string') {
                    var cellValueLC = ("" + cellValue).toLowerCase();
                    var filterValueLC = filter.value.toLowerCase();
                    if (isNullOrUndefined(comparator) || comparator === 'equalsIgnoreCase') {
                        if (filterValueLC !== cellValueLC) {
                            data.splice(i, 1).forEach(function (item) { return _this.filteredOutRows["" + item.id] = item; });
                            break;
                        }
                    }
                    else if (comparator === 'contains') {
                        if (cellValue.indexOf(filter.value) === -1) {
                            data.splice(i, 1).forEach(function (item) { return _this.filteredOutRows["" + item.id] = item; });
                            break;
                        }
                    }
                    else if (comparator === 'containsIgnoreCase') {
                        if (cellValueLC.indexOf(filterValueLC) === -1) {
                            data.splice(i, 1).forEach(function (item) { return _this.filteredOutRows["" + item.id] = item; });
                            break;
                        }
                    }
                    else if (comparator === 'startsWith') {
                        if (!cellValue.startsWith(filter.value)) {
                            data.splice(i, 1).forEach(function (item) { return _this.filteredOutRows["" + item.id] = item; });
                            break;
                        }
                    }
                    else if (comparator === 'startsWithIgnoreCase') {
                        if (!cellValueLC.startsWith(filterValueLC)) {
                            data.splice(i, 1).forEach(function (item) { return _this.filteredOutRows["" + item.id] = item; });
                            break;
                        }
                    }
                }
            }
        }
    };
    MatSelectTableComponent.prototype.applyOverallFilter = function (data) {
        var _this = this;
        this.filteredOutRows = {};
        if (isNullOrUndefined(this.overallFilterControl.value)) {
            return;
        }
        var filterValueLC = this.overallFilterControl.value.toLowerCase();
        if (filterValueLC.trim().length === 0) {
            return;
        }
        for (var i = data.length - 1; i >= 0; i--) {
            var row = data[i];
            var rowShouldBeFiltered = true;
            for (var j = this.dataSource.columns.length - 1; j >= 0; j--) {
                var key = this.dataSource.columns[j].key;
                var cellValue = row[key];
                if (isNullOrUndefined(cellValue)) {
                    continue;
                }
                var cellValueLC = ("" + cellValue).toLowerCase();
                if (cellValueLC.indexOf(filterValueLC) !== -1) {
                    rowShouldBeFiltered = false;
                    break;
                }
            }
            if (rowShouldBeFiltered) {
                data.splice(i, 1).forEach(function (item) { return _this.filteredOutRows["" + item.id] = item; });
            }
        }
    };
    MatSelectTableComponent.prototype.applyProxyToArray = function (array, callback) {
        ['pop', 'push', 'reverse', 'shift', 'unshift', 'splice', 'sort'].forEach(function (methodName) {
            array[methodName] = function () {
                var res = Array.prototype[methodName].apply(array, arguments); // call normal behaviour
                callback.apply(array, arguments); // finally call the callback supplied
                return res;
            };
        });
    };
    MatSelectTableComponent.prototype.resetFilters = function () {
        var _this = this;
        this.overallFilterControl.setValue('');
        Object.keys(this.filterControls.controls)
            .forEach(function (key) { return _this.filterControls.get(key).setValue(''); });
    };
    /**
     * Taken from {@see MatTableDataSource#sortingDataAccessor}
     *
     * @param data
     * @param sortHeaderId
     */
    MatSelectTableComponent.prototype.sortingDataAccessor = function (data, active) {
        var value = data[active];
        if (_isNumberValue(value)) {
            var numberValue = Number(value);
            // Numbers beyond `MAX_SAFE_INTEGER` can't be compared reliably so we
            // leave them as strings. For more info: https://goo.gl/y5vbSg
            return numberValue < MAX_SAFE_INTEGER ? numberValue : value;
        }
        return value;
    };
    MatSelectTableComponent.prototype.sortData = function (data, active, direction) {
        var _this = this;
        if (!active || direction === '') {
            return data;
        }
        return data.sort(function (a, b) {
            var aValue = _this.sortingDataAccessor(a, active);
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
            aValue = isNaN(aValue) ? "" + aValue : +aValue;
            bValue = isNaN(bValue) ? "" + bValue : +bValue;
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
    };
    MatSelectTableComponent.prototype.addNullRow = function () {
        return !this.multiple && !isNullOrUndefined(this.labelForNullValue);
    };
    MatSelectTableComponent.prototype.checkAndResetSelection = function () {
        if (this.matSelect.value && isArray(this.matSelect.value) && this.matSelect.value.length < 1
            && !isNullOrUndefined(this.resetOptionAction)) {
            this.resetOptionAction();
        }
    };
    var MatSelectTableComponent_1;
    MatSelectTableComponent.ctorParameters = function () { return [
        { type: ChangeDetectorRef }
    ]; };
    tslib_1.__decorate([
        Input()
    ], MatSelectTableComponent.prototype, "dataSource", void 0);
    tslib_1.__decorate([
        Input()
    ], MatSelectTableComponent.prototype, "multiple", void 0);
    tslib_1.__decorate([
        Input()
    ], MatSelectTableComponent.prototype, "overallSearchEnabled", void 0);
    tslib_1.__decorate([
        Input()
    ], MatSelectTableComponent.prototype, "overallSearchVisible", void 0);
    tslib_1.__decorate([
        Input()
    ], MatSelectTableComponent.prototype, "resetSortOnOpen", void 0);
    tslib_1.__decorate([
        Input()
    ], MatSelectTableComponent.prototype, "resetFiltersOnOpen", void 0);
    tslib_1.__decorate([
        Input()
    ], MatSelectTableComponent.prototype, "customTriggerLabelFn", void 0);
    tslib_1.__decorate([
        Input()
    ], MatSelectTableComponent.prototype, "triggerLabelSort", void 0);
    tslib_1.__decorate([
        Input()
    ], MatSelectTableComponent.prototype, "customTriggerLabelTemplate", void 0);
    tslib_1.__decorate([
        Input()
    ], MatSelectTableComponent.prototype, "labelForNullValue", void 0);
    tslib_1.__decorate([
        Input()
    ], MatSelectTableComponent.prototype, "matSelectConfigurator", void 0);
    tslib_1.__decorate([
        Input()
    ], MatSelectTableComponent.prototype, "matSelectSearchConfigurator", void 0);
    tslib_1.__decorate([
        Input()
    ], MatSelectTableComponent.prototype, "defaultSort", void 0);
    tslib_1.__decorate([
        Input()
    ], MatSelectTableComponent.prototype, "resetOptionAction", void 0);
    tslib_1.__decorate([
        Output()
    ], MatSelectTableComponent.prototype, "close", void 0);
    tslib_1.__decorate([
        ViewChild('componentSelect', { static: true })
    ], MatSelectTableComponent.prototype, "matSelect", void 0);
    tslib_1.__decorate([
        ViewChild(MatSelectSearchComponent, { static: false })
    ], MatSelectTableComponent.prototype, "matSelectSearch", void 0);
    tslib_1.__decorate([
        ViewChild(MatSort, { static: true })
    ], MatSelectTableComponent.prototype, "sort", void 0);
    tslib_1.__decorate([
        ViewChild(MatTable, { static: true })
    ], MatSelectTableComponent.prototype, "table", void 0);
    tslib_1.__decorate([
        ViewChild('table', { read: ElementRef, static: true })
    ], MatSelectTableComponent.prototype, "tableRef", void 0);
    tslib_1.__decorate([
        ViewChildren(MatOption)
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
                    useExisting: forwardRef(function () { return MatSelectTableComponent_1; }),
                    multi: true
                }
            ],
            styles: [":host{display:block}:host mat-form-field{width:100%}::ng-deep .mat-select-panel.mat-select-search-table-panel{overflow-x:auto!important}::ng-deep .mat-select-panel.mat-select-search-table-panel .overall-search-toggle{z-index:102;position:absolute;left:13px;top:17px;cursor:pointer}::ng-deep .mat-select-panel.mat-select-search-table-panel ngx-mat-select-search{position:absolute;z-index:101}::ng-deep .mat-select-panel.mat-select-search-table-panel ngx-mat-select-search.hidden{display:none}::ng-deep .mat-select-panel.mat-select-search-table-panel ngx-mat-select-search .mat-select-search-inner{height:56px}::ng-deep .mat-select-panel.mat-select-search-table-panel ngx-mat-select-search .mat-select-search-inner .mat-select-search-input{margin-left:26px;width:calc(100% - 26px)}::ng-deep .mat-select-panel.mat-select-search-table-panel table{width:100%}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr{cursor:pointer;height:48px;max-height:48px}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr mat-option{height:48px;max-height:48px}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr.active{background:rgba(0,0,0,.04)}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr td{-webkit-user-select:none;-moz-user-select:none;user-select:none;border-bottom:0!important;box-shadow:inset 0 -1px 0 0 rgba(0,0,0,.12)}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th ::ng-deep .mat-sort-header-container{height:55px}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th ::ng-deep .mat-sort-header-container mat-form-field .mat-form-field-infix{width:initial}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th[aria-sort] ::ng-deep .mat-sort-header-arrow{opacity:1!important}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr td mat-option,::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th mat-option{background:0 0!important}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr td.selection,::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th.selection{width:56px;padding:0;margin:0}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr td.selection.hidden mat-option,::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th.selection.hidden mat-option{visibility:hidden}"]
        })
    ], MatSelectTableComponent);
    return MatSelectTableComponent;
}());
export { MatSelectTableComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0LXNlbGVjdC10YWJsZS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9uZ3gtbWF0LXNlbGVjdC10YWJsZS8iLCJzb3VyY2VzIjpbIm1hdC1zZWxlY3QtdGFibGUuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQ0wsYUFBYSxFQUNiLHVCQUF1QixFQUN2QixpQkFBaUIsRUFDakIsU0FBUyxFQUNULFVBQVUsRUFDVixZQUFZLEVBQ1osVUFBVSxFQUNWLEtBQUssRUFDTCxTQUFTLEVBQ1QsU0FBUyxFQUNULE1BQU0sRUFDTixNQUFNLEVBQ04sU0FBUyxFQUNULGFBQWEsRUFDYixTQUFTLEVBQ1QsWUFBWSxFQUNiLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBdUIsV0FBVyxFQUFFLFNBQVMsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQy9GLE9BQU8sRUFBQyxLQUFLLEVBQUUsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ3BDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUVuRCxPQUFPLEVBQUUsT0FBTyxFQUF1QixNQUFNLHdCQUF3QixDQUFDO0FBQ3RFLE9BQU8sRUFBRSxRQUFRLEVBQXNCLE1BQU0seUJBQXlCLENBQUM7QUFDdkUsT0FBTyxFQUFDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBR3BFLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUNyRCxPQUFPLEVBQUMsWUFBWSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUc3RCxPQUFPLEVBQUMsd0JBQXdCLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUUvRCxJQUFNLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDO0FBZ0IxQztJQW9IRSxpQ0FBb0IsRUFBcUI7UUFBckIsT0FB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LEVBQUUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQzs2REFBOEI7SUFFNUQ7UUFBeEIsWUFBWSxDQUFDLFNBQVMsQ0FBQzsrREFBMEM7SUE5RXZELHVCQUF1QjtRQWRuQyxTQUFTLENBQUM7WUFDVCxRQUFRLEVBQUUsc0JBQXNCO1lBQ2hDLGlySkFBZ0Q7WUFFaEQsUUFBUSxFQUFFLHNCQUFzQjtZQUNoQyxlQUFlLEVBQUUsdUJBQXVCLENBQUMsTUFBTTtZQUMvQyxTQUFTLEVBQUU7Z0JBQ1Q7b0JBQ0UsT0FBTyxFQUFFLGlCQUFpQjtvQkFDMUIsV0FBVyxFQUFFLFVBQVUsQ0FBQyxjQUFNLE9BQUEseUJBQXVCLEVBQXZCLENBQXVCLENBQUM7b0JBQ3RELEtBQUssRUFBRSxJQUFJO2lCQUNaO2FBQ0Y7O1NBQ0YsQ0FBQztPQUNXLHVCQUF1QixDQTBwQm5DO0lBQUQsOEJBQUM7Q0FBQSxBQTFwQkQsSUEwcEJDO1NBMXBCWSx1QkFBdUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xyXG4gIEFmdGVyVmlld0luaXQsXHJcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXHJcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXHJcbiAgQ29tcG9uZW50LFxyXG4gIEVsZW1lbnRSZWYsXHJcbiAgRXZlbnRFbWl0dGVyLFxyXG4gIGZvcndhcmRSZWYsXHJcbiAgSW5wdXQsXHJcbiAgT25DaGFuZ2VzLFxyXG4gIE9uRGVzdHJveSxcclxuICBPbkluaXQsXHJcbiAgT3V0cHV0LFxyXG4gIFF1ZXJ5TGlzdCxcclxuICBTaW1wbGVDaGFuZ2VzLFxyXG4gIFZpZXdDaGlsZCxcclxuICBWaWV3Q2hpbGRyZW5cclxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHtDb250cm9sVmFsdWVBY2Nlc3NvciwgRm9ybUNvbnRyb2wsIEZvcm1Hcm91cCwgTkdfVkFMVUVfQUNDRVNTT1J9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcclxuaW1wb3J0IHttZXJnZSwgU3ViamVjdH0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7IE1hdE9wdGlvbiB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2NvcmUnO1xuaW1wb3J0IHsgTWF0U2VsZWN0IH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvc2VsZWN0JztcbmltcG9ydCB7IE1hdFNvcnQsIFNvcnQsIFNvcnREaXJlY3Rpb24gfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9zb3J0JztcbmltcG9ydCB7IE1hdFRhYmxlLCBNYXRUYWJsZURhdGFTb3VyY2UgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC90YWJsZSc7XHJcbmltcG9ydCB7aXNBcnJheSwgaXNOdWxsT3JVbmRlZmluZWQsIGlzTnVtYmVyLCBpc1N0cmluZ30gZnJvbSAndXRpbCc7XHJcbmltcG9ydCB7TWF0U2VsZWN0VGFibGVEYXRhU291cmNlfSBmcm9tICcuL01hdFNlbGVjdFRhYmxlRGF0YVNvdXJjZSc7XHJcbmltcG9ydCB7TWF0U2VsZWN0VGFibGVSb3d9IGZyb20gJy4vTWF0U2VsZWN0VGFibGVSb3cnO1xyXG5pbXBvcnQge19pc051bWJlclZhbHVlfSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xyXG5pbXBvcnQge2RlYm91bmNlVGltZSwgdGFrZSwgdGFrZVVudGlsfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XHJcbmltcG9ydCB7TWF0U2VsZWN0VGFibGVDb2x1bW59IGZyb20gJy4vTWF0U2VsZWN0VGFibGVDb2x1bW4nO1xyXG5pbXBvcnQge01hdFNlbGVjdFRhYmxlRmlsdGVyfSBmcm9tICcuL01hdFNlbGVjdFRhYmxlRmlsdGVyJztcclxuaW1wb3J0IHtNYXRTZWxlY3RTZWFyY2hDb21wb25lbnR9IGZyb20gJ25neC1tYXQtc2VsZWN0LXNlYXJjaCc7XHJcblxyXG5jb25zdCBNQVhfU0FGRV9JTlRFR0VSID0gOTAwNzE5OTI1NDc0MDk5MTtcclxuXHJcbkBDb21wb25lbnQoe1xyXG4gIHNlbGVjdG9yOiAnbmd4LW1hdC1zZWxlY3QtdGFibGUnLFxyXG4gIHRlbXBsYXRlVXJsOiAnLi9tYXQtc2VsZWN0LXRhYmxlLmNvbXBvbmVudC5odG1sJyxcclxuICBzdHlsZVVybHM6IFsnLi9tYXQtc2VsZWN0LXRhYmxlLmNvbXBvbmVudC5zY3NzJ10sXHJcbiAgZXhwb3J0QXM6ICduZ3gtbWF0LXNlbGVjdC10YWJsZScsXHJcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXHJcbiAgcHJvdmlkZXJzOiBbXHJcbiAgICB7XHJcbiAgICAgIHByb3ZpZGU6IE5HX1ZBTFVFX0FDQ0VTU09SLFxyXG4gICAgICB1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBNYXRTZWxlY3RUYWJsZUNvbXBvbmVudCksXHJcbiAgICAgIG11bHRpOiB0cnVlXHJcbiAgICB9XHJcbiAgXVxyXG59KVxyXG5leHBvcnQgY2xhc3MgTWF0U2VsZWN0VGFibGVDb21wb25lbnQgaW1wbGVtZW50cyBDb250cm9sVmFsdWVBY2Nlc3NvciwgT25Jbml0LCBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3ksIE9uQ2hhbmdlcyB7XHJcblxyXG4gIC8qKiBEYXRhIFNvdXJjZSBmb3IgdGhlIHRhYmxlICovXHJcbiAgQElucHV0KCkgZGF0YVNvdXJjZTogTWF0U2VsZWN0VGFibGVEYXRhU291cmNlPE1hdFNlbGVjdFRhYmxlUm93PjtcclxuXHJcbiAgLyoqXHJcbiAgICogTXVsdGlwbGUvU2luZ2xlIG1vZGUgZm9yIHtAc2VlIE1hdFNlbGVjdCNtdWx0aXBsZX0gdG8gaW5pdGlhbGl6ZS5cclxuICAgKiBOQjogc3dpdGNoaW5nIGJldHdlZW4gbW9kZXMgaW4gcnVudGltZSBpcyBub3Qgc3VwcG9ydGVkIGJ5IHtAc2VlIE1hdFNlbGVjdH1cclxuICAgKi9cclxuICBASW5wdXQoKSBtdWx0aXBsZTogYm9vbGVhbjtcclxuXHJcbiAgLyoqIFdoZXRoZXIgb3Igbm90IG92ZXJhbGwgc2VhcmNoIG1vZGUgZW5hYmxlZC4gU2VlIHtAc2VlIE1hdFNlbGVjdFRhYmxlQ29tcG9uZW50fSAqL1xyXG4gIEBJbnB1dCgpIG92ZXJhbGxTZWFyY2hFbmFibGVkOiBib29sZWFuO1xyXG5cclxuICAvKiogRGVmYXVsdCBpcyB0cnVlICovXHJcbiAgQElucHV0KCkgb3ZlcmFsbFNlYXJjaFZpc2libGU6IGJvb2xlYW47XHJcblxyXG4gIC8qKiBXaGV0aGVyIG9yIG5vdCBzaG91bGQge0BzZWUgTWF0U2VsZWN0VGFibGVDb21wb25lbnR9IGJlIHZpc2libGUgb24gb3Blbi4gRGVmYXVsdCBpcyB0cnVlICovXHJcbiAgQElucHV0KCkgcmVzZXRTb3J0T25PcGVuOiBib29sZWFuO1xyXG5cclxuICAvKiogV2hldGhlciBvciBub3QgcHJldmlvdXMgc2VhcmNoIHNob3VsZCBiZSBjbGVhcmVkIG9uIG9wZW4uIERlZmF1bHQgaXMgdHJ1ZSAqL1xyXG4gIEBJbnB1dCgpIHJlc2V0RmlsdGVyc09uT3BlbjogYm9vbGVhbjtcclxuXHJcbiAgLyoqXHJcbiAgICogRnVuY3Rpb24gdG8gY3VzdG9taXplIHRoZSBkZWZhdWx0IGxhYmVsXHJcbiAgICovXHJcbiAgQElucHV0KCkgY3VzdG9tVHJpZ2dlckxhYmVsRm46ICh2YWx1ZTogTWF0U2VsZWN0VGFibGVSb3dbXSkgPT4gc3RyaW5nO1xyXG5cclxuICAvKipcclxuICAgKiBTb3J0IG9wdGlvbiBmb3IgdmFsdWVzIGluIHRoZSBjdXN0b21UcmlnZ2VyTGFiZWxGbiBpbiBNdWx0aXBsZSBtb2RlLlxyXG4gICAqL1xyXG4gIEBJbnB1dCgpIHRyaWdnZXJMYWJlbFNvcnQ6IFNvcnQ7XHJcblxyXG4gIC8qKlxyXG4gICAqIFRlbXBsYXRlIHRvIGN1c3RvbWl6ZSB0aGUgZGVmYXVsdCB0cmlnZ2VyIGxhYmVsLiBIYXMgbGVzc2VyIHByaW9yaXR5IHRoYW4ge0BzZWUgTWF0U2VsZWN0VGFibGVDb21wb25lbnQjY3VzdG9tVHJpZ2dlckxhYmVsRm59LlxyXG4gICAqIFN1YnN0aXR1dGlvbiBpcyBjYXNlIHNlbnNpdGl2ZS5cclxuICAgKiBFeGFtcGxlOiAke25hbWV9ICR7aWR9IC0gJHthZGRyZXNzfVxyXG4gICAqL1xyXG4gIEBJbnB1dCgpIGN1c3RvbVRyaWdnZXJMYWJlbFRlbXBsYXRlOiBzdHJpbmc7XHJcblxyXG4gIEBJbnB1dCgpIGxhYmVsRm9yTnVsbFZhbHVlOiBzdHJpbmc7XHJcbiAgcHJpdmF0ZSBudWxsUm93OiBNYXRTZWxlY3RUYWJsZVJvdyA9IHtpZDogbnVsbH07XHJcblxyXG4gIC8qKlxyXG4gICAqIHtAc2VlIE1hdFNlbGVjdH0gcHJveHkgaW5wdXRzIGNvbmZpZ3VyYXRvclxyXG4gICAqIHtAc2VlIE1hdFNlbGVjdCNtdWx0aXBsZX0gZ2V0cyB2YWx1ZSBmcm9tIHtAc2VlIE1hdFNlbGVjdFRhYmxlQ29tcG9uZW50I211bHRpcGxlfVxyXG4gICAqL1xyXG4gIEBJbnB1dCgpIG1hdFNlbGVjdENvbmZpZ3VyYXRvcjogeyBba2V5OiBzdHJpbmddOiBhbnkgfTtcclxuXHJcbiAgLyoqXHJcbiAgICoge0BzZWUgTWF0U2VsZWN0U2VhcmNoQ29tcG9uZW50fSBwcm94eSBpbnB1dHMgY29uZmlndXJhdG9yXHJcbiAgICoge0BzZWUgTWF0U2VsZWN0U2VhcmNoQ29tcG9uZW50I2NsZWFyU2VhcmNoSW5wdXR9IGdldHMgdmFsdWUgZnJvbSB7QHNlZSBNYXRTZWxlY3RUYWJsZUNvbXBvbmVudCNyZXNldEZpbHRlcnNPbk9wZW59XHJcbiAgICoge0BzZWUgTWF0U2VsZWN0U2VhcmNoQ29tcG9uZW50fSB7QHNlZSBDb250cm9sVmFsdWVBY2Nlc3Nvcn0gZ2V0cyB2YWx1ZSBmcm9tIHtAc2VlIE1hdFNlbGVjdFRhYmxlQ29tcG9uZW50I292ZXJhbGxGaWx0ZXJDb250cm9sfVxyXG4gICAqL1xyXG4gIEBJbnB1dCgpIG1hdFNlbGVjdFNlYXJjaENvbmZpZ3VyYXRvcjogeyBba2V5OiBzdHJpbmddOiBhbnkgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQXBwbHkgZGVmYXVsdCBzb3J0aW5nXHJcbiAgICovXHJcbiAgQElucHV0KCkgZGVmYXVsdFNvcnQ6IFNvcnQ7XHJcbiAgXHJcbiAgLyoqXHJcbiAgICogQWN0aW9uIGZvciAnQWxsJyBvcHRpb24uXHJcbiAgICovXHJcbiAgQElucHV0KCkgcmVzZXRPcHRpb25BY3Rpb246ICgpID0+IHZvaWQ7XHJcblxyXG4gIEBPdXRwdXQoKSBjbG9zZTogRXZlbnRFbWl0dGVyPGJvb2xlYW4+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG5cclxuICBAVmlld0NoaWxkKCdjb21wb25lbnRTZWxlY3QnLCB7IHN0YXRpYzogdHJ1ZSB9KSBwcml2YXRlIG1hdFNlbGVjdDogTWF0U2VsZWN0O1xyXG5cclxuICBAVmlld0NoaWxkKE1hdFNlbGVjdFNlYXJjaENvbXBvbmVudCwgeyBzdGF0aWM6IGZhbHNlIH0pIHByaXZhdGUgbWF0U2VsZWN0U2VhcmNoOiBNYXRTZWxlY3RTZWFyY2hDb21wb25lbnQ7XHJcblxyXG4gIEBWaWV3Q2hpbGQoTWF0U29ydCwgeyBzdGF0aWM6IHRydWUgfSkgcHJpdmF0ZSBzb3J0OiBNYXRTb3J0O1xyXG5cclxuICBAVmlld0NoaWxkKE1hdFRhYmxlLCB7IHN0YXRpYzogdHJ1ZSB9KSBwcml2YXRlIHRhYmxlOiBNYXRUYWJsZTxNYXRTZWxlY3RUYWJsZVJvdz47XHJcblxyXG4gIEBWaWV3Q2hpbGQoJ3RhYmxlJywgeyByZWFkOiBFbGVtZW50UmVmLCBzdGF0aWM6IHRydWUgfSkgcHJpdmF0ZSB0YWJsZVJlZjogRWxlbWVudFJlZjtcclxuXHJcbiAgQFZpZXdDaGlsZHJlbihNYXRPcHRpb24pIHByaXZhdGUgbWF0T3B0aW9uczogUXVlcnlMaXN0PE1hdE9wdGlvbj47XHJcblxyXG4gIHRhYmxlRGF0YVNvdXJjZTogTWF0U2VsZWN0VGFibGVSb3dbXTtcclxuXHJcbiAgdGFibGVDb2x1bW5zOiBzdHJpbmdbXTtcclxuXHJcbiAgdGFibGVDb2x1bW5zTWFwOiBNYXA8c3RyaW5nLCBNYXRTZWxlY3RUYWJsZUNvbHVtbj47XHJcblxyXG4gIHRhYmxlQWN0aXZlUm93OiBudW1iZXI7XHJcblxyXG4gIGZpbHRlcmVkT3V0Um93czogeyBba2V5OiBzdHJpbmddOiBNYXRTZWxlY3RUYWJsZVJvdyB9O1xyXG5cclxuICBjb21wbGV0ZVJvd0xpc3Q6IE1hdFNlbGVjdFRhYmxlUm93W10gPSBbXTtcclxuXHJcbiAgb3ZlcmFsbFNlYXJjaFZpc2libGVTdGF0ZTogYm9vbGVhbjtcclxuXHJcbiAgb3ZlcmFsbEZpbHRlckNvbnRyb2w6IEZvcm1Db250cm9sO1xyXG5cclxuICBwcml2YXRlIGZpbHRlckNvbnRyb2xzOiBGb3JtR3JvdXA7XHJcblxyXG4gIHByaXZhdGUgY29tcGxldGVWYWx1ZUxpc3Q6IGFueVtdID0gW107XHJcblxyXG4gIHByaXZhdGUgY29udHJvbFZhbHVlQWNjZXNzb3JLZXlzOiBzdHJpbmdbXSA9IFtcclxuICAgICdmb3JtQ29udHJvbCcsXHJcbiAgICAnZm9ybUNvbnRyb2xOYW1lJyxcclxuICAgICdmb3JtR3JvdXAnLFxyXG4gICAgJ2Zvcm1Hcm91cE5hbWUnLFxyXG4gICAgJ2Zvcm1BcnJheScsXHJcbiAgICAnZm9ybUFycmF5TmFtZSdcclxuICBdO1xyXG5cclxuICAvKiogU3ViamVjdCB0aGF0IGVtaXRzIHdoZW4gdGhlIGNvbXBvbmVudCBoYXMgYmVlbiBkZXN0cm95ZWQuICovXHJcbiAgcHJpdmF0ZSBfb25EZXN0cm95ID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcclxuXHJcbiAgcHJpdmF0ZSBfb25TZWxlY3RPcGVuID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcclxuXHJcbiAgcHJpdmF0ZSBfb25PcHRpb25zQ2hhbmdlID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcclxuXHJcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBjZDogQ2hhbmdlRGV0ZWN0b3JSZWYpIHtcclxuICAgIHRoaXMudGFibGVDb2x1bW5zTWFwID0gbmV3IE1hcCgpO1xyXG4gICAgdGhpcy5maWx0ZXJDb250cm9scyA9IG5ldyBGb3JtR3JvdXAoe30pO1xyXG4gICAgdGhpcy5vdmVyYWxsRmlsdGVyQ29udHJvbCA9IG5ldyBGb3JtQ29udHJvbCgnJyk7XHJcbiAgfVxyXG5cclxuICBuZ09uSW5pdCgpOiB2b2lkIHtcclxuICAgIHRoaXMubXVsdGlwbGUgPSB0aGlzLm11bHRpcGxlIHx8IGZhbHNlO1xyXG4gICAgdGhpcy5tYXRTZWxlY3Qub3BlbmVkQ2hhbmdlXHJcbiAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLl9vbkRlc3Ryb3kpKVxyXG4gICAgICAuc3Vic2NyaWJlKG9wZW5lZCA9PiB7XHJcbiAgICAgICAgaWYgKHRoaXMucmVzZXRGaWx0ZXJzT25PcGVuICE9PSBmYWxzZSB8fCAhdGhpcy5tYXRPcHRpb25zLmxlbmd0aCkge1xyXG4gICAgICAgICAgdGhpcy5yZXNldEZpbHRlcnMoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5vdmVyYWxsU2VhcmNoVmlzaWJsZVN0YXRlID0gdGhpcy5vdmVyYWxsU2VhcmNoVmlzaWJsZTtcclxuICAgICAgICBpZiAodGhpcy5yZXNldFNvcnRPbk9wZW4gIT09IGZhbHNlKSB7XHJcbiAgICAgICAgICB0aGlzLnNvcnQuc29ydCh7aWQ6ICcnLCBzdGFydDogJ2FzYycsIGRpc2FibGVDbGVhcjogZmFsc2V9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFvcGVuZWQpIHtcclxuICAgICAgICAgIHRoaXMuY2xvc2UuZW1pdCghb3BlbmVkKTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMub3ZlcmFsbFNlYXJjaEVuYWJsZWQpIHtcclxuICAgICAgICAgIHRoaXMucHJveHlNYXRTZWxlY3RTZWFyY2hDb25maWd1cmF0aW9uKHRoaXMubWF0U2VsZWN0U2VhcmNoQ29uZmlndXJhdG9yKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gVG9EbzogZ2V0IHJpZCBvZiB0aGlzIHdvcmthcm91bmQgKHVwZGF0ZXMgaGVhZGVyIHJvdyBbb3RoZXJ3aXNlIHNvcnQgbWVjaGFuaXNtIHByb2R1Y2VzIGdsaXRjaGVzXSlcclxuICAgICAgICAodGhpcy50YWJsZSBhcyBhbnkpLl9oZWFkZXJSb3dEZWZDaGFuZ2VkID0gdHJ1ZTtcclxuICAgICAgICAvLyBEaXNhYmxlIHNvcnQgYnV0dG9ucyB0byBwcmV2ZW50IHNvcnRpbmcgY2hhbmdlIG9uIFNQQUNFIGtleSBwcmVzc2VkIGluIGZpbHRlciBmaWVsZFxyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4gW10uZm9yRWFjaC5jYWxsKFxyXG4gICAgICAgICAgdGhpcy50YWJsZVJlZi5uYXRpdmVFbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2J1dHRvbi5tYXQtc29ydC1oZWFkZXItYnV0dG9uJyksXHJcbiAgICAgICAgICAoZSkgPT4gZS5kaXNhYmxlZCA9IHRydWUpXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgLy8gUGF0Y2ggdGhlIGhlaWdodCBvZiB0aGUgcGFuZWwgdG8gaW5jbHVkZSB0aGUgaGVpZ2h0IG9mIHRoZSBoZWFkZXIgYW5kIGZvb3RlclxyXG4gICAgICAgIGNvbnN0IHBhbmVsRWxlbWVudDogSFRNTERpdkVsZW1lbnQgPSB0aGlzLm1hdFNlbGVjdC5wYW5lbC5uYXRpdmVFbGVtZW50O1xyXG4gICAgICAgIGNvbnN0IHBhbmVsSGVpZ2h0ID0gcGFuZWxFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodDtcclxuICAgICAgICBsZXQgdGFibGVBZGRpdGlvbmFsSGVpZ2h0ID0gMDtcclxuICAgICAgICB0aGlzLnRhYmxlXHJcbiAgICAgICAgICAuX2dldFJlbmRlcmVkUm93cyh0aGlzLnRhYmxlLl9oZWFkZXJSb3dPdXRsZXQpXHJcbiAgICAgICAgICAuY29uY2F0KHRoaXMudGFibGUuX2dldFJlbmRlcmVkUm93cyh0aGlzLnRhYmxlLl9mb290ZXJSb3dPdXRsZXQpKVxyXG4gICAgICAgICAgLmZvckVhY2gocm93ID0+IHRhYmxlQWRkaXRpb25hbEhlaWdodCArPSByb3cuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0KTtcclxuICAgICAgICBpZiAoIWlzTmFOKHBhbmVsSGVpZ2h0KSkge1xyXG4gICAgICAgICAgcGFuZWxFbGVtZW50LnN0eWxlLm1heEhlaWdodCA9IGAke3BhbmVsSGVpZ2h0ICsgdGFibGVBZGRpdGlvbmFsSGVpZ2h0fXB4YDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5tYXRTZWxlY3RTZWFyY2hDb25maWd1cmF0b3IuZGlzYWJsZVNjcm9sbFRvQWN0aXZlT25PcHRpb25zQ2hhbmdlZFxyXG4gICAgICAgICAgJiYgIWlzTnVsbE9yVW5kZWZpbmVkKHRoaXMubWF0U2VsZWN0Ll9rZXlNYW5hZ2VyKSAmJiB0aGlzLmNvbXBsZXRlUm93TGlzdC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICB0aGlzLl9vblNlbGVjdE9wZW4ucGlwZSh0YWtlVW50aWwodGhpcy5fb25EZXN0cm95KSwgZGVib3VuY2VUaW1lKDEpLCB0YWtlKDEpKS5zdWJzY3JpYmUoKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBmaXJzdFZhbHVlID0gYCR7dGhpcy5jb21wbGV0ZVJvd0xpc3RbMF0uaWR9YDtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnRhYmxlRGF0YVNvdXJjZS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgIGlmIChgJHt0aGlzLnRhYmxlRGF0YVNvdXJjZVtpXS5pZH1gID09PSBmaXJzdFZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1hdFNlbGVjdC5fa2V5TWFuYWdlci5zZXRBY3RpdmVJdGVtKGkpO1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgdGhpcy5jZC5kZXRlY3RDaGFuZ2VzKCk7XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChpZ25vcmVkKSB7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblx0ICBcclxuXHQgIHRoaXMubWF0U2VsZWN0LnZhbHVlQ2hhbmdlXHRcclxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX29uRGVzdHJveSkpXHRcclxuICAgICAgLnN1YnNjcmliZSgodmFsdWUpID0+IHtcdFxyXG4gICAgICAgIGlmICghdGhpcy5tdWx0aXBsZSkge1x0XHJcbiAgICAgICAgICByZXR1cm47XHRcclxuICAgICAgICB9XHRcclxuICAgICAgICBpZiAoaXNBcnJheSh2YWx1ZSkgJiYgdmFsdWUubGVuZ3RoID4gMSAmJiB2YWx1ZS5zb21lKHYgPT4gdiA9PT0gJycpKSB7XHRcclxuICAgICAgICAgIHRoaXMud3JpdGVWYWx1ZSh2YWx1ZS5maWx0ZXIodiA9PiB2ICE9PSAnJykpO1x0XHJcbiAgICAgICAgICB0cnkge1x0XHJcbiAgICAgICAgICAgIHRoaXMuY2QuZGV0ZWN0Q2hhbmdlcygpO1x0XHJcbiAgICAgICAgICB9IGNhdGNoIChpZ25vcmVkKSB7XHRcclxuICAgICAgICAgIH1cdFxyXG4gICAgICAgIH1cdFxyXG4gICAgICAgIGlmIChpc0FycmF5KHZhbHVlKSAmJiB2YWx1ZS5sZW5ndGggPT09IDApIHtcdFxyXG4gICAgICAgICAgdGhpcy5jaGVja0FuZFJlc2V0U2VsZWN0aW9uKCk7XHRcclxuICAgICAgICB9XHRcclxuICAgICAgfSk7XHJcbiAgfVxyXG5cclxuICBuZ0FmdGVyVmlld0luaXQoKTogdm9pZCB7XHJcbiAgICBtZXJnZSguLi5bXHJcbiAgICAgIHRoaXMuX29uT3B0aW9uc0NoYW5nZSxcclxuICAgICAgdGhpcy5zb3J0LnNvcnRDaGFuZ2UsXHJcbiAgICAgIHRoaXMuZmlsdGVyQ29udHJvbHMudmFsdWVDaGFuZ2VzLFxyXG4gICAgICB0aGlzLm92ZXJhbGxGaWx0ZXJDb250cm9sLnZhbHVlQ2hhbmdlc1xyXG4gICAgXSlcclxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX29uRGVzdHJveSksIGRlYm91bmNlVGltZSgxMDApKVxyXG4gICAgICAuc3Vic2NyaWJlKCgpID0+IHtcclxuICAgICAgICBjb25zdCBkYXRhQ2xvbmU6IE1hdFNlbGVjdFRhYmxlUm93W10gPSBbLi4uKCh0aGlzLmRhdGFTb3VyY2UgfHwge2RhdGE6IFtdfSkuZGF0YSB8fCBbXSldO1xyXG4gICAgICAgIGlmICh0aGlzLmFkZE51bGxSb3coKSkge1xyXG4gICAgICAgICAgZGF0YUNsb25lLnVuc2hpZnQodGhpcy5udWxsUm93KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEFwcGx5IGZpbHRlcmluZ1xyXG4gICAgICAgIGlmICh0aGlzLm92ZXJhbGxTZWFyY2hFbmFibGVkICYmIHRoaXMub3ZlcmFsbFNlYXJjaFZpc2libGVTdGF0ZSkge1xyXG4gICAgICAgICAgdGhpcy5hcHBseU92ZXJhbGxGaWx0ZXIoZGF0YUNsb25lKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5hcHBseUNvbHVtbkxldmVsRmlsdGVycyhkYXRhQ2xvbmUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSW5oZXJpdCBkZWZhdWx0IHNvcnRpbmcgb3B0aW9ucyBpZiBzb3J0IG5vdCBzcGVjaWZpZWRcclxuICAgICAgICBpZiAoIXRoaXMuc29ydC5hY3RpdmUgJiYgIWlzTnVsbE9yVW5kZWZpbmVkKHRoaXMuZGVmYXVsdFNvcnQpICYmIHRoaXMuZGVmYXVsdFNvcnQuYWN0aXZlKSB7XHJcbiAgICAgICAgICB0aGlzLnNvcnQuYWN0aXZlID0gdGhpcy5kZWZhdWx0U29ydC5hY3RpdmU7XHJcbiAgICAgICAgICB0aGlzLnNvcnQuZGlyZWN0aW9uID0gdGhpcy5kZWZhdWx0U29ydC5kaXJlY3Rpb247XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBBcHBseSBkZWZhdWx0IG9yIG1hbnVhbCBzb3J0aW5nXHJcbiAgICAgICAgdGhpcy50YWJsZURhdGFTb3VyY2UgPSAhdGhpcy5zb3J0LmFjdGl2ZSA/XHJcbiAgICAgICAgICBkYXRhQ2xvbmUgOiB0aGlzLnNvcnREYXRhKGRhdGFDbG9uZSwgdGhpcy5zb3J0LmFjdGl2ZSwgdGhpcy5zb3J0LmRpcmVjdGlvbik7XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICB0aGlzLmNkLmRldGVjdENoYW5nZXMoKTtcclxuICAgICAgICB9IGNhdGNoIChpZ25vcmVkKSB7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9vblNlbGVjdE9wZW4ubmV4dCgpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAvLyBNYW51YWxseSBzb3J0IGRhdGEgZm9yIHRoaXMubWF0U2VsZWN0Lm9wdGlvbnMgKFF1ZXJ5TGlzdDxNYXRPcHRpb24+KSBhbmQgbm90aWZ5IG1hdFNlbGVjdC5vcHRpb25zIG9mIGNoYW5nZXNcclxuICAgIC8vIEl0J3MgaW1wb3J0YW50IHRvIGtlZXAgdGhpcy5tYXRTZWxlY3Qub3B0aW9ucyBvcmRlciBzeW5jaHJvbml6ZWQgd2l0aCBkYXRhIGluIHRoZSB0YWJsZVxyXG4gICAgLy8gICAgIGJlY2F1c2UgdGhpcy5tYXRTZWxlY3Qub3B0aW9ucyAoUXVlcnlMaXN0PE1hdE9wdGlvbj4pIGRvZXNuJ3QgdXBkYXRlIGl0J3Mgc3RhdGUgYWZ0ZXIgdGFibGUgZGF0YSBpcyBjaGFuZ2VkXHJcbiAgICB0aGlzLm1hdE9wdGlvbnMuY2hhbmdlcy5zdWJzY3JpYmUoKCkgPT4ge1xyXG4gICAgICBjb25zdCBvcHRpb25zOiB7IFtrZXk6IHN0cmluZ106IE1hdE9wdGlvbiB9ID0ge307XHJcbiAgICAgIHRoaXMubWF0T3B0aW9ucy50b0FycmF5KClcclxuICAgICAgICAuZmlsdGVyKG9wdGlvbiA9PiAhaXNOdWxsT3JVbmRlZmluZWQob3B0aW9uKSlcclxuICAgICAgICAuZm9yRWFjaChvcHRpb24gPT4gb3B0aW9uc1tgJHtvcHRpb24udmFsdWV9YF0gPSBvcHRpb24pO1xyXG4gICAgICB0aGlzLm1hdFNlbGVjdC5vcHRpb25zLnJlc2V0KHRoaXMudGFibGVEYXRhU291cmNlXHJcbiAgICAgICAgLmZpbHRlcihyb3cgPT4gIWlzTnVsbE9yVW5kZWZpbmVkKG9wdGlvbnNbYCR7cm93LmlkfWBdKSlcclxuICAgICAgICAubWFwKHJvdyA9PiBvcHRpb25zW2Ake3Jvdy5pZH1gXSkpO1xyXG4gICAgICB0aGlzLm1hdFNlbGVjdC5vcHRpb25zLm5vdGlmeU9uQ2hhbmdlcygpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKCFpc051bGxPclVuZGVmaW5lZCh0aGlzLm1hdFNlbGVjdC5fa2V5TWFuYWdlcikpIHtcclxuICAgICAgLy8gU3Vic2NyaWJlIG9uIEtleU1hbmFnZXIgY2hhbmdlcyB0byBoaWdobGlnaHQgdGhlIHRhYmxlIHJvd3MgYWNjb3JkaW5nbHlcclxuICAgICAgdGhpcy5tYXRTZWxlY3QuX2tleU1hbmFnZXIuY2hhbmdlXHJcbiAgICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX29uRGVzdHJveSkpXHJcbiAgICAgICAgLnN1YnNjcmliZShhY3RpdmVSb3cgPT4gdGhpcy50YWJsZUFjdGl2ZVJvdyA9IGFjdGl2ZVJvdyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcclxuICAgIHRoaXMuX29uU2VsZWN0T3Blbi5jb21wbGV0ZSgpO1xyXG4gICAgdGhpcy5fb25EZXN0cm95Lm5leHQoKTtcclxuICAgIHRoaXMuX29uRGVzdHJveS5jb21wbGV0ZSgpO1xyXG4gIH1cclxuXHJcbiAgcmVnaXN0ZXJPbkNoYW5nZShmbjogKHZhbHVlOiBhbnkpID0+IHZvaWQpOiB2b2lkIHtcclxuICAgIGNvbnN0IHByb3h5Rm46ICh2YWx1ZTogYW55KSA9PiB2b2lkID0gKHZhbHVlOiBhbnkpID0+IHtcclxuICAgICAgLy8gVG9EbzogcmVmYWN0b3IgLSBjb21wYXJpc29uIG1lY2hhbmlzbSBpc24ndCBvcHRpbWl6ZWQuIGZpbHRlcmVkT3V0Um93cyBpcyBhIG1hcCBidXQgY29tcGxldGVWYWx1ZUxpc3QgaXMgYW4gYXJyYXlcclxuICAgICAgaWYgKHRoaXMubXVsdGlwbGUgPT09IHRydWUpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gdGhpcy5jb21wbGV0ZVZhbHVlTGlzdC5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgaWYgKHRoaXMuZmlsdGVyZWRPdXRSb3dzW2Ake3RoaXMuY29tcGxldGVWYWx1ZUxpc3RbaV19YF0gPT09IHVuZGVmaW5lZCAmJiB2YWx1ZS5pbmRleE9mKHRoaXMuY29tcGxldGVWYWx1ZUxpc3RbaV0pID09PSAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbXBsZXRlVmFsdWVMaXN0LnNwbGljZShpLCAxKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdmFsdWVcclxuICAgICAgICAgIC5maWx0ZXIoY2hvaWNlID0+IHRoaXMuY29tcGxldGVWYWx1ZUxpc3QuaW5kZXhPZihjaG9pY2UpID09PSAtMSlcclxuICAgICAgICAgIC5mb3JFYWNoKGNob2ljZSA9PiB0aGlzLmNvbXBsZXRlVmFsdWVMaXN0LnB1c2goY2hvaWNlKSk7XHJcbiAgICAgICAgdGhpcy5tYXRTZWxlY3QudmFsdWUgPSB0aGlzLmNvbXBsZXRlVmFsdWVMaXN0O1xyXG4gICAgICAgIGZuKHRoaXMuY29tcGxldGVWYWx1ZUxpc3QpO1xyXG4gICAgICAgIHRoaXMuY29tcGxldGVSb3dMaXN0LnNwbGljZSgwKTtcclxuICAgICAgICAoKHRoaXMuZGF0YVNvdXJjZSB8fCB7ZGF0YTogW119KS5kYXRhIHx8IFtdKVxyXG4gICAgICAgICAgLmZpbHRlcihyb3cgPT4gdGhpcy5jb21wbGV0ZVZhbHVlTGlzdC5pbmRleE9mKHJvdy5pZCkgIT09IC0xKVxyXG4gICAgICAgICAgLmZvckVhY2gocm93ID0+IHRoaXMuY29tcGxldGVSb3dMaXN0LnB1c2gocm93KSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZm4odmFsdWUpO1xyXG4gICAgICAgIHRoaXMuY29tcGxldGVSb3dMaXN0LnNwbGljZSgwKTtcclxuICAgICAgICAoKHRoaXMuZGF0YVNvdXJjZSB8fCB7ZGF0YTogW119KS5kYXRhIHx8IFtdKVxyXG4gICAgICAgICAgLmZpbHRlcihyb3cgPT4gcm93LmlkID09PSB2YWx1ZSlcclxuICAgICAgICAgIC5mb3JFYWNoKHJvdyA9PiB0aGlzLmNvbXBsZXRlUm93TGlzdC5wdXNoKHJvdykpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gICAgdGhpcy5tYXRTZWxlY3QucmVnaXN0ZXJPbkNoYW5nZShwcm94eUZuKTtcclxuICB9XHJcblxyXG4gIHJlZ2lzdGVyT25Ub3VjaGVkKGZuOiAoKSA9PiB7fSk6IHZvaWQge1xyXG4gICAgdGhpcy5tYXRTZWxlY3QucmVnaXN0ZXJPblRvdWNoZWQoZm4pO1xyXG4gIH1cclxuXHJcbiAgc2V0RGlzYWJsZWRTdGF0ZShpc0Rpc2FibGVkOiBib29sZWFuKTogdm9pZCB7XHJcbiAgICB0aGlzLm1hdFNlbGVjdC5zZXREaXNhYmxlZFN0YXRlKGlzRGlzYWJsZWQpO1xyXG4gIH1cclxuXHJcbiAgd3JpdGVWYWx1ZSh2YWx1ZTogYW55KTogdm9pZCB7XHJcbiAgICB0aGlzLnVwZGF0ZUNvbXBsZXRlUm93TGlzdCh2YWx1ZSk7XHJcbiAgICB0aGlzLm1hdFNlbGVjdC53cml0ZVZhbHVlKHZhbHVlKTtcclxuICAgIGlmICh0aGlzLm1hdFNlbGVjdC52YWx1ZSAhPT0gdmFsdWUpIHtcclxuICAgICAgdGhpcy5tYXRTZWxlY3QudmFsdWUgPSB2YWx1ZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpOiB2b2lkIHtcclxuXHJcbiAgICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKGNoYW5nZXMucmVzZXRGaWx0ZXJzT25PcGVuKSAmJiBjaGFuZ2VzLnJlc2V0RmlsdGVyc09uT3Blbi5jdXJyZW50VmFsdWUgIT09IGZhbHNlKSB7XHJcbiAgICAgIHRoaXMucmVzZXRGaWx0ZXJzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFpc051bGxPclVuZGVmaW5lZChjaGFuZ2VzLmRhdGFTb3VyY2UpKSB7XHJcbiAgICAgIHRoaXMudXBkYXRlQ29tcGxldGVSb3dMaXN0KHRoaXMuY29tcGxldGVSb3dMaXN0Lm1hcChyb3cgPT4gcm93LmlkKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUHJveHkgQElucHV0IGJpbmRpbmdzIHRvIE1hdFNlbGVjdFxyXG4gICAgaWYgKCFpc051bGxPclVuZGVmaW5lZChjaGFuZ2VzLm1hdFNlbGVjdENvbmZpZ3VyYXRvcikpIHtcclxuICAgICAgY29uc3QgY29uZmlndXJhdGlvbiA9IGNoYW5nZXMubWF0U2VsZWN0Q29uZmlndXJhdG9yLmN1cnJlbnRWYWx1ZTtcclxuICAgICAgT2JqZWN0LmtleXMoY29uZmlndXJhdGlvbilcclxuICAgICAgICAuZmlsdGVyKGtleSA9PiAhWydtdWx0aXBsZScsICdwYW5lbENsYXNzJ10uaW5jbHVkZXMoa2V5KSAmJiAhdGhpcy5jb250cm9sVmFsdWVBY2Nlc3NvcktleXMuaW5jbHVkZXMoa2V5KSlcclxuICAgICAgICAuZm9yRWFjaChrZXkgPT4gdGhpcy5tYXRTZWxlY3Rba2V5XSA9IGNvbmZpZ3VyYXRpb25ba2V5XSk7XHJcbiAgICAgIGNvbnN0IHBhbmVsQ2xhc3M6IHN0cmluZ1tdID0gW107XHJcbiAgICAgIHBhbmVsQ2xhc3MucHVzaCgnbWF0LXNlbGVjdC1zZWFyY2gtdGFibGUtcGFuZWwnKTtcclxuICAgICAgaWYgKCFpc051bGxPclVuZGVmaW5lZChjb25maWd1cmF0aW9uLnBhbmVsQ2xhc3MpKSB7XHJcbiAgICAgICAgcGFuZWxDbGFzcy5wdXNoKGNvbmZpZ3VyYXRpb24ucGFuZWxDbGFzcyk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHRoaXMub3ZlcmFsbFNlYXJjaEVuYWJsZWQpIHtcclxuICAgICAgICBwYW5lbENsYXNzLnB1c2goJ21hdC1zZWxlY3Qtc2VhcmNoLXBhbmVsJyk7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5tYXRTZWxlY3QucGFuZWxDbGFzcyA9IHBhbmVsQ2xhc3M7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFpc051bGxPclVuZGVmaW5lZChjaGFuZ2VzLm1hdFNlbGVjdFNlYXJjaENvbmZpZ3VyYXRvcikpIHtcclxuICAgICAgdGhpcy5wcm94eU1hdFNlbGVjdFNlYXJjaENvbmZpZ3VyYXRpb24oY2hhbmdlcy5tYXRTZWxlY3RTZWFyY2hDb25maWd1cmF0b3IuY3VycmVudFZhbHVlKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKGNoYW5nZXMuZGF0YVNvdXJjZSlcclxuICAgICAgJiYgIWlzTnVsbE9yVW5kZWZpbmVkKGNoYW5nZXMuZGF0YVNvdXJjZS5jdXJyZW50VmFsdWUpXHJcbiAgICAgICYmIGlzQXJyYXkoY2hhbmdlcy5kYXRhU291cmNlLmN1cnJlbnRWYWx1ZS5kYXRhKSkge1xyXG4gICAgICB0aGlzLnRhYmxlRGF0YVNvdXJjZSA9IFsuLi5jaGFuZ2VzLmRhdGFTb3VyY2UuY3VycmVudFZhbHVlLmRhdGFdO1xyXG4gICAgICBpZiAodGhpcy5hZGROdWxsUm93KCkpIHtcclxuICAgICAgICB0aGlzLnRhYmxlRGF0YVNvdXJjZS51bnNoaWZ0KHRoaXMubnVsbFJvdyk7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy50YWJsZUNvbHVtbnMgPSBbJ19zZWxlY3Rpb24nLCAuLi5jaGFuZ2VzLmRhdGFTb3VyY2UuY3VycmVudFZhbHVlLmNvbHVtbnMubWFwKGNvbHVtbiA9PiBjb2x1bW4ua2V5KV07XHJcbiAgICAgIHRoaXMudGFibGVDb2x1bW5zTWFwLmNsZWFyKCk7XHJcbiAgICAgIGNoYW5nZXMuZGF0YVNvdXJjZS5jdXJyZW50VmFsdWUuY29sdW1ucy5mb3JFYWNoKGNvbHVtbiA9PiB0aGlzLnRhYmxlQ29sdW1uc01hcC5zZXQoY29sdW1uLmtleSwgY29sdW1uKSk7XHJcbiAgICAgIHRoaXMuYXBwbHlQcm94eVRvQXJyYXkoY2hhbmdlcy5kYXRhU291cmNlLmN1cnJlbnRWYWx1ZS5kYXRhLCAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5fb25PcHRpb25zQ2hhbmdlLm5leHQoKTtcclxuICAgICAgfSk7XHJcbiAgICAgIHRoaXMuX29uT3B0aW9uc0NoYW5nZS5uZXh0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBlbXVsYXRlTWF0T3B0aW9uQ2xpY2soZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkIHtcclxuICAgIGlmIChldmVudC5jb21wb3NlZFBhdGgoKVxyXG4gICAgICAuZmlsdGVyKGV0ID0+IGV0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpXHJcbiAgICAgIC5zb21lKChldDogSFRNTEVsZW1lbnQpID0+IGV0LnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ21hdC1vcHRpb24nKSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBpZiAoIShldmVudC50YXJnZXQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgbGV0IHJvd0VsZW1lbnQgPSBldmVudC50YXJnZXQ7XHJcbiAgICB3aGlsZSAocm93RWxlbWVudCAhPSBudWxsICYmIHJvd0VsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCAmJiByb3dFbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKSAhPT0gJ3RyJykge1xyXG4gICAgICByb3dFbGVtZW50ID0gcm93RWxlbWVudC5wYXJlbnRFbGVtZW50O1xyXG4gICAgfVxyXG4gICAgaWYgKHJvd0VsZW1lbnQgPT09IG51bGwpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgY29uc3QgY2hpbGRPcHRpb246IEhUTUxFbGVtZW50ID0gcm93RWxlbWVudC5xdWVyeVNlbGVjdG9yKCdtYXQtb3B0aW9uJyk7XHJcbiAgICBpZiAoIWNoaWxkT3B0aW9uKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGNoaWxkT3B0aW9uLmNsaWNrKCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgZmlsdGVyRm9ybUNvbnRyb2woa2V5OiBzdHJpbmcpOiBGb3JtQ29udHJvbCB7XHJcbiAgICBpZiAoIXRoaXMuZmlsdGVyQ29udHJvbHMuY29udGFpbnMoa2V5KSkge1xyXG4gICAgICB0aGlzLmZpbHRlckNvbnRyb2xzLnJlZ2lzdGVyQ29udHJvbChrZXksIG5ldyBGb3JtQ29udHJvbCgnJykpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIDxGb3JtQ29udHJvbD50aGlzLmZpbHRlckNvbnRyb2xzLmdldChrZXkpO1xyXG4gIH1cclxuXHJcbiAgc2ltcGxlVHJpZ2dlckxhYmVsRm4odmFsdWU6IE1hdFNlbGVjdFRhYmxlUm93W10pOiBzdHJpbmcge1xyXG4gICAgaWYgKCFpc051bGxPclVuZGVmaW5lZCh0aGlzLnRyaWdnZXJMYWJlbFNvcnQpKSB7XHJcbiAgICAgIHRoaXMuc29ydERhdGEodmFsdWUsIHRoaXMudHJpZ2dlckxhYmVsU29ydC5hY3RpdmUsIHRoaXMudHJpZ2dlckxhYmVsU29ydC5kaXJlY3Rpb24pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHZhbHVlLm1hcChyb3cgPT4ge1xyXG4gICAgICBpZiAoaXNOdWxsT3JVbmRlZmluZWQocm93KSkge1xyXG4gICAgICAgIHJldHVybiAnJztcclxuICAgICAgfVxyXG4gICAgICBpZiAoaXNOdWxsT3JVbmRlZmluZWQodGhpcy5jdXN0b21UcmlnZ2VyTGFiZWxUZW1wbGF0ZSlcclxuICAgICAgICB8fCB0eXBlb2YgdGhpcy5jdXN0b21UcmlnZ2VyTGFiZWxUZW1wbGF0ZSAhPT0gJ3N0cmluZydcclxuICAgICAgICB8fCB0aGlzLmN1c3RvbVRyaWdnZXJMYWJlbFRlbXBsYXRlLnRyaW0oKS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICByZXR1cm4gYCR7cm93LmlkfWA7XHJcbiAgICAgIH1cclxuICAgICAgbGV0IGF0TGVhc3RQYXJ0aWFsU3Vic3RpdHV0aW9uID0gZmFsc2U7XHJcbiAgICAgIGNvbnN0IHN1YnN0aXR1dGlvbjogc3RyaW5nID0gdGhpcy5jdXN0b21UcmlnZ2VyTGFiZWxUZW1wbGF0ZS5yZXBsYWNlKC9bJF17MX1be117MX0oW159XSspW31dezF9Py9nLCAoXywga2V5KSA9PlxyXG4gICAgICAgICFpc051bGxPclVuZGVmaW5lZChyb3dba2V5XSkgJiYgKGF0TGVhc3RQYXJ0aWFsU3Vic3RpdHV0aW9uID0gdHJ1ZSkgPyByb3dba2V5XSA6ICcnKTtcclxuICAgICAgaWYgKGF0TGVhc3RQYXJ0aWFsU3Vic3RpdHV0aW9uID09PSBmYWxzZSkge1xyXG4gICAgICAgIHJldHVybiBgJHtyb3cuaWR9YDtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gc3Vic3RpdHV0aW9uLnRyaW0oKTtcclxuICAgIH0pLmpvaW4oJywgJyk7XHJcbiAgfVxyXG5cclxuICB0b2dnbGVPdmVyYWxsU2VhcmNoKCk6IHZvaWQge1xyXG4gICAgdGhpcy5vdmVyYWxsU2VhcmNoVmlzaWJsZVN0YXRlID0gIXRoaXMub3ZlcmFsbFNlYXJjaFZpc2libGVTdGF0ZTtcclxuICAgIHRoaXMucmVzZXRGaWx0ZXJzKCk7XHJcbiAgICBpZiAodGhpcy5vdmVyYWxsU2VhcmNoVmlzaWJsZVN0YXRlKSB7XHJcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5tYXRTZWxlY3RTZWFyY2guX2ZvY3VzKCkpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB1cGRhdGVDb21wbGV0ZVJvd0xpc3QodmFsdWU6IGFueVtdKTogdm9pZCB7XHJcbiAgICB0aGlzLmNvbXBsZXRlUm93TGlzdC5zcGxpY2UoMCk7XHJcbiAgICB0aGlzLmNvbXBsZXRlVmFsdWVMaXN0LnNwbGljZSgwKTtcclxuICAgIGlmIChpc051bGxPclVuZGVmaW5lZCh2YWx1ZSkpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgY29uc3QgdmFsdWVBcnJheTogYW55W10gPSAhaXNBcnJheSh2YWx1ZSkgPyBbdmFsdWVdIDogdmFsdWU7XHJcbiAgICB2YWx1ZUFycmF5XHJcbiAgICAgIC5maWx0ZXIodmFsdWVJZCA9PiAhaXNOdWxsT3JVbmRlZmluZWQodmFsdWVJZCkpXHJcbiAgICAgIC5mb3JFYWNoKHZhbHVlSWQgPT4ge1xyXG4gICAgICAgICgodGhpcy5kYXRhU291cmNlIHx8IHtkYXRhOiBbXX0pLmRhdGEgfHwgW10pXHJcbiAgICAgICAgICAuZmlsdGVyKHJvdyA9PiAhaXNOdWxsT3JVbmRlZmluZWQocm93KSAmJiAhaXNOdWxsT3JVbmRlZmluZWQocm93LmlkKSAmJiByb3cuaWQgPT09IHZhbHVlSWQpXHJcbiAgICAgICAgICAuZm9yRWFjaChyb3cgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmNvbXBsZXRlUm93TGlzdC5wdXNoKHJvdyk7XHJcbiAgICAgICAgICAgIHRoaXMuY29tcGxldGVWYWx1ZUxpc3QucHVzaChyb3cuaWQpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBwcm94eU1hdFNlbGVjdFNlYXJjaENvbmZpZ3VyYXRpb24oY29uZmlndXJhdGlvbjogeyBba2V5OiBzdHJpbmddOiBhbnkgfSk6IHZvaWQge1xyXG4gICAgaWYgKGlzTnVsbE9yVW5kZWZpbmVkKHRoaXMubWF0U2VsZWN0U2VhcmNoKSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUHJveHkgQElucHV0IGJpbmRpbmdzIHRvIE5neE1hdFNlbGVjdFNlYXJjaFxyXG4gICAgT2JqZWN0LmtleXMoY29uZmlndXJhdGlvbilcclxuICAgICAgLmZpbHRlcihrZXkgPT4gIVsnY2xlYXJTZWFyY2hJbnB1dCddLmluY2x1ZGVzKGtleSkgJiYgIXRoaXMuY29udHJvbFZhbHVlQWNjZXNzb3JLZXlzLmluY2x1ZGVzKGtleSkpXHJcbiAgICAgIC5mb3JFYWNoKGtleSA9PiB0aGlzLm1hdFNlbGVjdFNlYXJjaFtrZXldID0gY29uZmlndXJhdGlvbltrZXldKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYXBwbHlDb2x1bW5MZXZlbEZpbHRlcnMoZGF0YTogTWF0U2VsZWN0VGFibGVSb3dbXSk6IHZvaWQge1xyXG4gICAgdGhpcy5maWx0ZXJlZE91dFJvd3MgPSB7fTtcclxuICAgIGNvbnN0IGZpbHRlcnM6IHsgW2tleTogc3RyaW5nXTogeyBmaWx0ZXI6IE1hdFNlbGVjdFRhYmxlRmlsdGVyLCB2YWx1ZTogYW55IH0gfSA9IHt9O1xyXG4gICAgT2JqZWN0LmtleXModGhpcy5maWx0ZXJDb250cm9scy5jb250cm9scylcclxuICAgICAgLmZpbHRlcihrZXkgPT4gdGhpcy50YWJsZUNvbHVtbnNNYXAuaGFzKGtleSlcclxuICAgICAgICAmJiAhaXNOdWxsT3JVbmRlZmluZWQodGhpcy50YWJsZUNvbHVtbnNNYXAuZ2V0KGtleSkuZmlsdGVyKVxyXG4gICAgICAgIC8vIElmIGZpbHRlciBpcyBlbmFibGVkXHJcbiAgICAgICAgJiYgdGhpcy50YWJsZUNvbHVtbnNNYXAuZ2V0KGtleSkuZmlsdGVyLmVuYWJsZWQgIT09IGZhbHNlKVxyXG4gICAgICAuZmlsdGVyKGtleSA9PiB7XHJcbiAgICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLmZpbHRlckNvbnRyb2xzLmdldChrZXkpLnZhbHVlO1xyXG4gICAgICAgIHJldHVybiAhaXNOdWxsT3JVbmRlZmluZWQodmFsdWUpXHJcbiAgICAgICAgICAvLyBJZiBhbiBhcnJheSAtIGNoZWNrIGl0J3Mgbm90IGVtcHR5XHJcbiAgICAgICAgICAmJiAoKGlzQXJyYXkodmFsdWUpICYmIHZhbHVlLmxlbmd0aCA+IDApXHJcbiAgICAgICAgICAgIC8vIElmIHN0cmluZyAtIGNoZWNrIHRoYXQgbm90IGJsYW5rXHJcbiAgICAgICAgICAgIHx8ICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHZhbHVlLnRyaW0oKS5sZW5ndGggPiAwKVxyXG4gICAgICAgICAgICAvLyBJZiBudW1iZXIgLSBjaGVjayB0aGF0IHRvU3RyaW5nKCkgaXMgbm90IGJsYW5rXHJcbiAgICAgICAgICAgIHx8ICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmIGAke3ZhbHVlfWAudHJpbSgpLmxlbmd0aCA+IDApKTtcclxuICAgICAgfSlcclxuICAgICAgLmZvckVhY2goa2V5ID0+IGZpbHRlcnNba2V5XSA9IHtcclxuICAgICAgICBmaWx0ZXI6IHRoaXMudGFibGVDb2x1bW5zTWFwLmdldChrZXkpLmZpbHRlcixcclxuICAgICAgICB2YWx1ZTogdGhpcy5maWx0ZXJDb250cm9scy5nZXQoa2V5KS52YWx1ZVxyXG4gICAgICB9KTtcclxuICAgIGNvbnN0IGZpbHRlcktleXM6IHN0cmluZ1tdID0gT2JqZWN0LmtleXMoZmlsdGVycyk7XHJcbiAgICBmb3IgKGxldCBpID0gZGF0YS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICBmb3IgKGxldCBrID0gMDsgayA8IGZpbHRlcktleXMubGVuZ3RoOyBrKyspIHtcclxuICAgICAgICBjb25zdCBmaWx0ZXJLZXk6IHN0cmluZyA9IGZpbHRlcktleXNba107XHJcbiAgICAgICAgY29uc3Qgcm93OiBNYXRTZWxlY3RUYWJsZVJvdyA9IGRhdGFbaV07XHJcbiAgICAgICAgaWYgKGlzTnVsbE9yVW5kZWZpbmVkKHJvdykpIHtcclxuICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBjZWxsVmFsdWU6IGFueSA9IHJvd1tmaWx0ZXJLZXldO1xyXG4gICAgICAgIGlmIChpc051bGxPclVuZGVmaW5lZChjZWxsVmFsdWUpKSB7XHJcbiAgICAgICAgICBkYXRhLnNwbGljZShpLCAxKS5mb3JFYWNoKGl0ZW0gPT4gdGhpcy5maWx0ZXJlZE91dFJvd3NbYCR7aXRlbS5pZH1gXSA9IGl0ZW0pO1xyXG4gICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGZpbHRlciA9IGZpbHRlcnNbZmlsdGVyS2V5XTtcclxuICAgICAgICBjb25zdCBjb21wYXJhdG9yID0gZmlsdGVyLmZpbHRlci5jb21wYXJhdG9yO1xyXG4gICAgICAgIGlmICh0eXBlb2YgZmlsdGVyLmZpbHRlci5jb21wYXJhdG9yRm4gPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgIGlmICghZmlsdGVyLmZpbHRlci5jb21wYXJhdG9yRm4uY2FsbChudWxsLCBjZWxsVmFsdWUsIGZpbHRlci52YWx1ZSwgcm93KSkge1xyXG4gICAgICAgICAgICBkYXRhLnNwbGljZShpLCAxKS5mb3JFYWNoKGl0ZW0gPT4gdGhpcy5maWx0ZXJlZE91dFJvd3NbYCR7aXRlbS5pZH1gXSA9IGl0ZW0pO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKGlzTnVsbE9yVW5kZWZpbmVkKGNvbXBhcmF0b3IpIHx8IGNvbXBhcmF0b3IgPT09ICdlcXVhbHMnKSB7XHJcbiAgICAgICAgICBpZiAoZmlsdGVyLnZhbHVlICE9PSBjZWxsVmFsdWUpIHtcclxuICAgICAgICAgICAgZGF0YS5zcGxpY2UoaSwgMSkuZm9yRWFjaChpdGVtID0+IHRoaXMuZmlsdGVyZWRPdXRSb3dzW2Ake2l0ZW0uaWR9YF0gPSBpdGVtKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgY2VsbFZhbHVlID09PSAnc3RyaW5nJyAmJiB0eXBlb2YgZmlsdGVyLnZhbHVlID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgY29uc3QgY2VsbFZhbHVlTEM6IHN0cmluZyA9IGAke2NlbGxWYWx1ZX1gLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICBjb25zdCBmaWx0ZXJWYWx1ZUxDOiBzdHJpbmcgPSBmaWx0ZXIudmFsdWUudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgIGlmIChpc051bGxPclVuZGVmaW5lZChjb21wYXJhdG9yKSB8fCBjb21wYXJhdG9yID09PSAnZXF1YWxzSWdub3JlQ2FzZScpIHtcclxuICAgICAgICAgICAgaWYgKGZpbHRlclZhbHVlTEMgIT09IGNlbGxWYWx1ZUxDKSB7XHJcbiAgICAgICAgICAgICAgZGF0YS5zcGxpY2UoaSwgMSkuZm9yRWFjaChpdGVtID0+IHRoaXMuZmlsdGVyZWRPdXRSb3dzW2Ake2l0ZW0uaWR9YF0gPSBpdGVtKTtcclxuICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIGlmIChjb21wYXJhdG9yID09PSAnY29udGFpbnMnKSB7XHJcbiAgICAgICAgICAgIGlmIChjZWxsVmFsdWUuaW5kZXhPZihmaWx0ZXIudmFsdWUpID09PSAtMSkge1xyXG4gICAgICAgICAgICAgIGRhdGEuc3BsaWNlKGksIDEpLmZvckVhY2goaXRlbSA9PiB0aGlzLmZpbHRlcmVkT3V0Um93c1tgJHtpdGVtLmlkfWBdID0gaXRlbSk7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSBpZiAoY29tcGFyYXRvciA9PT0gJ2NvbnRhaW5zSWdub3JlQ2FzZScpIHtcclxuICAgICAgICAgICAgaWYgKGNlbGxWYWx1ZUxDLmluZGV4T2YoZmlsdGVyVmFsdWVMQykgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgZGF0YS5zcGxpY2UoaSwgMSkuZm9yRWFjaChpdGVtID0+IHRoaXMuZmlsdGVyZWRPdXRSb3dzW2Ake2l0ZW0uaWR9YF0gPSBpdGVtKTtcclxuICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIGlmIChjb21wYXJhdG9yID09PSAnc3RhcnRzV2l0aCcpIHtcclxuICAgICAgICAgICAgaWYgKCFjZWxsVmFsdWUuc3RhcnRzV2l0aChmaWx0ZXIudmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgZGF0YS5zcGxpY2UoaSwgMSkuZm9yRWFjaChpdGVtID0+IHRoaXMuZmlsdGVyZWRPdXRSb3dzW2Ake2l0ZW0uaWR9YF0gPSBpdGVtKTtcclxuICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIGlmIChjb21wYXJhdG9yID09PSAnc3RhcnRzV2l0aElnbm9yZUNhc2UnKSB7XHJcbiAgICAgICAgICAgIGlmICghY2VsbFZhbHVlTEMuc3RhcnRzV2l0aChmaWx0ZXJWYWx1ZUxDKSkge1xyXG4gICAgICAgICAgICAgIGRhdGEuc3BsaWNlKGksIDEpLmZvckVhY2goaXRlbSA9PiB0aGlzLmZpbHRlcmVkT3V0Um93c1tgJHtpdGVtLmlkfWBdID0gaXRlbSk7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgYXBwbHlPdmVyYWxsRmlsdGVyKGRhdGE6IE1hdFNlbGVjdFRhYmxlUm93W10pOiB2b2lkIHtcclxuICAgIHRoaXMuZmlsdGVyZWRPdXRSb3dzID0ge307XHJcbiAgICBpZiAoaXNOdWxsT3JVbmRlZmluZWQodGhpcy5vdmVyYWxsRmlsdGVyQ29udHJvbC52YWx1ZSkpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgY29uc3QgZmlsdGVyVmFsdWVMQzogc3RyaW5nID0gdGhpcy5vdmVyYWxsRmlsdGVyQ29udHJvbC52YWx1ZS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgaWYgKGZpbHRlclZhbHVlTEMudHJpbSgpLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBmb3IgKGxldCBpID0gZGF0YS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICBjb25zdCByb3c6IE1hdFNlbGVjdFRhYmxlUm93ID0gZGF0YVtpXTtcclxuICAgICAgbGV0IHJvd1Nob3VsZEJlRmlsdGVyZWQgPSB0cnVlO1xyXG4gICAgICBmb3IgKGxldCBqID0gdGhpcy5kYXRhU291cmNlLmNvbHVtbnMubGVuZ3RoIC0gMTsgaiA+PSAwOyBqLS0pIHtcclxuICAgICAgICBjb25zdCBrZXk6IHN0cmluZyA9IHRoaXMuZGF0YVNvdXJjZS5jb2x1bW5zW2pdLmtleTtcclxuICAgICAgICBjb25zdCBjZWxsVmFsdWU6IGFueSA9IHJvd1trZXldO1xyXG4gICAgICAgIGlmIChpc051bGxPclVuZGVmaW5lZChjZWxsVmFsdWUpKSB7XHJcbiAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgY2VsbFZhbHVlTEM6IHN0cmluZyA9IGAke2NlbGxWYWx1ZX1gLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgaWYgKGNlbGxWYWx1ZUxDLmluZGV4T2YoZmlsdGVyVmFsdWVMQykgIT09IC0xKSB7XHJcbiAgICAgICAgICByb3dTaG91bGRCZUZpbHRlcmVkID0gZmFsc2U7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHJvd1Nob3VsZEJlRmlsdGVyZWQpIHtcclxuICAgICAgICBkYXRhLnNwbGljZShpLCAxKS5mb3JFYWNoKGl0ZW0gPT4gdGhpcy5maWx0ZXJlZE91dFJvd3NbYCR7aXRlbS5pZH1gXSA9IGl0ZW0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFwcGx5UHJveHlUb0FycmF5KGFycmF5OiBhbnlbXSwgY2FsbGJhY2s6ICgpID0+IHZvaWQpOiB2b2lkIHtcclxuICAgIFsncG9wJywgJ3B1c2gnLCAncmV2ZXJzZScsICdzaGlmdCcsICd1bnNoaWZ0JywgJ3NwbGljZScsICdzb3J0J10uZm9yRWFjaCgobWV0aG9kTmFtZSkgPT4ge1xyXG4gICAgICBhcnJheVttZXRob2ROYW1lXSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBjb25zdCByZXMgPSBBcnJheS5wcm90b3R5cGVbbWV0aG9kTmFtZV0uYXBwbHkoYXJyYXksIGFyZ3VtZW50cyk7IC8vIGNhbGwgbm9ybWFsIGJlaGF2aW91clxyXG4gICAgICAgIGNhbGxiYWNrLmFwcGx5KGFycmF5LCBhcmd1bWVudHMpOyAvLyBmaW5hbGx5IGNhbGwgdGhlIGNhbGxiYWNrIHN1cHBsaWVkXHJcbiAgICAgICAgcmV0dXJuIHJlcztcclxuICAgICAgfTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSByZXNldEZpbHRlcnMoKTogdm9pZCB7XHJcbiAgICB0aGlzLm92ZXJhbGxGaWx0ZXJDb250cm9sLnNldFZhbHVlKCcnKTtcclxuICAgIE9iamVjdC5rZXlzKHRoaXMuZmlsdGVyQ29udHJvbHMuY29udHJvbHMpXHJcbiAgICAgIC5mb3JFYWNoKGtleSA9PiB0aGlzLmZpbHRlckNvbnRyb2xzLmdldChrZXkpLnNldFZhbHVlKCcnKSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUYWtlbiBmcm9tIHtAc2VlIE1hdFRhYmxlRGF0YVNvdXJjZSNzb3J0aW5nRGF0YUFjY2Vzc29yfVxyXG4gICAqXHJcbiAgICogQHBhcmFtIGRhdGFcclxuICAgKiBAcGFyYW0gc29ydEhlYWRlcklkXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzb3J0aW5nRGF0YUFjY2Vzc29yKGRhdGE6IE1hdFNlbGVjdFRhYmxlUm93LCBhY3RpdmU6IHN0cmluZyk6IHN0cmluZyB8IG51bWJlciB8IERhdGUge1xyXG5cclxuICAgIGNvbnN0IHZhbHVlID0gKGRhdGEgYXMgeyBba2V5OiBzdHJpbmddOiBhbnkgfSlbYWN0aXZlXTtcclxuXHJcbiAgICBpZiAoX2lzTnVtYmVyVmFsdWUodmFsdWUpKSB7XHJcbiAgICAgIGNvbnN0IG51bWJlclZhbHVlID0gTnVtYmVyKHZhbHVlKTtcclxuXHJcbiAgICAgIC8vIE51bWJlcnMgYmV5b25kIGBNQVhfU0FGRV9JTlRFR0VSYCBjYW4ndCBiZSBjb21wYXJlZCByZWxpYWJseSBzbyB3ZVxyXG4gICAgICAvLyBsZWF2ZSB0aGVtIGFzIHN0cmluZ3MuIEZvciBtb3JlIGluZm86IGh0dHBzOi8vZ29vLmdsL3k1dmJTZ1xyXG4gICAgICByZXR1cm4gbnVtYmVyVmFsdWUgPCBNQVhfU0FGRV9JTlRFR0VSID8gbnVtYmVyVmFsdWUgOiB2YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdmFsdWU7XHJcbiAgfVxyXG5cclxuXHJcbiAgcHJpdmF0ZSBzb3J0RGF0YShkYXRhOiBNYXRTZWxlY3RUYWJsZVJvd1tdLCBhY3RpdmU6IHN0cmluZywgZGlyZWN0aW9uOiBTb3J0RGlyZWN0aW9uKTogTWF0U2VsZWN0VGFibGVSb3dbXSB7XHJcbiAgICBpZiAoIWFjdGl2ZSB8fCBkaXJlY3Rpb24gPT09ICcnKSB7XHJcbiAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBkYXRhLnNvcnQoKGEsIGIpID0+IHtcclxuICAgICAgbGV0IGFWYWx1ZSA9IHRoaXMuc29ydGluZ0RhdGFBY2Nlc3NvcihhLCBhY3RpdmUpO1xyXG4gICAgICBsZXQgYlZhbHVlID0gdGhpcy5zb3J0aW5nRGF0YUFjY2Vzc29yKGIsIGFjdGl2ZSk7XHJcblxyXG4gICAgICBpZiAoYS5pZCA9PT0gbnVsbCkge1xyXG4gICAgICAgIHJldHVybiAtMTtcclxuICAgICAgfSBlbHNlIGlmIChiLmlkID09PSBudWxsKSB7XHJcbiAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEJvdGggbnVsbC91bmRlZmluZWQvZXF1YWwgdmFsdWUgY2hlY2tcclxuICAgICAgaWYgKGFWYWx1ZSA9PT0gYlZhbHVlKSB7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIE9uZSBudWxsIHZhbHVlIGNoZWNrXHJcbiAgICAgIGlmIChpc051bGxPclVuZGVmaW5lZChhVmFsdWUpICYmICFpc051bGxPclVuZGVmaW5lZChiVmFsdWUpKSB7XHJcbiAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICB9IGVsc2UgaWYgKCFpc051bGxPclVuZGVmaW5lZChhVmFsdWUpICYmIGlzTnVsbE9yVW5kZWZpbmVkKGJWYWx1ZSkpIHtcclxuICAgICAgICByZXR1cm4gMTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGFWYWx1ZSBpbnN0YW5jZW9mIERhdGUpIHtcclxuICAgICAgICBhVmFsdWUgPSBhVmFsdWUuZ2V0VGltZSgpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChiVmFsdWUgaW5zdGFuY2VvZiBEYXRlKSB7XHJcbiAgICAgICAgYlZhbHVlID0gYlZhbHVlLmdldFRpbWUoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gVXNlciBsb2NhbGVDb21wYXJlIGZvciBzdHJpbmdzXHJcbiAgICAgIGlmIChpc1N0cmluZyhhVmFsdWUpICYmIGlzU3RyaW5nKGJWYWx1ZSkpIHtcclxuICAgICAgICByZXR1cm4gKDxzdHJpbmc+YVZhbHVlKS5sb2NhbGVDb21wYXJlKDxzdHJpbmc+YlZhbHVlKSAqIChkaXJlY3Rpb24gPT09ICdhc2MnID8gMSA6IC0xKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gVHJ5IHRvIGNvbnZlcnQgdG8gYSBOdW1iZXIgdHlwZVxyXG4gICAgICBhVmFsdWUgPSBpc05hTig8bnVtYmVyPmFWYWx1ZSkgPyBgJHthVmFsdWV9YCA6ICthVmFsdWU7XHJcbiAgICAgIGJWYWx1ZSA9IGlzTmFOKDxudW1iZXI+YlZhbHVlKSA/IGAke2JWYWx1ZX1gIDogK2JWYWx1ZTtcclxuXHJcbiAgICAgIC8vIGlmIG9uZSBpcyBudW1iZXIgYW5kIG90aGVyIGlzIFN0cmluZ1xyXG4gICAgICBpZiAoaXNTdHJpbmcoYVZhbHVlKSAmJiBpc051bWJlcihiVmFsdWUpKSB7XHJcbiAgICAgICAgcmV0dXJuICgxKSAqIChkaXJlY3Rpb24gPT09ICdhc2MnID8gMSA6IC0xKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoaXNOdW1iZXIoYVZhbHVlKSAmJiBpc1N0cmluZyhiVmFsdWUpKSB7XHJcbiAgICAgICAgcmV0dXJuICgtMSkgKiAoZGlyZWN0aW9uID09PSAnYXNjJyA/IDEgOiAtMSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIENvbXBhcmUgYXMgTnVtYmVycyBvdGhlcndpc2VcclxuICAgICAgcmV0dXJuIChhVmFsdWUgPiBiVmFsdWUgPyAxIDogLTEpICogKGRpcmVjdGlvbiA9PT0gJ2FzYycgPyAxIDogLTEpO1xyXG4gICAgfSk7XHJcblx0XHJcbiAgfVxyXG5cclxuICBhZGROdWxsUm93KCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuICF0aGlzLm11bHRpcGxlICYmICFpc051bGxPclVuZGVmaW5lZCh0aGlzLmxhYmVsRm9yTnVsbFZhbHVlKTtcclxuICB9XHJcbiAgXHJcbiAgcHJpdmF0ZSBjaGVja0FuZFJlc2V0U2VsZWN0aW9uKCkge1x0XHJcbiAgICBpZiAodGhpcy5tYXRTZWxlY3QudmFsdWUgJiYgaXNBcnJheSh0aGlzLm1hdFNlbGVjdC52YWx1ZSkgJiYgdGhpcy5tYXRTZWxlY3QudmFsdWUubGVuZ3RoIDwgMVx0XHJcbiAgICAgICYmICFpc051bGxPclVuZGVmaW5lZCh0aGlzLnJlc2V0T3B0aW9uQWN0aW9uKSkge1x0XHJcbiAgICAgIHRoaXMucmVzZXRPcHRpb25BY3Rpb24oKTtcdFxyXG4gICAgfVx0XHJcbiAgfVxyXG59XHJcbiJdfQ==