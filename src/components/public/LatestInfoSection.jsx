import { Link } from "react-router-dom";
import { ArrowRight, Phone } from "lucide-react";

const MANUFACTURERS = [
  { name: "Beechcraft", url: "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/3e1406576_Beechcraft-600x169.png" },
  { name: "Cessna", url: "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/29127b365_Cesna-600x603.png" },
  { name: "Piper", url: "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/7a4adc981_Piper-600x283.png" },
  { name: "Mooney", url: "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/188573ee2_mooney-600x300.png" },
  { name: "Cirrus", url: "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/facab544e_Cirrus-600x125.png" },
  { name: "Maule", url: "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/6813a7dff_Maule-Aircraft.png" },
  { name: "Van's Aircraft", url: "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/e42f97c46_vans-aircraft-600.png" },
  { name: "Waco", url: "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/f3f4d33aa_waco-aircraft-logo-600x100.png" },
  { name: "Grumman", url: "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/2d7570271_Grumman_logo-600x.png" }
];

export default function LatestInfoSection({ announcements }) {
  const featured = announcements[0];
  const rest = announcements.slice(1, 3);

  return (
    <section>
      {/* News band — featured announcement + compact headline list */}
      <div className="bg-[#00447f] py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="font-bold uppercase tracking-widest mb-6 text-lg text-[hsl(var(--card))]">Latest Info and More</p>

          <div className="grid lg:grid-cols-2 gap-6 items-start">
            {featured ? (
              <div className="bg-white rounded-xl overflow-hidden border border-gray-200 flex flex-col sm:flex-row">
                {featured.image_url &&
                  <div className="sm:w-44 shrink-0 bg-gray-100 flex items-center justify-center p-3">
                    <img src={featured.image_url} alt={featured.title} loading="lazy" className="w-full aspect-video object-contain" />
                  </div>
                }
                <div className="p-5 text-left flex-1">
                  <h3 className="font-black text-[#00447f] text-xl mb-2">{featured.title}</h3>
                  {featured.body &&
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {featured.body.length > 200 ? `${featured.body.slice(0, 200).trim()}…` : featured.body}
                    </p>
                  }
                  <Link to="/news" className="inline-flex items-center gap-1 mt-3 text-[#00447f] font-bold text-sm hover:text-[#2a6faa] transition-colors">
                    Read more <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-white/50 text-sm">Check back soon for the latest news and announcements.</p>
            )}

            {rest.length > 0 && (
              <ul className="space-y-3">
                {rest.map((ann) => (
                  <li key={ann.id}>
                    <Link
                      to="/news"
                      className="flex items-center justify-between gap-3 bg-white/5 hover:bg-white/10 rounded-lg px-4 py-3 transition-colors"
                    >
                      <span className="text-white font-semibold text-sm">{ann.title}</span>
                      <ArrowRight className="w-4 h-4 text-[#C9A84C] shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-wrap gap-4 justify-center lg:justify-start mt-8">
            <Link to="/inventory" className="flex items-center gap-2 px-6 py-3 rounded font-bold text-sm transition-all hover:brightness-110" style={{ backgroundColor: '#C9A84C', color: '#00447f' }}>
              Explore Our Listings <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/contact" className="flex items-center gap-2 px-6 py-3 rounded font-bold text-sm border border-white text-white hover:bg-white hover:text-[#00447f] transition-all">
              <Phone className="w-4 h-4" /> Contact Us Today
            </Link>
          </div>
        </div>
      </div>

      {/* Black manufacturer banner */}
      <div className="bg-black py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {MANUFACTURERS.map((m) => (
            <img key={m.name} src={m.url} alt={`${m.name} logo`} loading="lazy" className="h-8 w-auto max-w-[110px] object-contain opacity-80 hover:opacity-100 transition-opacity" />
          ))}
        </div>
      </div>
    </section>
  );
}