import { useState, useMemo } from 'react';

export type SortDirection = 'asc' | 'desc';

export type SortConfig<T> = {
  key: keyof T;
  direction: SortDirection;
} | null;

export function useSortableData<T>(items: T[], config: SortConfig<T> = null) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>(config);

  const sortedItems = useMemo(() => {
    const sortableItems = [...items];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle string comparison nicely (case insensitive)
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase() as any;
          bValue = bValue.toLowerCase() as any;
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key: keyof T) => {
    let direction: SortDirection = 'asc';
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'asc'
    ) {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return { items: sortedItems, requestSort, sortConfig };
}
