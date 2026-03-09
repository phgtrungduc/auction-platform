import { createReducer, on } from '@ngrx/store';
import { ClearUserAction, SetUserAction } from './user.action';
import { initialUserState } from './user.state';

export const userReducer = createReducer(
  initialUserState,
  on(SetUserAction, (state, { user }) => ({
    ...state,
    username: user.username,
    role: user.role,
  })),
  on(ClearUserAction, () => initialUserState),
);
