import { Component } from '@angular/core';
import { BaseComponent } from '../../../core/base/base.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent extends BaseComponent {
  constructor() {
    super();
  }
}
