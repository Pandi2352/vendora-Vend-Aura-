import { useState, useCallback, useEffect } from 'react';
import { api, unwrap, getErrorMessage } from '../lib/api';
import { cacheCatalog, getCachedCatalog, cacheCustomers, getCachedCustomers } from '../lib/offline/syncManager';
import type { ProductItem, CustomerItem } from '../types/pos.types';

interface ApiProduct {
  _id?: string;
  id?: string;
  name: string;
  category: string;
  barcode: string;
  unitPrice: number;
  mrp?: number;
  costPrice?: number;
  taxRatePercent?: number;
  stock?: number;
  batchNumber?: string;
  expiryDate?: string;
}

export function useCatalogCustomers(enabled: boolean) {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['ALL']);
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [catalogError, setCatalogError] = useState('');
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);

  const fetchCatalog = useCallback(async () => {
    const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

    if (isOffline) {
      const cached = await getCachedCatalog();
      if (cached.length > 0) {
        setProducts(cached);
        const cats = Array.from(new Set(cached.map((p) => p.category).filter(Boolean)));
        setCategories(['ALL', ...cats]);
        setCatalogError('');
        return;
      }
    }

    const [productsRes, categoriesRes] = await Promise.allSettled([
      api.get('/catalog/products'),
      api.get('/catalog/categories'),
    ]);

    if (productsRes.status === 'fulfilled') {
      const list = unwrap<ApiProduct[]>(productsRes.value);
      const mapped: ProductItem[] = (Array.isArray(list) ? list : []).map((p) => ({
        id: (p._id || p.id) as string,
        name: p.name,
        category: p.category,
        barcode: p.barcode,
        unitPrice: p.unitPrice,
        mrp: p.mrp || p.unitPrice,
        costPrice: p.costPrice || 0,
        taxRatePercent: p.taxRatePercent || 0,
        stock: p.stock,
        batchNumber: p.batchNumber,
        expiryDate: p.expiryDate,
      }));
      setProducts(mapped);
      setCatalogError('');
      // Update IndexedDB offline store
      cacheCatalog(mapped).catch(() => {});
    } else {
      // Try fallback to offline IndexedDB
      const cached = await getCachedCatalog();
      if (cached.length > 0) {
        setProducts(cached);
        const cats = Array.from(new Set(cached.map((p) => p.category).filter(Boolean)));
        setCategories(['ALL', ...cats]);
        setCatalogError('');
      } else {
        setCatalogError(getErrorMessage(productsRes.reason, 'Failed to load product catalog.'));
      }
    }

    if (categoriesRes.status === 'fulfilled') {
      const list = unwrap<Array<{ name: string }>>(categoriesRes.value);
      if (Array.isArray(list)) setCategories(['ALL', ...list.map((c) => c.name)]);
    }
  }, []);

  const fetchCustomers = useCallback(async () => {
    setIsLoadingCustomers(true);
    try {
      const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
      if (isOffline) {
        const cached = await getCachedCustomers();
        if (cached.length > 0) {
          setCustomers(cached);
          return;
        }
      }

      const res = await api.get('/customers', { params: { limit: 100 } });
      const list = unwrap<Array<CustomerItem & { _id?: string }>>(res);
      if (Array.isArray(list)) {
        const mapped = list.map((c) => ({ ...c, id: c.id ?? (c._id as string) }));
        setCustomers(mapped);
        cacheCustomers(mapped).catch(() => {});
      }
    } catch {
      // Try fallback to offline IndexedDB
      const cached = await getCachedCustomers();
      if (cached.length > 0) {
        setCustomers(cached);
      }
    } finally {
      setIsLoadingCustomers(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      fetchCatalog();
      fetchCustomers();
    }
  }, [enabled, fetchCatalog, fetchCustomers]);

  return {
    products,
    categories,
    customers,
    isLoadingCustomers,
    catalogError,
    fetchCatalog,
    fetchCustomers,
  };
}
