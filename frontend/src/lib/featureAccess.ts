export const FEATURE_OPTIONS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'ingredients', label: 'Ingredients' },
  { key: 'inventory-logs', label: 'Inventory Logs' },
  { key: 'menus', label: 'Menus' },
  { key: 'categories', label: 'Categories' },
  { key: 'discounts', label: 'Discounts' },
  { key: 'expenses', label: 'Expenses' },
  { key: 'users', label: 'Staff Management' },
  { key: 'customers', label: 'Customers' },
  { key: 'outlets', label: 'Outlets' },
  { key: 'suppliers', label: 'Suppliers' },
  { key: 'purchase-orders', label: 'Purchase Orders' },
  { key: 'pos', label: 'Point of Sale' },
  { key: 'transactions', label: 'Transactions' },
  { key: 'kitchen', label: 'Kitchen / KDS' },
] as const;

export type FeatureKey = (typeof FEATURE_OPTIONS)[number]['key'];

export function parseJsonArray(value?: string | null): string[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

export function stringifyJsonArray(values: string[]) {
  return JSON.stringify(values);
}

export function isFeatureDisabled(disabledFeatures: string[], feature: FeatureKey) {
  return disabledFeatures.includes(feature);
}

export function getFirstAvailableRoute(role: string | undefined, disabledFeatures: string[]) {
  const isDisabled = (feature: FeatureKey) => isFeatureDisabled(disabledFeatures, feature);

  if (role === 'BARISTA') {
    return isDisabled('kitchen') ? '/profile' : '/kitchen';
  }

  if (role === 'CASHIER') {
    if (!isDisabled('pos')) return '/pos';
    if (!isDisabled('transactions')) return '/transactions';
    if (!isDisabled('customers')) return '/customers';
    if (!isDisabled('outlets')) return '/outlets';
    if (!isDisabled('suppliers')) return '/suppliers';
    if (!isDisabled('purchase-orders')) return '/purchase-orders';
    if (!isDisabled('kitchen')) return '/kitchen';
    return '/profile';
  }

  if (role === 'OWNER' || role === 'MANAGER') {
    if (!isDisabled('dashboard')) return '/';
    if (!isDisabled('pos')) return '/pos';
    if (!isDisabled('transactions')) return '/transactions';
    if (!isDisabled('customers')) return '/customers';
    if (!isDisabled('kitchen')) return '/kitchen';
    if (!isDisabled('menus')) return '/menus';
    if (!isDisabled('ingredients')) return '/ingredients';
    return role === 'OWNER' ? '/settings' : '/profile';
  }

  return '/profile';
}
