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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LW1hdC1zZWxlY3QtdGFibGUubW9kdWxlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmd4LW1hdC1zZWxlY3QtdGFibGUvIiwic291cmNlcyI6WyJuZ3gtbWF0LXNlbGVjdC10YWJsZS5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFdkMsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQzdDLE9BQU8sRUFBQyx1QkFBdUIsRUFBQyxNQUFNLDhCQUE4QixDQUFDO0FBQ3JFLE9BQU8sRUFBQyx3QkFBd0IsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQy9ELE9BQU8sRUFBRSxlQUFlLEVBQUUsZUFBZSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDMUUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ3ZELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUN6RCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDM0QsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ3ZELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUN6RCxPQUFPLEVBQUMsV0FBVyxFQUFFLG1CQUFtQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDaEUsT0FBTyxFQUFDLHVDQUF1QyxFQUFDLE1BQU0sMkRBQTJELENBQUM7QUF3QmxIO0lBQUE7SUFDQSxDQUFDO0lBRFksdUJBQXVCO1FBdEJuQyxRQUFRLENBQUM7WUFDUixZQUFZLEVBQUU7Z0JBQ1osdUJBQXVCO2dCQUN2Qix1Q0FBdUM7YUFDeEM7WUFDRCxPQUFPLEVBQUU7Z0JBQ1AsWUFBWTtnQkFDWixXQUFXO2dCQUNYLG1CQUFtQjtnQkFDbkIsZUFBZTtnQkFDZixhQUFhO2dCQUNiLGVBQWU7Z0JBQ2YsZUFBZTtnQkFDZixjQUFjO2dCQUNkLGNBQWM7Z0JBQ2QsYUFBYTtnQkFDYix3QkFBd0I7YUFDekI7WUFDRCxTQUFTLEVBQUUsRUFBRTtZQUNiLFNBQVMsRUFBRSxDQUFDLHVCQUF1QixDQUFDO1lBQ3BDLE9BQU8sRUFBRSxDQUFDLHVCQUF1QixDQUFDO1NBQ25DLENBQUM7T0FDVyx1QkFBdUIsQ0FDbkM7SUFBRCw4QkFBQztDQUFBLEFBREQsSUFDQztTQURZLHVCQUF1QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TmdNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5cclxuaW1wb3J0IHtDb21tb25Nb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XHJcbmltcG9ydCB7TWF0U2VsZWN0VGFibGVDb21wb25lbnR9IGZyb20gJy4vbWF0LXNlbGVjdC10YWJsZS5jb21wb25lbnQnO1xyXG5pbXBvcnQge05neE1hdFNlbGVjdFNlYXJjaE1vZHVsZX0gZnJvbSAnbmd4LW1hdC1zZWxlY3Qtc2VhcmNoJztcclxuaW1wb3J0IHsgTWF0Q29tbW9uTW9kdWxlLCBNYXRPcHRpb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9jb3JlJztcbmltcG9ydCB7IE1hdEljb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9pY29uJztcbmltcG9ydCB7IE1hdElucHV0TW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvaW5wdXQnO1xuaW1wb3J0IHsgTWF0U2VsZWN0TW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvc2VsZWN0JztcbmltcG9ydCB7IE1hdFNvcnRNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9zb3J0JztcbmltcG9ydCB7IE1hdFRhYmxlTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvdGFibGUnO1xyXG5pbXBvcnQge0Zvcm1zTW9kdWxlLCBSZWFjdGl2ZUZvcm1zTW9kdWxlfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XHJcbmltcG9ydCB7TWF0U2VsZWN0VGFibGVJbnB1dFJlc3RyaWN0aW9uRGlyZWN0aXZlfSBmcm9tICcuL2RpcmVjdGl2ZXMvbWF0LXNlbGVjdC10YWJsZS1pbnB1dC1yZXN0cmljdGlvbi5kaXJlY3RpdmUnO1xyXG5cclxuQE5nTW9kdWxlKHtcclxuICBkZWNsYXJhdGlvbnM6IFtcclxuICAgIE1hdFNlbGVjdFRhYmxlQ29tcG9uZW50LFxyXG4gICAgTWF0U2VsZWN0VGFibGVJbnB1dFJlc3RyaWN0aW9uRGlyZWN0aXZlXHJcbiAgXSxcclxuICBpbXBvcnRzOiBbXHJcbiAgICBDb21tb25Nb2R1bGUsXHJcbiAgICBGb3Jtc01vZHVsZSxcclxuICAgIFJlYWN0aXZlRm9ybXNNb2R1bGUsXHJcbiAgICBNYXRTZWxlY3RNb2R1bGUsXHJcbiAgICBNYXRTb3J0TW9kdWxlLFxyXG4gICAgTWF0T3B0aW9uTW9kdWxlLFxyXG4gICAgTWF0Q29tbW9uTW9kdWxlLFxyXG4gICAgTWF0VGFibGVNb2R1bGUsXHJcbiAgICBNYXRJbnB1dE1vZHVsZSxcclxuICAgIE1hdEljb25Nb2R1bGUsXHJcbiAgICBOZ3hNYXRTZWxlY3RTZWFyY2hNb2R1bGVcclxuICBdLFxyXG4gIHByb3ZpZGVyczogW10sXHJcbiAgYm9vdHN0cmFwOiBbTWF0U2VsZWN0VGFibGVDb21wb25lbnRdLFxyXG4gIGV4cG9ydHM6IFtNYXRTZWxlY3RUYWJsZUNvbXBvbmVudF1cclxufSlcclxuZXhwb3J0IGNsYXNzIE5neE1hdFNlbGVjdFRhYmxlTW9kdWxlIHtcclxufVxyXG4iXX0=