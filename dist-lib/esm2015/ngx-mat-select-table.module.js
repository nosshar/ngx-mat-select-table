import * as tslib_1 from "tslib";
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectTableComponent } from './mat-select-table.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatCommonModule, MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectTableInputRestrictionDirective } from './directives/mat-select-table-input-restriction.directive';
let NgxMatSelectTableModule = class NgxMatSelectTableModule {
};
NgxMatSelectTableModule = tslib_1.__decorate([
    NgModule({
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
], NgxMatSelectTableModule);
export { NgxMatSelectTableModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LW1hdC1zZWxlY3QtdGFibGUubW9kdWxlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmd4LW1hdC1zZWxlY3QtdGFibGUvIiwic291cmNlcyI6WyJuZ3gtbWF0LXNlbGVjdC10YWJsZS5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFdkMsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQzdDLE9BQU8sRUFBQyx1QkFBdUIsRUFBQyxNQUFNLDhCQUE4QixDQUFDO0FBQ3JFLE9BQU8sRUFBQyx3QkFBd0IsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQy9ELE9BQU8sRUFBRSxlQUFlLEVBQUUsZUFBZSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDMUUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ3ZELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUN6RCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDM0QsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ3ZELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUN6RCxPQUFPLEVBQUMsV0FBVyxFQUFFLG1CQUFtQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDaEUsT0FBTyxFQUFDLHVDQUF1QyxFQUFDLE1BQU0sMkRBQTJELENBQUM7QUF3QmxILElBQWEsdUJBQXVCLEdBQXBDLE1BQWEsdUJBQXVCO0NBQ25DLENBQUE7QUFEWSx1QkFBdUI7SUF0Qm5DLFFBQVEsQ0FBQztRQUNSLFlBQVksRUFBRTtZQUNaLHVCQUF1QjtZQUN2Qix1Q0FBdUM7U0FDeEM7UUFDRCxPQUFPLEVBQUU7WUFDUCxZQUFZO1lBQ1osV0FBVztZQUNYLG1CQUFtQjtZQUNuQixlQUFlO1lBQ2YsYUFBYTtZQUNiLGVBQWU7WUFDZixlQUFlO1lBQ2YsY0FBYztZQUNkLGNBQWM7WUFDZCxhQUFhO1lBQ2Isd0JBQXdCO1NBQ3pCO1FBQ0QsU0FBUyxFQUFFLEVBQUU7UUFDYixTQUFTLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQztRQUNwQyxPQUFPLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQztLQUNuQyxDQUFDO0dBQ1csdUJBQXVCLENBQ25DO1NBRFksdUJBQXVCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcblxyXG5pbXBvcnQge0NvbW1vbk1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcclxuaW1wb3J0IHtNYXRTZWxlY3RUYWJsZUNvbXBvbmVudH0gZnJvbSAnLi9tYXQtc2VsZWN0LXRhYmxlLmNvbXBvbmVudCc7XHJcbmltcG9ydCB7Tmd4TWF0U2VsZWN0U2VhcmNoTW9kdWxlfSBmcm9tICduZ3gtbWF0LXNlbGVjdC1zZWFyY2gnO1xyXG5pbXBvcnQgeyBNYXRDb21tb25Nb2R1bGUsIE1hdE9wdGlvbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2NvcmUnO1xuaW1wb3J0IHsgTWF0SWNvbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2ljb24nO1xuaW1wb3J0IHsgTWF0SW5wdXRNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9pbnB1dCc7XG5pbXBvcnQgeyBNYXRTZWxlY3RNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9zZWxlY3QnO1xuaW1wb3J0IHsgTWF0U29ydE1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL3NvcnQnO1xuaW1wb3J0IHsgTWF0VGFibGVNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC90YWJsZSc7XHJcbmltcG9ydCB7Rm9ybXNNb2R1bGUsIFJlYWN0aXZlRm9ybXNNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcclxuaW1wb3J0IHtNYXRTZWxlY3RUYWJsZUlucHV0UmVzdHJpY3Rpb25EaXJlY3RpdmV9IGZyb20gJy4vZGlyZWN0aXZlcy9tYXQtc2VsZWN0LXRhYmxlLWlucHV0LXJlc3RyaWN0aW9uLmRpcmVjdGl2ZSc7XHJcblxyXG5ATmdNb2R1bGUoe1xyXG4gIGRlY2xhcmF0aW9uczogW1xyXG4gICAgTWF0U2VsZWN0VGFibGVDb21wb25lbnQsXHJcbiAgICBNYXRTZWxlY3RUYWJsZUlucHV0UmVzdHJpY3Rpb25EaXJlY3RpdmVcclxuICBdLFxyXG4gIGltcG9ydHM6IFtcclxuICAgIENvbW1vbk1vZHVsZSxcclxuICAgIEZvcm1zTW9kdWxlLFxyXG4gICAgUmVhY3RpdmVGb3Jtc01vZHVsZSxcclxuICAgIE1hdFNlbGVjdE1vZHVsZSxcclxuICAgIE1hdFNvcnRNb2R1bGUsXHJcbiAgICBNYXRPcHRpb25Nb2R1bGUsXHJcbiAgICBNYXRDb21tb25Nb2R1bGUsXHJcbiAgICBNYXRUYWJsZU1vZHVsZSxcclxuICAgIE1hdElucHV0TW9kdWxlLFxyXG4gICAgTWF0SWNvbk1vZHVsZSxcclxuICAgIE5neE1hdFNlbGVjdFNlYXJjaE1vZHVsZVxyXG4gIF0sXHJcbiAgcHJvdmlkZXJzOiBbXSxcclxuICBib290c3RyYXA6IFtNYXRTZWxlY3RUYWJsZUNvbXBvbmVudF0sXHJcbiAgZXhwb3J0czogW01hdFNlbGVjdFRhYmxlQ29tcG9uZW50XVxyXG59KVxyXG5leHBvcnQgY2xhc3MgTmd4TWF0U2VsZWN0VGFibGVNb2R1bGUge1xyXG59XHJcbiJdfQ==