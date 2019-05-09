import { MatSelectTableFilter } from './MatSelectTableFilter';
export interface MatSelectTableColumn {
    key: string;
    name: string;
    sortable: boolean;
    filter: MatSelectTableFilter;
}
