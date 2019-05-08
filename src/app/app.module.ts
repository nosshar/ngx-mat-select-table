import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgxMatSelectTableModule} from './component/ngx-mat-select-table/ngx-mat-select-table.module';
import {ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule, MatCheckboxModule, MatInputModule} from '@angular/material';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgxMatSelectTableModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule
  ],
  entryComponents: [],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
