import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { tapResponse } from '@ngrx/operators';
import { ToastrService } from 'ngx-toastr';
import { switchMap, tap } from 'rxjs';
import { ImmerComponentStore } from 'ngrx-immer/component-store';

import { CategoryService } from '../../core/services/category.service';
import { AssetCategory, LegalCategory } from '../../core/models/category.model';

export interface CategoryState {
  loading: boolean;
  list: AssetCategory[];
  legalLoading: boolean;
  legalList: LegalCategory[];
  error: string;
}

const initialState: CategoryState = {
  loading: false,
  list: [],
  legalLoading: false,
  legalList: [],
  error: ''
};

@Injectable({ providedIn: 'root' })
export class CategoryStore extends ImmerComponentStore<CategoryState> {
  constructor(
    private service: CategoryService,
    private toastr: ToastrService
  ) {
    super(initialState);
  }

  list$ = this.select((s) => s.list);
  loading$ = this.select((s) => s.loading);
  legalList$ = this.select((s) => s.legalList);
  legalLoading$ = this.select((s) => s.legalLoading);

  readonly getAssetCategories$ = this.effect<void>(($) =>
    $.pipe(
      tap(() => {
        this.patchState({
          loading: true,
          error: '',
          list: []
        });
      }),
      switchMap(() =>
        this.service.getAssetCategories(true).pipe(
          tapResponse(
            (response: AssetCategory[]) => {
              this.patchState({
                loading: false,
                list: this.normalizeCategories(response)
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
        )
      )
    )
  );

  readonly getLegalCategories$ = this.effect<void>(($) =>
    $.pipe(
      tap(() => {
        this.patchState({
          legalLoading: true,
          error: '',
          legalList: []
        });
      }),
      switchMap(() =>
        this.service.getLegalCategories(true).pipe(
          tapResponse(
            (response: LegalCategory[]) => {
              this.patchState({
                legalLoading: false,
                legalList: this.normalizeLegalCategories(response)
              });
            },
            (e: HttpErrorResponse) => {
              this.patchState({
                legalLoading: false,
                error: e.message
              });
              this.toastr.error(e.message || 'Đã có lỗi xảy ra', 'Lỗi');
            }
          )
        )
      )
    )
  );

  private normalizeCategories(categories: AssetCategory[]): AssetCategory[] {
    return (categories ?? [])
      .filter((item) => item?.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((item) => ({
        ...item,
        children: (item.children ?? [])
          .filter((child) => child?.isActive)
          .sort((a, b) => a.displayOrder - b.displayOrder)
      }));
  }

  private normalizeLegalCategories(categories: LegalCategory[]): LegalCategory[] {
    return (categories ?? [])
      .filter((item) => item?.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }
}

