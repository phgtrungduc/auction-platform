import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AssetStore } from '../../../../store/asset/asset.store';
import { Subject, takeUntil } from 'rxjs';
import { AdvancedSearchRequest, MarketplaceNoticeDetail, NoticeSearchDocument } from '../../../../core/models/asset.model';
import { TooltipModule } from 'ngx-bootstrap/tooltip';


@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, TooltipModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public assetStore = inject(AssetStore);
  private destroy$ = new Subject<void>();

  product: MarketplaceNoticeDetail | null = null;
  expandedAssets: boolean[] = [];
  similarProducts: SimilarProductItem[] = [];

  ngOnInit(): void {
    this.assetStore.detailData$.pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.product = data;
      if (this.product?.assets) {
        this.expandedAssets = this.product.assets.map((_: any, i: number) => i === 0);
      } else {
        this.expandedAssets = [];
      }

      const req = this.buildSimilarSearchRequest(this.product);
      if (req) {
        this.assetStore.getSimilarListData$(req);
      }
    });

    this.assetStore.similarListData$
      .pipe(takeUntil(this.destroy$))
      .subscribe((items) => {
        this.similarProducts = (items ?? []).map((x) => this.mapNoticeToSimilarProduct(x));
      });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.assetStore.getDetail$(id);

        // Cuộn lên đầu trang mượt mà khi load item mới
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleAsset(index: number): void {
    this.expandedAssets[index] = !this.expandedAssets[index];
  }

  formatCurrency(value: number | string | null | undefined): string {
    if (!value) return '-';
    return Number(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  }

  goBack(): void {
    window.history.back();
  }

  private buildSimilarSearchRequest(product: MarketplaceNoticeDetail | null): AdvancedSearchRequest | null {
    if (!product?.assets?.length) return null;

    const assetCategoryId = (product.assets[0] as any)?.assetTypeCode ?? product.assets[0]?.assetType ?? undefined;

    const legalCategoryIds = (product.assets ?? [])
      .map((a: any) => a.legalCategoryCode ?? a.legalCategoryId ?? a.legalCategory)
      .map((x: any) => {
        if (typeof x === 'number') return x;
        if (typeof x === 'string' && /^\d+$/.test(x)) return Number(x);
        return null;
      })
      .filter((x: number | null): x is number => x !== null);

    return {
      page: 1,
      pageSize: 8,
      sortBy: 'newest',
      assetCategoryId: typeof assetCategoryId === 'number' ? assetCategoryId : undefined,
      legalCategoryIds: legalCategoryIds.length ? Array.from(new Set(legalCategoryIds)) : undefined
    };
  }

  private mapNoticeToSimilarProduct(item: NoticeSearchDocument): SimilarProductItem {
    return {
      id: String(item.noticeId),
      title: item.title,
      desc: `${item.provinceName || 'Không xác định'} · ${item.assetCount ?? 0} tài sản`,
      price: `${this.formatToTy(item.minStartingPrice)} - ${this.formatToTy(item.maxStartingPrice)}`,
      status: item.status,
      owner: item.auctionOrgName,
      image: 'assets/images/product-sample-1.jpg'
    };
  }

  private formatToTy(value: number | null | undefined): string {
    if (value == null) return '—';
    return (value / 1000000000).toFixed(1) + ' tỷ';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'UPCOMING': return 'badge--green';
      case 'ONGOING': return 'badge--blue';
      case 'COMPLETED': return 'badge--dark';
      case 'CANCELLED': return 'badge--yellow';
      default: return 'badge--gray';
    }
  }

  getNoticeStatusLabel(status: string | undefined): string {
    if (!status) return 'Chưa rõ';
    switch (status) {
      case 'UPCOMING': return 'Mở đăng ký';
      case 'ONGOING': return 'Đang diễn ra';
      case 'COMPLETED': return 'Đã kết thúc';
      case 'CANCELED':
      case 'CANCELLED': return 'Huỷ đấu giá';
      default: return status;
    }
  }

  getNoticeStatusClass(status: string | undefined): string {
    if (!status) return 'badge--gray';
    switch (status) {
      case 'UPCOMING': return 'badge--green';
      case 'ONGOING': return 'badge--blue';
      case 'COMPLETED': return 'badge--dark';
      case 'CANCELED':
      case 'CANCELLED': return 'badge--yellow';
      default: return 'badge--gray';
    }
  }

  get uniqueAssetCategories(): string[] {
    if (!this.product?.assets) return [];
    const categories = new Set<string>();
    this.product.assets.forEach(a => {
      if (a.assetType || a.assetSubType) {
        categories.add(`${a.assetType || 'Chưa phân loại'} - ${a.assetSubType || 'Chưa phân loại'}`);
      }
    });
    return Array.from(categories);
  }

  get uniqueLegalCategories(): string[] {
    if (!this.product?.assets) return [];
    const set = new Set<string>();
    this.product.assets.forEach(a => {
      if (a.legalCategory) {
        set.add(a.legalCategory);
      }
    });
    return Array.from(set);
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

  isDragging = false;
  startX = 0;
  scrollLeft = 0;
  draggedElement: HTMLElement | null = null;

  onMouseDown(e: MouseEvent) {
    this.isDragging = true;
    this.startX = e.pageX;
    this.draggedElement = e.currentTarget as HTMLElement;
    this.scrollLeft = this.draggedElement.scrollLeft;
  }

  onMouseMove(e: MouseEvent) {
    if (!this.isDragging || !this.draggedElement) return;

    const x = e.pageX;
    const walk = x - this.startX;

    this.draggedElement.scrollLeft = this.scrollLeft - walk;
  }

  onMouseUp() {
    this.isDragging = false;
    this.draggedElement = null;
  }
}

interface SimilarProductItem {
  id: string;
  title: string;
  desc: string;
  price: string;
  status: string;
  owner: string;
  image: string;
}
