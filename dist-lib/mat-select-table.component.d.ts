import { AfterViewInit, ChangeDetectorRef, EventEmitter, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, FormControl } from '@angular/forms';
import { Sort } from '@angular/material';
import { MatSelectTableDataSource } from './MatSelectTableDataSource';
import { MatSelectTableRow } from './MatSelectTableRow';
import { MatSelectTableColumn } from './MatSelectTableColumn';
export declare class MatSelectTableComponent implements ControlValueAccessor, OnInit, AfterViewInit, OnDestroy, OnChanges {
    private cd;
    /** Data Source for the table */
    dataSource: MatSelectTableDataSource<MatSelectTableRow>;
    /**
     * Multiple/Single mode for {@see MatSelect#multiple} to initialize.
     * NB: switching between modes in runtime is not supported by {@see MatSelect}
     */
    multiple: boolean;
    /** Whether or not overall search mode enabled. See {@see MatSelectTableComponent} */
    overallSearchEnabled: boolean;
    /** Default is true */
    overallSearchVisible: boolean;
    /** Whether or not should {@see MatSelectTableComponent} be visible on open. Default is true */
    resetSortOnOpen: boolean;
    /** Whether or not previous search should be cleared on open. Default is true */
    resetFiltersOnOpen: boolean;
    /**
     * Function to customize the default label
     */
    customTriggerLabelFn: (value: MatSelectTableRow[]) => string;
    /**
     * Sort option for values in the customTriggerLabelFn in Multiple mode.
      */
    triggerLabelSort: Sort;
    /**
     * Template to customize the default trigger label. Has lesser priority than {@see MatSelectTableComponent#customTriggerLabelFn}.
     * Substitution is case sensitive.
     * Example: ${name} ${id} - ${address}
     */
    customTriggerLabelTemplate: string;
    labelForNullValue: string;
    private nullRow;
    /**
     * {@see MatSelect} proxy inputs configurator
     * {@see MatSelect#multiple} gets value from {@see MatSelectTableComponent#multiple}
     */
    matSelectConfigurator: {
        [key: string]: any;
    };
    /**
     * {@see MatSelectSearchComponent} proxy inputs configurator
     * {@see MatSelectSearchComponent#clearSearchInput} gets value from {@see MatSelectTableComponent#resetFiltersOnOpen}
     * {@see MatSelectSearchComponent} {@see ControlValueAccessor} gets value from {@see MatSelectTableComponent#overallFilterControl}
     */
    matSelectSearchConfigurator: {
        [key: string]: any;
    };
    /**
     * Apply default sorting
     */
    defaultSort: Sort;
    close: EventEmitter<boolean>;
    private matSelect;
    private matSelectSearch;
    private sort;
    private table;
    private tableRef;
    private matOptions;
    tableDataSource: MatSelectTableRow[];
    tableColumns: string[];
    tableColumnsMap: Map<string, MatSelectTableColumn>;
    tableActiveRow: number;
    filteredOutRows: {
        [key: string]: MatSelectTableRow;
    };
    completeRowList: MatSelectTableRow[];
    overallSearchVisibleState: boolean;
    overallFilterControl: FormControl;
    private filterControls;
    private completeValueList;
    private controlValueAccessorKeys;
    /** Subject that emits when the component has been destroyed. */
    private _onDestroy;
    private _onSelectOpen;
    private _onOptionsChange;
    constructor(cd: ChangeDetectorRef);
    ngOnInit(): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    registerOnChange(fn: (value: any) => void): void;
    registerOnTouched(fn: () => {}): void;
    setDisabledState(isDisabled: boolean): void;
    writeValue(value: any): void;
    ngOnChanges(changes: SimpleChanges): void;
    emulateMatOptionClick(event: MouseEvent): void;
    filterFormControl(key: string): FormControl;
    simpleTriggerLabelFn(value: MatSelectTableRow[]): string;
    toggleOverallSearch(): void;
    private updateCompleteRowList;
    private proxyMatSelectSearchConfiguration;
    private applyColumnLevelFilters;
    private applyOverallFilter;
    private applyProxyToArray;
    private resetFilters;
    /**
     * Taken from {@see MatTableDataSource#sortingDataAccessor}
     *
     * @param data
     * @param sortHeaderId
     */
    private sortingDataAccessor;
    private sortData;
    addNullRow(): boolean;
}
