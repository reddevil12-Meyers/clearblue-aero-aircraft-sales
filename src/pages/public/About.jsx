import { Link } from "react-router-dom";
import { Award, Users, Plane, Star } from "lucide-react";

export default function PublicAbout() {
  return (
    <div>
      <div className="py-20 text-white text-center" style={{ backgroundColor: '#0a1628' }}>
        <h1 className="text-5xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>About ClearBlue Aero</h1>
        <p className="text-white/60 text-xl max-w-xl mx-auto">A veteran owned, pilot operated aviation brokerage based in Florida.</p>
      </div>

      {/* Mission */}
      <section className="py-20 max-w-4xl mx-auto px-6 text-center">
        <p className="text-amber-600 text-xs font-bold uppercase tracking-widest mb-3">Our Mission</p>
        <h2 className="text-4xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
          Making Aircraft Ownership Accessible
        </h2>
        <p className="text-gray-500 text-lg leading-relaxed max-w-3xl mx-auto">
          ClearBlue Aero was founded on the belief that buying or selling an aircraft should be a straightforward, transparent experience. We bring deep aviation expertise and military discipline to every transaction, ensuring our clients receive the highest level of service and professionalism.
        </p>
      </section>

      {/* Values */}
      <section className="py-16" style={{ backgroundColor: '#f8f9fb' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Award, title: "Veteran Owned", desc: "Founded and operated by veterans who bring integrity and dedication to every deal." },
              { icon: Plane, title: "Pilot Operated", desc: "Our brokers are pilots. We speak the language and understand your needs." },
              { icon: Users, title: "Client Focused", desc: "Your goals drive every decision we make from first contact to final closing." },
              { icon: Star, title: "Full Transparency", desc: "No hidden fees, no surprises. Clear communication throughout the entire process." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-100 p-7 text-center hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#0a1628' }}>
                  <Icon className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 max-w-4xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12" style={{ fontFamily: "'Playfair Display', serif" }}>Our Services</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: "Aircraft Sales", desc: "We represent buyers and sellers of single-engine, multi-engine, and turbine aircraft throughout the United States." },
            { title: "Aircraft Acquisitions", desc: "Looking for a specific aircraft? Our team will conduct a targeted search to find the right aircraft at the right price." },
            { title: "Aircraft Appraisals", desc: "Certified appraisals for insurance, financing, estate, and litigation purposes — delivered with precision and documentation." },
            { title: "Pre-Purchase Inspections", desc: "We coordinate and attend pre-purchase inspections with qualified mechanics to protect your interests." },
            { title: "Leasing", desc: "We assist with dry and wet lease arrangements for individuals and businesses requiring flexible aircraft access." },
            { title: "Consulting", desc: "Not sure what aircraft fits your mission? Our brokers provide unbiased consulting to match you with the right platform." },
          ].map(({ title, desc }) => (
            <div key={title} className="p-6 rounded-2xl border border-gray-100 bg-white hover:shadow-md transition-shadow">
              <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-white text-center" style={{ backgroundColor: '#0a1628' }}>
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Ready to Work Together?</h2>
          <p className="text-white/60 mb-8">Whether you're buying, selling, or just exploring options — we're here to help.</p>
          <Link to="/public/contact" className="inline-block px-10 py-4 rounded-lg font-semibold text-white transition-all" style={{ backgroundColor: '#d97706' }}>
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  );
}