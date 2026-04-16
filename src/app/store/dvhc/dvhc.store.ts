import { Injectable } from "@angular/core";
import { ImmerComponentStore } from "ngrx-immer/component-store";
import { tapResponse } from "@ngrx/operators";
import { switchMap, tap } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import { ToastrService } from "ngx-toastr";

import { DvhcService } from "../../core/services/dvhc.service";
import { Dvhc, DvhcQueryParams } from "../../core/models/dvhc.model";

export interface DvhcState {
    loading: boolean;
    listWards: Dvhc[];
    listDistricts: Dvhc[];
    listProvinces: Dvhc[];
    _searchReq: DvhcQueryParams | null;
    error: string;
}

const initialState: DvhcState = {
    loading: false,
    listWards: [],
    listDistricts: [],
    listProvinces: [],
    _searchReq: null,
    error: ""
};

@Injectable({ providedIn: 'root' })
export class DvhcStore extends ImmerComponentStore<DvhcState> {
    constructor(
        private service: DvhcService,
        private toastr: ToastrService
    ) {
        super(initialState);
    }

    listWards$ = this.select((s) => s.listWards);
    listDistricts$ = this.select((s) => s.listDistricts);
    listProvinces$ = this.select((s) => s.listProvinces);
    loading$ = this.select((s) => s.loading);

    readonly getWards$ = this.effect<DvhcQueryParams>(($) =>
        $.pipe(
            tap(() => {
                this.patchState({
                    loading: true,
                    error: "",
                    listWards: []
                });
            }),
            switchMap((req) => {
                return this.service.getWards(req).pipe(
                    tapResponse(
                        (response: Dvhc[]) => {
                            this.patchState({
                                loading: false,
                                listWards: response,
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

    readonly getDistricts$ = this.effect<DvhcQueryParams>(($) =>
        $.pipe(
            tap(() => {
                this.patchState({
                    loading: true,
                    error: "",
                    listDistricts: []
                });
            }),
            switchMap((req) => {
                return this.service.getDistricts(req).pipe(
                    tapResponse(
                        (response: Dvhc[]) => {
                            this.patchState({
                                loading: false,
                                listDistricts: response,
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

    readonly getProvinces$ = this.effect<void>(($) =>
        $.pipe(
            tap(() => {
                this.patchState({
                    loading: true,
                    error: "",
                    listProvinces: []
                });
            }),
            switchMap(() => {
                return this.service.getProvinces().pipe(
                    tapResponse(
                        (response: Dvhc[]) => {
                            this.patchState({
                                loading: false,
                                listProvinces: response,
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
}
