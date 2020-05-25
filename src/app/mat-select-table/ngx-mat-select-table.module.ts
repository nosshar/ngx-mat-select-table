import {NgModule} from '@angular/core';

import {CommonModule} from '@angular/common';
import {MatSelectTableComponent} from './mat-select-table.component';
import {NgxMatSelectSearchModule} from 'ngx-mat-select-search';
import {
  MatCommonModule,
  MatIconModule,
  MatInputModule,
  MatOptionModule,
  MatSelectModule,
  MatSortModule,
  MatTableModule
} from '@angular/material';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatSelectTableInputRestrictionDirective} from './directives/mat-select-table-input-restriction.directive';

@NgModule({
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
export class NgxMatSelectTableModule {
}
