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

export default function LatestInfoSection({ announcements = [] }) {
  const featured = announcements[0];
  const headlines = announcements.slice(1, 3);
  const teaser = featured?.body && featured.body.length > 160
    ? featured.body.slice(0, 160).trim() + '…'
    : featured?.body;

  return (
    <section className="py-12 lg:py-14 bg-[#00447f]">
      <div className="max-w-7xl mx-auto px-4">
        <p className="font-bold uppercase tracking-widest mb-6 text-lg text-white">LATEST INFO AND MORE</p>
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left: featured announcement + headline list */}
          <div>
            {featured ? (
              <>
                <Link
                  to="/news"
                  className="block bg-white rounded-xl p-5 flex items-center gap-5 hover:shadow-xl transition-shadow"
                >
                  {featured.image_url && (
                    <div className="w-28 shrink-0 rounded-lg bg-gray-100 flex items-center justify-center p-2">
                      <img
                        src={featured.image_url}
                        alt={featured.title}
                        loading="lazy"
                        className="w-full aspect-square object-contain"
                      />
                    </div>
                  )}
                  <div className="min-w-0 text-left">
                    <h3 className="font-black text-[#00447f] text-xl mb-1">{featured.title}</h3>
                    {teaser && (
                      <p className="text-gray-600 text-sm leading-relaxed">{teaser}</p>
                    )}
                  </div>
                </Link>
                {headlines.length > 0 && (
                  <ul className="mt-5 space-y-3">
                    {headlines.map((ann) => (
                      <li key={ann.id}>
                        <Link
                          to="/news"
                          className="flex items-center gap-3 text-white text-sm font-medium hover:text-[#C9A84C] transition-colors"
                        >
                          <span className="w-2 h-2 rounded-full bg-white shrink-0" />
                          {ann.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <p className="text-white/50 text-sm">Check back soon for the latest news and announcements.</p>
            )}
            <div className="flex flex-wrap gap-4 mt-6">
              <Link
                to="/inventory"
                className="flex items-center gap-2 px-7 py-3.5 rounded font-bold text-sm transition-all hover:brightness-110"
                style={{ backgroundColor: '#C9A84C', color: '#00447f' }}
              >
                Explore Our Listings <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="flex items-center gap-2 px-7 py-3.5 rounded font-bold text-sm text-white border border-white/60 hover:bg-white/10 transition-all"
              >
                <Phone className="w-4 h-4" /> Contact Us Today
              </Link>
            </div>
          </div>

          {/* Right: manufacturer logo wall */}
          <div className="grid grid-cols-3 gap-3">
            {MANUFACTURERS.map((m) => (
              <div key={m.name} className="aspect-[3/2] bg-black rounded-lg flex items-center justify-center p-3">
                <img
                  src={m.url}
                  alt={`${m.name} logo`}
                  loading="lazy"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}