export interface Asset {
  id: number;
  sourceId: string;
  sourceItemId: string;
  sourceUrl: string;
  title: string;
  description: string;
  startingPrice: number;
  depositAmount: number;
  auctionOrgName: string;
  assetOwnerName: string;
  docSaleStart: string;
  docSaleEnd: string;
  auctionDatetime: string;
  publishDate: string;
  auctionLocation: string;
  assetLocation: string;
  provinceCode: string;
  provinceName: string;
  districtCode: string;
  districtName: string;
  landArea: number;
  landPurpose: string;
  status: string;
  propertyTypeId: number;
  propertyTypeName: string;
  assetType: number;
  assetTypeName: string;
  assetTypeRefId: string;
  assetSubType: number;
  assetSubTypeName: string;
  assetSubTypeRefId: string;
  legalCategory: number;
  legalCategoryName: string;
  legalCategoryRefId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedAssetsResponse {
  items: Asset[];
  totalCount: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface AssetQueryParams {
  Limit?: number;
  Offset?: number;
  Status?: string;
  AssetType?: number;
  AssetSubType?: number;
  LegalCategory?: number;
  ProvinceCode?: string;
  SortBy?: string;
}

export interface AdvancedTimeFilter {
  type: 'Auction' | 'DocSale' | 'AssetView' | 'Result';
  from: string;
  to: string;
}

export interface AdvancedSearchRequest {
  query?: string;
  assetCategoryId?: number;
  statuses?: string[];
  minPrice?: string;
  maxPrice?: string;
  timeFilters?: AdvancedTimeFilter[];
  legalCategoryIds?: number[];
  provinceCode?: string;
  districtCode?: string;
  sortBy?: string;
  page?: number;
  pageSize?: number;
}

export interface NoticeSearchDocument {
  noticeId: number;
  sourceId: string;
  sourceNoticeId: string;
  sourceUrl: string;
  title: string;
  auctionOrgName: string;
  status: string;
  docSaleStart: string;
  docSaleEnd: string;
  viewingStart: string | null;
  viewingEnd: string | null;
  auctionDatetime: string;
  publishDate: string;
  provinceCode: string;
  provinceName: string;
  districtCode: string;
  assetCount: number;
  minStartingPrice: number;
  maxStartingPrice: number;
  firstAssetCategoryId?: number;
  firstAssetCategoryName?: string;
  firstAssetCategoryRefId?: string;
}

export interface AdvancedSearchResponse {
  items: NoticeSearchDocument[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Attachment {
  id: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number | null;
  displayOrder: number;
}

export interface NoticeAsset {
  id: number;
  noticeId: number;
  displayOrder: number;
  title: string;
  description: string | null;
  assetType: number | null;
  assetTypeCode: number | null;
  assetSubType: number | null;
  assetSubTypeCode: number | null;
  legalCategory: string | null;
  legalCategoryCode: string | null;
  startingPrice: number;
  depositValue: number;
  depositType: number;
  winningPrice: number | null;
  priceStep: number | null;
  assetLocation: string | null;
  provinceCode: string | null;
  districtCode: string | null;
  landArea: number | null;
  landPurpose: string | null;
  propertyTypeId: number;
  propertyTypeName: string;
}

export interface MarketplaceNoticeDetail {
  id: number;
  sourceId: string;
  sourceNoticeId: string;
  sourceUrl: string;
  title: string;
  description: string | null;
  auctionOrgName: string;
  auctionOrgAddress: string | null;
  assetOwnerName: string;
  assetOwnerAddress: string | null;
  docSaleStart: string;
  docSaleEnd: string;
  viewingStart: string | null;
  viewingEnd: string | null;
  auctionDatetime: string;
  publishDate: string;
  auctionLocation: string | null;
  status: string;
  auctionMethod: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  fingerprint: string;
  attachments: Attachment[];
  assets: NoticeAsset[];
  created: string;
}
