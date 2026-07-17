import { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { DollarSign, TrendingUp, Users, BarChart3, Check, ArrowRight, Phone, Mail, Clock } from "lucide-react";

const benefits = [
  { icon: DollarSign, title: "$250 Commission", desc: "Earn $250 for every referred aircraft owner who enters a broker agreement with ClearBlue Aero." },
  { icon: TrendingUp, title: "Passive Income", desc: "Supplement your revenue stream by leveraging your aviation network and professional connections." },
  { icon: Users, title: "Simple Referrals", desc: "Share your unique referral link or QR code. We handle everything from valuation to closing." },
  { icon: BarChart3, title: "Full Transparency", desc: "Track every referral, view earnings, and monitor your performance from your affiliate dashboard." },
];

const steps = [
  { num: "01", title: "Register", desc: "Sign up online in minutes. Get approved and receive your unique referral code, link, and QR code." },
  { num: "02", title: "Refer", desc: "Share your link, QR code, or affiliate name with aircraft owners looking to sell or appraise." },
  { num: "03", title: "Earn", desc: "When your referral signs a broker agreement, you earn $250. Payments are dispersed upon listing." },
];

export default function AffiliateProgram() {
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', company: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await base44.functions.invoke('registerAffiliate', form);
      if (res.data?.error) {
        setError(res.data.error);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white w-full">
      {/* Hero */}
      <div className="bg-[#00447f] py-24 px-4 text-center">
        <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">Affiliate Program</p>
        <h1 className="text-4xl md:text-6xl font-black text-white mb-5">
          Refer Aircraft Owners.<br />Earn $250 Per Deal.
        </h1>
        <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed mb-10">
          Join the ClearBlue Aero affiliate network and turn your aviation connections into a reliable revenue stream.
          Refer aircraft owners who want to sell — we handle the brokerage, you collect the commission.
        </p>
        <a href="#register" className="inline-flex items-center gap-2 px-8 py-4 rounded font-bold text-sm transition-all hover:brightness-110" style={{ backgroundColor: '#C9A84C', color: '#00447f' }}>
          Become an Affiliate <ArrowRight className="w-4 h-4" />
        </a>
      </div>

      {/* Benefits */}
      <section className="py-20 bg-[#f5f6f8]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <img
              src="https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/859c78b98_Alliance-CBALogovectorBlack.png"
              alt="ClearBlue Aero Alliance"
              className="h-24 md:h-28 w-auto object-contain mx-auto mb-6"
            />
            <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">Why Join</p>
            <h2 className="text-4xl font-black text-[#00447f]">Program Benefits</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-7 border border-gray-100">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#00447f' }}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-black text-[#00447f] mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">Getting Started</p>
            <h2 className="text-4xl font-black text-[#00447f]">How It Works</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {steps.map(({ num, title, desc }) => (
              <div key={num} className="text-center">
                <p className="text-5xl font-black mb-4" style={{ color: '#C9A84C' }}>{num}</p>
                <h3 className="text-lg font-black text-[#00447f] mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section id="register" className="py-20 bg-[#f5f6f8]">
        <div className="max-w-lg mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">Get Started</p>
            <h2 className="text-3xl font-black text-[#00447f]">Affiliate Registration</h2>
            <p className="text-gray-500 text-sm mt-3">Fill out the form below to apply. We'll review your application and send your dashboard login within 1-2 business days.</p>
          </div>

          {success ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-black text-[#00447f] mb-3">Application Received!</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Thank you for applying to the ClearBlue Aero Affiliate Program. We'll review your application and email you with next steps, including your unique referral code and dashboard access.
              </p>
              <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded font-bold text-sm text-white transition-all hover:brightness-110" style={{ backgroundColor: '#00447f' }}>
                Back to Home
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">First Name *</label>
                  <input
                    type="text"
                    required
                    value={form.first_name}
                    onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#00447f] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={form.last_name}
                    onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#00447f] transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Email *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#00447f] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#00447f] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Company / Organization</label>
                <input
                  type="text"
                  value={form.company}
                  onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#00447f] transition-colors"
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-lg font-bold text-sm text-white transition-all hover:brightness-110 disabled:opacity-60"
                style={{ backgroundColor: '#00447f' }}
              >
                {submitting ? 'Submitting...' : 'Apply Now'}
              </button>
              <p className="text-xs text-gray-400 text-center">By applying, you agree to the ClearBlue Aero Affiliate Program terms.</p>
            </form>
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-[#00447f] text-center px-4">
        <h2 className="text-2xl font-black text-white mb-4">Have Questions?</h2>
        <p className="text-white/50 text-sm mb-8 max-w-md mx-auto">Reach out to our team — we're happy to walk you through the program.</p>
        <div className="flex flex-wrap justify-center gap-6">
          <a href="tel:+13862276840" className="flex items-center gap-2 text-white/80 hover:text-white text-sm">
            <Phone className="w-4 h-4" /> (386) 227-6840
          </a>
          <a href="mailto:sales@flyclearblue.com" className="flex items-center gap-2 text-white/80 hover:text-white text-sm">
            <Mail className="w-4 h-4" /> sales@flyclearblue.com
          </a>
          <span className="flex items-center gap-2 text-white/50 text-sm">
            <Clock className="w-4 h-4" /> Mon–Fri, 8AM–6PM EST
          </span>
        </div>
      </section>
    </div>
  );
}