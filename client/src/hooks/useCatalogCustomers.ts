import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import type { ProductItem, CustomerItem } from '../types/pos.types';

const API_BASE = 'http://localhost:5000/api/v1';

export function useCatalogCustomers(tenantId?: string) {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['ALL']);
  const [customers, setCustomers] = useState<CustomerItem[]>([]);

  const fetchCatalog = useCallback((tId: string) => {
    axios
      .get(`${API_BASE}/catalog/products?tenantId=${tId}`)
      .then((res) => {
        if (Array.isArray(res.data?.data)) {
          setProducts(
            res.data.data.map((p: any) => ({
              id: p._id || p.id,
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
        }
      })
      .catch(() => {});

    axios
      .get(`${API_BASE}/catalog/categories?tenantId=${tId}`)
      .then((res) => {
        if (Array.isArray(res.data?.data)) {
          setCategories(['ALL', ...res.data.data.map((c: any) => c.name)]);
        }
      })
      .catch(() => {});
  }, []);

  const fetchCustomers = useCallback((tId: string) => {
    axios
      .get(`${API_BASE}/customers?tenantId=${tId}`)
      .then((res) => {
        if (Array.isArray(res.data?.data)) setCustomers(res.data.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchCatalog(tenantId);
      fetchCustomers(tenantId);
    }
  }, [tenantId, fetchCatalog, fetchCustomers]);

  return {
    products,
    categories,
    customers,
    fetchCatalog,
    fetchCustomers,
  };
}

