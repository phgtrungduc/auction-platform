export interface LoginRequest {
  email: string;
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

export interface RequestOtpRequest {
  email: string;
}

export interface RequestOtpResponse {
  success?: boolean;
  userId?: number | null;
  message?: string | null;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  success?: boolean;
  otpVerified?: boolean;
  registrationToken?: string;
  userId?: number | null;
  email?: string | null;
}

export interface RegisterRequest {
  email: string;
  password: string;
  registrationToken?: string;
}

export interface RegisterResponse {
  userId: number;
  email: string;
  accessToken: string;
  expiresInSeconds: number;
}
