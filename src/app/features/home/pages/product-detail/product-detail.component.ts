import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SampleAuctionProducts } from '@shared/constants/sample-data.constant';


@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  product: any = null;
  expandedAssets: boolean[] = [];

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.product = SampleAuctionProducts.find(p => p.source_id === id);
        if (this.product?.assets) {
          this.expandedAssets = this.product.assets.map((_: any, i: number) => i === 0);
        } else {
          this.expandedAssets = [];
        }
        
        // Cuộn lên đầu trang mượt mà khi load item mới
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  toggleAsset(index: number): void {
    this.expandedAssets[index] = !this.expandedAssets[index];
  }

  formatCurrency(value: number | string | null | undefined): string {
    if (!value) return '0';
    return Number(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  goBack(): void {
    window.history.back();
  }

  similarProducts = [
    {
      id: 'dgts_moj8',
      title: 'Đất Thanh Oai 500m²',
      desc: 'Trả giá lên • Hà Nội • 3 tài sản',
      price: '9.00 - 11.50 tỷ',
      status: 'Mở đăng ký',
      image: 'assets/images/product-sample-1.jpg'
    },
    {
      id: 'dgts_moj6',
      title: 'Đất Thanh Oai 500m²',
      desc: 'Trả giá lên • Hà Nội • 3 tài sản',
      price: '9.00 - 11.50 tỷ',
      status: 'Mở đăng ký',
      image: 'assets/images/product-sample-1.jpg'
    },
    {
      id: 'dgts_moj7',
      title: 'Đất Thanh Oai 500m²',
      desc: 'Trả giá lên • Hà Nội • 3 tài sản',
      price: '9.00 - 11.50 tỷ',
      status: 'Đang diễn ra',
      image: 'assets/images/product-sample-1.jpg'
    },
    {
      id: 'dgts_moj5',
      title: 'Đất Thanh Oai 500m²',
      desc: 'Trả giá lên • Hà Nội • 3 tài sản',
      price: '9.00 - 11.50 tỷ',
      status: 'Sắp diễn ra',
      image: 'assets/images/product-sample-1.jpg'
    }
  ];

  getStatusClass(status: string): string {
    switch (status) {
      case 'Mở đăng ký': return 'badge--green';
      case 'Đang diễn ra': return 'badge--blue';
      case 'Sắp diễn ra': return 'badge--yellow';
      default: return 'badge--gray';
    }
  }

  getPriceClass(status: string): string {
    if (status === 'Đang diễn ra') return 'price--blue';
    return 'price--green';
  }

  navToDetail(id: string | undefined) {
    if (id) {
      this.router.navigate(['/product-detail', id]);
    }
  }
}
