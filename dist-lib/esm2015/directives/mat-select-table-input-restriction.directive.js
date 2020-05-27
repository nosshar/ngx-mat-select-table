/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Directive, HostListener, Input } from '@angular/core';
export class MatSelectTableInputRestrictionDirective {
    /**
     * @param {?} event
     * @return {?}
     */
    onKeyPress(event) {
        if (this.appInputRestriction === 'integer') {
            this.integerOnly(event);
        }
    }
    /**
     * @param {?} event
     * @return {?}
     */
    integerOnly(event) {
        /** @type {?} */
        const e = (/** @type {?} */ (event));
        if (['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].indexOf(e.key) === -1) {
            e.preventDefault();
        }
    }
    /**
     * @param {?} event
     * @return {?}
     */
    onPaste(event) {
        /** @type {?} */
        let regex;
        if (this.appInputRestriction === 'integer') {
            regex = /^[0-9]*$/;
        }
        /** @type {?} */
        const e = (/** @type {?} */ (event));
        /** @type {?} */
        const pasteData = e.clipboardData.getData('text/plain');
        if (!pasteData.match(regex)) {
            e.preventDefault();
        }
    }
}
MatSelectTableInputRestrictionDirective.decorators = [
    { type: Directive, args: [{
                selector: '[appInputRestriction]'
            },] }
];
MatSelectTableInputRestrictionDirective.propDecorators = {
    appInputRestriction: [{ type: Input }],
    onKeyPress: [{ type: HostListener, args: ['keypress', ['$event'],] }],
    onPaste: [{ type: HostListener, args: ['paste', ['$event'],] }]
};
if (false) {
    /** @type {?} */
    MatSelectTableInputRestrictionDirective.prototype.appInputRestriction;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0LXNlbGVjdC10YWJsZS1pbnB1dC1yZXN0cmljdGlvbi5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9uZ3gtbWF0LXNlbGVjdC10YWJsZS8iLCJzb3VyY2VzIjpbImRpcmVjdGl2ZXMvbWF0LXNlbGVjdC10YWJsZS1pbnB1dC1yZXN0cmljdGlvbi5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFBQyxTQUFTLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUs3RCxNQUFNLE9BQU8sdUNBQXVDOzs7OztJQUlaLFVBQVUsQ0FBQyxLQUFLO1FBQ3BELElBQUksSUFBSSxDQUFDLG1CQUFtQixLQUFLLFNBQVMsRUFBRTtZQUMxQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3pCO0lBQ0gsQ0FBQzs7Ozs7SUFFRCxXQUFXLENBQUMsS0FBSzs7Y0FDVCxDQUFDLEdBQUcsbUJBQWUsS0FBSyxFQUFBO1FBQzlCLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO1lBQzVFLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztTQUNwQjtJQUNILENBQUM7Ozs7O0lBRWtDLE9BQU8sQ0FBQyxLQUFLOztZQUMxQyxLQUFLO1FBQ1QsSUFBSSxJQUFJLENBQUMsbUJBQW1CLEtBQUssU0FBUyxFQUFFO1lBQzFDLEtBQUssR0FBRyxVQUFVLENBQUM7U0FDcEI7O2NBQ0ssQ0FBQyxHQUFHLG1CQUFnQixLQUFLLEVBQUE7O2NBQ3pCLFNBQVMsR0FBRyxDQUFDLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUM7UUFDdkQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDM0IsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO1NBQ3BCO0lBQ0gsQ0FBQzs7O1lBOUJGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsdUJBQXVCO2FBQ2xDOzs7a0NBR0UsS0FBSzt5QkFFTCxZQUFZLFNBQUMsVUFBVSxFQUFFLENBQUMsUUFBUSxDQUFDO3NCQWFuQyxZQUFZLFNBQUMsT0FBTyxFQUFFLENBQUMsUUFBUSxDQUFDOzs7O0lBZmpDLHNFQUFxQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RGlyZWN0aXZlLCBIb3N0TGlzdGVuZXIsIElucHV0fSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2FwcElucHV0UmVzdHJpY3Rpb25dJ1xufSlcbmV4cG9ydCBjbGFzcyBNYXRTZWxlY3RUYWJsZUlucHV0UmVzdHJpY3Rpb25EaXJlY3RpdmUge1xuXG4gIEBJbnB1dCgpIGFwcElucHV0UmVzdHJpY3Rpb246IHN0cmluZztcblxuICBASG9zdExpc3RlbmVyKCdrZXlwcmVzcycsIFsnJGV2ZW50J10pIG9uS2V5UHJlc3MoZXZlbnQpIHtcbiAgICBpZiAodGhpcy5hcHBJbnB1dFJlc3RyaWN0aW9uID09PSAnaW50ZWdlcicpIHtcbiAgICAgIHRoaXMuaW50ZWdlck9ubHkoZXZlbnQpO1xuICAgIH1cbiAgfVxuXG4gIGludGVnZXJPbmx5KGV2ZW50KSB7XG4gICAgY29uc3QgZSA9IDxLZXlib2FyZEV2ZW50PmV2ZW50O1xuICAgIGlmIChbJzEnLCAnMicsICczJywgJzQnLCAnNScsICc2JywgJzcnLCAnOCcsICc5JywgJzAnXS5pbmRleE9mKGUua2V5KSA9PT0gLTEpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG4gIH1cblxuICBASG9zdExpc3RlbmVyKCdwYXN0ZScsIFsnJGV2ZW50J10pIG9uUGFzdGUoZXZlbnQpIHtcbiAgICBsZXQgcmVnZXg7XG4gICAgaWYgKHRoaXMuYXBwSW5wdXRSZXN0cmljdGlvbiA9PT0gJ2ludGVnZXInKSB7XG4gICAgICByZWdleCA9IC9eWzAtOV0qJC87XG4gICAgfVxuICAgIGNvbnN0IGUgPSA8Q2xpcGJvYXJkRXZlbnQ+ZXZlbnQ7XG4gICAgY29uc3QgcGFzdGVEYXRhID0gZS5jbGlwYm9hcmREYXRhLmdldERhdGEoJ3RleHQvcGxhaW4nKTtcbiAgICBpZiAoIXBhc3RlRGF0YS5tYXRjaChyZWdleCkpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==