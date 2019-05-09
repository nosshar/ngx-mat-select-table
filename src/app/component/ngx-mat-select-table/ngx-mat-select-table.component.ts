import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  forwardRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR} from '@angular/forms';
import {merge, Subject} from 'rxjs';
import {MatOption, MatSelect, MatSort, MatTable, MatTableDataSource} from '@angular/material';
import {isArray, isNullOrUndefined} from 'util';
import {MatSelectTableDataSource} from './MatSelectTableDataSource';
import {MatSelectTableRow} from './MatSelectTableRow';
import {_isNumberValue} from '@angular/cdk/coercion';
import {debounceTime, takeUntil} from 'rxjs/operators';
import {MatSelectTableColumn} from './MatSelectTableColumn';
import {MatSelectTableFilter} from './MatSelectTableFilter';
import {MatSelectSearchComponent} from 'ngx-mat-select-search';

const MAX_SAFE_INTEGER = 9007199254740991;

@Component({
  selector: 'ngx-mat-select-table',
  templateUrl: './ngx-mat-select-table.component.html',
  styleUrls: ['./ngx-mat-select-table.component.scss'],
  exportAs: 'ngx-mat-select-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NgxMatSelectTableComponent),
      multi: true
    }
  ]
})
export class NgxMatSelectTableComponent implements ControlValueAccessor, OnInit, AfterViewInit, OnDestroy, OnChanges {

  /** Data Source for the table */
  @Input() dataSource: MatSelectTableDataSource<MatSelectTableRow>;

  /**
   * Multiple/Single mode for {@see MatSelect#multiple} to initialize.
   * NB: switching between modes in runtime is not supported by {@see MatSelect}
   */
  @Input() multiple: boolean;

  /** Whether or not overall search mode enabled. See {@see NgxMatSelectTableComponent} */
  @Input() overallSearchEnabled: boolean;

  /** Default is true */
  @Input() overallSearchVisible: boolean;

  /** Whether or not should {@see NgxMatSelectTableComponent} be visible on open. Default is true */
  @Input() resetSortOnOpen: boolean;

  /** Whether or not previous search should be cleared on open. Default is true */
  @Input() resetFiltersOnOpen: boolean;

  /**
   * Function to customize the default label
   */
  @Input() customTriggerLabelFn: (value: MatSelectTableRow[]) => string;

  /**
   * Template to customize the default trigger label. Has lesser priority than {@see NgxMatSelectTableComponent#customTriggerLabelFn}.
   * Substitution is case sensitive.
   * Example: ${name} ${id} - ${address}
   */
  @Input() customTriggerLabelTemplate: string;

  /**
   * {@link MatSelect} proxy inputs configurator
   * {@link MatSelect#multiple} gets value from {@link NgxMatSelectTableComponent#multiple}
   */
  @Input() matSelectConfigurator: { [key: string]: any };

  /**
   * {@link MatSelectSearchComponent} proxy inputs configurator
   * {@link MatSelectSearchComponent#formControl} gets value from {@link NgxMatSelectTableComponent#overallFilterControl}
   * {@link MatSelectSearchComponent#clearSearchInput} gets value from {@link NgxMatSelectTableComponent#resetFiltersOnOpen}
   */
  @Input() matSelectSearchConfigurator: { [key: string]: any };

  @ViewChild('componentSelect') private matSelect: MatSelect;

  @ViewChild(MatSelectSearchComponent) private matSelectSearch: MatSelectSearchComponent;

  @ViewChild(MatSort) private sort: MatSort;

  @ViewChild(MatTable) private table: MatTable<MatSelectTableRow>;

  @ViewChild('table', {read: ElementRef}) private tableRef: ElementRef;

  @ViewChildren(MatOption) private matOptions: QueryList<MatOption>;

  tableDataSource: MatSelectTableRow[];

  tableColumns: string[];

  tableColumnsMap: Map<string, MatSelectTableColumn>;

  tableActiveRow: number;

  filteredOutRows: { [key: string]: MatSelectTableRow };

  completeRowList: MatSelectTableRow[] = [];

  overallSearchVisibleState: boolean;

  overallFilterControl: FormControl;

  private filterControls: FormGroup;

  private completeValueList: any[] = [];

  private controlValueAccessorKeys: string[] = [
    'formControl',
    'formControlName',
    'formGroup',
    'formGroupName',
    'formArray',
    'formArrayName'
  ];

  /** Subject that emits when the component has been destroyed. */
  private _onDestroy = new Subject<void>();

  private _onOptionsChange = new Subject<void>();

  constructor(private cd: ChangeDetectorRef) {
    this.tableColumnsMap = new Map();
    this.filterControls = new FormGroup({});
    this.overallFilterControl = new FormControl('');
  }

  ngOnInit(): void {
    this.multiple = this.multiple || false;
    this.matSelect.openedChange
      .pipe(takeUntil(this._onDestroy))
      .subscribe(opened => {
        if (this.resetFiltersOnOpen !== false || !this.matOptions.length) {
          this.resetFilters();
        }
        if (!opened) {
          return;
        }
        this.overallSearchVisibleState = this.overallSearchVisible;
        if (this.resetSortOnOpen !== false) {
          this.sort.sort({id: '', start: 'asc', disableClear: false});
        }
        if (this.overallSearchEnabled) {
          this.proxyMatSelectSearchConfiguration(this.matSelectSearchConfigurator);
        }
        // ToDo: get rid of this workaround (updates header row [otherwise sort mechanism produces glitches])
        (this.table as any)._headerRowDefChanged = true;
        // Disable sort buttons to prevent sorting change on SPACE key pressed in filter field
        setTimeout(() => [].forEach.call(
          this.tableRef.nativeElement.querySelectorAll('button.mat-sort-header-button'),
          (e) => e.disabled = true)
        );

        // Patch the height of the panel to include the height of the header and footer
        const panelElement: HTMLDivElement = this.matSelect.panel.nativeElement;
        const panelHeight = panelElement.getBoundingClientRect().height;
        let tableAdditionalHeight = 0;
        this.table
          ._getRenderedRows(this.table._headerRowOutlet)
          .concat(this.table._getRenderedRows(this.table._footerRowOutlet))
          .forEach(row => tableAdditionalHeight += row.getBoundingClientRect().height);
        if (!isNaN(panelHeight)) {
          panelElement.style.maxHeight = `${panelHeight + tableAdditionalHeight}px`;
        }
      });
  }

  ngAfterViewInit(): void {
    merge(...[
      this.sort.sortChange,
      this.filterControls.valueChanges,
      this.overallFilterControl.valueChanges
    ])
      .pipe(takeUntil(this._onDestroy), debounceTime(100))
      .subscribe(() => {
        const dataClone: MatSelectTableRow[] = [...this.dataSource.data];

        // Apply filtering
        if (this.overallSearchEnabled && this.overallSearchVisibleState) {
          this.applyOverallFilter(dataClone);
        } else {
          this.applyColumnLevelFilters(dataClone);
        }

        // Apply sorting
        this.tableDataSource = !this.sort.direction ? dataClone : this.sortData(dataClone, this.sort);

        this.cd.detectChanges();
      });

    // Manually sort data for this.matSelect.options (QueryList<MatOption>) and notify matSelect.options of changes
    // It's important to keep this.matSelect.options order synchronized with data in the table
    //     because this.matSelect.options (QueryList<MatOption>) doesn't update it's state after table data is changed
    this.matOptions.changes.subscribe(() => {
      const options: { [key: string]: MatOption } = {};
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

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  registerOnChange(fn: (value: any) => void): void {
    const proxyFn: (value: any) => void = (value: any) => {
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
        this.dataSource.data
          .filter(row => this.completeValueList.indexOf(row.id) !== -1)
          .forEach(row => this.completeRowList.push(row));
      } else {
        fn(value);
        this.completeRowList.splice(0);
        this.dataSource.data
          .filter(row => row.id === value)
          .forEach(row => this.completeRowList.push(row));
      }
    };
    this.matSelect.registerOnChange(proxyFn);
  }

  registerOnTouched(fn: () => {}): void {
    this.matSelect.registerOnTouched(fn);
  }

  setDisabledState(isDisabled: boolean): void {
    this.matSelect.setDisabledState(isDisabled);
  }

  writeValue(value: any): void {
    this.matSelect.writeValue(value);
    if (this.matSelect.value !== value) {
      this.matSelect.value = value;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {

    if (!isNullOrUndefined(changes.resetFiltersOnOpen) && changes.resetFiltersOnOpen.currentValue !== false) {
      this.resetFilters();
    }

    // Proxy @Input bindings to MatSelect
    if (!isNullOrUndefined(changes.matSelectConfigurator)) {
      const configuration = changes.matSelectConfigurator.currentValue;
      Object.keys(configuration)
        .filter(key => !['multiple'].includes(key) && !this.controlValueAccessorKeys.includes(key))
        .forEach(key => this.matSelect[key] = configuration[key]);
    }

    if (!isNullOrUndefined(changes.matSelectSearchConfigurator)) {
      this.proxyMatSelectSearchConfiguration(changes.matSelectSearchConfigurator.currentValue);
    }

    if (!isNullOrUndefined(changes.dataSource)
      && !isNullOrUndefined(changes.dataSource.currentValue)
      && isArray(changes.dataSource.currentValue.data)) {
      this.tableDataSource = [...changes.dataSource.currentValue.data];
      this.tableColumns = ['_selection', ...changes.dataSource.currentValue.columns.map(column => column.key)];
      this.tableColumnsMap.clear();
      changes.dataSource.currentValue.columns.forEach(column => this.tableColumnsMap.set(column.key, column));
      this.applyProxyToArray(changes.dataSource.currentValue.data, () => {
        this._onOptionsChange.next();
      });
      this._onOptionsChange.next();
    }
  }

  emulateMatOptionClick(event: MouseEvent): void {
    if (event.composedPath()
      .filter(et => et instanceof HTMLElement)
      .some((et: HTMLElement) => et.tagName.toLowerCase() === 'mat-option')) {
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
    const childOption: HTMLElement = rowElement.querySelector('mat-option');
    if (!childOption) {
      return;
    }
    childOption.click();
  }


  filterFormControl(key: string): FormControl {
    if (!this.filterControls.contains(key)) {
      this.filterControls.registerControl(key, new FormControl(''));
    }
    return <FormControl>this.filterControls.get(key);
  }

  simpleTriggerLabelFn(value: MatSelectTableRow[]): string {
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
      const substitution: string = this.customTriggerLabelTemplate.replace(/[$]{1}[{]{1}([^}]+)[}]{1}?/g, (_, key) =>
        !isNullOrUndefined(row[key]) && (atLeastPartialSubstitution = true) ? row[key] : '');
      if (atLeastPartialSubstitution === false) {
        return `${row.id}`;
      }
      return substitution.trim();
    }).join(', ');
  }

  toggleOverallSearch(): void {
    this.overallSearchVisibleState = !this.overallSearchVisibleState;
    this.resetFilters();
    if (this.overallSearchVisibleState) {
      setTimeout(() => this.matSelectSearch._focus());
    }
  }

  private proxyMatSelectSearchConfiguration(configuration: { [key: string]: any }): void {
    if (isNullOrUndefined(this.matSelectSearch)) {
      return;
    }

    // Proxy @Input bindings to NgxMatSelectSearch
    Object.keys(configuration)
      .filter(key => !['clearSearchInput'].includes(key) && !this.controlValueAccessorKeys.includes(key))
      .forEach(key => this.matSelectSearch[key] = configuration[key]);
  }

  private applyColumnLevelFilters(data: MatSelectTableRow[]): void {
    this.filteredOutRows = {};
    const filters: { [key: string]: { filter: MatSelectTableFilter, value: any } } = {};
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
    const filterKeys: string[] = Object.keys(filters);
    for (let i = data.length - 1; i >= 0; i--) {
      for (let k = 0; k < filterKeys.length; k++) {
        const filterKey: string = filterKeys[k];
        const row: MatSelectTableRow = data[i];
        const cellValue: any = row[filterKey];
        if (isNullOrUndefined(cellValue)) {
          continue;
        }
        const filter = filters[filterKey];
        const comparator = filter.filter.comparator;
        if (typeof filter.filter.comparatorFn === 'function') {
          if (!filter.filter.comparatorFn.call(null, cellValue, filter.value, row)) {
            data.splice(i, 1).forEach(item => this.filteredOutRows[`${item.id}`] = item);
            break;
          }
        } else if (isNullOrUndefined(comparator) || comparator === 'equals') {
          if (filter.value !== cellValue) {
            data.splice(i, 1).forEach(item => this.filteredOutRows[`${item.id}`] = item);
            break;
          }
        } else if (typeof cellValue === 'string' && typeof filter.value === 'string') {
          const cellValueLC: string = `${cellValue}`.toLowerCase();
          const filterValueLC: string = filter.value.toLowerCase();
          if (isNullOrUndefined(comparator) || comparator === 'equalsIgnoreCase') {
            if (filterValueLC !== cellValueLC) {
              data.splice(i, 1).forEach(item => this.filteredOutRows[`${item.id}`] = item);
              break;
            }
          } else if (comparator === 'contains') {
            if (cellValue.indexOf(filter.value) === -1) {
              data.splice(i, 1).forEach(item => this.filteredOutRows[`${item.id}`] = item);
              break;
            }
          } else if (comparator === 'containsIgnoreCase') {
            if (cellValueLC.indexOf(filterValueLC) === -1) {
              data.splice(i, 1).forEach(item => this.filteredOutRows[`${item.id}`] = item);
              break;
            }
          } else if (comparator === 'startsWith') {
            if (!cellValue.startsWith(filter.value)) {
              data.splice(i, 1).forEach(item => this.filteredOutRows[`${item.id}`] = item);
              break;
            }
          } else if (comparator === 'startsWithIgnoreCase') {
            if (!cellValueLC.startsWith(filterValueLC)) {
              data.splice(i, 1).forEach(item => this.filteredOutRows[`${item.id}`] = item);
              break;
            }
          }
        }
      }
    }
  }

  private applyOverallFilter(data: MatSelectTableRow[]): void {
    this.filteredOutRows = {};
    if (isNullOrUndefined(this.overallFilterControl.value)) {
      return;
    }
    const filterValueLC: string = this.overallFilterControl.value.toLowerCase();
    if (filterValueLC.trim().length === 0) {
      return;
    }
    for (let i = data.length - 1; i >= 0; i--) {
      const row: MatSelectTableRow = data[i];
      let rowShouldBeFiltered = true;
      for (let j = this.dataSource.columns.length - 1; j >= 0; j--) {
        const key: string = this.dataSource.columns[j].key;
        const cellValue: any = row[key];
        if (isNullOrUndefined(cellValue)) {
          continue;
        }
        const cellValueLC: string = `${cellValue}`.toLowerCase();
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

  private applyProxyToArray(array: any[], callback: () => void): void {
    ['pop', 'push', 'reverse', 'shift', 'unshift', 'splice', 'sort'].forEach((methodName) => {
      array[methodName] = function () {
        const res = Array.prototype[methodName].apply(array, arguments); // call normal behaviour
        callback.apply(array, arguments); // finally call the callback supplied
        return res;
      };
    });
  }

  private resetFilters(): void {
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
  private sortingDataAccessor(data: MatSelectTableRow, sortHeaderId: string): string | number {
    const value = (data as { [key: string]: any })[sortHeaderId];

    if (_isNumberValue(value)) {
      const numberValue = Number(value);

      // Numbers beyond `MAX_SAFE_INTEGER` can't be compared reliably so we
      // leave them as strings. For more info: https://goo.gl/y5vbSg
      return numberValue < MAX_SAFE_INTEGER ? numberValue : value;
    }

    return value;
  }

  /**
   * Taken from {@see MatTableDataSource#sortData}
   *
   * @param data
   * @param sort
   */
  private sortData(data: MatSelectTableRow[], sort: MatSort): MatSelectTableRow[] {
    const active = sort.active;
    const direction = sort.direction;
    if (!active || direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      const valueA = this.sortingDataAccessor(a, active);
      const valueB = this.sortingDataAccessor(b, active);

      // If both valueA and valueB exist (truthy), then compare the two. Otherwise, check if
      // one value exists while the other doesn't. In this case, existing value should come first.
      // This avoids inconsistent results when comparing values to undefined/null.
      // If neither value exists, return 0 (equal).
      let comparatorResult = 0;
      if (valueA != null && valueB != null) {
        // Check if one value is greater than the other; if equal, comparatorResult should remain 0.
        if (valueA > valueB) {
          comparatorResult = 1;
        } else if (valueA < valueB) {
          comparatorResult = -1;
        }
      } else if (valueA != null) {
        comparatorResult = 1;
      } else if (valueB != null) {
        comparatorResult = -1;
      }

      return comparatorResult * (direction === 'asc' ? 1 : -1);
    });
  }

}
