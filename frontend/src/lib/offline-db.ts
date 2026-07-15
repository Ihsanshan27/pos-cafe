import Dexie, { type EntityTable } from 'dexie';

interface OfflineOrder {
  id: string; // uuid
  customerName: string;
  orderType: 'DINE_IN' | 'TAKEAWAY';
  totalAmount: number;
  paymentMethod: string;
  items: Array<{
    menuId: number;
    menuName: string;
    quantity: number;
    price: number;
    notes?: string;
  }>;
  createdAt: string;
  status: 'PENDING_SYNC' | 'SYNCED' | 'FAILED';
}

interface OfflineMenu {
  id: number;
  name: string;
  sellingPrice: number;
  category: string;
  image: string | null;
}

const db = new Dexie('POSOfflineDB') as Dexie & {
  orders: EntityTable<OfflineOrder, 'id'>;
  menus: EntityTable<OfflineMenu, 'id'>;
};

// Schema declaration
db.version(1).stores({
  orders: 'id, status, createdAt', // primary key and indexed props
  menus: 'id, category'
});

export { db };
export type { OfflineOrder, OfflineMenu };
