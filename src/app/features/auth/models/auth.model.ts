export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  isSuccess: boolean;
  jwt: string;
  user: {
    username: string;
    role: number;
  };
}
