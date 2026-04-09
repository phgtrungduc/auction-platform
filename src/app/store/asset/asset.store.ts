import { Injectable } from "@angular/core";
import { ImmerComponentStore } from "ngrx-immer/component-store";
import { tapResponse } from "@ngrx/operators";
import { switchMap, tap } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import { ToastrService } from "ngx-toastr";

import { AssetService } from "../../core/services/asset.service";
import {
    AdvancedSearchRequest,
    AdvancedSearchResponse,
    MarketplaceNoticeDetail,
    NoticeSearchDocument
} from "../../core/models/asset.model";

export interface AssetState {
    loading: boolean;
    endedLoading: boolean;
    detailLoading: boolean;
    listData: NoticeSearchDocument[];
    endedListData: NoticeSearchDocument[];
    detailData: MarketplaceNoticeDetail | null;
    meta: {
        totalElements: number;
        pageSize: number;
        pageNumber: number;
        hasMore: boolean;
    };
    endedMeta: {
        totalElements: number;
        pageSize: number;
        pageNumber: number;
        hasMore: boolean;
    };
    _searchReq: AdvancedSearchRequest;
    _endedSearchReq: AdvancedSearchRequest;
    error: string;
}

const initialState: AssetState = {
    loading: false,
    endedLoading: false,
    detailLoading: false,
    listData: [],
    endedListData: [],
    detailData: null,
    meta: {
        totalElements: 0,
        pageSize: 10,
        pageNumber: 1,
        hasMore: false,
    },
    endedMeta: {
        totalElements: 0,
        pageSize: 10,
        pageNumber: 1,
        hasMore: false,
    },
    _searchReq: {
        page: 1,
        pageSize: 20,
        sortBy: "newest"
    },
    _endedSearchReq: {
        page: 1,
        pageSize: 20,
        sortBy: "newest"
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
    endedListData$ = this.select((s) => s.endedListData);
    meta$ = this.select((s) => s.meta);
    endedMeta$ = this.select((s) => s.endedMeta);
    loading$ = this.select((s) => s.loading);
    endedLoading$ = this.select((s) => s.endedLoading);
    detailData$ = this.select((s) => s.detailData);
    detailLoading$ = this.select((s) => s.detailLoading);

    readonly getListData$ = this.effect<AdvancedSearchRequest>(($) =>
        $.pipe(
            tap(() => {
                this.patchState({
                    loading: true,
                    error: "",
                    listData: []
                });
            }),
            switchMap((req) => {
                return this.service.advancedSearch(req).pipe(
                    tapResponse(
                        (response: AdvancedSearchResponse) => {
                            this.patchState({
                                loading: false,
                                listData: response.items,
                                meta: {
                                    totalElements: response.totalCount,
                                    pageSize: response.pageSize,
                                    pageNumber: response.page,
                                    hasMore: response.page < response.totalPages
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

    readonly getEndedListData$ = this.effect<AdvancedSearchRequest>(($) =>
        $.pipe(
            tap(() => {
                this.patchState({
                    endedLoading: true,
                    error: "",
                    endedListData: []
                });
            }),
            switchMap((req) => {
                return this.service.advancedSearch(req).pipe(
                    tapResponse(
                        (response: AdvancedSearchResponse) => {
                            this.patchState({
                                endedLoading: false,
                                endedListData: response.items,
                                endedMeta: {
                                    totalElements: response.totalCount,
                                    pageSize: response.pageSize,
                                    pageNumber: response.page,
                                    hasMore: response.page < response.totalPages
                                },
                                _endedSearchReq: req
                            });
                        },
                        (e: HttpErrorResponse) => {
                            this.patchState({
                                endedLoading: false,
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
