import {MatSelectTableRow} from './MatSelectTableRow';

export interface MatSelectTableFilter {

  /**
   * Filter is enabled by default
   */
  enabled?: boolean;

  type: 'string' | 'number' | 'select' | 'select-binary' | 'select-multiple';

  /**
   * Default comparator is 'equalsIgnoreCase' (if string) or 'equals'
   */
  comparator?: 'equalsIgnoreCase' | 'equals'
    | 'containsIgnoreCase' | 'contains'
    | 'startsWithIgnoreCase' | 'startsWith';

  /**
   * Custom comparator has higher priority than {@see MatSelectTableFilter#comparator}
   *
   * @param value
   * @param filterValue
   * @param row
   */
  comparatorFn?: (value: any, filterValue: any, row: MatSelectTableRow) => boolean;

}
