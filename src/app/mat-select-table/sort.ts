
// The current sort state. */
import {SortDirection} from '@angular/material';

export interface Sort {
  // The id of the column being sorted. */
  active: string;
  /** The sort direction. */
  direction: SortDirection;
}
