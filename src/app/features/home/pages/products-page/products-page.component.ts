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
import { DvhcStore } from '../../../../store/dvhc/dvhc.store';
import { Dvhc } from '../../../../core/models/dvhc.model';
import { AssetCategory, LegalCategory } from '../../../../core/models/category.model';
import { AssetService } from '../../../../core/services/asset.service';
import { AdvancedSearchRequest, AdvancedTimeFilter, NoticeSearchDocument } from '../../../../core/models/asset.model';
import { UserFavoriteStore } from '../../../../store/user-favorite/user-favorite.store';
import { Store } from '@ngrx/store';
import { selectIsLoggedIn } from '../../../../store/app-state';
import { LoggerService } from '../../../../core/services/logger.service';

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
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private categoryStore = inject(CategoryStore);
  private dvhcStore = inject(DvhcStore);
  private assetService = inject(AssetService);
  private userFavoriteStore = inject(UserFavoriteStore);
  private destroyRef = inject(DestroyRef);
  private logger = inject(LoggerService);
  private store = inject(Store);

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

  selectedCategory: number | null = null;
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

  /** Danh sách tỉnh/thành (simple filter bar) — lấy từ DvhcStore */
  optionsLocation: SelectOption[] = [];

  /** Danh sách tỉnh/thành (bộ lọc nâng cao 3 cấp) — lấy từ DvhcStore */
  optionsAdvProvince: SelectOption[] = [];

  /** Danh sách quận/huyện ứng với tỉnh đang chọn */
  optionsAdvDistrict: SelectOption[] = [];

  /** Danh sách phường/xã ứng với quận/huyện đang chọn */
  optionsAdvWard: SelectOption[] = [];

  selectedAdvProvinceId: string | null = null;
  selectedAdvDistrictId: string | null = null;
  selectedAdvWardId: string | null = null;

  private dvhcToSelectOptions(list: Dvhc[]): SelectOption[] {
    return list.map((d) => ({ label: d.nameWithType, value: d.code }));
  }

  optionsOrder = [
    { label: 'Mới nhất', value: 'auction_soon' },
    { label: 'Giá tăng dần', value: 'price_asc' },
    { label: 'Giá giảm dần', value: 'price_desc' },
  ];

  /** Từ khoá tìm kiếm (search bar) */
  searchQuery = '';

  /** Category ID từ dropdown search bar (không liên quan advanced filter) */
  selectedSearchCategoryId: number | null = null;

  selectedStatusValue: NoticeStatusCode | null = null;
  selectedStatusValues = new Set<NoticeStatusCode>();

  /** Province code từ location dropdown search bar */
  selectedLocationValue: string | null = null;

  /** Sort value trực tiếp từ option (ví dụ: 'newest', 'price_asc') */
  selectedOrderValue: string | null = null;

  selectedToDate: Date | null = null;

  selectedFromDate: Date | null = null;

  currentPage: number = 1;
  totalPages: number = 1;
  totalCount: number = 0;
  readonly pageSize = 20;
  notices: NoticeSearchDocument[] = [];
  private favoriteIdByNoticeId: Record<number, number> = {};

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
    const toFromISO = (d: Date) =>
      `${d.toISOString().split('T')[0]}T00:00:00Z`;
    const toToISO = (d: Date) =>
      `${d.toISOString().split('T')[0]}T23:59:59Z`;

    // --- Time filters từ Advanced filter panel ---
    type TimeFilterKey = keyof typeof this.timeFilter;
    const typeMap: Record<TimeFilterKey, AdvancedTimeFilter['type']> = {
      DOC_SALE: 'DocSale',
      ASSET_VIEW: 'AssetView',
      AUCTION_TIME: 'Auction',
      RESULT_TIME: 'Result',
    };
    const advTimeFilters = (Object.keys(this.timeFilter) as TimeFilterKey[])
      .reduce<AdvancedTimeFilter[]>((acc, key) => {
        const v = this.timeFilter[key];
        if (v.enabled && (v.from || v.to)) {
          acc.push({
            type: typeMap[key],
            from: v.from ? toFromISO(v.from) : '',
            to: v.to ? toToISO(v.to) : '',
          });
        }
        return acc;
      }, []);

    // --- Auction time filter từ search bar date range ---
    // Chỉ thêm nếu advanced filter chưa có AUCTION_TIME
    const hasAdvAuction = advTimeFilters.some((f) => f.type === 'Auction');
    if (!hasAdvAuction && (this.selectedFromDate || this.selectedToDate)) {
      advTimeFilters.push({
        type: 'Auction',
        from: this.selectedFromDate ? toFromISO(this.selectedFromDate) : '',
        to: this.selectedToDate ? toToISO(this.selectedToDate) : '',
      });
    }

    const req: AdvancedSearchRequest = {
      page: this.currentPage,
      pageSize: this.pageSize,
    };

    // query từ search bar
    if (this.searchQuery.trim()) req.query = this.searchQuery.trim();

    // assetCategoryId: ưu tiên advanced filter, fallback sang search bar category
    const assetCategoryId =
      this.selectedAssetSubCategoryId ??
      this.selectedAssetCategoryId ??
      this.selectedSearchCategoryId ?? this.selectedCategory;
    if (assetCategoryId != null) req.assetCategoryId = assetCategoryId;

    // Statuses: merge advanced filter (Set) + search bar single value
    const mergedStatuses = new Set<string>(this.selectedStatusValues);
    if (this.selectedStatusValue) mergedStatuses.add(this.selectedStatusValue);
    if (mergedStatuses.size > 0) req.statuses = [...mergedStatuses];

    if (advTimeFilters.length > 0) req.timeFilters = advTimeFilters;
    if (this.selectedLegalCategoryIds.size > 0) req.legalCategoryIds = [...this.selectedLegalCategoryIds];

    // provinceCode: ưu tiên advanced filter 3 cấp, fallback sang location bar
    const provinceCode = this.selectedAdvProvinceId || this.selectedLocationValue;
    if (provinceCode) req.provinceCode = provinceCode;
    if (this.selectedAdvDistrictId) req.districtCode = this.selectedAdvDistrictId;

    // sortBy: giá trị string trực tiếp từ option
    if (this.selectedOrderValue) req.sortBy = this.selectedOrderValue;

    const isFullPriceRange =
      this.priceMinVnd <= 0 && this.priceMaxVnd >= this.sliderMaxVnd;
    if (!isFullPriceRange) {
      req.minPrice = String(this.priceMinVnd);
      req.maxPrice = String(this.priceMaxVnd);
    }

    return req;
  }

  /** Tìm kiếm từ search bar (Enter hoặc click icon) */
  onSearch() {
    this.currentPage = 1;
    this.fetchPage();
  }

  /** Thay đổi category từ dropdown search bar */
  onCategoryChange(value: number | null) {
    this.selectedSearchCategoryId = value;
    this.currentPage = 1;
    this.fetchPage();
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
          this.notices = res.items ?? [];
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
    this.selectedAssetCategoryId = null;
    this.selectedAssetSubCategoryId = null;
    this.expandedAssetCategoryIds.clear();
    this.selectedStatusValues = new Set();
    this.selectedLegalCategoryIds = new Set();
    this.isLegalCategoryExpanded = false;
    this.timeFilter = {
      DOC_SALE: { enabled: false, from: null, to: null },
      ASSET_VIEW: { enabled: false, from: null, to: null },
      AUCTION_TIME: { enabled: false, from: null, to: null },
      RESULT_TIME: { enabled: false, from: null, to: null },
    };
    this.selectedAdvProvinceId = null;
    this.selectedAdvDistrictId = null;
    this.selectedAdvWardId = null;
    this.currentPage = 1;
    this.startPricePreset = 'all';
    this.priceMinVnd = 0;
    this.priceMaxVnd = this.sliderMaxVnd;
    this.draggingThumb = null;
    this.syncPriceInputStrings();

    console.log('[AdvancedFilter] All filters cleared');
    this.closeAdvancedFilter();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.fetchPage();
  }

  onChangeStatus(value: any) {
    this.selectedStatusValue = (value as NoticeStatusCode | null) ?? null;
    this.currentPage = 1;
    this.fetchPage();
  }

  onChangeLocation(value: any) {
    this.selectedLocationValue = (value as string | null) ?? null;
    this.currentPage = 1;
    this.fetchPage();
  }

  onAdvProvincePick(value: string | null) {
    this.selectedAdvProvinceId = value;
    this.selectedAdvDistrictId = null;
    this.selectedAdvWardId = null;
    this.optionsAdvDistrict = [];
    this.optionsAdvWard = [];
    if (value) {
      this.dvhcStore.getDistricts$({ parentCode: value });
    }
  }

  onAdvDistrictPick(value: string | null) {
    this.selectedAdvDistrictId = value;
    this.selectedAdvWardId = null;
    this.optionsAdvWard = [];
    if (value) {
      this.dvhcStore.getWards$({ parentCode: value });
    }
  }

  onAdvWardPick(value: string | null) {
    this.selectedAdvWardId = value;
  }

  onChangeOrder(value: any) {
    this.selectedOrderValue = (value as string | null) ?? null;
    this.currentPage = 1;
    this.fetchPage();
  }

  onChangeToDate(value: any) {
    this.selectedToDate = value as Date | null;
    this.currentPage = 1;
    this.fetchPage();
  }

  onChangeFromDate(value: any) {
    this.selectedFromDate = value as Date | null;
    this.currentPage = 1;
    this.fetchPage();
  }

  ngOnInit() {
    this.categoryStore.list$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((categories) => {
        this.assetCategories = categories ?? [];
        this.categories = this.assetCategories.map((item) => ({
          label: item.name,
          value: item.id.toString(),
          children: (item.children ?? []).map((child) => ({ label: child.name, value: child.id.toString() }))
        }));
      });
    this.categoryStore.getAssetCategories$();
    this.categoryStore.legalList$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((categories) => {
        this.legalCategories = categories ?? [];
      });
    this.categoryStore.getLegalCategories$();

    // Tỉnh/thành — dùng chung cho cả filter bar và bộ lọc nâng cao
    this.dvhcStore.listProvinces$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((list) => {
        const opts = this.dvhcToSelectOptions(list);
        this.optionsLocation = opts;
        this.optionsAdvProvince = opts;
      });
    this.dvhcStore.getProvinces$();

    // Quận/huyện
    this.dvhcStore.listDistricts$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((list) => {
        this.optionsAdvDistrict = this.dvhcToSelectOptions(list);
      });

    // Phường/xã
    this.dvhcStore.listWards$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((list) => {
        this.optionsAdvWard = this.dvhcToSelectOptions(list);
      });

    this.route.queryParams.subscribe(params => {
      this.selectedCategory = params['category'] || null;
    });

    this.syncPriceInputStrings();

    this.userFavoriteStore.lastMutation$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((m) => {
        if (!m) return;
        this.applyFavoriteMutation(m.noticeId, m.isLiked, m.favoriteId);
      });

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
    if (min < 100_000_000) {
      const minS = minOk ? (min as number / 1_000_000).toFixed(2) : null;
      const maxS = maxOk ? (max as number / 1_000_000).toFixed(2) : null;
      if (minS && maxS && min !== max) {
        return `${minS} - ${maxS} triệu`;
      }
      if (minS) {
        return `${minS} triệu`;
      }
      if (maxS) {
        return `${maxS} triệu`;
      }
    } else {
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
    }

    return 'Không xác định';
  }

  getNoticeImage(item: NoticeSearchDocument): string {
    const normalizedRefId = item.firstAssetCategoryRefId?.trim().toUpperCase();
    if (!normalizedRefId) {
      return this.defaultNoticeImage;
    }

    return this.categoryImageByRefId[normalizedRefId] ?? this.defaultNoticeImage;
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
      case 'UPCOMING': return 'Mở đăng ký';
      case 'ONGOING': return 'Đang diễn ra';
      case 'COMPLETED': return 'Đã kết thúc';
      case 'CANCELLED': return 'Huỷ đấu giá';
      default: return status;
    }
  }

  getStatusClassByCode(status: string | undefined): string {
    switch (status) {
      case 'UPCOMING': return 'badge--green';
      case 'ONGOING': return 'badge--blue';
      case 'COMPLETED': return 'badge--gray';
      case 'CANCELLED': return 'badge--gray';
      default: return '';
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

  toggleFavorite(item: NoticeSearchDocument, event?: Event): void {
    event?.stopPropagation();
    event?.preventDefault();

    let isLoggedIn = false;
    this.store.select(selectIsLoggedIn).subscribe(v => isLoggedIn = v).unsubscribe();

    if (!isLoggedIn) {
      this.logger.info('Vui lòng đăng nhập để thực hiện chức năng này!');
      return;
    }

    const noticeId = item.noticeId;
    if (!noticeId) return;
    item.isLiked = !item.isLiked;

    if (!item.isLiked) {
      this.userFavoriteStore.removeFavorite$({
        noticeId,
        favoriteId: this.favoriteIdByNoticeId[noticeId]
      });
      return;
    }

    this.userFavoriteStore.addFavorite$(noticeId);
  }

  private applyFavoriteMutation(noticeId: number, isLiked: boolean, favoriteId?: number): void {
    this.notices = (this.notices ?? []).map((it) => {
      if (it.noticeId !== noticeId) return it;
      return { ...it, isLiked };
    });

    if (isLiked && favoriteId) {
      this.favoriteIdByNoticeId[noticeId] = favoriteId;
      return;
    }
    delete this.favoriteIdByNoticeId[noticeId];
  }
}
