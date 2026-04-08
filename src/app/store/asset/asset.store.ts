import { Injectable } from "@angular/core";
import { ImmerComponentStore } from "ngrx-immer/component-store";
import { tapResponse } from "@ngrx/operators";
import { switchMap, tap } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import { ToastrService } from "ngx-toastr";

import { AssetService } from "../../core/services/asset.service";
import { Asset, AssetQueryParams, PaginatedAssetsResponse, MarketplaceNoticeDetail } from "../../core/models/asset.model";

export interface AssetState {
    loading: boolean;
    detailLoading: boolean;
    listData: Asset[];
    detailData: MarketplaceNoticeDetail | null;
    meta: {
        totalElements: number;
        pageSize: number;
        pageNumber: number;
        hasMore: boolean;
    };
    _searchReq: AssetQueryParams;
    error: string;
}

const initialState: AssetState = {
    loading: false,
    detailLoading: false,
    listData: [],
    detailData: null,
    meta: {
        totalElements: 0,
        pageSize: 10,
        pageNumber: 1,
        hasMore: false,
    },
    _searchReq: {
        Limit: 10,
        Offset: 1,
    },
    error: ""
};

@Injectable({ providedIn: 'root' })
export class AssetStore extends ImmerComponentStore<AssetState> {
    constructor(
        private service: AssetService,
        private toastr: ToastrService
    ) {
        super(initialState);
    }

    listData$ = this.select((s) => s.listData);
    meta$ = this.select((s) => s.meta);
    loading$ = this.select((s) => s.loading);
    detailData$ = this.select((s) => s.detailData);
    detailLoading$ = this.select((s) => s.detailLoading);

    readonly getListData$ = this.effect<AssetQueryParams>(($) =>
        $.pipe(
            tap(() => {
                this.patchState({
                    loading: true,
                    error: "",
                    listData: []
                });
            }),
            switchMap((req) => {
                return this.service.getAssets(req).pipe(
                    tapResponse(
                        (response: PaginatedAssetsResponse) => {
                            this.patchState({
                                loading: false,
                                listData: response.items,
                                meta: {
                                    totalElements: response.totalCount,
                                    pageSize: response.limit,
                                    pageNumber: response.offset,
                                    hasMore: response.hasMore
                                },
                                _searchReq: req
                            });
                        },
                        (e: HttpErrorResponse) => {
                            this.patchState({
                                loading: false,
                                error: e.message
                            });
                            this.toastr.error(e.message || "Đã có lỗi xảy ra", "Lỗi");
                        }
                    )
                );
            })
        )
    );

    readonly getDetail$ = this.effect<string | number>(($) =>
        $.pipe(
            tap(() => {
                this.patchState({
                    detailLoading: true,
                    error: "",
                    detailData: null
                });
            }),
            switchMap((id) => {
                return this.service.getDetail(id).pipe(
                    tapResponse(
                        (response: MarketplaceNoticeDetail) => {
                            this.patchState({
                                detailLoading: false,
                                detailData: response
                            });
                        },
                        (e: HttpErrorResponse) => {
                            this.patchState({
                                detailLoading: false,
                                error: e.message
                            });
                            this.toastr.error(e.message || "Đã có lỗi xảy ra", "Lỗi");
                        }
                    )
                );
            })
        )
    );
}
