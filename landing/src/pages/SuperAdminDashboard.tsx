import { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Sparkles, 
  ArrowUpRight, 
  Search, 
  Filter, 
  ExternalLink, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Store, 
  RefreshCw,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BusinessType, BUSINESS_TYPE_LABELS, SubscriptionPlanCode } from '../shared';

interface TenantItem {
  id: string;
  shopId: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  businessType: BusinessType;
  plan: SubscriptionPlanCode;
  status: 'ACTIVE' | 'TRIAL' | 'SUSPENDED';
  billsCount: number;
  createdAt: string;
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  gstin?: string;
  users?: {
    username: string;
    role: string;
    email: string;
  }[];
}

const API_BASE = 'http://localhost:5000/api/v1';

export function SuperAdminDashboard() {
  const [tenants, setTenants] = useState<TenantItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [selectedTenant, setSelectedTenant] = useState<TenantItem | null>(null);

  // Initial seed demo tenants for immediate live visualization
  const initialDemoTenants: TenantItem[] = [
    {
      id: '1',
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
      address: {
        street: '12 Bazaar Road, Porur',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600116',
      },
      gstin: '33AAAAA0000A1Z5',
      users: [
        { username: 'srimurugan_admin', role: 'OWNER', email: 'pandi@srimurugan.in' },
        { username: 'cashier_01', role: 'CASHIER', email: 'counter1@srimurugan.in' },
        { username: 'manager_vel', role: 'STORE_MANAGER', email: 'vel@srimurugan.in' },
      ],
    },
    {
      id: '2',
      shopId: 'annaimedicals',
      businessName: 'Annai Pharmacy & Healthcare',
      ownerName: 'K. Rajasekaran',
      email: 'raja@annaimedicals.com',
      phone: '+91 94433 11223',
      businessType: BusinessType.PHARMACY,
      plan: SubscriptionPlanCode.BUSINESS,
      status: 'ACTIVE',
      billsCount: 14290,
      createdAt: '2026-10-15',
      address: {
        street: '45 Cross Street, Gandhipuram',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        pincode: '641012',
      },
      gstin: '33AABCR1234F1Z8',
      users: [
        { username: 'annai_admin', role: 'OWNER', email: 'raja@annaimedicals.com' },
        { username: 'pharmacist_kumar', role: 'MANAGER', email: 'kumar@annaimedicals.com' },
      ],
    },
    {
      id: '3',
      shopId: 'royalfashions',
      businessName: 'Royal Textile & Garments',
      ownerName: 'M. Senthil Nathan',
      email: 'senthil@royalfashions.in',
      phone: '+91 97890 55443',
      businessType: BusinessType.TEXTILE_GARMENTS,
      plan: SubscriptionPlanCode.STARTER,
      status: 'TRIAL',
      billsCount: 340,
      createdAt: '2026-11-09',
      address: {
        street: '88 Car Street, Madurai Town',
        city: 'Madurai',
        state: 'Tamil Nadu',
        pincode: '625001',
      },
      gstin: '33AABCS9876E1Z2',
      users: [
        { username: 'royal_admin', role: 'OWNER', email: 'senthil@royalfashions.in' },
      ],
    },
    {
      id: '4',
      shopId: 'greenbasket',
      businessName: 'Green Basket Fresh Produce',
      ownerName: 'Deepa V.',
      email: 'deepa@greenbasket.co.in',
      phone: '+91 99401 22334',
      businessType: BusinessType.FRUITS_VEGETABLES,
      plan: SubscriptionPlanCode.FREE_TRIAL,
      status: 'TRIAL',
      billsCount: 180,
      createdAt: '2026-11-10',
      address: {
        street: '15 Anna Nagar 2nd Avenue',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600040',
      },
      users: [
        { username: 'green_admin', role: 'OWNER', email: 'deepa@greenbasket.co.in' },
      ],
    },
  ];

  // Fetch registered tenants from backend or fallback to state
  const fetchTenants = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/saas-admin/tenants`);
      if (res.data?.data && res.data.data.length > 0) {
        setTenants(res.data.data);
      } else {
        setTenants(initialDemoTenants);
      }
    } catch (err) {
      setTenants(initialDemoTenants);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  // Filtered tenants
  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.shopId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.phone.includes(searchQuery);

    const matchesPlan = filterPlan === 'ALL' || t.plan === filterPlan;
    const matchesType = filterType === 'ALL' || t.businessType === filterType;

    return matchesSearch && matchesPlan && matchesType;
  });

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Top Super Admin Navbar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold">
                <Store className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-white">Vendora</span>
            </Link>
            <span className="text-xs bg-brand-500/20 text-brand-300 border border-brand-400/30 px-2 py-0.5 rounded-md font-semibold">
              Super Admin Console
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <a
              href="http://localhost:5000/docs"
              target="_blank"
              rel="noreferrer"
              className="text-slate-300 hover:text-white flex items-center gap-1 font-medium"
            >
              <span>Swagger API Docs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>

            <a
              href="http://localhost:4001"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-all flex items-center gap-1.5"
            >
              <span>Open Store POS (Port 4001)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <Link
              to="/"
              className="text-slate-400 hover:text-white transition-colors"
            >
              ← Back to Landing
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Total Registered Tenants</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{tenants.length}</p>
              <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Across 14 retail sectors</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Active Paid Stores</p>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {tenants.filter((t) => t.status === 'ACTIVE').length}
              </p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Starter, Growth & Business</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">30-Day Free Trials</p>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {tenants.filter((t) => t.status === 'TRIAL').length}
              </p>
              <p className="text-[11px] text-blue-600 font-medium mt-0.5">Under evaluation</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Estimated MRR</p>
              <p className="text-2xl font-black text-slate-900 mt-1">₹5,298</p>
              <p className="text-[11px] text-emerald-600 font-medium mt-0.5">+24% vs last month</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by shop ID, name, owner, email, phone..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              <span>Plan:</span>
              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 outline-none"
              >
                <option value="ALL">All Plans</option>
                <option value={SubscriptionPlanCode.FREE_TRIAL}>Free Trial</option>
                <option value={SubscriptionPlanCode.STARTER}>Starter</option>
                <option value={SubscriptionPlanCode.GROWTH}>Growth</option>
                <option value={SubscriptionPlanCode.BUSINESS}>Business</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>Industry:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 outline-none"
              >
                <option value="ALL">All Industries</option>
                {Object.entries(BUSINESS_TYPE_LABELS).map(([code, label]) => (
                  <option key={code} value={code}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={fetchTenants}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
              title="Refresh Tenants"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tenant Directory Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm sm:text-base text-slate-900">
              Registered Tenant Shops ({filteredTenants.length})
            </h3>
            <span className="text-xs text-slate-500 font-mono">Live Sync</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Shop ID & Store Name</th>
                  <th className="py-3 px-4">Owner & Contact</th>
                  <th className="py-3 px-4">Business Sector</th>
                  <th className="py-3 px-4">Plan & Status</th>
                  <th className="py-3 px-4">Bills Processed</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Shop ID & Name */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{tenant.businessName}</div>
                      <div className="font-mono text-[11px] text-brand-600 mt-0.5">
                        {tenant.shopId}.vendora.com
                      </div>
                    </td>

                    {/* Owner & Contact */}
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="font-medium text-slate-900">{tenant.ownerName}</div>
                      <div className="text-[11px] text-slate-500">{tenant.phone}</div>
                      <div className="text-[11px] text-slate-400">{tenant.email}</div>
                    </td>

                    {/* Business Sector */}
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-[11px] font-medium">
                        {BUSINESS_TYPE_LABELS[tenant.businessType] || tenant.businessType}
                      </span>
                    </td>

                    {/* Plan & Status */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{tenant.plan}</div>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-0.5 ${
                          tenant.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : tenant.status === 'TRIAL'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {tenant.status}
                      </span>
                    </td>

                    {/* Bills Processed */}
                    <td className="py-3.5 px-4 font-mono text-slate-800">
                      {tenant.billsCount.toLocaleString('en-IN')} bills
                    </td>

                    {/* Created Date */}
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {tenant.createdAt}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Open Contact Modal */}
                        <button
                          onClick={() => setSelectedTenant(tenant)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium cursor-pointer"
                        >
                          View Details
                        </button>

                        {/* Direct link to POS terminal on client port 4001 */}
                        <a
                          href={`http://localhost:4001`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs"
                          title="Open Store Terminal"
                        >
                          <span>Launch POS</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Tenant Details & Contact Info Drawer Modal */}
      {selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-base text-slate-900">{selectedTenant.businessName}</h4>
                <p className="text-xs text-brand-600 font-mono mt-0.5">https://{selectedTenant.shopId}.vendora.com</p>
              </div>
              <button
                onClick={() => setSelectedTenant(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              {/* Contact Information */}
              <div>
                <p className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Owner & Contact Details</p>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Proprietor: <strong>{selectedTenant.ownerName}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Phone: {selectedTenant.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Email: {selectedTenant.email}</span>
                  </div>
                  {selectedTenant.address && (
                    <div className="flex items-start gap-2 text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>
                        {selectedTenant.address.street}, {selectedTenant.address.city}, {selectedTenant.address.state} - {selectedTenant.address.pincode}
                      </span>
                    </div>
                  )}
                  {selectedTenant.gstin && (
                    <div className="flex items-center gap-2 text-slate-700">
                      <span className="font-bold text-[10px] bg-slate-200 px-1.5 py-0.5 rounded">GSTIN</span>
                      <span className="font-mono">{selectedTenant.gstin}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Staff Users Scoped to this Tenant */}
              {selectedTenant.users && selectedTenant.users.length > 0 && (
                <div>
                  <p className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Staff Users & Credentials</p>
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                    {selectedTenant.users.map((u, i) => (
                      <div key={i} className="p-2.5 flex items-center justify-between bg-white text-xs">
                        <div>
                          <p className="font-mono font-bold text-slate-800">{u.username}</p>
                          <p className="text-[10px] text-slate-400">{u.email}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                          {u.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setSelectedTenant(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              <a
                href={`http://localhost:4001`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <span>Launch Counter (Port 4001)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
