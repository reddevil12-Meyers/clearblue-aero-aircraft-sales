import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

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
  return (
    <section>
      {/* News band — slim single-row ticker of headlines */}
      <div className="bg-[#00447f] py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:gap-10">
          <p className="font-bold uppercase tracking-widest text-xs text-white/70 whitespace-nowrap mb-4 lg:mb-0">
            Latest Info and More
          </p>

          {announcements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-8 lg:flex-1">
              {announcements.slice(0, 3).map((ann) => (
                <Link
                  key={ann.id}
                  to="/news"
                  className="group border-l-2 border-[#C9A84C] pl-3"
                >
                  <span className="block text-white font-bold text-sm leading-snug line-clamp-2 group-hover:text-[#C9A84C] transition-colors">
                    {ann.title}
                  </span>
                  <span className="inline-flex items-center gap-1 mt-1 text-white/50 text-xs font-semibold">
                    Read more <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-white/50 text-sm">Check back soon for the latest news and announcements.</p>
          )}
        </div>
      </div>

      {/* Black manufacturer banner — scrolling marquee */}
      <div className="bg-black py-6 overflow-hidden">
        <div
          className="flex items-center gap-10 w-max"
          style={{ animation: 'marquee-scroll 40s linear infinite' }}
        >
          {[...MANUFACTURERS, ...MANUFACTURERS].map((m, i) => (
            <div key={`${m.name}-${i}`} className="flex items-center justify-center shrink-0" style={{ width: 120, height: 44 }}>
              <img
                src={m.url}
                alt={`${m.name} logo`}
                loading="lazy"
                style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', objectFit: 'contain', display: 'block' }}
                className="opacity-80 hover:opacity-100 transition-opacity"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}