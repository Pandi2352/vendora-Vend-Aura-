import { ArrowRight, Eye } from '@phosphor-icons/react';

export function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Sign up in 2 minutes',
      description: 'Enter your shop ID, company name, city, business type and contact details.',
    },
    {
      number: '2',
      title: 'Get your login by email',
      description: 'We create your account and email your login details instantly.',
    },
    {
      number: '3',
      title: 'Start billing',
      description: 'Log in, follow the short setup guide, and make your first bill.',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white border-b border-zinc-200 w-full">
      <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-8 lg:px-14 xl:px-16">
        <div className="flex flex-col lg:flex-row items-center justify-around gap-12 lg:gap-20">
          {/* Left Steps */}
          <div className="max-w-xl w-full">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight mb-8">
              How it works
            </h2>

            <div className="relative pl-6 sm:pl-8 space-y-8 border-l-2 border-red-600 ml-3.5">
              {steps.map((step, idx) => (
                <div key={idx} className="relative">
                  {/* Step Number Badge */}
                  <div className="absolute -left-[35px] sm:-left-[43px] top-0 w-7 h-7 rounded-md bg-red-600 text-white font-bold text-xs flex items-center justify-center">
                    {step.number}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-zinc-950 mb-1">{step.title}</h3>
                    <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sign-in Mockup matching screenshot #3 */}
          <div className="w-full max-w-md bg-zinc-50 p-6 sm:p-8 rounded-md border border-zinc-200">
            <div className="bg-white p-6 rounded-md border border-zinc-200">
              <h3 className="text-lg font-bold text-zinc-950">Sign in</h3>
              <p className="text-xs text-zinc-500 mt-1 mb-5">
                Enter your credentials to access the store counter
              </p>

              <div className="space-y-3.5 text-left">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Customer ID</label>
                  <div className="w-full px-3 py-2 rounded-md border border-zinc-300 bg-zinc-50 text-xs font-semibold text-zinc-900">
                    VENDORA
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Username</label>
                  <div className="w-full px-3 py-2 rounded-md border border-red-600 bg-white text-xs font-medium text-zinc-950 ring-1 ring-red-600/30">
                    admin|
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Password</label>
                  <div className="w-full px-3 py-2 rounded-md border border-zinc-300 bg-white text-xs flex items-center justify-between text-zinc-400">
                    <span>••••••••••••••••</span>
                    <Eye className="w-4 h-4 text-zinc-400" />
                  </div>
                </div>

                <div className="pt-2">
                  <div className="w-full py-2.5 rounded-md bg-red-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-default">
                    <span>Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
