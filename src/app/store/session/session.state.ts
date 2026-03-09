export interface SessionState {
  bearerToken: string;
}

export const initialSessionState: SessionState = {
  bearerToken: '',
};
