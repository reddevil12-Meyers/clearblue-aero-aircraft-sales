import { Link } from "react-router-dom";
import { ArrowRight, Plane } from "lucide-react";

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
      {/* News band — three mini cards */}
      <div className="bg-[#00447f] py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="font-bold uppercase tracking-widest mb-8 text-lg text-white text-center">Latest Info and More</p>

          {announcements.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {announcements.slice(0, 3).map((ann) => (
                <div key={ann.id} className="bg-white rounded-xl overflow-hidden border border-gray-200 border-t-4 border-t-[#C9A84C] flex flex-col">
                  {ann.image_url ? (
                    <img src={ann.image_url} alt={ann.title} loading="lazy" className="w-full aspect-video object-cover" />
                  ) : (
                    <div className="w-full aspect-video bg-gray-100 flex items-center justify-center">
                      <Plane className="w-10 h-10 text-gray-300" />
                    </div>
                  )}
                  <div className="p-5 text-left flex-1">
                    <h3 className="font-black text-[#00447f] text-lg mb-2">{ann.title}</h3>
                    {ann.body &&
                      <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                        {ann.body.length > 140 ? `${ann.body.slice(0, 140).trim()}…` : ann.body}
                      </p>
                    }
                    <Link to="/news" className="inline-flex items-center gap-1 mt-3 text-[#00447f] font-bold text-sm hover:text-[#2a6faa] transition-colors">
                      Read more <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/50 text-sm text-center">Check back soon for the latest news and announcements.</p>
          )}
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