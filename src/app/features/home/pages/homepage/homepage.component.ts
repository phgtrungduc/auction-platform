import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, OnInit, OnDestroy, DestroyRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseComponent } from '../../../../core/base/base.component';
import { DvhcStore } from '../../../../store/dvhc/dvhc.store';
import { takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CustomSelectComponent } from '@shared/components/custom-select/custom-select.component';
import { CategoryDropdownComponent } from '@shared/components/category-dropdown/category-dropdown.component';
import { CategoryItem } from '@shared/components/header/header.component';
import { AssetStore } from '../../../../store/asset/asset.store';
import { Dvhc } from '../../../../core/models/dvhc.model';
import { NoticeSearchDocument } from '../../../../core/models/asset.model';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { CategoryStore } from '../../../../store/category/category.store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AssetCategory } from '../../../../core/models/category.model';
import { UserFavoriteStore } from '../../../../store/user-favorite/user-favorite.store';
import { selectIsLoggedIn } from '../../../../store/app-state';
import { LoggerService } from '../../../../core/services/logger.service';


@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomSelectComponent, CategoryDropdownComponent, TooltipModule],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss',
})
export class HomepageComponent extends BaseComponent implements OnInit {
  private readonly defaultNoticeImage = 'assets/images/product-sample-1.jpg';
  private readonly categoryImageByRefId: Record<string, string> = {
    REAL_ESTATE: 'assets/images/bds.png',
    VEHICLE: 'assets/images/xeco.png',
    MACHINERY: 'assets/images/maymoc.png',
    GOODS: 'assets/images/hanghoa.png',
    HOUSEHOLD: 'assets/images/dodung.png',

    RE_DAT_O: 'assets/images/dato.png',
    RE_DAT_NONG_NGHIEP: 'assets/images/datnongnghiep.png',
    RE_NHA_PHO: 'assets/images/nhapho.png',
    RE_CAN_HO: 'assets/images/canho.png',
    RE_NHA_XUONG: 'assets/images/nhaxuong.png',
    RE_SHOPHOUSE: 'assets/images/shopehouse.png',
    VEH_OTO: 'assets/images/oto.png',
    VEH_XE_TAI: 'assets/images/xeco.png',
    VEH_XE_MAY: 'assets/images/xemay.png',
    MAC_MAY_CONG_TRINH: 'assets/images/maycongtrinh.png',
    MAC_MAY_NONG_NGHIEP: 'assets/images/maynongnghiep.png',
    MAC_DAY_CHUYEN: 'assets/images/daychuyen.png',
    GOODS_GACH_VAT_LIEU: 'assets/images/gach.png',
    GOODS_SAT_THEP: 'assets/images/satthep.png',
    GOODS_HANG_TON_KHO: 'assets/images/hangtonkho.png',
    HH_NOI_THAT: 'assets/images/noithat.png',
    HH_THIET_BI: 'assets/images/thietbi.png',
    HH_CONG_CU: 'assets/images/congcu.png',

    // Backward-compatible aliases
    RE_BDS: 'assets/images/bds.png',
    VHE_OTO: 'assets/images/oto.png',
    VH_XE_MAY: 'assets/images/xemay.png',
    VH_XE_CO: 'assets/images/xeco.png',
    EQ_MAY_MOC: 'assets/images/maymoc.png',
    EQ_MAY_CONG_TRINH: 'assets/images/maycongtrinh.png',
    EQ_MAY_NONG_NGHIEP: 'assets/images/maynongnghiep.png',
    GOODS_HANG_HOA: 'assets/images/hanghoa.png',
    GOODS_DO_DUNG: 'assets/images/dodung.png',
    OTHER: 'assets/images/khac.png',
  };

  // ── Banner Slideshow ──────────────────────────────────────────────────────
  readonly bannersPerView = 4;          // số banner hiển thị cùng lúc
  banners = [
    { src: 'assets/images/banner/banner_bds.png', alt: 'Bất động sản' },
    { src: 'assets/images/banner/banner_xe_co.png', alt: 'Xe cộ' },
    { src: 'assets/images/banner/banner_may_moc.png', alt: 'Máy móc' },
    { src: 'assets/images/banner/banner_hang_hoa.png', alt: 'Hàng hoá' },
    { src: 'assets/images/banner/banner_do_dung.png', alt: 'Đồ dùng' },
    { src: 'assets/images/banner/banner_khac.png', alt: 'Khác' },
  ];

  currentBannerIndex = 0;
  private bannerInterval: ReturnType<typeof setInterval> | null = null;
  private readonly BANNER_INTERVAL_MS = 4000;

  private get maxBannerIndex() {
    return this.banners.length - this.bannersPerView;  // 6 - 4 = 2
  }

  /** Array [0, 1, ..., maxBannerIndex] used to render dots */
  get dotIndices(): number[] {
    return Array.from({ length: this.maxBannerIndex + 1 }, (_, i) => i);
  }

  assetCategories: AssetCategory[] = [];

  ngOnInit() {
    this.startBannerAutoPlay();
    this.dvhcStore.getProvinces$();
    this.categoryStore.list$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((categories) => {
        this.assetCategories = categories ?? [];
        this.listCategories = this.assetCategories.map((item) => ({
          label: item.name,
          value: item.id.toString(),
          children: (item.children ?? []).map((child) => ({ label: child.name }))
        }));
      });
    this.categoryStore.getAssetCategories$();
    this.assetStore.getListData$({
      page: 1,
      pageSize: 8,
      statuses: ['UPCOMING', 'ONGOING']
    });
    this.assetStore.getEndedListData$({
      page: 1,
      pageSize: 8,
      statuses: ['COMPLETED', 'CANCELLED']
    });
  }

  override ngOnDestroy() {
    this.stopBannerAutoPlay();
    super.ngOnDestroy();
  }

  private startBannerAutoPlay() {
    this.bannerInterval = setInterval(() => {
      this.currentBannerIndex =
        this.currentBannerIndex < this.maxBannerIndex
          ? this.currentBannerIndex + 1
          : 0;                          // quay về đầu khi hết
    }, this.BANNER_INTERVAL_MS);
  }

  private stopBannerAutoPlay() {
    if (this.bannerInterval !== null) {
      clearInterval(this.bannerInterval);
      this.bannerInterval = null;
    }
  }

  prevBanner() {
    this.stopBannerAutoPlay();
    this.currentBannerIndex =
      this.currentBannerIndex > 0 ? this.currentBannerIndex - 1 : this.maxBannerIndex;
    this.startBannerAutoPlay();
  }

  nextBanner() {
    this.stopBannerAutoPlay();
    this.currentBannerIndex =
      this.currentBannerIndex < this.maxBannerIndex ? this.currentBannerIndex + 1 : 0;
    this.startBannerAutoPlay();
  }

  goToBanner(index: number) {
    this.stopBannerAutoPlay();
    this.currentBannerIndex = Math.min(index, this.maxBannerIndex);
    this.startBannerAutoPlay();
  }
  // ─────────────────────────────────────────────────────────────────────────

  private dvhcStore = inject(DvhcStore);
  private assetStore = inject(AssetStore);
  private categoryStore = inject(CategoryStore);
  private userFavoriteStore = inject(UserFavoriteStore);
  private destroyRef = inject(DestroyRef);
  private logger = inject(LoggerService);
  //protected store = inject(Store);

  selectedLocationValue: any = null;
  optionsLocation: { label: string, value: any }[] = [];
  provinces: Dvhc[] = [];

  selectedCategory: number | null = null;
  listCategories: CategoryItem[] = [];


  onChangeLocation(value: any) {
    console.log('Selected:', value);
  }

  private sanitizer = inject(DomSanitizer);

  private svg(raw: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(raw);
  }

  constructor() {
    super();
    this.dvhcStore.listProvinces$.pipe(takeUntil(this.destroy$)).subscribe(data => {
      if (data) {
        this.provinces = data;
        this.optionsLocation = data.map(item => ({
          label: item.nameWithType,
          value: item.code
        }));
      }
    });

    this.assetStore.listData$
      .pipe(takeUntil(this.destroy$))
      .subscribe((items) => {
        this.auctionList = (items ?? []).map((item) => this.mapNoticeToAuctionItem(item));
      });

    this.assetStore.endedListData$
      .pipe(takeUntil(this.destroy$))
      .subscribe((items) => {
        this.endedAuctions = (items ?? []).map((item) => this.mapNoticeToEndedItem(item));
      });

    this.userFavoriteStore.lastMutation$
      .pipe(takeUntil(this.destroy$))
      .subscribe((m) => {
        if (!m) return;
        this.applyFavoriteMutationToLists(m.noticeId, m.isLiked, m.favoriteId);
      });
  }

  private mapNoticeToAuctionItem(item: NoticeSearchDocument): AuctionItem {
    return {
      id: item.noticeId,
      title: item.title,
      type: '',
      location: item.provinceName || 'Không xác định',
      minPrice: item.minStartingPrice ? this.formatPrice(item.minStartingPrice) : 'Không xác định',
      maxPrice: item.maxStartingPrice ? this.formatPrice(item.maxStartingPrice) : 'Không xác định',
      owner: item.auctionOrgName,
      image: this.getNoticeImageByCategoryRefId(item.firstAssetCategoryRefId),
      status: item.status,
      assetCount: item.assetCount,
      isLiked: false,
      favoriteId: undefined,
    };
  }

  private mapNoticeToEndedItem(item: NoticeSearchDocument): EndedAuctionItem {
    return {
      id: item.noticeId,
      title: item.title,
      location: item.provinceName || 'Không xác định',
      price: item.maxStartingPrice ? this.formatPrice(item.maxStartingPrice) : '—',
      increase: '',
      startPrice: item.minStartingPrice ? this.formatPrice(item.minStartingPrice) : '—',
      company: item.auctionOrgName,
      image: this.getNoticeImageByCategoryRefId(item.firstAssetCategoryRefId),
      status: item.status,
      assetCount: item.assetCount,
      isLiked: false,
      favoriteId: undefined,
    };
  }

  private getNoticeImageByCategoryRefId(refId?: string): string {
    if (!refId) {
      return this.defaultNoticeImage;
    }

    const normalizedRefId = refId.trim().toUpperCase();
    return this.categoryImageByRefId[normalizedRefId] ?? this.defaultNoticeImage;
  }

  private router = inject(Router);

  navToDetail(id: number | undefined) {
    if (id) {
      this.router.navigate(['/product-detail', id]);
    }
  }

  navToListings() {
    this.router.navigate(['/products-listing']);
  }

  keyword = '';
  isDragging = false;
  startX = 0;
  scrollLeft = 0;

  auctionList: AuctionItem[] = [];

  endedAuctions: EndedAuctionItem[] = [];

  featuredAreas = [
    {
      name: 'Hà Nội',
      sessions: 45,
      value: '1.250 tỷ',
      image: 'assets/images/khu-vuc-noi-bat.jpg'
    },
    {
      name: 'TP Hồ Chí Minh',
      sessions: 30,
      value: '980 tỷ',
      image: 'assets/images/khu-vuc-noi-bat.jpg'
    },
    {
      name: 'Đà Nẵng',
      sessions: 18,
      value: '520 tỷ',
      image: 'assets/images/khu-vuc-noi-bat.jpg'
    },
    {
      name: 'Bình Dương',
      sessions: 22,
      value: '610 tỷ',
      image: 'assets/images/khu-vuc-noi-bat.jpg'
    }
  ];

  categories: { name: string; image: string; svgIcon: SafeHtml }[] = [
    {
      name: 'Bất động sản',
      image: 'assets/images/menu-images/menu-bds.png',
      svgIcon: this.svg(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M3 22V12C3 10.114 3 9.172 3.586 8.586C4.172 8 5.114 8 7 8C8.886 8 9.828 8 10.414 8.586C11 9.172 11 10.114 11 12" stroke="#3a6428" stroke-width="1.5"/>
  <path d="M17 22V16C17 14.114 17 13.172 16.414 12.586C15.828 12 14.886 12 13 12H11C9.114 12 8.172 12 7.586 12.586C7 13.172 7 14.114 7 16V22" stroke="#3a6428" stroke-width="1.5"/>
  <path d="M21 22.0002V7.77217C21 6.43217 21 5.76117 20.644 5.24717C20.288 4.73317 19.66 4.49717 18.404 4.02717C15.949 3.10617 14.722 2.64617 13.861 3.24217C13 3.84017 13 5.15017 13 7.77217V12.0002" stroke="#3a6428" stroke-width="1.5"/>
  <path d="M4 8V6.5C4 5.557 4 5.086 4.293 4.793C4.586 4.5 5.057 4.5 6 4.5H8C8.943 4.5 9.414 4.5 9.707 4.793C10 5.086 10 5.557 10 6.5V8M7 4V2M22 22H2M10 15H14M10 18H14" stroke="#3a6428" stroke-width="1.5" stroke-linecap="round"/>
</svg>`)
    },
    {
      name: 'Đất ở',
      image: 'assets/images/menu-images/menu-dat-o.png',
      svgIcon: this.svg(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M12 22C17.5228 22 22 20.433 22 18.5C22 16.567 17.5228 15 12 15C6.47715 15 2 16.567 2 18.5C2 20.433 6.47715 22 12 22Z" stroke="#3a6428" stroke-width="1.5"/>
  <path d="M12 18V2M12 3.5L17.422 6.211C18.983 6.991 19.764 7.382 19.764 8C19.764 8.618 18.984 9.008 17.422 9.789L12 12.5" stroke="#3a6428" stroke-width="1.5" stroke-linecap="round"/>
</svg>`)
    },
    {
      name: 'Đất nông nghiệp',
      image: 'assets/images/menu-images/menu-dnn.png',
      svgIcon: this.svg(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M8.36328 20.5007C8.81777 16.0008 10.6357 12.5009 14.7261 10.501" stroke="#3a6428" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M11.999 17.4996C17.6511 17.4996 21.5433 14.2117 21.9978 5.49995V3.5H18.3491C10.1683 3.5 7.45413 7.49989 7.44141 12.4998C7.44141 13.4997 7.44141 15.4997 9.25936 17.4996H11.999Z" stroke="#3a6428" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M8.36328 17.5008H6.99465C4.1711 17.5008 2.22668 15.8568 1.99964 11.5009V10.501H3.82236C5.29236 10.501 6.40904 10.7597 7.23668 11.2074" stroke="#3a6428" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`)
    },
    {
      name: 'Nhà phố',
      image: 'assets/images/menu-images/menu-nha.png',
      svgIcon: this.svg(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M3 11L12 3L21 11V21C21 21.5523 20.5523 22 20 22H15V17C15 16.4477 14.5523 16 14 16H10C9.44772 16 9 16.4477 9 17V22H4C3.44772 22 3 21.5523 3 21V11Z" stroke="#3a6428" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M9 22V17C9 16.4477 9.44772 16 10 16H14C14.5523 16 15 16.4477 15 17V22" stroke="#3a6428" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`)
    },
    {
      name: 'Căn hộ',
      image: 'assets/images/menu-images/menu-can-ho.png',
      svgIcon: this.svg(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M22 22H2" stroke="#3a6428" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M20.9999 22V6C20.9999 4.114 20.9999 3.172 20.4139 2.586C19.8279 2 18.8859 2 16.9999 2H14.9999C13.1139 2 12.1719 2 11.5859 2.586C11.1139 3.057 11.0219 3.76 11.0039 5" stroke="#3a6428" stroke-width="1.5"/>
  <path d="M15 22V9C15 7.114 15 6.172 14.414 5.586C13.828 5 12.886 5 11 5H7C5.114 5 4.172 5 3.586 5.586C3 6.172 3 7.114 3 9V22" stroke="#3a6428" stroke-width="1.5"/>
  <path d="M9 22V19M6 8H12M6 11H12M6 14H12" stroke="#3a6428" stroke-width="1.5" stroke-linecap="round"/>
</svg>`)
    },
    {
      name: 'Nhà xưởng',
      image: 'assets/images/menu-images/menu-xuong.png',
      svgIcon: this.svg(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M7.59461 20.5H5.03354C4.7573 20.5 4.48394 20.4471 4.23016 20.3445C3.97638 20.2418 3.74749 20.0917 3.55747 19.9031C3.36745 19.7145 3.22028 19.4914 3.12494 19.2476C3.0296 19.0037 2.98809 18.7441 3.00294 18.4847L3.76024 5.30965C3.78822 4.8209 4.01437 4.36084 4.39212 4.0242C4.76986 3.68755 5.27046 3.49994 5.79084 3.5H6.83731C7.35754 3.50016 7.8579 3.68787 8.23546 4.02449C8.61301 4.36111 8.83903 4.82105 8.86701 5.30965L9.6243 18.4847C9.63916 18.744 9.59768 19.0035 9.50239 19.2474C9.40711 19.4912 9.26001 19.7142 9.07009 19.9027C8.88016 20.0913 8.65139 20.2415 8.39771 20.3442C8.14404 20.4469 7.87078 20.4999 7.59461 20.5ZM7.59461 20.5H18.9667C19.506 20.5 20.0231 20.2985 20.4045 19.9398C20.7858 19.5812 21 19.0947 21 18.5875V6.9C21 6.77604 20.9616 6.65477 20.8895 6.55102C20.8174 6.44727 20.7147 6.36554 20.594 6.31584C20.4732 6.26614 20.3397 6.25063 20.2098 6.2712C20.0798 6.29177 19.959 6.34752 19.8622 6.43165L15.126 10.5439V6.9C15.1262 6.77588 15.0878 6.6544 15.0157 6.55048C14.9435 6.44656 14.8407 6.36471 14.7198 6.31498C14.5989 6.26525 14.4652 6.2498 14.3351 6.27052C14.2049 6.29125 14.0841 6.34725 13.9873 6.43165L9.19082 10.9432M12.8659 20.5V16.8875C12.8659 16.8311 12.8897 16.7771 12.932 16.7372C12.9744 16.6974 13.0319 16.675 13.0918 16.675H16.7066C16.7665 16.675 16.8239 16.6974 16.8663 16.7372C16.9087 16.7771 16.9325 16.8311 16.9325 16.8875V20.5" stroke="#3a6428" stroke-width="1.5"/>
</svg>`)
    },
    {
      name: 'Shophouse',
      image: 'assets/images/menu-images/menu-shophouse.png',
      svgIcon: this.svg(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M3.5 11V14C3.5 17.771 3.5 19.657 4.672 20.828C5.844 21.999 7.729 22 11.5 22H12.5C16.271 22 18.157 22 19.328 20.828C20.499 19.656 20.5 17.771 20.5 14V11" stroke="#3a6428" stroke-width="1.5"/>
  <path d="M9.50099 2H14.501L15.153 8.517C15.1959 8.95677 15.1464 9.40065 15.0075 9.82013C14.8687 10.2396 14.6436 10.6254 14.3467 10.9526C14.0499 11.2799 13.6878 11.5415 13.2838 11.7204C12.8798 11.8994 12.4428 11.9919 12.001 11.9919C11.5591 11.9919 11.1222 11.8994 10.7182 11.7204C10.3142 11.5415 9.95212 11.2799 9.65525 10.9526C9.35839 10.6254 9.13329 10.2396 8.99443 9.82013C8.85558 9.40065 8.80603 8.95677 8.84898 8.517L9.50099 2Z" stroke="#3a6428" stroke-width="1.5"/>
  <path d="M3.33002 5.351C3.50802 4.461 3.59702 4.016 3.77802 3.655C3.96662 3.27904 4.23217 2.94694 4.55743 2.68025C4.88269 2.41356 5.26039 2.21826 5.66602 2.107C6.05602 2 6.51002 2 7.41802 2H9.50002L8.77502 9.245C8.73676 9.65963 8.61428 10.0621 8.41508 10.4277C8.21588 10.7934 7.94414 11.1145 7.61651 11.3715C7.28888 11.6285 6.91225 11.8159 6.50968 11.9223C6.1071 12.0287 5.68706 12.0518 5.27525 11.9901C4.86344 11.9285 4.46853 11.7835 4.11471 11.564C3.76089 11.3445 3.45559 11.0551 3.21751 10.7135C2.97943 10.3718 2.81357 9.98523 2.73009 9.5773C2.64662 9.16936 2.64727 8.74867 2.73202 8.341L3.33002 5.351ZM20.67 5.351C20.492 4.461 20.403 4.016 20.222 3.655C20.0334 3.27904 19.7679 2.94694 19.4426 2.68025C19.1174 2.41356 18.7397 2.21826 18.334 2.107C17.944 2 17.49 2 16.582 2H14.5L15.225 9.245C15.2633 9.65963 15.3858 10.0621 15.585 10.4277C15.7842 10.7934 16.0559 11.1145 16.3835 11.3715C16.7112 11.6285 17.0878 11.8159 17.4904 11.9223C17.8929 12.0287 18.313 12.0518 18.7248 11.9901C19.1366 11.9285 19.5315 11.7835 19.8853 11.564C20.2392 11.3445 20.5445 11.0551 20.7825 10.7135C21.0206 10.3718 21.1865 9.98523 21.27 9.5773C21.3534 9.16936 21.3528 8.74867 21.268 8.341L20.67 5.351Z" stroke="#3a6428" stroke-width="1.5"/>
  <path d="M9.5 21.5V18.5C9.5 17.565 9.5 17.098 9.701 16.75C9.83265 16.522 10.022 16.3326 10.25 16.201C10.598 16 11.065 16 12 16C12.935 16 13.402 16 13.75 16.201C13.978 16.3326 14.1674 16.522 14.299 16.75C14.5 17.098 14.5 17.565 14.5 18.5V21.5" stroke="#3a6428" stroke-width="1.5" stroke-linecap="round"/>
</svg>`)
    }
  ];

  tools = [
    {
      title: 'Định giá tài sản đấu giá',
      desc: 'Ước tính giá trị tài sản trước khi tham gia đấu giá dựa trên dữ liệu thị trường',
      image: 'assets/images/dinh-gia-ts.png',
      icon: 'fa-calculator'
    },
    {
      title: 'Hỗ trợ vay vốn khi trúng đấu giá',
      desc: 'Lãi suất ưu đãi từ đối tác ngân hàng. Giải ngân nhanh - Thủ tục đơn giản',
      image: 'assets/images/cong-cu-vay-von.png',
      icon: 'fa-university'
    },
    {
      title: 'Tư vấn pháp lý đấu giá',
      desc: 'Tra cứu quy định, điều kiện tham gia và quy trình đấu giá tài sản',
      image: 'assets/images/tu-van-phap-ly.png',
      icon: 'fa-balance-scale'
    }
  ];

  news = [
    {
      title: 'Quy định mới về đấu giá tài sản có hiệu lực',
      image: 'assets/images/tin1.jpg'
    },
    {
      title: 'Quy định mới về đấu giá tài sản',
      image: 'assets/images/tin2.jpg'
    },
    {
      title: 'Quy định mới về đấu giá tài sản',
      image: 'assets/images/tin3.jpg'
    },
    {
      title: 'Quy định mới về đấu giá tài sản',
      image: 'assets/images/tin4.jpg'
    },
    {
      title: 'Quy định mới về đấu giá tài sản',
      image: 'assets/images/tin5.jpg'
    },
    {
      title: 'Quy định mới về đấu giá tài sản',
      image: 'assets/images/tin6.jpg'
    }
  ];

  onSearch() {
    console.log({
      keyword: this.keyword,
      city: this.selectedLocationValue,
      category: this.selectedCategory,
    });
    this.router.navigate(['/products-listing']);
  }

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

  formatPrice(price: number | null | undefined): string {
    if (price == null) return 'Không xác định';
    if (price < 100_000_000) {
      return (price / 1_000_000).toFixed(2) + ' triệu';
    }
    return (price / 1_000_000_000).toFixed(2) + ' tỷ';
  }

  getNoticeStatusLabel(status: string | undefined): string {
    if (!status) return 'Chưa rõ';
    switch (status) {
      case 'UPCOMING': return 'Mở đăng ký';
      case 'ONGOING': return 'Đang diễn ra';
      case 'COMPLETED': return 'Đã kết thúc';
      case 'CANCELLED': return 'Huỷ đấu giá';
      default: return status;
    }
  }

  getOwnerInitials(name: string | undefined): string {
    if (!name) {
      return '?';
    }
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(w => w[0].toUpperCase())
      .join('');
  }

  toggleFavorite(item: { id: number; isLiked: boolean; favoriteId?: number }, event?: Event): void {
    event?.stopPropagation();
    event?.preventDefault();

    let isLoggedIn = false;
    this.store.select(selectIsLoggedIn).subscribe(v => isLoggedIn = v).unsubscribe();

    if (!isLoggedIn) {
      this.logger.info('Vui lòng đăng nhập để thực hiện chức năng này!');
      return;
    }

    const noticeId = item.id;
    if (!noticeId) return;

    item.isLiked = !item.isLiked;

    if (!item.isLiked) {
      this.userFavoriteStore.removeFavorite$({ noticeId, favoriteId: item.favoriteId });
      return;
    }

    this.userFavoriteStore.addFavorite$(noticeId);
  }

  private applyFavoriteMutationToLists(noticeId: number, isLiked: boolean, favoriteId?: number): void {
    this.auctionList = this.auctionList.map((it) =>
      it.id === noticeId
        ? { ...it, isLiked, favoriteId: isLiked ? favoriteId : undefined }
        : it
    );
    this.endedAuctions = this.endedAuctions.map((it) =>
      it.id === noticeId
        ? { ...it, isLiked, favoriteId: isLiked ? favoriteId : undefined }
        : it
    );
  }
}
interface AuctionItem {
  id: number;
  title: string;
  type: string;
  location: string;
  minPrice: string;
  maxPrice: string;
  owner: string;
  image: string;
  status: string;
  assetCount: number;
  isLiked: boolean;
  favoriteId?: number;
}

interface EndedAuctionItem {
  id: number;
  title: string;
  location: string;
  price: string;
  increase: string;
  startPrice: string;
  company: string;
  image: string;
  status: string;
  assetCount: number;
  isLiked: boolean;
  favoriteId?: number;
}