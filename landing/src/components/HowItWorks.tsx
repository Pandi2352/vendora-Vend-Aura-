import { ArrowRight, Eye } from 'lucide-react';

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
    <section id="how-it-works" className="py-20 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
          {/* Left Steps */}
          <div className="max-w-xl w-full">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-10">
              How it works
            </h2>

            <div className="relative pl-6 sm:pl-8 space-y-10 border-l-2 border-red-500/80 ml-4">
              {steps.map((step, idx) => (
                <div key={idx} className="relative">
                  {/* Step Number Dot */}
                  <div className="absolute -left-[37px] sm:-left-[45px] top-0 w-8 h-8 rounded-full bg-red-600 text-white font-bold text-sm flex items-center justify-center shadow-md shadow-red-500/20">
                    {step.number}
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1.5">{step.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sign-in Mockup matching screenshot #3 */}
          <div className="w-full max-w-md bg-gradient-to-tr from-slate-100 via-rose-50/40 to-indigo-50/50 p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl">
            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-md">
              <h3 className="text-xl font-bold text-slate-900">Sign in</h3>
              <p className="text-xs text-slate-500 mt-1 mb-6">
                Enter your credentials to access the dashboard
              </p>

              <div className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Customer ID</label>
                  <div className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-slate-50 text-xs font-semibold text-slate-800">
                    UNIPRO
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Username</label>
                  <div className="w-full px-3.5 py-2.5 rounded-lg border border-blue-500 bg-white text-xs font-medium text-slate-900 ring-2 ring-blue-500/20">
                    admin|
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
                  <div className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-xs flex items-center justify-between text-slate-400">
                    <span>••••••••••••••••</span>
                    <Eye className="w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <div className="pt-2">
                  <div className="w-full py-3 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30">
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

