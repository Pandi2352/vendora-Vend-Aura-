import { useState, useCallback, useEffect } from 'react';
import { api, unwrap, getErrorMessage } from '../lib/api';
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
}

export function useCatalogCustomers(enabled: boolean) {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['ALL']);
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [catalogError, setCatalogError] = useState('');
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);

  const fetchCatalog = useCallback(async () => {
    const [productsRes, categoriesRes] = await Promise.allSettled([
      api.get('/catalog/products'),
      api.get('/catalog/categories'),
    ]);

    if (productsRes.status === 'fulfilled') {
      const list = unwrap<ApiProduct[]>(productsRes.value);
      setProducts(
        (Array.isArray(list) ? list : []).map((p) => ({
          id: (p._id || p.id) as string,
          name: p.name,
          category: p.category,
          barcode: p.barcode,
          unitPrice: p.unitPrice,
          mrp: p.mrp || p.unitPrice,
          costPrice: p.costPrice || 0,
          taxRatePercent: p.taxRatePercent || 0,
          stock: p.stock,
        }))
      );
      setCatalogError('');
    } else {
      console.error('Failed to load products:', productsRes.reason);
      setCatalogError(getErrorMessage(productsRes.reason, 'Failed to load product catalog.'));
    }

    if (categoriesRes.status === 'fulfilled') {
      const list = unwrap<Array<{ name: string }>>(categoriesRes.value);
      if (Array.isArray(list)) setCategories(['ALL', ...list.map((c) => c.name)]);
    } else {
      console.error('Failed to load categories:', categoriesRes.reason);
    }
  }, []);

  const fetchCustomers = useCallback(async () => {
    setIsLoadingCustomers(true);
    try {
      // Server pages at max 100; checkout search filters this list client-side.
      const res = await api.get('/customers', { params: { limit: 100 } });
      const list = unwrap<Array<CustomerItem & { _id?: string }>>(res);
      if (Array.isArray(list)) setCustomers(list.map((c) => ({ ...c, id: c.id ?? (c._id as string) })));
    } catch (err) {
      console.error('Failed to load customers:', err);
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
