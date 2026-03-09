import { createReducer, on } from '@ngrx/store';
import { ClearSessionAction, LoadBearerTokenAction } from './session.action';
import { initialSessionState } from './session.state';

export const sessionReducer = createReducer(
  initialSessionState,
  on(LoadBearerTokenAction, (state, { bearerToken }) => ({
    ...state,
    bearerToken,
  })),
  on(ClearSessionAction, () => initialSessionState),
);
