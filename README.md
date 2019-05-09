# NgxMatSelectTable
[https://github.com/nosshar/ngx-mat-select-table](https://github.com/nosshar/ngx-mat-select-table)

## What does it do?
Material Select Table component based on Angular Material ([Angular Material](https://material.angular.io)) library.
Uses [MatSelect](https://material.angular.io/components/select/overview), [MatTable](https://material.angular.io/components/table/overview), [NgxMatSelectSearch](https://github.com/bithost-gmbh/ngx-mat-select-search).

## Try it
Demo available [https://angular-7u6xkn.stackblitz.io](https://stackblitz.com/edit/angular-7u6xkn)

## How to use it?
Install `ngx-mat-select-table` in your project (from GIT):
```
npm install nosshar/ngx-mat-select-table#master
```

Import the `NgxMatSelectTableModule` in your `app.module.ts`:
```typescript
import { MatFormFieldModule, MatSelectModule } from '@angular/material';
import { NgxMatSelectTableModule } from 'ngx-mat-select-table/dist-lib';

@NgModule({
  imports: [
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    NgxMatSelectTableModule
  ],
})
export class AppModule {}
```

Use the `ngx-mat-select-table`:
```html
<div style="width: 300px">
  <ngx-mat-select-table *ngIf="redrawSubject$.value"
                        [formControl]="control"
                        [matSelectConfigurator]="{
                          placeholder: 'Select something',
                          panelClass: 'custom-panel-width-600'
                        }"
                        [matSelectSearchConfigurator]="{
                          placeholderLabel: 'Overall Search',
                          type: 'text',
                          noEntriesFoundLabel: 'No entries found',
                          searching: false,
                          disableInitialFocus: false,
                          preventHomeEndKeyPropagation: true,
                          disableScrollToActiveOnOptionsChanged: true,
                          clearIcon: 'close'
                        }"
                        [multiple]="multipleValue"
                        [overallSearchEnabled]="overallSearchEnabled.value"
                        [overallSearchVisible]="overallSearchVisible.value"
                        [customTriggerLabelTemplate]="customTriggerLabelTemplate.value"
                        [resetSortOnOpen]="resetSortOnOpen.value"
                        [resetFiltersOnOpen]="resetFiltersOnOpen.value"
                        [dataSource]="dataSource"></ngx-mat-select-table>
</div>
```
See the example in [https://github.com/nosshar/ngx-mat-select-table/blob/master/src/app/app.component.html](https://github.com/nosshar/ngx-mat-select-table/blob/master/src/app/app.component.html)
and [https://github.com/nosshar/ngx-mat-select-table/blob/master/src/app/app.component.ts](https://github.com/nosshar/ngx-mat-select-table/blob/master/src/app/app.component.ts).

### Inputs

```typescript
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
   * {@see MatSelect} proxy inputs configurator
   * {@see MatSelect#multiple} gets value from {@see NgxMatSelectTableComponent#multiple}
   */
  @Input() matSelectConfigurator: { [key: string]: any };

  /**
   * {@see MatSelectSearchComponent} proxy inputs configurator
   * {@see MatSelectSearchComponent#clearSearchInput} gets value from {@see NgxMatSelectTableComponent#resetFiltersOnOpen}
   * {@see MatSelectSearchComponent} {@see ControlValueAccessor} gets value from {@see NgxMatSelectTableComponent#overallFilterControl}
   */
  @Input() matSelectSearchConfigurator: { [key: string]: any };
```

Configuration object matSelectConfigurator proxied to MatSelect.
Configuration object matSelectSearchConfigurator proxied to NgxMatSelectSearch.

### Compatibility

* `@angular/core`: not tested,
* `@angular/material`: not tested,
* `rxjs`: not tested

### API
The `MatSelectSearchComponent` implements the [ControlValueAccessor](https://angular.io/api/forms/ControlValueAccessor) interface.

#### Inputs
TBD

## Known Problems / Solutions
* IE 11/Edge MatTable sticky headers styles are broken.
