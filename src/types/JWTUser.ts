interface JWTUser {
  id: string;
  email: string;
  subscription_status?: string;
  [key: string]: any;
}