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
