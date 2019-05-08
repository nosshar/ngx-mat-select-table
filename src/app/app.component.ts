import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatSelectTableDataSource} from './component/ngx-mat-select-table/MatSelectTableDataSource';
import {MatSelectTableRow} from './component/ngx-mat-select-table/MatSelectTableRow';
import {BehaviorSubject} from 'rxjs';

interface DataRow extends MatSelectTableRow {
  name: string;
  address: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  multiple: FormControl = new FormControl(true);
  overallSearchEnabled: FormControl = new FormControl(true);
  overallSearchVisible: FormControl = new FormControl(false);
  resetSortOnOpen: FormControl = new FormControl(true);
  resetFiltersOnOpen: FormControl = new FormControl(true);
  additionalRowsControl: FormControl = new FormControl(0);
  customTriggerLabelTemplate: FormControl = new FormControl('');

  redrawSubject$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  control: FormControl;
  dataSource: MatSelectTableDataSource<DataRow> = {
    columns: [
      {
        key: 'id',
        name: 'Identifier',
        sortable: false,
        filter: {
          type: 'number'
        }
      },
      {
        key: 'name',
        name: 'Name',
        sortable: true,
        filter: {
          type: 'string',
          comparator: 'startsWithIgnoreCase'
        }
      },
      {
        key: 'address',
        name: 'Address',
        sortable: true,
        filter: {
          type: 'string',
          comparatorFn: (value: any, filterValue: any, row: MatSelectTableRow) => {
            if (value.toLowerCase().indexOf(filterValue.toLowerCase()) !== -1) {
              return true;
            }
            return false;
          }
        }
      }
    ],
    data: [
      {id: 1, name: 'Test', address: 'Moscow'},
      {id: 2, name: 'Test #2', address: 'St. Petersburg'},
      {id: 3, name: 'Test #3', address: 'Yekaterinburg'},
      {id: 4, name: 'Test #4', address: 'Samara'},
      {id: 5, name: 'Test #5', address: 'Saratov'},
      {id: 6, name: 'Test #6', address: 'Venice'},
      {id: 7, name: 'Test #7', address: 'Prague'},
      {id: 8, name: 'Test #8', address: 'Washington'},
      {id: 9, name: 'Test #9', address: 'Detroit'},
    ]
  };

  multipleValue: boolean = this.multiple.value;

  constructor() {
    this.control = new FormControl(null);
  }

  ngOnInit(): void {
    // Workaround to redraw the component
    this.multiple.valueChanges.subscribe(() => this.redrawSubject$.next(false));
    this.additionalRowsControl.valueChanges.subscribe((value) => {
      if (value < 0) {
        this.additionalRowsControl.setValue(0);
        return;
      }
      if (value > 10000) {
        this.additionalRowsControl.setValue(10000);
        return;
      }
      this.dataSource.data.splice(9);
      for (let i = 0; i < value; i++) {
        this.dataSource.data.push({
          id: this.dataSource.data.length + 1,
          name: `${Math.random()}`,
          address: `${Math.random()}`
        });
      }
    });
    this.redrawSubject$.subscribe((redraw) => {
      if (!redraw) {
        this.multipleValue = this.multiple.value;
        this.control.setValue(null);
        setTimeout(() => this.redrawSubject$.next(true));
      }
    });

    this.control.valueChanges.subscribe((v) => console.info(v)); // ToDo: temp
  }

  ngOnDestroy(): void {
  }

}
