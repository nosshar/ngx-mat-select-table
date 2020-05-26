/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
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
    NgxMatSelectTableModule.decorators = [
        { type: NgModule, args: [{
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
                },] }
    ];
    return NgxMatSelectTableModule;
}());
export { NgxMatSelectTableModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LW1hdC1zZWxlY3QtdGFibGUubW9kdWxlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmd4LW1hdC1zZWxlY3QtdGFibGUvIiwic291cmNlcyI6WyJuZ3gtbWF0LXNlbGVjdC10YWJsZS5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFdkMsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQzdDLE9BQU8sRUFBQyx1QkFBdUIsRUFBQyxNQUFNLDhCQUE4QixDQUFDO0FBQ3JFLE9BQU8sRUFBQyx3QkFBd0IsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQy9ELE9BQU8sRUFDTCxlQUFlLEVBQ2YsYUFBYSxFQUNiLGNBQWMsRUFDZCxlQUFlLEVBQ2YsZUFBZSxFQUNmLGFBQWEsRUFDYixjQUFjLEVBQ2YsTUFBTSxtQkFBbUIsQ0FBQztBQUMzQixPQUFPLEVBQUMsV0FBVyxFQUFFLG1CQUFtQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDaEUsT0FBTyxFQUFDLHVDQUF1QyxFQUFDLE1BQU0sMkRBQTJELENBQUM7QUFFbEg7SUFBQTtJQXVCQSxDQUFDOztnQkF2QkEsUUFBUSxTQUFDO29CQUNSLFlBQVksRUFBRTt3QkFDWix1QkFBdUI7d0JBQ3ZCLHVDQUF1QztxQkFDeEM7b0JBQ0QsT0FBTyxFQUFFO3dCQUNQLFlBQVk7d0JBQ1osV0FBVzt3QkFDWCxtQkFBbUI7d0JBQ25CLGVBQWU7d0JBQ2YsYUFBYTt3QkFDYixlQUFlO3dCQUNmLGVBQWU7d0JBQ2YsY0FBYzt3QkFDZCxjQUFjO3dCQUNkLGFBQWE7d0JBQ2Isd0JBQXdCO3FCQUN6QjtvQkFDRCxTQUFTLEVBQUUsRUFBRTtvQkFDYixTQUFTLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQztvQkFDcEMsT0FBTyxFQUFFLENBQUMsdUJBQXVCLENBQUM7aUJBQ25DOztJQUVELDhCQUFDO0NBQUEsQUF2QkQsSUF1QkM7U0FEWSx1QkFBdUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge05nTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtDb21tb25Nb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge01hdFNlbGVjdFRhYmxlQ29tcG9uZW50fSBmcm9tICcuL21hdC1zZWxlY3QtdGFibGUuY29tcG9uZW50JztcbmltcG9ydCB7Tmd4TWF0U2VsZWN0U2VhcmNoTW9kdWxlfSBmcm9tICduZ3gtbWF0LXNlbGVjdC1zZWFyY2gnO1xuaW1wb3J0IHtcbiAgTWF0Q29tbW9uTW9kdWxlLFxuICBNYXRJY29uTW9kdWxlLFxuICBNYXRJbnB1dE1vZHVsZSxcbiAgTWF0T3B0aW9uTW9kdWxlLFxuICBNYXRTZWxlY3RNb2R1bGUsXG4gIE1hdFNvcnRNb2R1bGUsXG4gIE1hdFRhYmxlTW9kdWxlXG59IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsJztcbmltcG9ydCB7Rm9ybXNNb2R1bGUsIFJlYWN0aXZlRm9ybXNNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7TWF0U2VsZWN0VGFibGVJbnB1dFJlc3RyaWN0aW9uRGlyZWN0aXZlfSBmcm9tICcuL2RpcmVjdGl2ZXMvbWF0LXNlbGVjdC10YWJsZS1pbnB1dC1yZXN0cmljdGlvbi5kaXJlY3RpdmUnO1xuXG5ATmdNb2R1bGUoe1xuICBkZWNsYXJhdGlvbnM6IFtcbiAgICBNYXRTZWxlY3RUYWJsZUNvbXBvbmVudCxcbiAgICBNYXRTZWxlY3RUYWJsZUlucHV0UmVzdHJpY3Rpb25EaXJlY3RpdmVcbiAgXSxcbiAgaW1wb3J0czogW1xuICAgIENvbW1vbk1vZHVsZSxcbiAgICBGb3Jtc01vZHVsZSxcbiAgICBSZWFjdGl2ZUZvcm1zTW9kdWxlLFxuICAgIE1hdFNlbGVjdE1vZHVsZSxcbiAgICBNYXRTb3J0TW9kdWxlLFxuICAgIE1hdE9wdGlvbk1vZHVsZSxcbiAgICBNYXRDb21tb25Nb2R1bGUsXG4gICAgTWF0VGFibGVNb2R1bGUsXG4gICAgTWF0SW5wdXRNb2R1bGUsXG4gICAgTWF0SWNvbk1vZHVsZSxcbiAgICBOZ3hNYXRTZWxlY3RTZWFyY2hNb2R1bGVcbiAgXSxcbiAgcHJvdmlkZXJzOiBbXSxcbiAgYm9vdHN0cmFwOiBbTWF0U2VsZWN0VGFibGVDb21wb25lbnRdLFxuICBleHBvcnRzOiBbTWF0U2VsZWN0VGFibGVDb21wb25lbnRdXG59KVxuZXhwb3J0IGNsYXNzIE5neE1hdFNlbGVjdFRhYmxlTW9kdWxlIHtcbn1cbiJdfQ==