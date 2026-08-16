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

export type Product = {
  id: string;
  name: string;
  sku: string | null;
  description: string | null;
  unit: string;
  active: boolean;
  currentPrice: number;
};

export type PriceHistoryEntry = {
  id: string;
  price: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  createdByName: string;
};
