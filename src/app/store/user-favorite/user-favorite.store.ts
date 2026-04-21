import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { tapResponse } from '@ngrx/operators';
import { switchMap, tap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ImmerComponentStore } from 'ngrx-immer/component-store';

import { UserFavoriteService } from '../../core/services/user-favorite.service';
import {
  CreateUserFavoriteResponse,
  DeleteUserFavoriteResponse,
  UserFavoriteItem,
  UserFavoritesQueryParams,
  UserFavoritesResponse
} from '../../core/models/user-favorite.model';

export interface UserFavoriteState {
  loading: boolean;
  listData: UserFavoriteItem[];
  favoriteIdByNoticeId: Record<number, number>;
  mutateLoading: boolean;
  lastMutation: { noticeId: number; isLiked: boolean; favoriteId?: number; isFirstTime?: boolean } | null;
  meta: {
    totalElements: number;
    pageSize: number;
    pageNumber: number;
    hasMore: boolean;
  };
  error: string;
}

const initialState: UserFavoriteState = {
  loading: false,
  listData: [],
  favoriteIdByNoticeId: {},
  mutateLoading: false,
  lastMutation: null,
  meta: {
    totalElements: 0,
    pageSize: 20,
    pageNumber: 1,
    hasMore: false
  },
  error: ''
};

@Injectable({ providedIn: 'root' })
export class UserFavoriteStore extends ImmerComponentStore<UserFavoriteState> {
  constructor(
    private service: UserFavoriteService,
    private toastr: ToastrService
  ) {
    super(initialState);
  }

  listData$ = this.select((s) => s.listData);
  meta$ = this.select((s) => s.meta);
  loading$ = this.select((s) => s.loading);
  favoriteIdByNoticeId$ = this.select((s) => s.favoriteIdByNoticeId);
  mutateLoading$ = this.select((s) => s.mutateLoading);
  lastMutation$ = this.select((s) => s.lastMutation);

  getFavoriteIdForNotice(noticeId: number): number | undefined {
    return this.get((s) => s.favoriteIdByNoticeId[noticeId]);
  }

  readonly getListData$ = this.effect<UserFavoritesQueryParams>(($) =>
    $.pipe(
      tap(() => {
        this.patchState({
          loading: true,
          error: '',
          listData: []
        });
      }),
      switchMap((req) => this.service.getUserFavorites(req).pipe(
        tapResponse(
          (response: UserFavoritesResponse) => {
            const pageSize = response.limit || req.limit || 20;
            const pageNumber = Math.floor((response.offset || req.offset || 0) / pageSize) + 1;
            const map: Record<number, number> = {};
            (response.items ?? []).forEach((it) => {
              if (typeof it.noticeId === 'number' && typeof it.favoriteId === 'number') {
                map[it.noticeId] = it.favoriteId;
              }
            });

            this.patchState({
              loading: false,
              listData: (response.items ?? []).map((item) => ({ ...item, isLiked: true })),
              favoriteIdByNoticeId: map,
              meta: {
                totalElements: response.totalCount,
                pageSize,
                pageNumber,
                hasMore: response.hasMore
              }
            });
          },
          (e: HttpErrorResponse) => {
            this.patchState({
              loading: false,
              error: e.message
            });
            this.toastr.error(e.message || 'Đã có lỗi xảy ra', 'Lỗi');
          }
        )
      ))
    )
  );

  readonly addFavorite$ = this.effect<number>(($) =>
    $.pipe(
      tap(() => this.patchState({ mutateLoading: true, error: '' })),
      switchMap((noticeId) =>
        this.service.createUserFavorite(noticeId).pipe(
          tapResponse(
            (res: CreateUserFavoriteResponse) => {
              this.patchState((state) => ({
                mutateLoading: false,
                favoriteIdByNoticeId: {
                  ...state.favoriteIdByNoticeId,
                  [res.noticeId]: res.favoriteId
                },
                lastMutation: {
                  noticeId: res.noticeId,
                  isLiked: true,
                  favoriteId: res.favoriteId,
                  isFirstTime: res.isFirstTime
                }
              }));
            },
            (e: HttpErrorResponse) => {
              this.patchState({ mutateLoading: false, error: e.message });
              this.toastr.error(e.message || 'Đã có lỗi xảy ra', 'Lỗi');
            }
          )
        )
      )
    )
  );

  readonly removeFavorite$ = this.effect<{ noticeId: number; favoriteId?: number }>(($) =>
    $.pipe(
      tap(() => this.patchState({ mutateLoading: true, error: '' })),
      switchMap(({ noticeId, favoriteId }) => {
        const favId = favoriteId ?? this.get((s) => s.favoriteIdByNoticeId[noticeId]);
        if (!favId) {
          const msg = 'Không tìm thấy favoriteId để xoá';
          this.patchState({ mutateLoading: false, error: msg });
          //this.toastr.error(msg, 'Lỗi');
          return [];
        }

        return this.service.deleteUserFavorite(noticeId).pipe(
          tapResponse(
            (_res: DeleteUserFavoriteResponse) => {
              this.patchState((state) => ({
                mutateLoading: false,
                favoriteIdByNoticeId: Object.fromEntries(
                  Object.entries(state.favoriteIdByNoticeId).filter(
                    ([key]) => Number(key) !== noticeId
                  )
                ),
                lastMutation: { noticeId, isLiked: false }
              }));
            },
            (e: HttpErrorResponse) => {
              this.patchState({ mutateLoading: false, error: e.message });
              this.toastr.error(e.message || 'Đã có lỗi xảy ra', 'Lỗi');
            }
          )
        );
      })
    )
  );
}
