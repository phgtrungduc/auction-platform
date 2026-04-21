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

export interface UserProfileResponse {
  id: number;
  email: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
  isNotificated: boolean;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export interface UpdateDisplayNameRequest {
  displayName: string;
}

export interface UpdateDisplayNameResponse {
  success: boolean;
  message: string;
  displayName: string;
}

export interface UpdateNotificationStatusRequest {
  statusReceiveNotification: boolean;
}

export interface UpdateNotificationStatusResponse {
  success: boolean;
  message: string;
}
