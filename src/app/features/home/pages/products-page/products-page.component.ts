import { Component } from '@angular/core';
import { FilterSidebarComponent } from '@shared/components/filter-sidebar/filter-sidebar.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [CommonModule, FilterSidebarComponent],
  templateUrl: './products-page.component.html',
  styleUrl: './products-page.component.scss'
})
export class ProductsPageComponent {
  private router = inject(Router);

  navToDetail(id: string | undefined) {
    if (id) {
      this.router.navigate(['/product-detail', id]);
    }
  }

  products = [
    {
      id: 'dgts_moj',
      title: 'Đất Thanh Oai 500m²',
      desc: 'Quyền sử dụng đất - Hà Nội',
      price: '11.50 tỷ',
      status: 'Mở đăng ký',
      image: 'assets/images/product-sample-1.jpg',
    },
    {
      id: 'dgts_moj1',
      title: 'Đất Thanh Oai 500m²',
      desc: 'Quyền sử dụng đất - Hà Nội',
      price: '11.50 tỷ (Fail)',
      status: 'Đã kết thúc',
      startPrice: '9.00 tỷ',
      outcomeStatus: 'FAIL',
      image: 'assets/images/product-sample-1.jpg'
    },

    // 👉 Ads chen vào
    { isAd: true },

    {
      id: 'dgts_moj2',
      title: 'Đất Thanh Oai 500m²',
      desc: 'Quyền sử dụng đất - Hà Nội',
      price: '11.50 tỷ',
      status: 'Sắp diễn ra',
      image: 'assets/images/product-sample-1.jpg'
    },
    // 👉 Ads thứ 2
    { isAd: true },
    {
      id: 'dgts_moj3',
      title: 'Đất Thanh Oai 500m²',
      desc: 'Quyền sử dụng đất - Hà Nội',
      price: '11.50 tỷ',
      status: 'Đang diễn ra',
      startPrice: '9.00 tỷ',
      image: 'assets/images/product-sample-1.jpg'
    },
    {
      id: 'dgts_moj4',
      title: 'Đất Thanh Oai 500m²',
      desc: 'Quyền sử dụng đất - Hà Nội',
      price: '11.50 tỷ',
      status: 'Mở đăng ký',
      image: 'assets/images/product-sample-1.jpg'
    },
    {
      id: 'dgts_moj5',
      title: 'Đất Thanh Oai 500m²',
      desc: 'Quyền sử dụng đất - Hà Nội',
      price: '11.50 tỷ',
      status: 'Mở đăng ký',
      image: 'assets/images/product-sample-1.jpg'
    },
    {
      id: 'dgts_moj6',
      title: 'Đất Thanh Oai 500m²',
      desc: 'Quyền sử dụng đất - Hà Nội',
      price: '11.50 tỷ',
      status: 'Đã kết thúc',
      outcomeStatus: 'SUCCESS',
      startPrice: '9.00 tỷ',
      image: 'assets/images/product-sample-1.jpg'
    }
  ];

  getStatusClass(status: any): string {
    switch (status) {
      case 'Mở đăng ký':
        return 'badge--green';
      case 'Đang diễn ra':
        return 'badge--blue';
      case 'Sắp diễn ra':
        return 'badge--yellow';
      case 'Đã kết thúc':
        return 'badge--gray';
      default:
        return '';
    }
  }
}
