import { useState, useEffect } from 'react';
import {
  Buildings,
  Users,
  Sparkle,
  ArrowUpRight,
  MagnifyingGlass,
  Funnel,
  ArrowSquareOut,
  Phone,
  EnvelopeSimple,
  MapPin,
  ShieldCheck,
  ArrowsClockwise,
  X
} from '@phosphor-icons/react';
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
        { username: 'cashier_ramesh', role: 'CASHIER', email: 'ramesh@srimurugan.in' },
      ],
    },
    {
      id: '2',
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
      address: {
        street: '44 Usman Road, T. Nagar',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600017',
      },
      gstin: '33BBBBB1111B2Z6',
      users: [
        { username: 'chennai_admin', role: 'OWNER', email: 'venkat@chennaisilks.com' },
        { username: 'mgr_anand', role: 'STORE_MANAGER', email: 'anand@chennaisilks.com' },
      ],
    },
    {
      id: '3',
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
      address: {
        street: '2nd Avenue, Anna Nagar',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600040',
      },
      users: [
        { username: 'bakery_admin', role: 'OWNER', email: 'suresh@annabakery.in' },
      ],
    },
    {
      id: '4',
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
      address: {
        street: '7th Main Road, Velachery',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600042',
      },
      users: [
        { username: 'green_admin', role: 'OWNER', email: 'deepa@greenbasket.co.in' },
      ],
    },
  ];

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/saas-admin/tenants`);
      if (res.data?.data && res.data.data.length > 0) {
        setTenants(res.data.data);
      } else {
        setTenants(initialDemoTenants);
      }
    } catch {
      setTenants(initialDemoTenants);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

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
    <div className="min-h-screen bg-zinc-100 text-zinc-950 flex flex-col font-sans w-full">
      {/* Top Super Admin Navbar */}
      <header className="bg-zinc-950 text-white border-b border-zinc-800 sticky top-0 z-40">
        <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-8 lg:px-14 xl:px-16 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/assets/vendora_logo.png"
                alt="Vendora Logo"
                className="h-8 w-auto object-contain"
              />
              <span className="font-bold text-lg text-white">Vendora</span>
            </Link>
            <span className="text-xs bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded-md font-semibold">
              Super Admin Console
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <a
              href="http://localhost:5000/docs"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-400 hover:text-white flex items-center gap-1 font-medium"
            >
              <span>Swagger API Docs</span>
              <ArrowUpRight weight="bold" className="w-3.5 h-3.5" />
            </a>

            <a
              href="http://localhost:4001"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold transition-all flex items-center gap-1.5"
            >
              <span>Open Store POS (Port 4001)</span>
              <ArrowSquareOut weight="bold" className="w-3.5 h-3.5" />
            </a>

            <Link
              to="/"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              ← Back to Landing
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-[1680px] mx-auto px-4 sm:px-8 lg:px-14 xl:px-16 py-8 flex-1">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-md border border-zinc-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-500">Total Registered Tenants</p>
              <p className="text-2xl font-black text-zinc-950 mt-1">{tenants.length}</p>
              <p className="text-[11px] text-zinc-600 font-medium mt-0.5">Across 14 retail sectors</p>
            </div>
            <div className="w-10 h-10 rounded-md bg-zinc-100 text-zinc-800 flex items-center justify-center border border-zinc-200">
              <Buildings weight="duotone" className="w-5 h-5 text-red-600" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-md border border-zinc-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-500">Active Paid Stores</p>
              <p className="text-2xl font-black text-zinc-950 mt-1">
                {tenants.filter((t) => t.status === 'ACTIVE').length}
              </p>
              <p className="text-[11px] text-zinc-500 font-medium mt-0.5">Starter, Growth & Business</p>
            </div>
            <div className="w-10 h-10 rounded-md bg-zinc-100 text-zinc-800 flex items-center justify-center border border-zinc-200">
              <ShieldCheck weight="duotone" className="w-5 h-5 text-red-600" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-md border border-zinc-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-500">30-Day Free Trials</p>
              <p className="text-2xl font-black text-zinc-950 mt-1">
                {tenants.filter((t) => t.status === 'TRIAL').length}
              </p>
              <p className="text-[11px] text-zinc-600 font-medium mt-0.5">Under evaluation</p>
            </div>
            <div className="w-10 h-10 rounded-md bg-zinc-100 text-zinc-800 flex items-center justify-center border border-zinc-200">
              <Users weight="duotone" className="w-5 h-5 text-red-600" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-md border border-zinc-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-500">Estimated MRR</p>
              <p className="text-2xl font-black text-zinc-950 mt-1">₹5,298</p>
              <p className="text-[11px] text-zinc-600 font-medium mt-0.5">+24% vs last month</p>
            </div>
            <div className="w-10 h-10 rounded-md bg-zinc-100 text-zinc-800 flex items-center justify-center border border-zinc-200">
              <Sparkle weight="duotone" className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-md border border-zinc-200 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <MagnifyingGlass className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by shop ID, name, owner, email, phone..."
              className="w-full pl-9 pr-3 py-1.5 rounded-md border border-zinc-300 text-xs sm:text-sm focus:border-red-600 outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-zinc-600">
              <Funnel className="w-3.5 h-3.5" />
              <span>Plan:</span>
              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
                className="px-2.5 py-1.5 rounded-md border border-zinc-300 bg-white text-xs font-medium text-zinc-800 outline-none"
              >
                <option value="ALL">All Plans</option>
                <option value={SubscriptionPlanCode.FREE_TRIAL}>Free Trial</option>
                <option value={SubscriptionPlanCode.STARTER}>Starter</option>
                <option value={SubscriptionPlanCode.GROWTH}>Growth</option>
                <option value={SubscriptionPlanCode.BUSINESS}>Business</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-zinc-600">
              <span>Industry:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-2.5 py-1.5 rounded-md border border-zinc-300 bg-white text-xs font-medium text-zinc-800 outline-none"
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
              className="p-1.5 rounded-md border border-zinc-300 hover:bg-zinc-100 text-zinc-700 transition-colors cursor-pointer"
              title="Refresh Tenants"
            >
              <ArrowsClockwise className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tenant Directory Table */}
        <div className="bg-white rounded-md border border-zinc-200 overflow-hidden">
          <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
            <h3 className="font-bold text-sm sm:text-base text-zinc-950">
              Registered Tenant Shops ({filteredTenants.length})
            </h3>
            <span className="text-xs text-zinc-500 font-mono">Live Sync</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Shop ID & Store Name</th>
                  <th className="py-3 px-4">Owner & Contact</th>
                  <th className="py-3 px-4">Business Sector</th>
                  <th className="py-3 px-4">Plan & Status</th>
                  <th className="py-3 px-4">Bills Processed</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {filteredTenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-zinc-950">{tenant.businessName}</div>
                      <div className="font-mono text-[11px] text-red-600 mt-0.5">
                        {tenant.shopId}.vendora.com
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-zinc-700">
                      <div className="font-medium text-zinc-950">{tenant.ownerName}</div>
                      <div className="text-[11px] text-zinc-500">{tenant.phone}</div>
                      <div className="text-[11px] text-zinc-400">{tenant.email}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 text-[11px] font-medium border border-zinc-200">
                        {BUSINESS_TYPE_LABELS[tenant.businessType] || tenant.businessType}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-zinc-900">{tenant.plan}</div>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold mt-0.5 ${tenant.status === 'ACTIVE'
                            ? 'bg-zinc-950 text-white'
                            : tenant.status === 'TRIAL'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-zinc-200 text-zinc-700'
                          }`}
                      >
                        {tenant.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-medium text-zinc-800">
                      {tenant.billsCount.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 text-zinc-500 font-mono text-[11px]">
                      {tenant.createdAt}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedTenant(tenant)}
                        className="px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-950 hover:text-white border border-zinc-200 font-semibold text-[11px] text-zinc-800 transition-colors cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Selected Tenant Drawer Modal */}
      {selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-md border border-zinc-300 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200 uppercase">
                  Tenant Profile
                </span>
                <h3 className="text-lg font-bold text-zinc-950 mt-1">{selectedTenant.businessName}</h3>
                <p className="text-xs text-red-600 font-mono">{selectedTenant.shopId}.vendora.com</p>
              </div>
              <button
                onClick={() => setSelectedTenant(null)}
                className="w-7 h-7 rounded-md bg-zinc-200 hover:bg-zinc-300 text-zinc-700 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-md bg-zinc-50 border border-zinc-200">
                <div>
                  <span className="text-zinc-500 block">Subscription Tier</span>
                  <span className="font-bold text-zinc-900">{selectedTenant.plan}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Status</span>
                  <span className="font-bold text-red-600">{selectedTenant.status}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Sector</span>
                  <span className="font-bold text-zinc-900">{BUSINESS_TYPE_LABELS[selectedTenant.businessType]}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Bills Counter</span>
                  <span className="font-bold text-zinc-900">{selectedTenant.billsCount} bills</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-zinc-900 uppercase text-[10px] tracking-wider">Contact & Address</h4>
                <div className="space-y-1.5 text-zinc-700">
                  <p className="flex items-center gap-2">
                    <Users weight="bold" className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="font-medium">{selectedTenant.ownerName}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <EnvelopeSimple weight="bold" className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{selectedTenant.email}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone weight="bold" className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{selectedTenant.phone}</span>
                  </p>
                  {selectedTenant.address && (
                    <p className="flex items-start gap-2">
                      <MapPin weight="bold" className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                      <span>
                        {selectedTenant.address.street}, {selectedTenant.address.city}, {selectedTenant.address.state} - {selectedTenant.address.pincode}
                      </span>
                    </p>
                  )}
                  {selectedTenant.gstin && (
                    <p className="text-[11px] font-mono text-zinc-500">
                      GSTIN: <span className="font-bold text-zinc-900">{selectedTenant.gstin}</span>
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-zinc-900 uppercase text-[10px] tracking-wider mb-2">
                  Staff & Cashier Accounts
                </h4>
                <div className="space-y-1.5">
                  {selectedTenant.users?.map((user, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-md bg-zinc-50 border border-zinc-200 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-mono font-bold text-zinc-950">{user.username}</span>
                        <span className="text-zinc-500 ml-2">({user.email})</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-zinc-200 text-zinc-800 text-[10px] font-bold">
                        {user.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-end gap-2">
              <a
                href={`http://localhost:4001/login?shopId=${selectedTenant.shopId}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold text-xs flex items-center gap-1.5"
              >
                <span>Launch POS Terminal</span>
                <ArrowSquareOut weight="bold" className="w-3 h-3" />
              </a>
              <button
                onClick={() => setSelectedTenant(null)}
                className="px-3 py-1.5 rounded-md bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
