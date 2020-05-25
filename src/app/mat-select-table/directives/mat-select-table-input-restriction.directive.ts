import {Directive, HostListener, Input} from '@angular/core';

@Directive({
  selector: '[appInputRestriction]'
})
export class MatSelectTableInputRestrictionDirective {

  @Input() appInputRestriction: string;

  @HostListener('keypress', ['$event']) onKeyPress(event) {
    if (this.appInputRestriction === 'integer') {
      this.integerOnly(event);
    }
  }

  integerOnly(event) {
    const e = <KeyboardEvent>event;
    if (['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].indexOf(e.key) === -1) {
      e.preventDefault();
    }
  }

  @HostListener('paste', ['$event']) onPaste(event) {
    let regex;
    if (this.appInputRestriction === 'integer') {
      regex = /^[0-9]*$/;
    }
    const e = <ClipboardEvent>event;
    const pasteData = e.clipboardData.getData('text/plain');
    if (!pasteData.match(regex)) {
      e.preventDefault();
    }
  }
}
