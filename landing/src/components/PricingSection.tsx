import { Gift, Store, BarChart2, Building2, Check, ArrowRight } from 'lucide-react';
import { SUBSCRIPTION_PLANS, SubscriptionPlanCode } from '../shared';

interface PricingSectionProps {
  onOpenOnboarding: (planCode: SubscriptionPlanCode) => void;
}

export function PricingSection({ onOpenOnboarding }: PricingSectionProps) {
  const planIcons = {
    [SubscriptionPlanCode.FREE_TRIAL]: Gift,
    [SubscriptionPlanCode.STARTER]: Store,
    [SubscriptionPlanCode.GROWTH]: BarChart2,
    [SubscriptionPlanCode.BUSINESS]: Building2,
  };

  return (
    <section id="plans" className="py-24 bg-gradient-to-b from-white to-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-2">
            Cloud POS for modern retail
          </p>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Simple Plans for Every Retail Business
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-600">
            Start free and upgrade as you grow. No installation. No credit card required.
          </p>
        </div>

        {/* 4 Cards Grid exactly like screenshot #1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {Object.values(SUBSCRIPTION_PLANS).map((plan) => {
            const Icon = planIcons[plan.code] || Store;
            const isGrowth = plan.code === SubscriptionPlanCode.GROWTH;

            return (
              <div
                key={plan.code}
                className={`rounded-2xl p-6 transition-all flex flex-col justify-between ${
                  isGrowth
                    ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/30 ring-4 ring-blue-500/20 scale-[1.02] relative'
                    : 'bg-white border border-slate-200 text-slate-900 shadow-sm hover:border-slate-300 hover:shadow-md'
                }`}
              >
                <div>
                  {/* Top Icon & Tagline */}
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                        isGrowth ? 'bg-blue-500/80 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight">{plan.name}</h3>
                      <p className={`text-[11px] leading-snug mt-0.5 ${isGrowth ? 'text-blue-100' : 'text-slate-500'}`}>
                        {plan.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Pricing Display */}
                  <div className={`py-4 border-y mb-6 ${isGrowth ? 'border-blue-500/60' : 'border-slate-100'}`}>
                    {plan.monthlyPrice === 0 ? (
                      <div>
                        <div className="text-2xl font-black text-blue-600 tracking-tight">
                          30 Days Free
                        </div>
                        <p className={`text-xs font-semibold mt-0.5 ${isGrowth ? 'text-blue-100' : 'text-slate-600'}`}>
                          up to 1,000 Bills
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black tracking-tight">
                            ₹{plan.monthlyPrice.toLocaleString('en-IN')}
                          </span>
                          <span className={`text-xs ${isGrowth ? 'text-blue-200' : 'text-slate-500'}`}>/ month</span>
                        </div>
                        <p className={`text-xs font-medium mt-1 ${isGrowth ? 'text-blue-200' : 'text-slate-500'}`}>
                          ₹{plan.annualPrice.toLocaleString('en-IN')} / year
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Features List */}
                  <ul className="space-y-2.5 text-xs">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            isGrowth ? 'text-blue-200' : 'text-blue-600'
                          }`}
                        />
                        <span className={isGrowth ? 'text-blue-50' : 'text-slate-600'}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom CTA Button */}
                <div className="mt-8 pt-4">
                  <button
                    onClick={() => onOpenOnboarding(plan.code)}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                      isGrowth
                        ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30'
                        : plan.code === SubscriptionPlanCode.FREE_TRIAL
                        ? 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
                        : 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <span>{plan.code === SubscriptionPlanCode.FREE_TRIAL ? 'Create Free Account' : 'Get Started'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

