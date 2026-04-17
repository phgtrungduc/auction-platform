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
