import { createSelector } from '@ngrx/store';
import { ActionReducerMap } from '@ngrx/store';
import { SessionState, initialSessionState } from './session/session.state';
import { UserState, initialUserState } from './user/user.state';
import { sessionReducer } from './session/session.reducer';
import { userReducer } from './user/user.reducer';

export interface AppStates {
  session: SessionState;
  user: UserState;
}

export const reducers: ActionReducerMap<AppStates> = {
  session: sessionReducer,
  user: userReducer,
};

export const initialState: AppStates = {
  session: initialSessionState,
  user: initialUserState,
};

// Selectors
const selectSession = (state: AppStates) => state.session;
const selectUser = (state: AppStates) => state.user;

export const getBearerToken = createSelector(selectSession, session => session.bearerToken);
export const getCurrentUser = createSelector(selectUser, user => user);
export const getUsername = createSelector(selectUser, user => user.username);
export const getUserRole = createSelector(selectUser, user => user.role);
export const selectToken = (state: AppStates) => state.session?.bearerToken;

export const selectIsLoggedIn = createSelector(
  selectToken,
  (token) => {
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }
);
