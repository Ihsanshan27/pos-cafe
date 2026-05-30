import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
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

export interface InventoryLog {
  id: string;
  ingredientId: string;
  type: 'IN' | 'OUT' | 'SALE' | 'VOID' | 'ADJUSTMENT';
  quantity: number;
  notes?: string;
  createdAt: string;
  createdBy?: string;
  ingredient?: Ingredient;
}

export interface Transaction {
  id: string;
  orderNumber?: string;
  customerName?: string;
  customerId?: string;
  customer?: Customer;
  totalAmount: number;
  paymentMethod: 'CASH' | 'QRIS' | 'DEBIT' | 'EWALLET';
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  kitchenStatus: 'PENDING' | 'IN_PROGRESS' | 'DONE';
  createdAt: string;
  items: TransactionItem[];
}

// ── Ingredient API ─────────────────────────────────────────────────────────

export const ingredientApi = {
  getAll: () => api.get<Ingredient[]>('/ingredients').then((r) => r.data),
  getOne: (id: string) => api.get<Ingredient>(`/ingredients/${id}`).then((r) => r.data),
  create: (data: Omit<Ingredient, 'id' | 'createdAt' | 'updatedAt' | 'recipes'>) =>
    api.post<Ingredient>('/ingredients', data).then((r) => r.data),
  update: (id: string, data: Partial<Ingredient>) =>
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
  getAll: () => api.get<Menu[]>('/menus').then((r) => r.data),
  getOne: (id: string) => api.get<Menu>(`/menus/${id}`).then((r) => r.data),
  create: (data: CreateMenuPayload) => api.post<Menu>('/menus', data).then((r) => r.data),
  update: (id: string, data: Partial<CreateMenuPayload>) =>
    api.patch<Menu>(`/menus/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/menus/${id}`).then((r) => r.data),
};

// ── Transaction API ────────────────────────────────────────────────────────

export interface CreateTransactionPayload {
  items: { menuId: string; quantity: number; notes?: string }[];
  paymentMethod?: 'CASH' | 'QRIS' | 'DEBIT' | 'EWALLET';
  customerName?: string;
}

export const transactionApi = {
  getAll: () => api.get<Transaction[]>('/transactions').then((r) => r.data),
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
  createdAt: string;
}

export const expenseApi = {
  getAll: () => api.get<Expense[]>('/expenses').then((r) => r.data),
  create: (data: { description: string; amount: number }) => api.post<Expense>('/expenses', data).then((r) => r.data),
  delete: (id: string) => api.delete(`/expenses/${id}`).then((r) => r.data),
};

// ── Auth API ───────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'OWNER' | 'MANAGER' | 'CASHIER' | 'BARISTA';
  createdAt: string;
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
  register: (data: { name: string; email: string; password: string; role?: string }) =>
    api.post<AuthUser>('/auth/register', data).then((r) => r.data),
  login: (data: { email: string; password: string }) =>
    api.post<LoginResponse>('/auth/login', data).then((r) => r.data),
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

export interface Shift {
  id: string;
  userId: string;
  user?: AuthUser;
  startTime: string;
  endTime?: string;
  startingCash: number;
  actualEndingCash?: number;
  status: 'OPEN' | 'CLOSED';
}

export const shiftApi = {
  getAll: () => api.get<Shift[]>('/shifts').then((r) => r.data),
  getActive: () => api.get<Shift>('/shifts/active').then((r) => r.data),
  create: (data: { startingCash: number }) => api.post<Shift>('/shifts', data).then((r) => r.data),
  update: (id: string, data: Partial<Shift>) => api.patch<Shift>(`/shifts/${id}`, data).then((r) => r.data),
};

export const settingsApi = {
  getAllowRegistration: () => api.get<{ allowed: boolean }>('/settings/allow-registration').then((r) => r.data),
  setAllowRegistration: (allowed: boolean) => api.patch<{ allowed: boolean }>('/settings/allow-registration', { allowed }).then((r) => r.data),
  getSetting: (key: string) => api.get<{ key: string; value: string | null }>(`/settings/${key}`).then((r) => r.data),
  setSetting: (key: string, value: string) => api.patch<{ key: string; value: string }>(`/settings/${key}`, { value }).then((r) => r.data),
};

export const customerApi = {
  getAll: () => api.get<Customer[]>('/customers').then((r) => r.data),
  create: (data: { name: string; phone?: string; email?: string }) => api.post<Customer>('/customers', data).then((r) => r.data),
  update: (id: string, data: Partial<Customer>) => api.patch<Customer>(`/customers/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/customers/${id}`).then((r) => r.data),
};

export const inventoryLogApi = {
  getAll: () => api.get<InventoryLog[]>('/inventory-logs').then((r) => r.data),
  create: (data: { ingredientId: string; type: string; quantity: number; notes?: string }) => api.post<InventoryLog>('/inventory-logs', data).then((r) => r.data),
};

export default api;
