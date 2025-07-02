export interface SignUpRequestBody {
  email?: string;
  password?: string;
}

export interface SignInRequestBody {
  email?: string;
  password: string;
  username?: string;
}
