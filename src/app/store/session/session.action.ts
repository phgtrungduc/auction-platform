import { createAction, props } from '@ngrx/store';

export const LoadBearerTokenAction = createAction(
  '[Session] Load BearerToken',
  props<{ bearerToken: string }>(),
);

export const ClearSessionAction = createAction('[Session] Clear');
