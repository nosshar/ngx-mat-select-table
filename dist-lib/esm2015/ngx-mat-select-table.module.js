import * as tslib_1 from "tslib";
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectTableComponent } from './mat-select-table.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatCommonModule, MatIconModule, MatInputModule, MatOptionModule, MatSelectModule, MatSortModule, MatTableModule } from '@angular/material';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LW1hdC1zZWxlY3QtdGFibGUubW9kdWxlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmd4LW1hdC1zZWxlY3QtdGFibGUvIiwic291cmNlcyI6WyJuZ3gtbWF0LXNlbGVjdC10YWJsZS5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFdkMsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQzdDLE9BQU8sRUFBQyx1QkFBdUIsRUFBQyxNQUFNLDhCQUE4QixDQUFDO0FBQ3JFLE9BQU8sRUFBQyx3QkFBd0IsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQy9ELE9BQU8sRUFDTCxlQUFlLEVBQ2YsYUFBYSxFQUNiLGNBQWMsRUFDZCxlQUFlLEVBQ2YsZUFBZSxFQUNmLGFBQWEsRUFDYixjQUFjLEVBQ2YsTUFBTSxtQkFBbUIsQ0FBQztBQUMzQixPQUFPLEVBQUMsV0FBVyxFQUFFLG1CQUFtQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDaEUsT0FBTyxFQUFDLHVDQUF1QyxFQUFDLE1BQU0sMkRBQTJELENBQUM7QUF3QmxILElBQWEsdUJBQXVCLEdBQXBDLE1BQWEsdUJBQXVCO0NBQ25DLENBQUE7QUFEWSx1QkFBdUI7SUF0Qm5DLFFBQVEsQ0FBQztRQUNSLFlBQVksRUFBRTtZQUNaLHVCQUF1QjtZQUN2Qix1Q0FBdUM7U0FDeEM7UUFDRCxPQUFPLEVBQUU7WUFDUCxZQUFZO1lBQ1osV0FBVztZQUNYLG1CQUFtQjtZQUNuQixlQUFlO1lBQ2YsYUFBYTtZQUNiLGVBQWU7WUFDZixlQUFlO1lBQ2YsY0FBYztZQUNkLGNBQWM7WUFDZCxhQUFhO1lBQ2Isd0JBQXdCO1NBQ3pCO1FBQ0QsU0FBUyxFQUFFLEVBQUU7UUFDYixTQUFTLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQztRQUNwQyxPQUFPLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQztLQUNuQyxDQUFDO0dBQ1csdUJBQXVCLENBQ25DO1NBRFksdUJBQXVCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcblxyXG5pbXBvcnQge0NvbW1vbk1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcclxuaW1wb3J0IHtNYXRTZWxlY3RUYWJsZUNvbXBvbmVudH0gZnJvbSAnLi9tYXQtc2VsZWN0LXRhYmxlLmNvbXBvbmVudCc7XHJcbmltcG9ydCB7Tmd4TWF0U2VsZWN0U2VhcmNoTW9kdWxlfSBmcm9tICduZ3gtbWF0LXNlbGVjdC1zZWFyY2gnO1xyXG5pbXBvcnQge1xyXG4gIE1hdENvbW1vbk1vZHVsZSxcclxuICBNYXRJY29uTW9kdWxlLFxyXG4gIE1hdElucHV0TW9kdWxlLFxyXG4gIE1hdE9wdGlvbk1vZHVsZSxcclxuICBNYXRTZWxlY3RNb2R1bGUsXHJcbiAgTWF0U29ydE1vZHVsZSxcclxuICBNYXRUYWJsZU1vZHVsZVxyXG59IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsJztcclxuaW1wb3J0IHtGb3Jtc01vZHVsZSwgUmVhY3RpdmVGb3Jtc01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xyXG5pbXBvcnQge01hdFNlbGVjdFRhYmxlSW5wdXRSZXN0cmljdGlvbkRpcmVjdGl2ZX0gZnJvbSAnLi9kaXJlY3RpdmVzL21hdC1zZWxlY3QtdGFibGUtaW5wdXQtcmVzdHJpY3Rpb24uZGlyZWN0aXZlJztcclxuXHJcbkBOZ01vZHVsZSh7XHJcbiAgZGVjbGFyYXRpb25zOiBbXHJcbiAgICBNYXRTZWxlY3RUYWJsZUNvbXBvbmVudCxcclxuICAgIE1hdFNlbGVjdFRhYmxlSW5wdXRSZXN0cmljdGlvbkRpcmVjdGl2ZVxyXG4gIF0sXHJcbiAgaW1wb3J0czogW1xyXG4gICAgQ29tbW9uTW9kdWxlLFxyXG4gICAgRm9ybXNNb2R1bGUsXHJcbiAgICBSZWFjdGl2ZUZvcm1zTW9kdWxlLFxyXG4gICAgTWF0U2VsZWN0TW9kdWxlLFxyXG4gICAgTWF0U29ydE1vZHVsZSxcclxuICAgIE1hdE9wdGlvbk1vZHVsZSxcclxuICAgIE1hdENvbW1vbk1vZHVsZSxcclxuICAgIE1hdFRhYmxlTW9kdWxlLFxyXG4gICAgTWF0SW5wdXRNb2R1bGUsXHJcbiAgICBNYXRJY29uTW9kdWxlLFxyXG4gICAgTmd4TWF0U2VsZWN0U2VhcmNoTW9kdWxlXHJcbiAgXSxcclxuICBwcm92aWRlcnM6IFtdLFxyXG4gIGJvb3RzdHJhcDogW01hdFNlbGVjdFRhYmxlQ29tcG9uZW50XSxcclxuICBleHBvcnRzOiBbTWF0U2VsZWN0VGFibGVDb21wb25lbnRdXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBOZ3hNYXRTZWxlY3RUYWJsZU1vZHVsZSB7XHJcbn1cclxuIl19