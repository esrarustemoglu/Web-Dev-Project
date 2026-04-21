export interface MiniUser {
  id: number;
  username: string;
  email: string;
}

export interface AuthResponse {
  user: MiniUser;
  access: string;
  refresh: string;
}
