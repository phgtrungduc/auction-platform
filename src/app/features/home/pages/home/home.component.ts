import { Component } from '@angular/core';
import { BaseComponent } from '../../../../core/base/base.component';
import { HomepageComponent } from '../homepage/homepage.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [HomepageComponent],
})
export class HomeComponent extends BaseComponent {
  constructor() {
    super();
  }
}
