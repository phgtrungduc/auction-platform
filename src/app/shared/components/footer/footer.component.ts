import { Component } from '@angular/core';
import { BaseComponent } from '../../../core/base/base.component';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent extends BaseComponent {
  readonly currentYear = new Date().getFullYear();

  constructor() {
    super();
  }
}
