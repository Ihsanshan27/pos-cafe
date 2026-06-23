import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { outletApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

const STORAGE_KEY = 'active_outlet_id';

export function useActiveOutlet() {
  const { user } = useAuth();
  const { data: outlets = [] } = useQuery({
    queryKey: ['outlets'],
    queryFn: outletApi.getAll,
  });

  const [activeOutletId, setActiveOutletIdState] = useState<string>(() => localStorage.getItem(STORAGE_KEY) || '');

  useEffect(() => {
    if (user?.outletId) {
      localStorage.setItem(STORAGE_KEY, user.outletId);
      setActiveOutletIdState(user.outletId);
      return;
    }

    if (!activeOutletId && outlets.length > 0) {
      localStorage.setItem(STORAGE_KEY, outlets[0].id);
      setActiveOutletIdState(outlets[0].id);
    }
  }, [activeOutletId, outlets, user?.outletId]);

  const setActiveOutletId = (nextId: string) => {
    localStorage.setItem(STORAGE_KEY, nextId);
    setActiveOutletIdState(nextId);
  };

  const activeOutlet = useMemo(
    () => outlets.find((outlet) => outlet.id === (user?.outletId || activeOutletId)) ?? null,
    [activeOutletId, outlets, user?.outletId],
  );

  return {
    outlets,
    activeOutletId: user?.outletId || activeOutletId,
    activeOutlet,
    setActiveOutletId,
    isLockedToUserOutlet: Boolean(user?.outletId),
  };
}
