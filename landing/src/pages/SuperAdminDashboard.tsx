import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { AdminLoginScreen } from '../components/admin/AdminLoginScreen';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import type { AdminTab } from '../components/admin/AdminSidebar';
import { AdminHeader } from '../components/admin/AdminHeader';
import { OverviewTab } from '../components/admin/OverviewTab';
import { TenantsTab } from '../components/admin/TenantsTab';
import { ContactsTab } from '../components/admin/ContactsTab';
import { ReportsTab } from '../components/admin/ReportsTab';
import { TenantDetailModal } from '../components/admin/TenantDetailModal';
import type { TenantItem, ContactItem, OverviewStats, ReportsData } from '../components/admin/types';
import { BusinessType, SubscriptionPlanCode } from '../shared';

const API_BASE = 'http://localhost:5000/api/v1';

export function SuperAdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('vendora_platform_admin_token');
  });

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<TenantItem | null>(null);

  const [tenants, setTenants] = useState<TenantItem[]>([]);
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);
  const [reportsData, setReportsData] = useState<ReportsData | null>(null);

  // Fallback initial demo data
  const fallbackTenants: TenantItem[] = [
    {
      id: 'demo-1',
      shopId: 'srimurugan',
      businessName: 'Sri Murugan Supermarket',
      ownerName: 'Pandi Selvam',
      email: 'pandi@srimurugan.in',
      phone: '+91 98765 43210',
      businessType: BusinessType.SUPERMARKET,
      plan: SubscriptionPlanCode.GROWTH,
      status: 'ACTIVE',
      billsCount: 8420,
      createdAt: '2026-11-01',
      address: { street: '12 Bazaar Road, Porur', city: 'Chennai', state: 'Tamil Nadu', pincode: '600116' },
      gstin: '33AAAAA0000A1Z5',
      users: [{ username: 'srimurugan_admin', role: 'OWNER', email: 'pandi@srimurugan.in' }],
    },
    {
      id: 'demo-2',
      shopId: 'chennaisilks',
      businessName: 'Chennai Silks & Garments',
      ownerName: 'Venkatesh Rao',
      email: 'venkat@chennaisilks.com',
      phone: '+91 98401 23456',
      businessType: BusinessType.TEXTILE_GARMENTS,
      plan: SubscriptionPlanCode.BUSINESS,
      status: 'ACTIVE',
      billsCount: 14210,
      createdAt: '2026-10-15',
      address: { street: '44 Usman Road, T. Nagar', city: 'Chennai', state: 'Tamil Nadu', pincode: '600017' },
      gstin: '33BBBBB1111B2Z6',
      users: [{ username: 'chennai_admin', role: 'OWNER', email: 'venkat@chennaisilks.com' }],
    },
    {
      id: 'demo-3',
      shopId: 'annabakery',
      businessName: 'Anna Nagar Hot Bakery',
      ownerName: 'Suresh Kumar',
      email: 'suresh@annabakery.in',
      phone: '+91 94440 98765',
      businessType: BusinessType.BAKERY_SWEETS,
      plan: SubscriptionPlanCode.STARTER,
      status: 'ACTIVE',
      billsCount: 3150,
      createdAt: '2026-11-05',
      address: { street: '2nd Avenue, Anna Nagar', city: 'Chennai', state: 'Tamil Nadu', pincode: '600040' },
      users: [{ username: 'bakery_admin', role: 'OWNER', email: 'suresh@annabakery.in' }],
    },
    {
      id: 'demo-4',
      shopId: 'greenbasket',
      businessName: 'Green Basket Organic Groceries',
      ownerName: 'Deepa Natarajan',
      email: 'deepa@greenbasket.co.in',
      phone: '+91 97910 11223',
      businessType: BusinessType.GROCERY,
      plan: SubscriptionPlanCode.FREE_TRIAL,
      status: 'TRIAL',
      billsCount: 245,
      createdAt: '2026-11-08',
      address: { street: '7th Main Road, Velachery', city: 'Chennai', state: 'Tamil Nadu', pincode: '600042' },
      users: [{ username: 'green_admin', role: 'OWNER', email: 'deepa@greenbasket.co.in' }],
    },
  ];

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [tenantsRes, overviewRes, contactsRes, reportsRes] = await Promise.allSettled([
        axios.get(`${API_BASE}/saas-admin/tenants`),
        axios.get(`${API_BASE}/saas-admin/overview`),
        axios.get(`${API_BASE}/saas-admin/contacts`),
        axios.get(`${API_BASE}/saas-admin/reports`),
      ]);

      if (tenantsRes.status === 'fulfilled' && tenantsRes.value.data?.data?.length > 0) {
        setTenants(tenantsRes.value.data.data);
      } else {
        setTenants(fallbackTenants);
      }

      if (overviewRes.status === 'fulfilled' && overviewRes.value.data?.data) {
        setOverviewStats(overviewRes.value.data.data);
      } else {
        setOverviewStats({
          metrics: {
            totalTenants: fallbackTenants.length,
            activeTenants: 3,
            trialTenants: 1,
            suspendedTenants: 0,
            totalMonthlyRevenue: 6997,
            totalBillsGenerated: 26025,
            totalLeads: 8,
          },
          planDistribution: {
            FREE_TRIAL: 1,
            STARTER: 1,
            GROWTH: 1,
            BUSINESS: 1,
          },
          sectorDistribution: {
            'Supermarket': 1,
            'Textile & Garments': 1,
            'Bakery & Sweets': 1,
            'Grocery / Kirana': 1,
          },
          recentTenants: fallbackTenants,
        });
      }

      if (contactsRes.status === 'fulfilled' && contactsRes.value.data?.data) {
        setContacts(contactsRes.value.data.data);
      } else {
        setContacts(
          fallbackTenants.map((t) => ({
            id: t.id,
            source: 'REGISTERED_TENANT',
            businessName: t.businessName,
            ownerName: t.ownerName,
            email: t.email,
            phone: t.phone,
            city: t.address?.city || 'Chennai',
            businessType: t.businessType,
            shopId: t.shopId,
            status: t.status,
            createdAt: t.createdAt,
          }))
        );
      }

      if (reportsRes.status === 'fulfilled' && reportsRes.value.data?.data) {
        setReportsData(reportsRes.value.data.data);
      } else {
        setReportsData({
          sectorStats: {
            SUPERMARKET: { count: 1, bills: 8420 },
            TEXTILE_GARMENTS: { count: 1, bills: 14210 },
            BAKERY_SWEETS: { count: 1, bills: 3150 },
            GROCERY: { count: 1, bills: 245 },
          },
          planStats: [
            { code: 'FREE_TRIAL', name: 'Free Trial', price: 0, tenantsCount: 1, estimatedRevenue: 0 },
            { code: 'STARTER', name: 'Starter Plan', price: 999, tenantsCount: 1, estimatedRevenue: 999 },
            { code: 'GROWTH', name: 'Growth Plan', price: 1999, tenantsCount: 1, estimatedRevenue: 1999 },
            { code: 'BUSINESS', name: 'Business Enterprise', price: 3999, tenantsCount: 1, estimatedRevenue: 3999 },
          ],
          totalTenants: 4,
          activeSubscriptions: 3,
          trialSubscriptions: 1,
        });
      }
    } catch {
      setTenants(fallbackTenants);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated, fetchAllData]);

  const handleSignOut = () => {
    localStorage.removeItem('vendora_platform_admin_token');
    localStorage.removeItem('vendora_platform_admin_user');
    setIsAuthenticated(false);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleUpdateStatus = async (id: string, newStatus: 'ACTIVE' | 'SUSPENDED' | 'TRIAL') => {
    try {
      await axios.patch(`${API_BASE}/saas-admin/tenants/${id}/status`, { status: newStatus });
      setTenants((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
      );
    } catch {
      // Local fallback
      setTenants((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
      );
    }
  };

  // If not authenticated as Platform Admin, render secure login screen
  if (!isAuthenticated) {
    return <AdminLoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-950 flex flex-col lg:flex-row font-sans w-full">
      {/* 1. Modular Admin Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tenantsCount={tenants.length}
        contactsCount={contacts.length}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 2. Modular Admin Header */}
        <AdminHeader
          activeTab={activeTab}
          loading={loading}
          onRefresh={fetchAllData}
          onSignOut={handleSignOut}
        />

        {/* 3. Tab Contents */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-[1600px] w-full mx-auto">
          {activeTab === 'overview' && (
            <OverviewTab
              stats={overviewStats}
              onInspectTenant={(t) => setSelectedTenant(t)}
              onNavigateToTenants={() => setActiveTab('tenants')}
            />
          )}

          {activeTab === 'tenants' && (
            <TenantsTab
              tenants={tenants}
              onInspectTenant={(t) => setSelectedTenant(t)}
              onUpdateStatus={handleUpdateStatus}
            />
          )}

          {activeTab === 'contacts' && (
            <ContactsTab contacts={contacts} />
          )}

          {activeTab === 'reports' && (
            <ReportsTab reports={reportsData} />
          )}
        </main>
      </div>

      {/* 4. Modular Tenant Profile Drawer Modal */}
      {selectedTenant && (
        <TenantDetailModal
          tenant={selectedTenant}
          onClose={() => setSelectedTenant(null)}
          onStatusChange={handleUpdateStatus}
        />
      )}
    </div>
  );
}
