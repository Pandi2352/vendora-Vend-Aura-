import { Gift, Storefront, ChartBar, Buildings, Check, ArrowRight } from '@phosphor-icons/react';
import { SUBSCRIPTION_PLANS, SubscriptionPlanCode } from '../shared';

export function PricingSection() {
  const planIcons = {
    [SubscriptionPlanCode.FREE_TRIAL]: Gift,
    [SubscriptionPlanCode.STARTER]: Storefront,
    [SubscriptionPlanCode.GROWTH]: ChartBar,
    [SubscriptionPlanCode.BUSINESS]: Buildings,
  };

  return (
    <section id="plans" className="py-20 bg-white border-b border-zinc-200 w-full scroll-mt-20">
      <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-8 lg:px-14 xl:px-16">
        {/* Header matching user prompt & screenshot */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-2">
            Cloud POS for modern retail
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-950 tracking-tight">
            Simple Plans for Every Retail Business
          </h2>
          <p className="mt-3 text-sm sm:text-base text-zinc-600 font-medium">
            Start free and upgrade as you grow. No installation. No credit card required.
          </p>
        </div>

        {/* 4 Cards Grid with Red & Black Theme, rounded-md, and NO shadows */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8 items-stretch">
          {Object.values(SUBSCRIPTION_PLANS).map((plan) => {
            const Icon = planIcons[plan.code] || Storefront;
            const isGrowth = plan.code === SubscriptionPlanCode.GROWTH;
            const isTrial = plan.code === SubscriptionPlanCode.FREE_TRIAL;

            return (
              <div
                key={plan.code}
                className={`rounded-md p-6 sm:p-7 transition-all flex flex-col justify-between relative ${
                  isGrowth
                    ? 'bg-zinc-950 text-white border-2 border-red-600'
                    : 'bg-white border border-zinc-200 text-zinc-950 hover:border-zinc-400'
                }`}
              >
                {isGrowth && (
                  <div className="absolute -top-3 left-6 px-2.5 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider">
                    Most Popular
                  </div>
                )}

                <div>
                  {/* Top Icon & Tagline */}
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className={`w-11 h-11 rounded-md flex items-center justify-center shrink-0 ${
                        isGrowth ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600 border border-red-200'
                      }`}
                    >
                      <Icon weight="duotone" className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base leading-tight">{plan.name}</h3>
                      <p className={`text-[11px] leading-snug mt-0.5 ${isGrowth ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        {plan.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Pricing Display */}
                  <div className={`py-4 border-y mb-5 ${isGrowth ? 'border-zinc-800' : 'border-zinc-200'}`}>
                    {plan.monthlyPrice === 0 ? (
                      <div>
                        <div className="text-2xl font-black text-red-600 tracking-tight">
                          30 Days Free
                        </div>
                        <p className={`text-xs font-semibold mt-0.5 ${isGrowth ? 'text-zinc-300' : 'text-zinc-600'}`}>
                          up to 1,000 Bills
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl sm:text-3xl font-black tracking-tight">
                            ₹{plan.monthlyPrice.toLocaleString('en-IN')}
                          </span>
                          <span className={`text-xs ${isGrowth ? 'text-zinc-400' : 'text-zinc-500'}`}>/ month</span>
                        </div>
                        <p className={`text-xs font-medium mt-1 ${isGrowth ? 'text-zinc-400' : 'text-zinc-500'}`}>
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
                          weight="bold"
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            isGrowth ? 'text-red-500' : 'text-red-600'
                          }`}
                        />
                        <span className={isGrowth ? 'text-zinc-300' : 'text-zinc-600'}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Plan Action CTA Button - Opens registration in new page/tab */}
                <div className="pt-6 mt-4">
                  <a
                    href={`/register?plan=${plan.code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-2.5 rounded-md font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isGrowth
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : isTrial
                        ? 'bg-red-50 hover:bg-red-600 text-red-700 hover:text-white border border-red-200'
                        : 'bg-zinc-100 hover:bg-zinc-950 text-zinc-900 hover:text-white border border-zinc-200'
                    }`}
                  >
                    <span>{isTrial ? 'Create Free Account' : 'Get Started'}</span>
                    <ArrowRight weight="bold" className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Features / Guarantees Strip */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-md bg-zinc-50 border border-zinc-200 text-center">
            <h4 className="text-xs font-bold text-zinc-950">No installation</h4>
            <p className="text-[11px] text-zinc-500 mt-0.5">Start in minutes</p>
          </div>
          <div className="p-4 rounded-md bg-zinc-50 border border-zinc-200 text-center">
            <h4 className="text-xs font-bold text-zinc-950">Quick setup</h4>
            <p className="text-[11px] text-zinc-500 mt-0.5">Preloaded categories</p>
          </div>
          <div className="p-4 rounded-md bg-zinc-50 border border-zinc-200 text-center">
            <h4 className="text-xs font-bold text-zinc-950">Access anywhere</h4>
            <p className="text-[11px] text-zinc-500 mt-0.5">Desktop, tablet, phone</p>
          </div>
          <div className="p-4 rounded-md bg-zinc-50 border border-zinc-200 text-center">
            <h4 className="text-xs font-bold text-zinc-950">Secure & reliable</h4>
            <p className="text-[11px] text-zinc-500 mt-0.5">Encrypted cloud backup</p>
          </div>
        </div>
      </div>
    </section>
  );
}
