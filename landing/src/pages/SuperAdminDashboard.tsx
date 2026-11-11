import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { AdminLoginScreen } from '../components/admin/AdminLoginScreen';
import { AdminNavbar } from '../components/admin/AdminNavbar';
import type { AdminTab } from '../components/admin/AdminNavbar';
import { AdminHeader } from '../components/admin/AdminHeader';
import { OverviewTab } from '../components/admin/OverviewTab';
import { TenantsTab } from '../components/admin/TenantsTab';
import { ContactsTab } from '../components/admin/ContactsTab';
import { ReportsTab } from '../components/admin/ReportsTab';
import { TenantDetailModal } from '../components/admin/TenantDetailModal';
import type { TenantItem, ContactItem, OverviewStats, ReportsData } from '../components/admin/types';

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

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [tenantsRes, overviewRes, contactsRes, reportsRes] = await Promise.allSettled([
        axios.get(`${API_BASE}/saas-admin/tenants`),
        axios.get(`${API_BASE}/saas-admin/overview`),
        axios.get(`${API_BASE}/saas-admin/contacts`),
        axios.get(`${API_BASE}/saas-admin/reports`),
      ]);

      if (tenantsRes.status === 'fulfilled' && Array.isArray(tenantsRes.value.data?.data)) {
        setTenants(tenantsRes.value.data.data);
      } else {
        setTenants([]);
      }

      if (overviewRes.status === 'fulfilled' && overviewRes.value.data?.data) {
        setOverviewStats(overviewRes.value.data.data);
      } else {
        setOverviewStats({
          metrics: {
            totalTenants: 0,
            activeTenants: 0,
            trialTenants: 0,
            suspendedTenants: 0,
            totalMonthlyRevenue: 0,
            totalBillsGenerated: 0,
            totalLeads: 0,
          },
          planDistribution: {},
          sectorDistribution: {},
          recentTenants: [],
        });
      }

      if (contactsRes.status === 'fulfilled' && Array.isArray(contactsRes.value.data?.data)) {
        setContacts(contactsRes.value.data.data);
      } else {
        setContacts([]);
      }

      if (reportsRes.status === 'fulfilled' && reportsRes.value.data?.data) {
        setReportsData(reportsRes.value.data.data);
      } else {
        setReportsData({
          sectorStats: {},
          planStats: [],
          totalTenants: 0,
          activeSubscriptions: 0,
          trialSubscriptions: 0,
        });
      }
    } catch {
      setTenants([]);
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
    <div className="min-h-screen bg-zinc-100 text-zinc-950 flex flex-col font-sans w-full">
      {/* 1. Modern Top Command Bar (No Vertical Sidebar!) */}
      <AdminNavbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tenantsCount={tenants.length}
        contactsCount={contacts.length}
        loading={loading}
        onRefresh={fetchAllData}
        onSignOut={handleSignOut}
      />

      {/* 2. Sub-Header Context Ribbon */}
      <AdminHeader
        activeTab={activeTab}
        tenantsCount={tenants.length}
      />

      {/* 3. Full-Width Main Content Canvas */}
      <main className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1">
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
