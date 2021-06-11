import { __spread, __decorate, __metadata } from 'tslib';
import { EventEmitter, ChangeDetectorRef, Input, Output, ViewChild, ElementRef, ViewChildren, QueryList, Component, ChangeDetectionStrategy, forwardRef, HostListener, Directive, NgModule } from '@angular/core';
import { FormGroup, FormControl, NG_VALUE_ACCESSOR, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject, merge } from 'rxjs';
import { MatSelect, MatSort, MatTable, MatOption, MatSelectModule, MatSortModule, MatOptionModule, MatCommonModule, MatTableModule, MatInputModule, MatIconModule } from '@angular/material';
import { isNullOrUndefined, isArray, isString, isNumber } from 'util';
import { _isNumberValue } from '@angular/cdk/coercion';
import { takeUntil, debounceTime, take } from 'rxjs/operators';
import { MatSelectSearchComponent, NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { CommonModule } from '@angular/common';

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
        merge.apply(void 0, __spread([
            this._onOptionsChange,
            this.sort.sortChange,
            this.filterControls.valueChanges,
            this.overallFilterControl.valueChanges
        ])).pipe(takeUntil(this._onDestroy), debounceTime(100))
            .subscribe(function () {
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
            this.tableDataSource = __spread(changes.dataSource.currentValue.data);
            if (this.addNullRow()) {
                this.tableDataSource.unshift(this.nullRow);
            }
            this.tableColumns = __spread(['_selection'], changes.dataSource.currentValue.columns.map(function (column) { return column.key; }));
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
                    useExisting: forwardRef(function () { return MatSelectTableComponent_1; }),
                    multi: true
                }
            ],
            styles: [":host{display:block}:host mat-form-field{width:100%}::ng-deep .mat-select-panel.mat-select-search-table-panel{overflow-x:auto!important}::ng-deep .mat-select-panel.mat-select-search-table-panel .overall-search-toggle{z-index:102;position:absolute;left:13px;top:17px;cursor:pointer}::ng-deep .mat-select-panel.mat-select-search-table-panel ngx-mat-select-search{position:absolute;z-index:101}::ng-deep .mat-select-panel.mat-select-search-table-panel ngx-mat-select-search.hidden{display:none}::ng-deep .mat-select-panel.mat-select-search-table-panel ngx-mat-select-search .mat-select-search-inner{height:56px}::ng-deep .mat-select-panel.mat-select-search-table-panel ngx-mat-select-search .mat-select-search-inner .mat-select-search-input{margin-left:26px;width:calc(100% - 26px)}::ng-deep .mat-select-panel.mat-select-search-table-panel table{width:100%}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr{cursor:pointer;height:48px;max-height:48px}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr mat-option{height:48px;max-height:48px}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr.active{background:rgba(0,0,0,.04)}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr td{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;border-bottom:0!important;box-shadow:inset 0 -1px 0 0 rgba(0,0,0,.12)}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th ::ng-deep .mat-sort-header-container{height:55px}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th ::ng-deep .mat-sort-header-container mat-form-field .mat-form-field-infix{width:initial}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th[aria-sort] ::ng-deep .mat-sort-header-arrow{opacity:1!important}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr td mat-option,::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th mat-option{background:0 0!important}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr td.selection,::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th.selection{width:56px;padding:0;margin:0}::ng-deep .mat-select-panel.mat-select-search-table-panel table tr td.selection.hidden mat-option,::ng-deep .mat-select-panel.mat-select-search-table-panel table tr th.selection.hidden mat-option{visibility:hidden}"]
        }),
        __metadata("design:paramtypes", [ChangeDetectorRef])
    ], MatSelectTableComponent);
    return MatSelectTableComponent;
}());

var MatSelectTableInputRestrictionDirective = /** @class */ (function () {
    function MatSelectTableInputRestrictionDirective() {
    }
    MatSelectTableInputRestrictionDirective.prototype.onKeyPress = function (event) {
        if (this.appInputRestriction === 'integer') {
            this.integerOnly(event);
        }
    };
    MatSelectTableInputRestrictionDirective.prototype.integerOnly = function (event) {
        var e = event;
        if (['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].indexOf(e.key) === -1) {
            e.preventDefault();
        }
    };
    MatSelectTableInputRestrictionDirective.prototype.onPaste = function (event) {
        var regex;
        if (this.appInputRestriction === 'integer') {
            regex = /^[0-9]*$/;
        }
        var e = event;
        var pasteData = e.clipboardData.getData('text/plain');
        if (!pasteData.match(regex)) {
            e.preventDefault();
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
    return MatSelectTableInputRestrictionDirective;
}());

var NgxMatSelectTableModule = /** @class */ (function () {
    function NgxMatSelectTableModule() {
    }
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
    return NgxMatSelectTableModule;
}());

/**
 * Generated bundle index. Do not edit.
 */

export { MatSelectTableComponent, NgxMatSelectTableModule, MatSelectTableInputRestrictionDirective as ɵa };
//# sourceMappingURL=ngx-mat-select-table.js.map
