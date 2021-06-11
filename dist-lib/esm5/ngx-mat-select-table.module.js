import * as tslib_1 from "tslib";
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectTableComponent } from './mat-select-table.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatCommonModule, MatIconModule, MatInputModule, MatOptionModule, MatSelectModule, MatSortModule, MatTableModule } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectTableInputRestrictionDirective } from './directives/mat-select-table-input-restriction.directive';
var NgxMatSelectTableModule = /** @class */ (function () {
    function NgxMatSelectTableModule() {
    }
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
    return NgxMatSelectTableModule;
}());
export { NgxMatSelectTableModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LW1hdC1zZWxlY3QtdGFibGUubW9kdWxlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmd4LW1hdC1zZWxlY3QtdGFibGUvIiwic291cmNlcyI6WyJuZ3gtbWF0LXNlbGVjdC10YWJsZS5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFdkMsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQzdDLE9BQU8sRUFBQyx1QkFBdUIsRUFBQyxNQUFNLDhCQUE4QixDQUFDO0FBQ3JFLE9BQU8sRUFBQyx3QkFBd0IsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQy9ELE9BQU8sRUFDTCxlQUFlLEVBQ2YsYUFBYSxFQUNiLGNBQWMsRUFDZCxlQUFlLEVBQ2YsZUFBZSxFQUNmLGFBQWEsRUFDYixjQUFjLEVBQ2YsTUFBTSxtQkFBbUIsQ0FBQztBQUMzQixPQUFPLEVBQUMsV0FBVyxFQUFFLG1CQUFtQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDaEUsT0FBTyxFQUFDLHVDQUF1QyxFQUFDLE1BQU0sMkRBQTJELENBQUM7QUF3QmxIO0lBQUE7SUFDQSxDQUFDO0lBRFksdUJBQXVCO1FBdEJuQyxRQUFRLENBQUM7WUFDUixZQUFZLEVBQUU7Z0JBQ1osdUJBQXVCO2dCQUN2Qix1Q0FBdUM7YUFDeEM7WUFDRCxPQUFPLEVBQUU7Z0JBQ1AsWUFBWTtnQkFDWixXQUFXO2dCQUNYLG1CQUFtQjtnQkFDbkIsZUFBZTtnQkFDZixhQUFhO2dCQUNiLGVBQWU7Z0JBQ2YsZUFBZTtnQkFDZixjQUFjO2dCQUNkLGNBQWM7Z0JBQ2QsYUFBYTtnQkFDYix3QkFBd0I7YUFDekI7WUFDRCxTQUFTLEVBQUUsRUFBRTtZQUNiLFNBQVMsRUFBRSxDQUFDLHVCQUF1QixDQUFDO1lBQ3BDLE9BQU8sRUFBRSxDQUFDLHVCQUF1QixDQUFDO1NBQ25DLENBQUM7T0FDVyx1QkFBdUIsQ0FDbkM7SUFBRCw4QkFBQztDQUFBLEFBREQsSUFDQztTQURZLHVCQUF1QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TmdNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5cclxuaW1wb3J0IHtDb21tb25Nb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XHJcbmltcG9ydCB7TWF0U2VsZWN0VGFibGVDb21wb25lbnR9IGZyb20gJy4vbWF0LXNlbGVjdC10YWJsZS5jb21wb25lbnQnO1xyXG5pbXBvcnQge05neE1hdFNlbGVjdFNlYXJjaE1vZHVsZX0gZnJvbSAnbmd4LW1hdC1zZWxlY3Qtc2VhcmNoJztcclxuaW1wb3J0IHtcclxuICBNYXRDb21tb25Nb2R1bGUsXHJcbiAgTWF0SWNvbk1vZHVsZSxcclxuICBNYXRJbnB1dE1vZHVsZSxcclxuICBNYXRPcHRpb25Nb2R1bGUsXHJcbiAgTWF0U2VsZWN0TW9kdWxlLFxyXG4gIE1hdFNvcnRNb2R1bGUsXHJcbiAgTWF0VGFibGVNb2R1bGVcclxufSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbCc7XHJcbmltcG9ydCB7Rm9ybXNNb2R1bGUsIFJlYWN0aXZlRm9ybXNNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcclxuaW1wb3J0IHtNYXRTZWxlY3RUYWJsZUlucHV0UmVzdHJpY3Rpb25EaXJlY3RpdmV9IGZyb20gJy4vZGlyZWN0aXZlcy9tYXQtc2VsZWN0LXRhYmxlLWlucHV0LXJlc3RyaWN0aW9uLmRpcmVjdGl2ZSc7XHJcblxyXG5ATmdNb2R1bGUoe1xyXG4gIGRlY2xhcmF0aW9uczogW1xyXG4gICAgTWF0U2VsZWN0VGFibGVDb21wb25lbnQsXHJcbiAgICBNYXRTZWxlY3RUYWJsZUlucHV0UmVzdHJpY3Rpb25EaXJlY3RpdmVcclxuICBdLFxyXG4gIGltcG9ydHM6IFtcclxuICAgIENvbW1vbk1vZHVsZSxcclxuICAgIEZvcm1zTW9kdWxlLFxyXG4gICAgUmVhY3RpdmVGb3Jtc01vZHVsZSxcclxuICAgIE1hdFNlbGVjdE1vZHVsZSxcclxuICAgIE1hdFNvcnRNb2R1bGUsXHJcbiAgICBNYXRPcHRpb25Nb2R1bGUsXHJcbiAgICBNYXRDb21tb25Nb2R1bGUsXHJcbiAgICBNYXRUYWJsZU1vZHVsZSxcclxuICAgIE1hdElucHV0TW9kdWxlLFxyXG4gICAgTWF0SWNvbk1vZHVsZSxcclxuICAgIE5neE1hdFNlbGVjdFNlYXJjaE1vZHVsZVxyXG4gIF0sXHJcbiAgcHJvdmlkZXJzOiBbXSxcclxuICBib290c3RyYXA6IFtNYXRTZWxlY3RUYWJsZUNvbXBvbmVudF0sXHJcbiAgZXhwb3J0czogW01hdFNlbGVjdFRhYmxlQ29tcG9uZW50XVxyXG59KVxyXG5leHBvcnQgY2xhc3MgTmd4TWF0U2VsZWN0VGFibGVNb2R1bGUge1xyXG59XHJcbiJdfQ==