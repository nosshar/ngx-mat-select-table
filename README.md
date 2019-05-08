# NgxMatSelectTable
[https://github.com/nosshar/ngx-mat-select-table](https://github.com/nosshar/ngx-mat-select-table)

[![npm version](https://img.shields.io/npm/v/ngx-mat-select-table.svg?style=flat-square)](https://www.npmjs.com/package/ngx-mat-select-table)
[![npm downloads](https://img.shields.io/npm/dm/ngx-mat-select-table.svg?style=flat-square)](https://www.npmjs.com/package/ngx-mat-select-table)

## What does it do?
Material Select Table component based on Angular Material ([Angular Material](https://material.angular.io)) library.
Uses [MatSelect](https://material.angular.io/components/select/overview), [MatTable](https://material.angular.io/components/table/overview).

## Try it
Demo available [https://angular-7u6xkn.stackblitz.io](https://stackblitz.com/edit/angular-7u6xkn)

## How to use it?
Install `ngx-mat-select-table` in your project:
```
npm install ngx-mat-select-table
```

Import the `NgxMatSelectTableModule` in your `app.module.ts`:
```typescript
import { MatFormFieldModule, MatSelectModule } from '@angular/material';
import { NgxMatSelectTableModule } from 'ngx-mat-select-table';

@NgModule({
  imports: [
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatSelectModule,
    MatFormFieldModule,
    NgxMatSelectTableModule
  ],
})
export class AppModule {}
```

Use the `ngx-mat-select-table` component inside a `mat-select` element by placing it inside a `<mat-option>` element:
```html
<mat-form-field>
  <ngx-mat-select-table *ngIf="redrawSubject$.value"
                        [formControl]="control"
                        style="width: 300px"
                        placeholder="Select something"
                        [multiple]="true"
                        [overallSearchEnabled]="true"
                        [overallSearchVisible]="true"
                        [customTriggerLabelTemplate]="''"
                        [resetSortOnOpen]="true"
                        [resetFiltersOnOpen]="true"
                        [dataSource]="dataSource"></ngx-mat-select-table>
</mat-form-field>
```
See the example in [https://github.com/nosshar/ngx-mat-select-table/blob/master/src/app/app.component.html](https://github.com/nosshar/ngx-mat-select-table/blob/master/src/app/app.component.html)
and [https://github.com/nosshar/ngx-mat-select-table/blob/master/src/app/app.component.ts](https://github.com/nosshar/ngx-mat-select-table/blob/master/src/app/app.component.ts).

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
