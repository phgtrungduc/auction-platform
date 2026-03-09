import { createAction, props } from '@ngrx/store';
import { UserState } from './user.state';

export const SetUserAction = createAction(
  '[User] Set user',
  props<{ user: Pick<UserState, 'username' | 'role'> }>(),
);

export const ClearUserAction = createAction('[User] Clear');
