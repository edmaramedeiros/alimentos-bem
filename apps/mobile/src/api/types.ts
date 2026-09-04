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
  category: string | null;
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

export type Customer = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  addressLine: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  notes: string | null;
  grupo: string | null;
  active: boolean;
  whatsappOptIn: boolean;
  ownerVendedorId: string;
  ownerVendedorName: string;
};

export type ExpenseCategory = 'MATERIA_PRIMA' | 'SUPRIMENTOS' | 'LOGISTICA' | 'TAXAS';

export type Expense = {
  id: string;
  creditorName: string;
  category: ExpenseCategory;
  expenseDate: string;
  payingCompanyName: string;
  amount: number;
  createdByName: string;
};

export type SaleStatus = 'AWAITING_DELIVERY' | 'AWAITING_PAYMENT' | 'PAID' | 'CANCELLED';

export type SaleItem = {
  id: string;
  productId: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type SaleSummary = {
  id: string;
  vendedorId: string;
  vendedorName: string;
  customerId: string | null;
  customerName: string;
  saleDate: string;
  status: SaleStatus;
  totalAmount: number;
  itemCount: number;
};

export type CommissionStatus = 'PENDING' | 'EARNED';

export type Sale = SaleSummary & {
  discountAmount: number;
  commissionRateApplied: number | null;
  commissionAmount: number | null;
  commissionStatus: CommissionStatus;
  items: SaleItem[];
};

export type PaymentMethod = 'DINHEIRO' | 'PIX' | 'CARTAO' | 'TRANSFERENCIA' | 'OUTRO';

export type Payment = {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  registeredByName: string;
  notes: string | null;
  hasAttachment: boolean;
  attachmentFileName: string | null;
};

export type PaymentAttachment = {
  fileName: string;
  mimeType: string;
  dataBase64: string;
};

export type CommissionRateEntry = {
  id: string;
  rate: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  createdByName: string;
};

export type CommissionEntry = {
  saleId: string;
  vendedorId: string;
  vendedorName: string;
  customerName: string;
  saleDate: string;
  totalAmount: number;
  commissionRateApplied: number;
  commissionAmount: number;
};

export type CommissionReport = {
  totalEarned: number;
  entries: CommissionEntry[];
};

export type DailySalesPoint = {
  day: number;
  total: number;
};

export type MonthlySalesPoint = {
  month: string;
  total: number;
};

export type WhatsappBroadcast = {
  id: string;
  message: string;
  hasAttachment: boolean;
  attachmentFileName: string | null;
  cityFilter: string | null;
  nameFilter: string | null;
  delaySeconds: number;
  status: 'QUEUED' | 'SENDING' | 'DONE' | 'FAILED';
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  createdByName: string;
  createdAt: string;
};

export type WhatsappBroadcastRecipient = {
  id: string;
  customerName: string;
  phone: string;
  status: 'QUEUED' | 'SENT' | 'FAILED';
  errorMessage: string | null;
  sentAt: string | null;
};

export type WhatsappSessionStatus = {
  connected: boolean;
  phoneNumber: string | null;
  waitingForQr: boolean;
};
