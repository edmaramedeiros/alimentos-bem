export type Role = 'ADMIN' | 'VENDEDOR';

export type UserSummary = {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  phone: string | null;
};

export type LoginResponse = {
  token: string;
  user: UserSummary;
};
