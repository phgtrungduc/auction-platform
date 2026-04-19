export interface UserFavoriteItem {
  favoriteId: number;
  noticeId: number;
  title: string;
  description: string;
  auctionOrgName: string;
  auctionDatetime: string;
  status: string;
  sourceUrl: string;
  createdAt: string;
  isLiked?: boolean;
  viewCount: number;
  favoriteCount: number;
  provinceNames: string;
  assetCount: number;
  assetCategoryId: number;
  minStartingPrice: number;
  maxStartingPrice: number;
  assetCategoryName: string;
  assetCategoryRefId: string;
}

export interface UserFavoritesResponse {
  items: UserFavoriteItem[];
  totalCount: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface UserFavoritesQueryParams {
  limit?: number;
  offset?: number;
}

export interface CreateUserFavoriteRequest {
  noticeId: number;
}

export interface CreateUserFavoriteResponse {
  favoriteId: number;
  noticeId: number;
  isFirstTime: boolean;
  message: string;
}

export interface DeleteUserFavoriteResponse {
  noticeId: number;
  message: string;
}
