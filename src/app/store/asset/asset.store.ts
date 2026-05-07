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
import { AuctionOrgListResponse, TopNoticeProvinceResponse } from "../../core/services/asset.service";

export interface AssetState {
    loading: boolean;
    endedLoading: boolean;
    similarLoading: boolean;
    detailLoading: boolean;
    listData: NoticeSearchDocument[];
    endedListData: NoticeSearchDocument[];
    similarListData: NoticeSearchDocument[];
    detailData: MarketplaceNoticeDetail | null;
    auctionOrgsLoading: boolean;
    auctionOrgs: AuctionOrgListResponse['items'];
    auctionOrgsMeta: {
        totalCount: number;
        limit: number;
        offset: number;
        hasMore: boolean;
    };
    topNoticeProvincesLoading: boolean;
    topNoticeProvinces: TopNoticeProvinceResponse['items'];
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
    similarMeta: {
        totalElements: number;
        pageSize: number;
        pageNumber: number;
        hasMore: boolean;
    };
    _searchReq: AdvancedSearchRequest;
    _endedSearchReq: AdvancedSearchRequest;
    _similarSearchReq: AdvancedSearchRequest;
    error: string;
}

const initialState: AssetState = {
    loading: false,
    endedLoading: false,
    similarLoading: false,
    detailLoading: false,
    listData: [],
    endedListData: [],
    similarListData: [],
    detailData: null,
    auctionOrgsLoading: false,
    auctionOrgs: [],
    auctionOrgsMeta: {
        totalCount: 0,
        limit: 4,
        offset: 1,
        hasMore: false,
    },
    topNoticeProvincesLoading: false,
    topNoticeProvinces: [],
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
    similarMeta: {
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
    _similarSearchReq: {
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
    similarListData$ = this.select((s) => s.similarListData);
    meta$ = this.select((s) => s.meta);
    endedMeta$ = this.select((s) => s.endedMeta);
    similarMeta$ = this.select((s) => s.similarMeta);
    loading$ = this.select((s) => s.loading);
    endedLoading$ = this.select((s) => s.endedLoading);
    similarLoading$ = this.select((s) => s.similarLoading);
    detailData$ = this.select((s) => s.detailData);
    detailLoading$ = this.select((s) => s.detailLoading);
    auctionOrgs$ = this.select((s) => s.auctionOrgs);
    auctionOrgsLoading$ = this.select((s) => s.auctionOrgsLoading);
    auctionOrgsMeta$ = this.select((s) => s.auctionOrgsMeta);
    topNoticeProvinces$ = this.select((s) => s.topNoticeProvinces);
    topNoticeProvincesLoading$ = this.select((s) => s.topNoticeProvincesLoading);

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

    readonly getSimilarListData$ = this.effect<AdvancedSearchRequest>(($) =>
        $.pipe(
            tap(() => {
                this.patchState({
                    similarLoading: true,
                    error: "",
                    similarListData: []
                });
            }),
            switchMap((req) => {
                return this.service.advancedSearch(req).pipe(
                    tapResponse(
                        (response: AdvancedSearchResponse) => {
                            this.patchState({
                                similarLoading: false,
                                similarListData: response.items,
                                similarMeta: {
                                    totalElements: response.totalCount,
                                    pageSize: response.pageSize,
                                    pageNumber: response.page,
                                    hasMore: response.page < response.totalPages
                                },
                                _similarSearchReq: req
                            });
                        },
                        (e: HttpErrorResponse) => {
                            this.patchState({
                                similarLoading: false,
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

    readonly getAuctionOrgs$ = this.effect<{ limit: number; offset: number; orgTypeCode?: number; isOrderDescNotices?: boolean; isPrioritizeDvl?: boolean }>(($) =>
        $.pipe(
            tap(() => {
                this.patchState({
                    auctionOrgsLoading: true,
                    error: "",
                    auctionOrgs: []
                });
            }),
            switchMap((req) => {
                return this.service.getAuctionOrgs(req).pipe(
                    tapResponse(
                        (response: AuctionOrgListResponse) => {
                            this.patchState({
                                auctionOrgsLoading: false,
                                auctionOrgs: response.items ?? [],
                                auctionOrgsMeta: {
                                    totalCount: response.totalCount,
                                    limit: response.limit,
                                    offset: response.offset,
                                    hasMore: response.hasMore
                                },
                            });
                        },
                        (e: HttpErrorResponse) => {
                            this.patchState({
                                auctionOrgsLoading: false,
                                error: e.message
                            });
                            this.toastr.error(e.message || "Đã có lỗi xảy ra", "Lỗi");
                        }
                    )
                );
            })
        )
    );

    readonly getTopNoticeProvinces$ = this.effect<void>(($) =>
        $.pipe(
            tap(() => {
                this.patchState({
                    topNoticeProvincesLoading: true,
                    error: "",
                    topNoticeProvinces: []
                });
            }),
            switchMap(() => {
                return this.service.getTopNoticeProvinces().pipe(
                    tapResponse(
                        (response: TopNoticeProvinceResponse) => {
                            this.patchState({
                                topNoticeProvincesLoading: false,
                                topNoticeProvinces: response.items ?? []
                            });
                        },
                        (e: HttpErrorResponse) => {
                            this.patchState({
                                topNoticeProvincesLoading: false,
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
