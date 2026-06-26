export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  permissions?: Record<string, boolean>;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface AuthSession {
  accessToken: string;
  user: User;
}
