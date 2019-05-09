import { MatSelectTableRow } from './MatSelectTableRow';
import { MatSelectTableColumn } from './MatSelectTableColumn';
export interface MatSelectTableDataSource<T extends MatSelectTableRow> {
    columns: MatSelectTableColumn[];
    data: T[];
}
