import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[tableCell]',
  standalone: true
})
export class TableCellDirective {
  @Input('tableCell') name!: string;
  constructor(public template: TemplateRef<any>) {}
}
