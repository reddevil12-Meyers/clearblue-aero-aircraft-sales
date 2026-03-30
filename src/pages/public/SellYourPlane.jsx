import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, DollarSign, FileText, Handshake, Shield } from "lucide-react";

export default function PublicSellYourPlane() {
  const steps = [
    { icon: FileText, title: "Submit Your Aircraft", desc: "Fill out our simple listing form with your aircraft's details. Takes less than 10 minutes." },
    { icon: DollarSign, title: "Receive a Valuation", desc: "Our experienced brokers will assess market value and develop a pricing strategy for your aircraft." },
    { icon: Handshake, title: "We Handle the Sale", desc: "We market your aircraft, vet buyers, manage showings, and negotiate on your behalf." },
    { icon: Shield, title: "Smooth Closing", desc: "From pre-purchase inspection to title and escrow, we guide the transaction to a clean close." },
  ];

  return (
    <div>
      {/* Hero */}
      <div className="py-20 text-white text-center" style={{ backgroundColor: '#0a1628' }}>
        <h1 className="text-5xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Sell Your Aircraft</h1>
        <p className="text-white/60 text-xl max-w-xl mx-auto">Let ClearBlue Aero handle every step of the sale — from valuation to closing.</p>
      </div>

      {/* Process */}
      <section className="py-20 max-w-5xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-14" style={{ fontFamily: "'Playfair Display', serif" }}>How It Works</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {steps.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className="flex gap-5 p-6 bg-white border border-gray-100 rounded-2xl hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#0a1628' }}>
                <Icon className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-600 mb-1">Step {i + 1}</p>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Choose Type */}
      <section className="py-16" style={{ backgroundColor: '#f8f9fb' }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Get Started Today</h2>
          <p className="text-gray-500 mb-10">Choose the category that best fits your aircraft:</p>
          <div className="grid md:grid-cols-2 gap-6">
            <Link to="/public/sell/single-engine" className="group bg-white border-2 border-gray-100 hover:border-amber-400 rounded-2xl p-8 text-left transition-all hover:shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-amber-700 transition-colors">Single Engine</h3>
              <p className="text-sm text-gray-500 mb-4">Cessna, Piper, Cirrus, Mooney, and more</p>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600">List Your Aircraft <ArrowRight className="w-4 h-4" /></span>
            </Link>
            <Link to="/public/sell/twin-engine" className="group bg-white border-2 border-gray-100 hover:border-amber-400 rounded-2xl p-8 text-left transition-all hover:shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-amber-700 transition-colors">Twin Engine</h3>
              <p className="text-sm text-gray-500 mb-4">Beechcraft Baron, Piper Seneca, Cessna 310, and more</p>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600">List Your Aircraft <ArrowRight className="w-4 h-4" /></span>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 max-w-5xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-10" style={{ fontFamily: "'Playfair Display', serif" }}>Why Sell With Us</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            "Nationwide buyer network",
            "Professional photography assistance",
            "Market-based pricing strategy",
            "Full transaction management",
            "Pre-purchase inspection coordination",
            "Title & escrow handling",
          ].map(b => (
            <div key={b} className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl">
              <CheckCircle className="w-5 h-5 text-amber-500 shrink-0" />
              <span className="text-sm text-gray-700 font-medium">{b}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}