import { Component } from '@angular/core';
import { FooterComponent } from '@shared/components/footer/footer.component';
import { HeaderComponent } from '@shared/components/header/header.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  imports: [HeaderComponent, FooterComponent, RouterOutlet],
  template: '<router-outlet />',
})
export class MainLayoutComponent {

}
