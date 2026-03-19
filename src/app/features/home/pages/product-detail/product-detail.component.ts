import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
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

  product: any = null;
  expandedAssets: boolean[] = [];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.product = SampleAuctionProducts.find(p => p.source_id === id);
      if (this.product?.assets) {
        this.expandedAssets = this.product.assets.map((_: any, i: number) => i === 0);
      }
    }
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
}
