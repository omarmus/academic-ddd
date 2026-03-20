export type LoginResult = {
  id: string;
  username: string;
  email: string;
  role: string;
};

export type LoginResponse = {
  access_token: string;
  user: LoginResult;
};

export type ChangePasswordDto = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type ChangePasswordResponse = {
  message: string;
};
