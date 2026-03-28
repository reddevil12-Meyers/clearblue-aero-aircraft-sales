import { Link } from 'react-router-dom';

const INSURANCE = [
  { name: 'Avemco', url: 'http://www.avemco.com/Aviation/Insurance', desc: 'For those who love to fly, Avemco® has you covered. Call us today for a quote. Personalized Service · Talk to a Specialist · Personalized Quotes.' },
  { name: 'Falcon Aviation Insurance', url: 'http://www.falconinsurance.com/', desc: 'Falcon Aviation Insurance Agency realizes that your airplane and helicopter insurance needs are unique, which is why we custom tailor your coverage to your needs.' },
  { name: 'Travers Aviation Insurance', url: 'http://www.traversaviation.com/', desc: 'Request an Online Quote Today! Over 60 Years Experience · Competitive Rates · Wide Range of Policies.' },
  { name: 'AOPA Insurance', url: 'http://insurance.aopa.org/aviation', desc: "From underwriting to claims service, we know that there's much more to you than can be captured by numbers on an actuarial table. You're always more than a number — you're a fellow aviator." },
  { name: 'USAA Aircraft Insurance For Pilots', url: 'http://www.usaa.com/inet/wc/insurance_aviation', desc: 'Aviation insurance offered through the USAA Insurance Agency. Offers protection for your aircraft, competitive rates and a personalized quote.' },
];

const FINANCE = [
  { name: 'PNC Aircraft Finance', url: 'http://www.pncaviationfinance.com' },
  { name: 'National Aircraft Finance Company', url: 'http://www.airloans.com' },
  { name: 'Dorr Aviation Credit Corporation, LLC', url: 'http://www.dorraviation.com' },
  { name: 'AOPA Aviation Finance', url: 'http://finance.aopa.org/aircraft' },
  { name: 'Red River State Bank', url: 'http://www.airloan.com' },
  { name: 'US Aircraft Financing', url: 'http://www.usaircraftfinance.com' },
  { name: 'Banterra Aircraft Financing', url: 'http://www.banterraaircraft.com' },
];

export default function PublicInsurance() {
  return (
    <div>
      <div className="bg-[#1a3a5c] text-white py-12 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Insurance & Financing</h1>
        <p className="text-blue-200">Our trusted partners for aircraft insurance and financing</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Insurance */}
        <div className="mb-12">
          <h2 className="text-center text-lg font-bold text-[#2a6aad] uppercase tracking-widest mb-8 pb-2 border-b border-[#2a6aad]/30">Insurance Companies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {INSURANCE.map(ins => (
              <div key={ins.name} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
                <h3 className="font-bold text-[#1a3a5c] mb-1">{ins.name}</h3>
                <a href={ins.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#2a6aad] hover:underline block mb-3">{ins.url.replace('http://', '').replace('https://', '')}</a>
                <p className="text-sm text-gray-600">{ins.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Finance */}
        <div>
          <h2 className="text-center text-lg font-bold text-[#2a6aad] uppercase tracking-widest mb-8 pb-2 border-b border-[#2a6aad]/30">Finance Companies</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {FINANCE.map(fin => (
              <a key={fin.name} href={fin.url} target="_blank" rel="noopener noreferrer" className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-[#2a6aad] transition text-center">
                <p className="font-semibold text-[#1a3a5c] text-sm">{fin.name}</p>
                <p className="text-xs text-[#2a6aad] mt-1">{fin.url.replace('http://', '').replace('https://', '')}</p>
              </a>
            ))}
          </div>
        </div>

        {/* Apply CTA */}
        <div className="mt-12 bg-[#1a3a5c] rounded-xl p-8 text-white text-center">
          <h3 className="text-xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Need Help Getting Started?</h3>
          <p className="text-blue-200 mb-6">Our team can help connect you with the right insurance and financing partners for your aircraft purchase.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="tel:+18502703331" className="bg-white text-[#1a3a5c] px-6 py-3 rounded-md font-semibold hover:bg-blue-50 transition">
              Call (850) 270-3331
            </a>
            <Link to="/public/contact" className="bg-[#2a6aad] text-white px-6 py-3 rounded-md font-semibold hover:bg-[#1a5a9d] transition border border-white/20">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}