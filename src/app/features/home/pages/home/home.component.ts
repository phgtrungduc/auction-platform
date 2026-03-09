import { Component } from '@angular/core';
import { BaseComponent } from '../../../../core/base/base.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [HeaderComponent, FooterComponent],
})
export class HomeComponent extends BaseComponent {
  constructor() {
    super();
  }
}
