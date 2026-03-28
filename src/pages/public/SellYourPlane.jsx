import { Link } from 'react-router-dom';
import { FileText, CheckCircle } from 'lucide-react';

const PARTNERS = [
  { name: 'Lima Bravo Aviation', url: 'https://limabravoaviation.com' },
  { name: 'Columbus Aero Service', url: 'http://www.columbusaeroservice.com' },
  { name: 'Gann Aviation', url: 'http://www.gannaviation.com' },
  { name: 'Beechcraft Buyers', url: 'http://www.beechcraftbuyersandsellers.com' },
  { name: 'Banterra Aircraft Financing', url: 'http://www.banterraaircraft.com' },
  { name: 'Falcon Insurance', url: 'http://www.falconinsurance.com' },
];

export default function PublicSellYourPlane() {
  return (
    <div>
      <div className="bg-[#1a3a5c] text-white py-12 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Tell Us a Little About Your Plane</h1>
      </div>

      <section className="py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-[#2a6aad] text-lg font-medium leading-relaxed">
              Looking to upgrade or downgrade? Selling because it's time?<br />
              Or, tried selling alone with poor results?<br />
              <strong>Search no more, ClearBlue Aero is here to assist.</strong>
            </p>
          </div>

          {/* Entry Form Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            <Link to="/public/sell/single-engine" className="flex items-center gap-3 bg-[#2a6aad] text-white px-6 py-5 rounded-xl font-semibold text-lg hover:bg-[#1a5a9d] transition shadow-md">
              <FileText className="w-6 h-6" />
              Single Engine Entry Form
            </Link>
            <Link to="/public/sell/twin-engine" className="flex items-center gap-3 bg-[#1a3a5c] text-white px-6 py-5 rounded-xl font-semibold text-lg hover:bg-[#0f2a45] transition shadow-md">
              <FileText className="w-6 h-6" />
              Twin Engine Entry Form
            </Link>
          </div>

          <div className="prose max-w-none text-gray-600 text-base leading-relaxed space-y-4 mb-12">
            <p>
              Most experienced airplane owners who have bought and sold aircraft will tell you the process is no easy task. Let ClearBlue Aero's experienced and professional staff — who are not only pilots and aircraft owners just like you, but also well versed in both factory and experimental type aircraft — save you time and money.
            </p>
            <p>
              From appraisals, marketing, and ultimate sales, our team has you covered. Using well-developed and maintained communication connections and a nose for sniffing out the right buyer, we will bring the best possible sales opportunity to your door for maximum closure rates.
            </p>
          </div>

          <div className="bg-[#e8f0f8] rounded-xl p-6 border border-[#2a6aad]/20">
            <p className="text-[#2a6aad] font-semibold text-center mb-3">Superior Customer Service. Experienced Aviators. And pricing that will put you at ease.</p>
            <p className="text-center text-gray-600">
              <strong>Get started with ClearBlue Aero today!</strong> Call <a href="tel:8502703331" className="text-[#1a3a5c] font-bold">(850) 270-3331</a> or complete the short questionnaire to get started immediately.
            </p>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-10 px-4 bg-[#f5f8fc] border-t border-gray-200">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-lg font-bold text-[#1a3a5c] mb-6 tracking-wider uppercase">Please Take a Moment to Visit Our Trusted Partners</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {PARTNERS.map(p => (
              <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-[#1a3a5c]/20 rounded-lg text-sm font-medium text-[#1a3a5c] hover:bg-[#1a3a5c] hover:text-white transition">
                {p.name}
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}