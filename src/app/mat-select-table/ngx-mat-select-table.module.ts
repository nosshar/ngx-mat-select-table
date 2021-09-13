import {NgModule} from '@angular/core';

import {CommonModule} from '@angular/common';
import {MatSelectTableComponent} from './mat-select-table.component';
import {NgxMatSelectSearchModule} from 'ngx-mat-select-search';
import { MatCommonModule, MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
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
