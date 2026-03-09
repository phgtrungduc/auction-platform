export interface UserState {
  username: string;
  role: number;
}

export const initialUserState: UserState = {
  username: '',
  role: 0,
};
