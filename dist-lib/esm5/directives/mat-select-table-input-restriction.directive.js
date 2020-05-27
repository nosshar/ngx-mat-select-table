/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Directive, HostListener, Input } from '@angular/core';
var MatSelectTableInputRestrictionDirective = /** @class */ (function () {
    function MatSelectTableInputRestrictionDirective() {
    }
    /**
     * @param {?} event
     * @return {?}
     */
    MatSelectTableInputRestrictionDirective.prototype.onKeyPress = /**
     * @param {?} event
     * @return {?}
     */
    function (event) {
        if (this.appInputRestriction === 'integer') {
            this.integerOnly(event);
        }
    };
    /**
     * @param {?} event
     * @return {?}
     */
    MatSelectTableInputRestrictionDirective.prototype.integerOnly = /**
     * @param {?} event
     * @return {?}
     */
    function (event) {
        /** @type {?} */
        var e = (/** @type {?} */ (event));
        if (['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].indexOf(e.key) === -1) {
            e.preventDefault();
        }
    };
    /**
     * @param {?} event
     * @return {?}
     */
    MatSelectTableInputRestrictionDirective.prototype.onPaste = /**
     * @param {?} event
     * @return {?}
     */
    function (event) {
        /** @type {?} */
        var regex;
        if (this.appInputRestriction === 'integer') {
            regex = /^[0-9]*$/;
        }
        /** @type {?} */
        var e = (/** @type {?} */ (event));
        /** @type {?} */
        var pasteData = e.clipboardData.getData('text/plain');
        if (!pasteData.match(regex)) {
            e.preventDefault();
        }
    };
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
    return MatSelectTableInputRestrictionDirective;
}());
export { MatSelectTableInputRestrictionDirective };
if (false) {
    /** @type {?} */
    MatSelectTableInputRestrictionDirective.prototype.appInputRestriction;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0LXNlbGVjdC10YWJsZS1pbnB1dC1yZXN0cmljdGlvbi5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9uZ3gtbWF0LXNlbGVjdC10YWJsZS8iLCJzb3VyY2VzIjpbImRpcmVjdGl2ZXMvbWF0LXNlbGVjdC10YWJsZS1pbnB1dC1yZXN0cmljdGlvbi5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFBQyxTQUFTLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUU3RDtJQUFBO0lBK0JBLENBQUM7Ozs7O0lBeEJ1Qyw0REFBVTs7OztJQUFoRCxVQUFpRCxLQUFLO1FBQ3BELElBQUksSUFBSSxDQUFDLG1CQUFtQixLQUFLLFNBQVMsRUFBRTtZQUMxQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3pCO0lBQ0gsQ0FBQzs7Ozs7SUFFRCw2REFBVzs7OztJQUFYLFVBQVksS0FBSzs7WUFDVCxDQUFDLEdBQUcsbUJBQWUsS0FBSyxFQUFBO1FBQzlCLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO1lBQzVFLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztTQUNwQjtJQUNILENBQUM7Ozs7O0lBRWtDLHlEQUFPOzs7O0lBQTFDLFVBQTJDLEtBQUs7O1lBQzFDLEtBQUs7UUFDVCxJQUFJLElBQUksQ0FBQyxtQkFBbUIsS0FBSyxTQUFTLEVBQUU7WUFDMUMsS0FBSyxHQUFHLFVBQVUsQ0FBQztTQUNwQjs7WUFDSyxDQUFDLEdBQUcsbUJBQWdCLEtBQUssRUFBQTs7WUFDekIsU0FBUyxHQUFHLENBQUMsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQztRQUN2RCxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUMzQixDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7U0FDcEI7SUFDSCxDQUFDOztnQkE5QkYsU0FBUyxTQUFDO29CQUNULFFBQVEsRUFBRSx1QkFBdUI7aUJBQ2xDOzs7c0NBR0UsS0FBSzs2QkFFTCxZQUFZLFNBQUMsVUFBVSxFQUFFLENBQUMsUUFBUSxDQUFDOzBCQWFuQyxZQUFZLFNBQUMsT0FBTyxFQUFFLENBQUMsUUFBUSxDQUFDOztJQVduQyw4Q0FBQztDQUFBLEFBL0JELElBK0JDO1NBNUJZLHVDQUF1Qzs7O0lBRWxELHNFQUFxQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RGlyZWN0aXZlLCBIb3N0TGlzdGVuZXIsIElucHV0fSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2FwcElucHV0UmVzdHJpY3Rpb25dJ1xufSlcbmV4cG9ydCBjbGFzcyBNYXRTZWxlY3RUYWJsZUlucHV0UmVzdHJpY3Rpb25EaXJlY3RpdmUge1xuXG4gIEBJbnB1dCgpIGFwcElucHV0UmVzdHJpY3Rpb246IHN0cmluZztcblxuICBASG9zdExpc3RlbmVyKCdrZXlwcmVzcycsIFsnJGV2ZW50J10pIG9uS2V5UHJlc3MoZXZlbnQpIHtcbiAgICBpZiAodGhpcy5hcHBJbnB1dFJlc3RyaWN0aW9uID09PSAnaW50ZWdlcicpIHtcbiAgICAgIHRoaXMuaW50ZWdlck9ubHkoZXZlbnQpO1xuICAgIH1cbiAgfVxuXG4gIGludGVnZXJPbmx5KGV2ZW50KSB7XG4gICAgY29uc3QgZSA9IDxLZXlib2FyZEV2ZW50PmV2ZW50O1xuICAgIGlmIChbJzEnLCAnMicsICczJywgJzQnLCAnNScsICc2JywgJzcnLCAnOCcsICc5JywgJzAnXS5pbmRleE9mKGUua2V5KSA9PT0gLTEpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG4gIH1cblxuICBASG9zdExpc3RlbmVyKCdwYXN0ZScsIFsnJGV2ZW50J10pIG9uUGFzdGUoZXZlbnQpIHtcbiAgICBsZXQgcmVnZXg7XG4gICAgaWYgKHRoaXMuYXBwSW5wdXRSZXN0cmljdGlvbiA9PT0gJ2ludGVnZXInKSB7XG4gICAgICByZWdleCA9IC9eWzAtOV0qJC87XG4gICAgfVxuICAgIGNvbnN0IGUgPSA8Q2xpcGJvYXJkRXZlbnQ+ZXZlbnQ7XG4gICAgY29uc3QgcGFzdGVEYXRhID0gZS5jbGlwYm9hcmREYXRhLmdldERhdGEoJ3RleHQvcGxhaW4nKTtcbiAgICBpZiAoIXBhc3RlRGF0YS5tYXRjaChyZWdleCkpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==