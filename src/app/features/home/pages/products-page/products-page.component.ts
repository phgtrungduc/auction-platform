import { Component, DestroyRef, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CategoryItem } from '@shared/components/header/header.component';
import { CustomSelectComponent, SelectOption } from '@shared/components/custom-select/custom-select.component';
import { DatePickerComponent } from '@shared/components/date-picker/date-picker.component';
import { CategoryDropdownComponent } from '@shared/components/category-dropdown/category-dropdown.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { CategoryStore } from '../../../../store/category/category.store';
import { AssetCategory, LegalCategory } from '../../../../core/models/category.model';
import { AssetService } from '../../../../core/services/asset.service';
import { AdvancedSearchRequest, AdvancedTimeFilter, NoticeSearchDocument } from '../../../../core/models/asset.model';

type NoticeStatusCode = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

type StartPricePreset = 'all' | 'lt1b' | '1_5' | '5_10' | 'gt10' | 'custom';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomSelectComponent, DatePickerComponent, CategoryDropdownComponent, PaginationComponent],
  templateUrl: './products-page.component.html',
  styleUrl: './products-page.component.scss'
})
export class ProductsPageComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private categoryStore = inject(CategoryStore);
  private assetService = inject(AssetService);
  private destroyRef = inject(DestroyRef);

  @ViewChild('priceSliderTrack') priceSliderTrackRef?: ElementRef<HTMLElement>;

  isFilterLoading = false;

  /** Giá khởi điểm — slider & preset (VND) */
  readonly sliderMaxVnd = 100_000_000_000;
  private readonly priceGap = 1_000_000;
  startPricePreset: StartPricePreset = 'all';
  priceMinVnd = 0;
  priceMaxVnd = 100_000_000_000;
  priceMinStr = '0';
  priceMaxStr = '100000000000';
  private draggingThumb: 'min' | 'max' | null = null;

  selectedCategory: string | null = null;
  assetCategories: AssetCategory[] = [];
  legalCategories: LegalCategory[] = [];
  categories: CategoryItem[] = [];
  selectedAssetCategoryId: number | null = null;
  selectedAssetSubCategoryId: number | null = null;
  expandedAssetCategoryIds = new Set<number>();
  selectedLegalCategoryIds = new Set<number>();
  readonly defaultVisibleLegalCategoryCount = 8;
  isLegalCategoryExpanded = false;

  timeFilter = {
    DOC_SALE: { enabled: false, from: null as Date | null, to: null as Date | null },
    ASSET_VIEW: { enabled: false, from: null as Date | null, to: null as Date | null },
    AUCTION_TIME: { enabled: false, from: null as Date | null, to: null as Date | null },
    RESULT_TIME: { enabled: false, from: null as Date | null, to: null as Date | null },
  };

  toggleTimeKey(key: keyof typeof this.timeFilter) {
    const nextEnabled = !this.timeFilter[key].enabled;
    this.timeFilter[key].enabled = nextEnabled;
    if (!nextEnabled) {
      this.timeFilter[key].from = null;
      this.timeFilter[key].to = null;
    }
  }

  optionsStatus: Array<{ label: string; value: NoticeStatusCode }> = [
    { label: 'Mở đăng ký', value: 'UPCOMING' },
    { label: 'Đang diễn ra', value: 'ONGOING' },
    { label: 'Đã kết thúc', value: 'COMPLETED' },
    { label: 'Huỷ đấu giá', value: 'CANCELLED' }
  ];

  optionsLocation = [
    { label: 'Thành phố Hà Nội', value: 1 },
    { label: 'Thành phố Hồ Chí Minh', value: 2 },
    { label: 'Thành phố Đà Nẵng', value: 3 },
    { label: 'Thành phố Hải Phòng', value: 4 }
  ];

  /** Mock: bộ lọc nâng cao — địa điểm 3 cấp (theo Figma) */
  optionsAdvProvince: SelectOption[] = [
    { label: 'Thành phố Hà Nội', value: 'hn' },
    { label: 'Thành phố Hồ Chí Minh', value: 'hcm' },
    { label: 'Thành phố Đà Nẵng', value: 'dn' },
    { label: 'Tỉnh Quảng Ninh', value: 'qn' },
    { label: 'Tỉnh Hưng Yên', value: 'hy' },
  ];

  private advDistrictByProvince: Record<string, SelectOption[]> = {
    hn: [
      { label: 'Quận Ba Đình', value: 'hn-badinh' },
      { label: 'Quận Hoàn Kiếm', value: 'hn-hoankiem' },
      { label: 'Quận Đống Đa', value: 'hn-dongda' },
    ],
    hcm: [
      { label: 'Quận 1', value: 'hcm-q1' },
      { label: 'Quận 3', value: 'hcm-q3' },
      { label: 'Quận Bình Thạnh', value: 'hcm-bt' },
    ],
    dn: [
      { label: 'Quận Hải Châu', value: 'dn-hc' },
      { label: 'Quận Thanh Khê', value: 'dn-tk' },
    ],
    qn: [
      { label: 'Thành phố Hạ Long', value: 'qn-hl' },
      { label: 'Thành phố Uông Bí', value: 'qn-ub' },
    ],
    hy: [
      { label: 'Thành phố Hưng Yên', value: 'hy-city' },
      { label: 'Huyện Văn Lâm', value: 'hy-vl' },
    ],
  };

  private advWardByDistrict: Record<string, SelectOption[]> = {
    'hn-badinh': [
      { label: 'Phường Điện Biên', value: 'hn-badinh-1' },
      { label: 'Phường Ngọc Hà', value: 'hn-badinh-2' },
    ],
    'hn-hoankiem': [
      { label: 'Phường Hàng Bạc', value: 'hn-hk-1' },
      { label: 'Phường Lý Thái Tổ', value: 'hn-hk-2' },
    ],
    'hn-dongda': [
      { label: 'Phường Văn Miếu', value: 'hn-dd-1' },
      { label: 'Phường Ô Chợ Dừa', value: 'hn-dd-2' },
    ],
    'hcm-q1': [
      { label: 'Phường Bến Nghé', value: 'hcm-q1-1' },
      { label: 'Phường Đa Kao', value: 'hcm-q1-2' },
    ],
    'hcm-q3': [
      { label: 'Phường 5', value: 'hcm-q3-1' },
      { label: 'Phường 6', value: 'hcm-q3-2' },
    ],
    'hcm-bt': [
      { label: 'Phường 1', value: 'hcm-bt-1' },
      { label: 'Phường 2', value: 'hcm-bt-2' },
    ],
    'dn-hc': [
      { label: 'Phường Thạch Thang', value: 'dn-hc-1' },
      { label: 'Phường Hải Châu I', value: 'dn-hc-2' },
    ],
    'dn-tk': [
      { label: 'Phường An Khê', value: 'dn-tk-1' },
      { label: 'Phường Thanh Khê Đông', value: 'dn-tk-2' },
    ],
    'qn-hl': [
      { label: 'Phường Hồng Hải', value: 'qn-hl-1' },
      { label: 'Phường Bãi Cháy', value: 'qn-hl-2' },
    ],
    'qn-ub': [
      { label: 'Phường Thanh Sơn', value: 'qn-ub-1' },
      { label: 'Phường Phương Nam', value: 'qn-ub-2' },
    ],
    'hy-city': [
      { label: 'Phường Hiến Nam', value: 'hy-c-1' },
      { label: 'Phường Lê Lợi', value: 'hy-c-2' },
    ],
    'hy-vl': [
      { label: 'Xã Lạc Hồng', value: 'hy-vl-1' },
      { label: 'Xã Trưng Trắc', value: 'hy-vl-2' },
    ],
  };

  selectedAdvProvinceId: string | null = null;
  selectedAdvDistrictId: string | null = null;
  selectedAdvWardId: string | null = null;

  get optionsAdvDistrict(): SelectOption[] {
    if (!this.selectedAdvProvinceId) {
      return [];
    }
    return this.advDistrictByProvince[this.selectedAdvProvinceId] ?? [];
  }

  get optionsAdvWard(): SelectOption[] {
    if (!this.selectedAdvDistrictId) {
      return [];
    }
    return this.advWardByDistrict[this.selectedAdvDistrictId] ?? [];
  }

  optionsOrder = [
    { label: 'Mới nhất', value: 1 },
    { label: 'Giá tăng dần', value: 2 },
    { label: 'Giá giảm dần', value: 3 },
  ];

  selectedStatusValue: NoticeStatusCode | null = null;
  selectedStatusValues = new Set<NoticeStatusCode>();

  selectedLocationValue: number | null = null;

  selectedOrderValue: number | null = null;

  selectedToDate: Date | null = null;

  selectedFromDate: Date | null = null;

  currentPage: number = 1;
  totalPages: number = 1;
  totalCount: number = 0;
  readonly pageSize = 20;
  notices: NoticeSearchDocument[] = [];

  isAdvancedFilterOpen = false;

  hasLoggedIn = true;

  toggleAdvancedFilter() {
    this.isAdvancedFilterOpen = !this.isAdvancedFilterOpen;
  }

  closeAdvancedFilter() {
    this.isAdvancedFilterOpen = false;
  }

  isStartPricePreset(p: StartPricePreset): boolean {
    return this.startPricePreset === p;
  }

  formatVndLabel(n: number): string {
    return `${new Intl.NumberFormat('vi-VN').format(n)} VNĐ`;
  }

  get sliderPctMin(): number {
    return (this.priceMinVnd / this.sliderMaxVnd) * 100;
  }

  get sliderPctMax(): number {
    return (this.priceMaxVnd / this.sliderMaxVnd) * 100;
  }

  get sliderPctWidth(): number {
    return Math.max(0, this.sliderPctMax - this.sliderPctMin);
  }

  private syncPriceInputStrings(): void {
    this.priceMinStr = String(this.priceMinVnd);
    this.priceMaxStr = String(this.priceMaxVnd);
  }

  private parseVndDigits(raw: string): number | null {
    const digits = raw.replace(/\D/g, '');
    if (!digits) {
      return null;
    }
    const n = Number(digits);
    return Number.isFinite(n) ? n : null;
  }

  selectStartPricePreset(p: StartPricePreset): void {
    this.startPricePreset = p;
    switch (p) {
      case 'all':
        this.priceMinVnd = 0;
        this.priceMaxVnd = this.sliderMaxVnd;
        break;
      case 'lt1b':
        this.priceMinVnd = 0;
        this.priceMaxVnd = 1_000_000_000;
        break;
      case '1_5':
        this.priceMinVnd = 1_000_000_000;
        this.priceMaxVnd = 5_000_000_000;
        break;
      case '5_10':
        this.priceMinVnd = 5_000_000_000;
        this.priceMaxVnd = 10_000_000_000;
        break;
      case 'gt10':
        this.priceMinVnd = 10_000_000_000;
        this.priceMaxVnd = this.sliderMaxVnd;
        break;
      default:
        break;
    }
    this.syncPriceInputStrings();
  }

  /** Đồng bộ thanh trượt ngay khi gõ (chỉ khi parse được số). */
  onPriceMinStrChange(raw: string): void {
    const n = this.parseVndDigits(raw);
    if (n === null) {
      return;
    }
    this.priceMinVnd = Math.max(0, Math.min(n, this.priceMaxVnd - this.priceGap));
    this.startPricePreset = 'custom';
  }

  onPriceMaxStrChange(raw: string): void {
    const n = this.parseVndDigits(raw);
    if (n === null) {
      return;
    }
    this.priceMaxVnd = Math.min(this.sliderMaxVnd, Math.max(n, this.priceMinVnd + this.priceGap));
    this.startPricePreset = 'custom';
  }

  commitPriceMinStr(): void {
    const n = this.parseVndDigits(this.priceMinStr);
    if (n === null) {
      this.syncPriceInputStrings();
      return;
    }
    this.priceMinVnd = Math.max(0, Math.min(n, this.priceMaxVnd - this.priceGap));
    this.startPricePreset = 'custom';
    this.syncPriceInputStrings();
  }

  commitPriceMaxStr(): void {
    const n = this.parseVndDigits(this.priceMaxStr);
    if (n === null) {
      this.syncPriceInputStrings();
      return;
    }
    this.priceMaxVnd = Math.min(this.sliderMaxVnd, Math.max(n, this.priceMinVnd + this.priceGap));
    this.startPricePreset = 'custom';
    this.syncPriceInputStrings();
  }

  private valueFromClientX(clientX: number): number {
    const el = this.priceSliderTrackRef?.nativeElement;
    if (!el) {
      return 0;
    }
    const r = el.getBoundingClientRect();
    const t = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    return Math.round(t * this.sliderMaxVnd);
  }

  onPriceTrackPointerDown(event: PointerEvent): void {
    const t = event.target as HTMLElement;
    if (t?.classList?.contains('slider-thumb')) {
      return;
    }
    const v = this.valueFromClientX(event.clientX);
    const distMin = Math.abs(v - this.priceMinVnd);
    const distMax = Math.abs(v - this.priceMaxVnd);
    if (distMin <= distMax) {
      this.priceMinVnd = Math.max(0, Math.min(v, this.priceMaxVnd - this.priceGap));
    } else {
      this.priceMaxVnd = Math.min(this.sliderMaxVnd, Math.max(v, this.priceMinVnd + this.priceGap));
    }
    this.startPricePreset = 'custom';
    this.syncPriceInputStrings();
  }

  onMinThumbPointerDown(event: PointerEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.draggingThumb = 'min';
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  onMaxThumbPointerDown(event: PointerEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.draggingThumb = 'max';
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  onPriceThumbPointerMove(event: PointerEvent): void {
    if (!this.draggingThumb) {
      return;
    }
    const v = this.valueFromClientX(event.clientX);
    if (this.draggingThumb === 'min') {
      this.priceMinVnd = Math.max(0, Math.min(v, this.priceMaxVnd - this.priceGap));
    } else {
      this.priceMaxVnd = Math.min(this.sliderMaxVnd, Math.max(v, this.priceMinVnd + this.priceGap));
    }
    this.startPricePreset = 'custom';
    this.syncPriceInputStrings();
  }

  onPriceThumbPointerUp(event: PointerEvent): void {
    if (this.draggingThumb) {
      try {
        (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
      } catch {
        /* ignore */
      }
    }
    this.draggingThumb = null;
  }

  private buildAdvancedSearchRequest(): AdvancedSearchRequest {
    const sortByMap: Record<number, string> = {
      1: 'newest',
      2: 'price_asc',
      3: 'price_desc',
    };

    type TimeFilterKey = keyof typeof this.timeFilter;
    const typeMap: Record<TimeFilterKey, AdvancedTimeFilter['type']> = {
      DOC_SALE:     'DocSale',
      ASSET_VIEW:   'AssetView',
      AUCTION_TIME: 'Auction',
      RESULT_TIME:  'Result',
    };

    const toFromISO = (d: Date) =>
      `${d.toISOString().split('T')[0]}T00:00:00Z`;
    const toToISO = (d: Date) =>
      `${d.toISOString().split('T')[0]}T23:59:59Z`;

    const timeFilters = (Object.keys(this.timeFilter) as TimeFilterKey[])
      .reduce<AdvancedTimeFilter[]>((acc, key) => {
        const v = this.timeFilter[key];
        if (v.enabled && (v.from || v.to)) {
          acc.push({
            type: typeMap[key],
            from: v.from ? toFromISO(v.from) : '',
            to:   v.to   ? toToISO(v.to)     : '',
          });
        }
        return acc;
      }, []);

    const req: AdvancedSearchRequest = {
      page:     this.currentPage,
      pageSize: this.pageSize,
    };

    const assetCategoryId = this.selectedAssetSubCategoryId ?? this.selectedAssetCategoryId;
    if (assetCategoryId != null)                  req.assetCategoryId   = assetCategoryId;
    if (this.selectedStatusValues.size > 0)       req.statuses          = [...this.selectedStatusValues];
    if (timeFilters.length > 0)                   req.timeFilters       = timeFilters;
    if (this.selectedLegalCategoryIds.size > 0)   req.legalCategoryIds  = [...this.selectedLegalCategoryIds];
    if (this.selectedAdvProvinceId)               req.provinceCode      = this.selectedAdvProvinceId;
    if (this.selectedAdvDistrictId)               req.districtCode      = this.selectedAdvDistrictId;
    if (this.selectedOrderValue != null)          req.sortBy            = sortByMap[this.selectedOrderValue];

    const isFullPriceRange =
      this.priceMinVnd <= 0 && this.priceMaxVnd >= this.sliderMaxVnd;
    if (!isFullPriceRange) {
      req.minPrice = String(this.priceMinVnd);
      req.maxPrice = String(this.priceMaxVnd);
    }

    return req;
  }

  applyAdvancedFilters() {
    this.currentPage = 1;
    this.fetchPage();
    this.closeAdvancedFilter();
  }

  fetchPage() {
    const request = this.buildAdvancedSearchRequest();
    console.log('[AdvancedFilter] Request payload:', request);

    this.isFilterLoading = true;

    this.assetService.advancedSearch(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.notices    = res.items ?? [];
          this.totalPages = res.totalPages;
          this.totalCount = res.totalCount;
          this.isFilterLoading = false;
        },
        error: (err) => {
          console.error('[AdvancedFilter] Error:', err);
          this.notices = [];
          this.isFilterLoading = false;
        },
      });
  }

  clearAdvancedFilters() {
    this.selectedAssetCategoryId    = null;
    this.selectedAssetSubCategoryId = null;
    this.expandedAssetCategoryIds.clear();
    this.selectedStatusValues       = new Set();
    this.selectedLegalCategoryIds   = new Set();
    this.isLegalCategoryExpanded    = false;
    this.timeFilter = {
      DOC_SALE:     { enabled: false, from: null, to: null },
      ASSET_VIEW:   { enabled: false, from: null, to: null },
      AUCTION_TIME: { enabled: false, from: null, to: null },
      RESULT_TIME:  { enabled: false, from: null, to: null },
    };
    this.selectedAdvProvinceId  = null;
    this.selectedAdvDistrictId  = null;
    this.selectedAdvWardId      = null;
    this.currentPage            = 1;
    this.startPricePreset       = 'all';
    this.priceMinVnd            = 0;
    this.priceMaxVnd            = this.sliderMaxVnd;
    this.draggingThumb          = null;
    this.syncPriceInputStrings();

    console.log('[AdvancedFilter] All filters cleared');
    this.closeAdvancedFilter();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.fetchPage();
  }

  onChangeStatus(value: any) {
    console.log('Selected:', value);
    this.selectedStatusValue = value as NoticeStatusCode | null;
  }

  onChangeLocation(value: any) {
    console.log('Selected:', value);
  }

  onAdvProvincePick(value: string | null) {
    this.selectedAdvProvinceId = value;
    this.selectedAdvDistrictId = null;
    this.selectedAdvWardId = null;
  }

  onAdvDistrictPick(value: string | null) {
    this.selectedAdvDistrictId = value;
    this.selectedAdvWardId = null;
  }

  onAdvWardPick(value: string | null) {
    this.selectedAdvWardId = value;
  }

  onChangeOrder(value: any) {
    console.log('Selected:', value);
  }

  onChangeToDate(value: any) {
    console.log('Selected:', value);
  }

  onChangeFromDate(value: any) {
    console.log('Selected:', value);
  }

  ngOnInit() {
    this.categoryStore.list$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((categories) => {
        this.assetCategories = categories ?? [];
        this.categories = this.assetCategories.map((item) => ({
          label: item.name,
          children: (item.children ?? []).map((child) => ({ label: child.name }))
        }));
      });
    this.categoryStore.getAssetCategories$();
    this.categoryStore.legalList$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((categories) => {
        this.legalCategories = categories ?? [];
      });
    this.categoryStore.getLegalCategories$();

    this.route.queryParams.subscribe(params => {
      this.selectedCategory = params['category'] || null;
    });

    this.syncPriceInputStrings();

    this.fetchPage();
  }

  selectAllAssetCategories() {
    this.selectedAssetCategoryId = null;
    this.selectedAssetSubCategoryId = null;
    this.expandedAssetCategoryIds.clear();
  }

  selectAssetCategory(category: AssetCategory) {
    this.selectedAssetCategoryId = category.id;
    this.selectedAssetSubCategoryId = null;

    if (category.children?.length) {
      this.toggleAssetCategoryExpand(category.id);
    }
  }

  selectAssetSubCategory(categoryId: number, subCategoryId: number) {
    this.selectedAssetCategoryId = categoryId;
    this.selectedAssetSubCategoryId = subCategoryId;
  }

  toggleAssetCategoryExpand(categoryId: number) {
    if (this.expandedAssetCategoryIds.has(categoryId)) {
      this.expandedAssetCategoryIds.delete(categoryId);
      return;
    }
    this.expandedAssetCategoryIds.add(categoryId);
  }

  isAssetCategoryExpanded(categoryId: number): boolean {
    return this.expandedAssetCategoryIds.has(categoryId);
  }

  isAssetCategoryActive(categoryId: number): boolean {
    return this.selectedAssetCategoryId === categoryId && this.selectedAssetSubCategoryId === null;
  }

  isAssetSubCategoryActive(subCategoryId: number): boolean {
    return this.selectedAssetSubCategoryId === subCategoryId;
  }

  toggleLegalCategory(categoryId: number) {
    if (this.selectedLegalCategoryIds.has(categoryId)) {
      this.selectedLegalCategoryIds.delete(categoryId);
      return;
    }
    this.selectedLegalCategoryIds.add(categoryId);
  }

  isLegalCategoryActive(categoryId: number): boolean {
    return this.selectedLegalCategoryIds.has(categoryId);
  }

  toggleStatus(status: NoticeStatusCode) {
    if (this.selectedStatusValues.has(status)) {
      this.selectedStatusValues.delete(status);
      return;
    }
    this.selectedStatusValues.add(status);
  }

  isStatusActive(status: NoticeStatusCode): boolean {
    return this.selectedStatusValues.has(status);
  }

  toggleLegalCategoryExpand() {
    this.isLegalCategoryExpanded = !this.isLegalCategoryExpanded;
  }

  get shouldShowLegalCategoryToggle(): boolean {
    return this.legalCategories.length > this.defaultVisibleLegalCategoryCount;
  }

  get visibleLegalCategories(): LegalCategory[] {
    if (this.isLegalCategoryExpanded || !this.shouldShowLegalCategoryToggle) {
      return this.legalCategories;
    }
    return this.legalCategories.slice(0, this.defaultVisibleLegalCategoryCount);
  }

  navToDetail(id: number | undefined) {
    if (id) {
      this.router.navigate(['/product-detail', id]);
    }
  }

  formatPrice(price: number | null | undefined): string {
    if (price == null) {
      return 'Không xác định';
    }
    return (price / 1_000_000_000).toFixed(1) + ' tỷ';
  }

  /** Một dòng giá theo Figma: "9.00 - 11.50 tỷ" hoặc một mức. */
  formatNoticePriceLine(item: NoticeSearchDocument): string {
    const min = item.minStartingPrice;
    const max = item.maxStartingPrice;
    const minOk = min != null && Number.isFinite(min);
    const maxOk = max != null && Number.isFinite(max);
    const minS = minOk ? (min as number / 1_000_000_000).toFixed(2) : null;
    const maxS = maxOk ? (max as number / 1_000_000_000).toFixed(2) : null;
    if (minS && maxS && min !== max) {
      return `${minS} - ${maxS} tỷ`;
    }
    if (minS) {
      return `${minS} tỷ`;
    }
    if (maxS) {
      return `${maxS} tỷ`;
    }
    return 'Không xác định';
  }

  private static readonly noticeTitlePrefix =
    'Thông báo việc đấu giá đối với danh mục tài sản:';

  /** Bỏ tiền tố chuẩn của thông báo đấu giá để title ngắn gọn trên card. */
  formatNoticeTitle(title: string | undefined | null): string {
    const t = title?.trim() ?? '';
    if (!t) {
      return '—';
    }
    const p = ProductsPageComponent.noticeTitlePrefix;
    if (t.startsWith(p)) {
      const rest = t.slice(p.length).trim();
      return rest || '—';
    }
    return t;
  }

  getNoticeStatusLabel(status: string | undefined): string {
    if (!status) {
      return 'Chưa rõ';
    }
    switch (status) {
      case 'UPCOMING':  return 'Mở đăng ký';
      case 'ONGOING':   return 'Đang diễn ra';
      case 'COMPLETED': return 'Đã kết thúc';
      case 'CANCELLED': return 'Huỷ đấu giá';
      default:          return status;
    }
  }

  getStatusClassByCode(status: string | undefined): string {
    switch (status) {
      case 'UPCOMING':  return 'badge--green';
      case 'ONGOING':   return 'badge--blue';
      case 'COMPLETED': return 'badge--gray';
      case 'CANCELLED': return 'badge--gray';
      default:          return '';
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
}
