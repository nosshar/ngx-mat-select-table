import {NgModule} from '@angular/core';

import {CommonModule} from '@angular/common';
import {NgxMatSelectTableComponent} from './ngx-mat-select-table.component';
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

@NgModule({
  declarations: [
    NgxMatSelectTableComponent
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
  bootstrap: [NgxMatSelectTableComponent],
  exports: [NgxMatSelectTableComponent]
})
export class NgxMatSelectTableModule {
}
