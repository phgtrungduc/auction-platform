import { Component } from '@angular/core';
import { FilterSidebarComponent } from '@shared/components/filter-sidebar/filter-sidebar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [CommonModule, FilterSidebarComponent],
  templateUrl: './products-page.component.html',
  styleUrl: './products-page.component.scss'
})
export class ProductsPageComponent {

}
