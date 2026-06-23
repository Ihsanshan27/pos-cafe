import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const ACCESS_TOKEN_KEY = 'access_token';
const USER_KEY = 'user';

export function getStoredAccessToken() {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function storeAccessToken(token: string) {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearStoredAccessToken() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function getStoredUser() {
  return sessionStorage.getItem(USER_KEY);
}

export function storeUser(user: string) {
  sessionStorage.setItem(USER_KEY, user);
}

export function clearStoredUser() {
  sessionStorage.removeItem(USER_KEY);
}

export function resolveMediaUrl(path?: string) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${baseURL}${path}`;
}

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      clearStoredAccessToken();
      clearStoredUser();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

// ── Types ──────────────────────────────────────────────────────────────────

export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  costPerUnit: number;
  stockQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Outlet {
  id: string;
  name: string;
  slug: string;
  address?: string;
  phone?: string;
  isActive: boolean;
  tableQRCodes?: TableQRCode[];
  _count?: {
    users: number;
    transactions: number;
  };
}

export interface TableQRCode {
  id: string;
  outletId: string;
  code: string;
  label?: string;
  isActive: boolean;
  createdAt: string;
}

export interface RecipeItem {
  id: string;
  quantity: number;
  ingredientId: string;
  menuId: string;
  ingredient: Ingredient;
}

export interface Menu {
  id: string;
  name: string;
  description?: string;
  sellingPrice: number;
  imageUrl?: string;
  hpp: number;
  ingredients: RecipeItem[];
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
  outletMenus?: Array<{
    id: string;
    outletId: string;
    menuId: string;
    sellingPrice: number;
    isActive: boolean;
  }>;
}

export interface TransactionItem {
  id: string;
  quantity: number;
  priceAtSale: number;
  subtotal: number;
  notes?: string;
  menuId: string;
  menu: Menu;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  pointBalance: number;
  tier: 'BRONZE' | 'SILVER' | 'GOLD';
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  isActive: boolean;
  _count?: {
    purchaseOrders: number;
  };
}

export interface PurchaseOrderItem {
  id: string;
  ingredientId: string;
  quantity: number;
  unitCost: number;
  receivedQuantity: number;
  ingredient: Ingredient;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplier: Supplier;
  outletId?: string;
  outlet?: Outlet;
  status: 'DRAFT' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';
  notes?: string;
  expectedDate?: string;
  receivedAt?: string;
  createdAt: string;
  createdBy?: AuthUser;
  items: PurchaseOrderItem[];
}

export interface InventoryLog {
  id: string;
  ingredientId: string;
  outletId?: string;
  type: 'IN' | 'OUT' | 'SALE' | 'VOID' | 'ADJUSTMENT';
  quantity: number;
  notes?: string;
  createdAt: string;
  createdBy?: string;
  createdByName?: string | null;
  ingredient?: Ingredient;
}

export interface Transaction {
  id: string;
  orderNumber?: string;
  source?: 'POS' | 'PUBLIC_QR';
  customerName?: string;
  customerId?: string;
  customer?: Customer;
  outletId?: string;
  outlet?: Outlet;
  totalAmount: number;
  paymentMethod: 'CASH' | 'QRIS' | 'DEBIT' | 'EWALLET';
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  kitchenStatus: 'PENDING' | 'IN_PROGRESS' | 'DONE';
  createdAt: string;
  items: TransactionItem[];
  pricingMetadata?: {
    subtotalBeforeDiscount: number;
    discountAmount: number;
    taxableAmount: number;
    taxAmount: number;
    totalAmount: number;
    taxEnabled: boolean;
    taxRate: number;
    taxInclusive: boolean;
    roundingMode: 'NONE' | 'NEAREST' | 'UP' | 'DOWN';
    roundingStep: number;
    roundingAdjustment: number;
  } | null;
}

// ── Ingredient API ─────────────────────────────────────────────────────────

export const ingredientApi = {
  getAll: (outletId?: string) => api.get<Ingredient[]>('/ingredients', { params: outletId ? { outletId } : undefined }).then((r) => r.data),
  getOne: (id: string, outletId?: string) => api.get<Ingredient>(`/ingredients/${id}`, { params: outletId ? { outletId } : undefined }).then((r) => r.data),
  create: (data: Omit<Ingredient, 'id' | 'createdAt' | 'updatedAt'> & { outletId?: string }) =>
    api.post<Ingredient>('/ingredients', data).then((r) => r.data),
  update: (id: string, data: Partial<Ingredient> & { outletId?: string }) =>
    api.patch<Ingredient>(`/ingredients/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/ingredients/${id}`).then((r) => r.data),
};

// ── Menu API ───────────────────────────────────────────────────────────────

export interface CreateMenuPayload {
  name: string;
  description?: string;
  sellingPrice: number;
  imageUrl?: string;
  ingredients?: { ingredientId: string; quantity: number }[];
}

export const menuApi = {
  getAll: (outletId?: string) => api.get<Menu[]>('/menus', { params: outletId ? { outletId } : undefined }).then((r) => r.data),
  getOne: (id: string, outletId?: string) => api.get<Menu>(`/menus/${id}`, { params: outletId ? { outletId } : undefined }).then((r) => r.data),
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api
      .post<{ imageUrl: string }>('/menus/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },
  create: (data: CreateMenuPayload) => api.post<Menu>('/menus', data).then((r) => r.data),
  update: (id: string, data: Partial<CreateMenuPayload>) =>
    api.patch<Menu>(`/menus/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/menus/${id}`).then((r) => r.data),
  upsertOutletOverride: (menuId: string, data: { outletId: string; sellingPrice: number; isActive: boolean }) =>
    api.patch<any>(`/menus/${menuId}/outlet-override`, data).then((r) => r.data),
  deleteOutletOverride: (menuId: string, outletId: string) =>
    api.delete<any>(`/menus/${menuId}/outlet-override/${outletId}`).then((r) => r.data),
};

// ── Transaction API ────────────────────────────────────────────────────────

export interface CreateTransactionPayload {
  items: { menuId: string; quantity: number; notes?: string }[];
  paymentMethod?: 'CASH' | 'QRIS' | 'DEBIT' | 'EWALLET';
  orderType?: 'DINE_IN' | 'TAKEAWAY';
  tableNumber?: string;
  customerId?: string;
  customerName?: string;
  discountAmount?: number;
  taxAmount?: number;
  shiftId?: string;
  outletId?: string;
  source?: 'POS' | 'PUBLIC_QR';
}

export const transactionApi = {
  getAll: (outletId?: string) =>
    api.get<Transaction[]>('/transactions', { params: outletId ? { outletId } : undefined }).then((r) => r.data),
  getOne: (id: string) => api.get<Transaction>(`/transactions/${id}`).then((r) => r.data),
  create: (data: CreateTransactionPayload) =>
    api.post<Transaction>('/transactions', data).then((r) => r.data),
  void: (id: string) => api.patch<Transaction>(`/transactions/${id}/void`).then((r) => r.data),
  updateKitchenStatus: (id: string, status: 'PENDING' | 'IN_PROGRESS' | 'DONE') => 
    api.patch<Transaction>(`/transactions/${id}/kitchen`, { status }).then((r) => r.data),
};

export interface Expense {
  id: string;
  description: string;
  amount: number | string;
  outletId?: string;
  outlet?: Outlet;
  createdAt: string;
}

export const expenseApi = {
  getAll: (outletId?: string) =>
    api.get<Expense[]>('/expenses', { params: outletId ? { outletId } : undefined }).then((r) => r.data),
  create: (data: { description: string; amount: number; outletId?: string }) => api.post<Expense>('/expenses', data).then((r) => r.data),
  delete: (id: string) => api.delete(`/expenses/${id}`).then((r) => r.data),
};

// ── Auth API ───────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'OWNER' | 'MANAGER' | 'CASHIER' | 'BARISTA';
  outletId?: string;
  outlet?: Outlet | null;
  createdAt: string;
  mustChangePassword?: boolean;
}

export const userApi = {
  getAll: () => api.get<AuthUser[]>('/users').then((r) => r.data),
  create: (data: any) => api.post<AuthUser>('/users', data).then((r) => r.data),
  update: (id: string, data: any) => api.patch<AuthUser>(`/users/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/users/${id}`).then((r) => r.data),
};

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<AuthUser>('/auth/register', data).then((r) => r.data),
  login: (data: { email: string; password: string }) =>
    api.post<LoginResponse>('/auth/login', data).then((r) => r.data),
  logout: () => api.post('/auth/logout').then((r) => r.data),
  me: () => api.get<AuthUser>('/auth/me').then((r) => r.data),
  updateProfile: (data: { name?: string; email?: string; password?: string }) => 
    api.patch<AuthUser>('/auth/me', data).then((r) => r.data),
};

// ── New Features API (Category, Discount, Shift) ───────────────

export interface Category {
  id: string;
  name: string;
}

export const categoryApi = {
  getAll: () => api.get<Category[]>('/categories').then((r) => r.data),
  create: (data: { name: string }) => api.post<Category>('/categories', data).then((r) => r.data),
  update: (id: string, data: Partial<Category>) => api.patch<Category>(`/categories/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/categories/${id}`).then((r) => r.data),
};

export interface Discount {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  isActive: boolean;
}

export const discountApi = {
  getAll: () => api.get<Discount[]>('/discounts').then((r) => r.data),
  create: (data: Omit<Discount, 'id'>) => api.post<Discount>('/discounts', data).then((r) => r.data),
  update: (id: string, data: Partial<Discount>) => api.patch<Discount>(`/discounts/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/discounts/${id}`).then((r) => r.data),
};

export interface ShiftSummary {
  startingCash: number;
  totalCashSales: number;
  totalNonCashSales: number;
  totalExpenses: number;
  transactionCount: number;
  expectedEndingCash: number;
  expenseDetails: Expense[];
}

export interface Shift {
  id: string;
  userId: string;
  user?: AuthUser;
  outletId?: string;
  outlet?: Outlet;
  startTime: string;
  endTime?: string;
  startingCash: number;
  actualEndingCash?: number;
  expectedEndingCash?: number;
  cashDifference?: number;
  totalCashSales?: number;
  totalNonCashSales?: number;
  totalExpenses?: number;
  transactionCount?: number;
  notes?: string;
  status: 'OPEN' | 'CLOSED';
}

export const shiftApi = {
  getAll: () => api.get<Shift[]>('/shifts').then((r) => r.data),
  getActive: (outletId?: string) => api.get<Shift>('/shifts/active', { params: outletId ? { outletId } : undefined }).then((r) => r.data),
  create: (data: { startingCash: number; outletId?: string }) => api.post<Shift>('/shifts', data).then((r) => r.data),
  update: (id: string, data: { actualEndingCash?: number; status?: 'OPEN' | 'CLOSED'; notes?: string }) => api.patch<Shift>(`/shifts/${id}`, data).then((r) => r.data),
  getSummary: (id: string) => api.get<ShiftSummary>(`/shifts/${id}/summary`).then((r) => r.data),
};

export interface AppSetting {
  key: string;
  value: string;
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  userEmail?: string | null;
  userName?: string | null;
  action: string;
  target: string;
  details?: string | null;
  ipAddress?: string | null;
  createdAt: string;
}

export interface SystemInfoResponse {
  appVersion: string;
  backendVersion: string;
  frontendVersion: string;
  logRetentionDays: number;
  generatedAt: string;
}

export interface BackupPayload {
  meta: {
    exportedAt: string;
    systemInfo: SystemInfoResponse;
  };
  data: Record<string, unknown>;
}

export const settingsApi = {
  getAll: () => api.get<AppSetting[]>('/settings').then((r) => r.data),
  setMany: (settings: Record<string, string>) =>
    api.patch<AppSetting[]>('/settings', { settings }).then((r) => r.data),
  uploadLogo: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api
      .post<{ imageUrl: string }>('/settings/upload-logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },
  getSystemInfo: () => api.get<SystemInfoResponse>('/settings/system-info').then((r) => r.data),
  exportBackup: () => api.get<BackupPayload>('/settings/export-backup').then((r) => r.data),
  restoreBackup: (backup: BackupPayload) => api.post<{ success: boolean; summary: Record<string, number> }>('/settings/restore-backup', { backup }).then((r) => r.data),
  applyLogRetention: () => api.post<{ deletedCount: number }>('/settings/apply-log-retention').then((r) => r.data),
  resetDemoData: () => api.post<{ success: boolean; summary: Record<string, number> }>('/settings/reset-demo-data').then((r) => r.data),
  getAllowRegistration: () => api.get<{ allowed: boolean }>('/settings/allow-registration').then((r) => r.data),
  setAllowRegistration: (allowed: boolean) => api.patch<{ allowed: boolean }>('/settings/allow-registration', { allowed }).then((r) => r.data),
  getSetting: (key: string) => api.get<{ key: string; value: string | null }>(`/settings/${key}`).then((r) => r.data),
  setSetting: (key: string, value: string) => api.patch<{ key: string; value: string }>(`/settings/${key}`, { value }).then((r) => r.data),
  getAuditLogs: () => api.get<AuditLog[]>('/settings/audit-logs').then((r) => r.data),
};

export const customerApi = {
  getAll: () => api.get<Customer[]>('/customers').then((r) => r.data),
  create: (data: { name: string; phone?: string; email?: string }) => api.post<Customer>('/customers', data).then((r) => r.data),
  update: (id: string, data: Partial<Customer>) => api.patch<Customer>(`/customers/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/customers/${id}`).then((r) => r.data),
};

export const inventoryLogApi = {
  getAll: (outletId?: string) => api.get<InventoryLog[]>('/inventory-logs', { params: outletId ? { outletId } : undefined }).then((r) => r.data),
  create: (data: { ingredientId: string; type: string; quantity: number; notes?: string; outletId?: string }) => api.post<InventoryLog>('/inventory-logs', data).then((r) => r.data),
};

export const outletApi = {
  getAll: () => api.get<Outlet[]>('/outlets').then((r) => r.data),
  create: (data: Partial<Outlet>) => api.post<Outlet>('/outlets', data).then((r) => r.data),
  update: (id: string, data: Partial<Outlet>) => api.patch<Outlet>(`/outlets/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/outlets/${id}`).then((r) => r.data),
  createTable: (outletId: string, data: { code: string; label?: string; isActive?: boolean }) =>
    api.post<TableQRCode>(`/outlets/${outletId}/tables`, data).then((r) => r.data),
  updateTable: (id: string, data: Partial<TableQRCode>) => api.patch<TableQRCode>(`/outlets/tables/${id}`, data).then((r) => r.data),
  deleteTable: (id: string) => api.delete(`/outlets/tables/${id}`).then((r) => r.data),
};

export const supplierApi = {
  getAll: () => api.get<Supplier[]>('/suppliers').then((r) => r.data),
  create: (data: Partial<Supplier>) => api.post<Supplier>('/suppliers', data).then((r) => r.data),
  update: (id: string, data: Partial<Supplier>) => api.patch<Supplier>(`/suppliers/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/suppliers/${id}`).then((r) => r.data),
};

export const purchaseOrderApi = {
  getAll: (outletId?: string) =>
    api.get<PurchaseOrder[]>('/purchase-orders', { params: outletId ? { outletId } : undefined }).then((r) => r.data),
  create: (data: {
    supplierId: string;
    outletId?: string;
    notes?: string;
    expectedDate?: string;
    items: Array<{ ingredientId: string; quantity: number; unitCost: number }>;
  }) => api.post<PurchaseOrder>('/purchase-orders', data).then((r) => r.data),
  updateStatus: (id: string, data: { status: PurchaseOrder['status']; receivedQuantities?: Record<string, number> }) =>
    api.patch<PurchaseOrder>(`/purchase-orders/${id}/status`, data).then((r) => r.data),
};

export const publicOrderApi = {
  getMenu: (outletSlug: string, tableCode: string) =>
    api.get<{ outlet: Outlet; table: TableQRCode; categories: Category[]; menus: Menu[] }>(`/public/order/${outletSlug}/${tableCode}`).then((r) => r.data),
  createOrder: (
    outletSlug: string,
    tableCode: string,
    data: { customerName?: string; items: Array<{ menuId: string; quantity: number; notes?: string }> },
  ) => api.post<Transaction>(`/public/order/${outletSlug}/${tableCode}`, data).then((r) => r.data),
};

export default api;
