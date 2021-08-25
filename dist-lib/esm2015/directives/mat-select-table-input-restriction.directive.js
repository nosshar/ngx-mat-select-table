import * as tslib_1 from "tslib";
import { Directive, HostListener, Input } from '@angular/core';
let MatSelectTableInputRestrictionDirective = class MatSelectTableInputRestrictionDirective {
    onKeyPress(event) {
        if (this.appInputRestriction === 'integer') {
            this.integerOnly(event);
        }
    }
    integerOnly(event) {
        const e = event;
        if (['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].indexOf(e.key) === -1) {
            e.preventDefault();
        }
    }
    onPaste(event) {
        let regex;
        if (this.appInputRestriction === 'integer') {
            regex = /^[0-9]*$/;
        }
        const e = event;
        const pasteData = e.clipboardData.getData('text/plain');
        if (!pasteData.match(regex)) {
            e.preventDefault();
        }
    }
};
tslib_1.__decorate([
    Input()
], MatSelectTableInputRestrictionDirective.prototype, "appInputRestriction", void 0);
tslib_1.__decorate([
    HostListener('keypress', ['$event'])
], MatSelectTableInputRestrictionDirective.prototype, "onKeyPress", null);
tslib_1.__decorate([
    HostListener('paste', ['$event'])
], MatSelectTableInputRestrictionDirective.prototype, "onPaste", null);
MatSelectTableInputRestrictionDirective = tslib_1.__decorate([
    Directive({
        selector: '[appInputRestriction]'
    })
], MatSelectTableInputRestrictionDirective);
export { MatSelectTableInputRestrictionDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0LXNlbGVjdC10YWJsZS1pbnB1dC1yZXN0cmljdGlvbi5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9uZ3gtbWF0LXNlbGVjdC10YWJsZS8iLCJzb3VyY2VzIjpbImRpcmVjdGl2ZXMvbWF0LXNlbGVjdC10YWJsZS1pbnB1dC1yZXN0cmljdGlvbi5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBQyxTQUFTLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUs3RCxJQUFhLHVDQUF1QyxHQUFwRCxNQUFhLHVDQUF1QztJQUlaLFVBQVUsQ0FBQyxLQUFLO1FBQ3BELElBQUksSUFBSSxDQUFDLG1CQUFtQixLQUFLLFNBQVMsRUFBRTtZQUMxQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3pCO0lBQ0gsQ0FBQztJQUVELFdBQVcsQ0FBQyxLQUFLO1FBQ2YsTUFBTSxDQUFDLEdBQWtCLEtBQUssQ0FBQztRQUMvQixJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtZQUM1RSxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7U0FDcEI7SUFDSCxDQUFDO0lBRWtDLE9BQU8sQ0FBQyxLQUFLO1FBQzlDLElBQUksS0FBSyxDQUFDO1FBQ1YsSUFBSSxJQUFJLENBQUMsbUJBQW1CLEtBQUssU0FBUyxFQUFFO1lBQzFDLEtBQUssR0FBRyxVQUFVLENBQUM7U0FDcEI7UUFDRCxNQUFNLENBQUMsR0FBbUIsS0FBSyxDQUFDO1FBQ2hDLE1BQU0sU0FBUyxHQUFHLENBQUMsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3hELElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQzNCLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztTQUNwQjtJQUNILENBQUM7Q0FDRixDQUFBO0FBMUJVO0lBQVIsS0FBSyxFQUFFO29GQUE2QjtBQUVDO0lBQXJDLFlBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQzt5RUFJcEM7QUFTa0M7SUFBbEMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDO3NFQVVqQztBQTNCVSx1Q0FBdUM7SUFIbkQsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLHVCQUF1QjtLQUNsQyxDQUFDO0dBQ1csdUNBQXVDLENBNEJuRDtTQTVCWSx1Q0FBdUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0RpcmVjdGl2ZSwgSG9zdExpc3RlbmVyLCBJbnB1dH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcblxyXG5ARGlyZWN0aXZlKHtcclxuICBzZWxlY3RvcjogJ1thcHBJbnB1dFJlc3RyaWN0aW9uXSdcclxufSlcclxuZXhwb3J0IGNsYXNzIE1hdFNlbGVjdFRhYmxlSW5wdXRSZXN0cmljdGlvbkRpcmVjdGl2ZSB7XHJcblxyXG4gIEBJbnB1dCgpIGFwcElucHV0UmVzdHJpY3Rpb246IHN0cmluZztcclxuXHJcbiAgQEhvc3RMaXN0ZW5lcigna2V5cHJlc3MnLCBbJyRldmVudCddKSBvbktleVByZXNzKGV2ZW50KSB7XHJcbiAgICBpZiAodGhpcy5hcHBJbnB1dFJlc3RyaWN0aW9uID09PSAnaW50ZWdlcicpIHtcclxuICAgICAgdGhpcy5pbnRlZ2VyT25seShldmVudCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBpbnRlZ2VyT25seShldmVudCkge1xyXG4gICAgY29uc3QgZSA9IDxLZXlib2FyZEV2ZW50PmV2ZW50O1xyXG4gICAgaWYgKFsnMScsICcyJywgJzMnLCAnNCcsICc1JywgJzYnLCAnNycsICc4JywgJzknLCAnMCddLmluZGV4T2YoZS5rZXkpID09PSAtMSkge1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBASG9zdExpc3RlbmVyKCdwYXN0ZScsIFsnJGV2ZW50J10pIG9uUGFzdGUoZXZlbnQpIHtcclxuICAgIGxldCByZWdleDtcclxuICAgIGlmICh0aGlzLmFwcElucHV0UmVzdHJpY3Rpb24gPT09ICdpbnRlZ2VyJykge1xyXG4gICAgICByZWdleCA9IC9eWzAtOV0qJC87XHJcbiAgICB9XHJcbiAgICBjb25zdCBlID0gPENsaXBib2FyZEV2ZW50PmV2ZW50O1xyXG4gICAgY29uc3QgcGFzdGVEYXRhID0gZS5jbGlwYm9hcmREYXRhLmdldERhdGEoJ3RleHQvcGxhaW4nKTtcclxuICAgIGlmICghcGFzdGVEYXRhLm1hdGNoKHJlZ2V4KSkge1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiJdfQ==