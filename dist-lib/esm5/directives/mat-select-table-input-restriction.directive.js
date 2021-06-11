import * as tslib_1 from "tslib";
import { Directive, HostListener, Input } from '@angular/core';
var MatSelectTableInputRestrictionDirective = /** @class */ (function () {
    function MatSelectTableInputRestrictionDirective() {
    }
    MatSelectTableInputRestrictionDirective.prototype.onKeyPress = function (event) {
        if (this.appInputRestriction === 'integer') {
            this.integerOnly(event);
        }
    };
    MatSelectTableInputRestrictionDirective.prototype.integerOnly = function (event) {
        var e = event;
        if (['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].indexOf(e.key) === -1) {
            e.preventDefault();
        }
    };
    MatSelectTableInputRestrictionDirective.prototype.onPaste = function (event) {
        var regex;
        if (this.appInputRestriction === 'integer') {
            regex = /^[0-9]*$/;
        }
        var e = event;
        var pasteData = e.clipboardData.getData('text/plain');
        if (!pasteData.match(regex)) {
            e.preventDefault();
        }
    };
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", String)
    ], MatSelectTableInputRestrictionDirective.prototype, "appInputRestriction", void 0);
    tslib_1.__decorate([
        HostListener('keypress', ['$event']),
        tslib_1.__metadata("design:type", Function),
        tslib_1.__metadata("design:paramtypes", [Object]),
        tslib_1.__metadata("design:returntype", void 0)
    ], MatSelectTableInputRestrictionDirective.prototype, "onKeyPress", null);
    tslib_1.__decorate([
        HostListener('paste', ['$event']),
        tslib_1.__metadata("design:type", Function),
        tslib_1.__metadata("design:paramtypes", [Object]),
        tslib_1.__metadata("design:returntype", void 0)
    ], MatSelectTableInputRestrictionDirective.prototype, "onPaste", null);
    MatSelectTableInputRestrictionDirective = tslib_1.__decorate([
        Directive({
            selector: '[appInputRestriction]'
        })
    ], MatSelectTableInputRestrictionDirective);
    return MatSelectTableInputRestrictionDirective;
}());
export { MatSelectTableInputRestrictionDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0LXNlbGVjdC10YWJsZS1pbnB1dC1yZXN0cmljdGlvbi5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9uZ3gtbWF0LXNlbGVjdC10YWJsZS8iLCJzb3VyY2VzIjpbImRpcmVjdGl2ZXMvbWF0LXNlbGVjdC10YWJsZS1pbnB1dC1yZXN0cmljdGlvbi5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBQyxTQUFTLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUs3RDtJQUFBO0lBNEJBLENBQUM7SUF4QnVDLDREQUFVLEdBQVYsVUFBVyxLQUFLO1FBQ3BELElBQUksSUFBSSxDQUFDLG1CQUFtQixLQUFLLFNBQVMsRUFBRTtZQUMxQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3pCO0lBQ0gsQ0FBQztJQUVELDZEQUFXLEdBQVgsVUFBWSxLQUFLO1FBQ2YsSUFBTSxDQUFDLEdBQWtCLEtBQUssQ0FBQztRQUMvQixJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtZQUM1RSxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7U0FDcEI7SUFDSCxDQUFDO0lBRWtDLHlEQUFPLEdBQVAsVUFBUSxLQUFLO1FBQzlDLElBQUksS0FBSyxDQUFDO1FBQ1YsSUFBSSxJQUFJLENBQUMsbUJBQW1CLEtBQUssU0FBUyxFQUFFO1lBQzFDLEtBQUssR0FBRyxVQUFVLENBQUM7U0FDcEI7UUFDRCxJQUFNLENBQUMsR0FBbUIsS0FBSyxDQUFDO1FBQ2hDLElBQU0sU0FBUyxHQUFHLENBQUMsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3hELElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQzNCLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztTQUNwQjtJQUNILENBQUM7SUF6QlE7UUFBUixLQUFLLEVBQUU7O3dGQUE2QjtJQUVDO1FBQXJDLFlBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQzs7Ozs2RUFJcEM7SUFTa0M7UUFBbEMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDOzs7OzBFQVVqQztJQTNCVSx1Q0FBdUM7UUFIbkQsU0FBUyxDQUFDO1lBQ1QsUUFBUSxFQUFFLHVCQUF1QjtTQUNsQyxDQUFDO09BQ1csdUNBQXVDLENBNEJuRDtJQUFELDhDQUFDO0NBQUEsQUE1QkQsSUE0QkM7U0E1QlksdUNBQXVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtEaXJlY3RpdmUsIEhvc3RMaXN0ZW5lciwgSW5wdXR9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5cclxuQERpcmVjdGl2ZSh7XHJcbiAgc2VsZWN0b3I6ICdbYXBwSW5wdXRSZXN0cmljdGlvbl0nXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBNYXRTZWxlY3RUYWJsZUlucHV0UmVzdHJpY3Rpb25EaXJlY3RpdmUge1xyXG5cclxuICBASW5wdXQoKSBhcHBJbnB1dFJlc3RyaWN0aW9uOiBzdHJpbmc7XHJcblxyXG4gIEBIb3N0TGlzdGVuZXIoJ2tleXByZXNzJywgWyckZXZlbnQnXSkgb25LZXlQcmVzcyhldmVudCkge1xyXG4gICAgaWYgKHRoaXMuYXBwSW5wdXRSZXN0cmljdGlvbiA9PT0gJ2ludGVnZXInKSB7XHJcbiAgICAgIHRoaXMuaW50ZWdlck9ubHkoZXZlbnQpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgaW50ZWdlck9ubHkoZXZlbnQpIHtcclxuICAgIGNvbnN0IGUgPSA8S2V5Ym9hcmRFdmVudD5ldmVudDtcclxuICAgIGlmIChbJzEnLCAnMicsICczJywgJzQnLCAnNScsICc2JywgJzcnLCAnOCcsICc5JywgJzAnXS5pbmRleE9mKGUua2V5KSA9PT0gLTEpIHtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgQEhvc3RMaXN0ZW5lcigncGFzdGUnLCBbJyRldmVudCddKSBvblBhc3RlKGV2ZW50KSB7XHJcbiAgICBsZXQgcmVnZXg7XHJcbiAgICBpZiAodGhpcy5hcHBJbnB1dFJlc3RyaWN0aW9uID09PSAnaW50ZWdlcicpIHtcclxuICAgICAgcmVnZXggPSAvXlswLTldKiQvO1xyXG4gICAgfVxyXG4gICAgY29uc3QgZSA9IDxDbGlwYm9hcmRFdmVudD5ldmVudDtcclxuICAgIGNvbnN0IHBhc3RlRGF0YSA9IGUuY2xpcGJvYXJkRGF0YS5nZXREYXRhKCd0ZXh0L3BsYWluJyk7XHJcbiAgICBpZiAoIXBhc3RlRGF0YS5tYXRjaChyZWdleCkpIHtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iXX0=