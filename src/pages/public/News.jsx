import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Phone, Newspaper } from "lucide-react";
import { base44 } from "@/api/base44Client";
import NewsletterSignup from "@/components/public/NewsletterSignup";

export default function PublicNews() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Announcement.list('sort_order', 200)
      .then(data => {
        setItems(data.filter(a => a.active));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white w-full">
      {/* Hero */}
      <div className="bg-[#00447f] py-24 px-4 text-center border-b-4 border-[#C9A84C]">
        <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">Stay Updated</p>
        <h1 className="text-4xl md:text-6xl font-black text-white mb-5">News & Announcements</h1>
        <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
          The latest news, announcements, and updates from ClearBlue Aero.
        </p>
      </div>

      {/* News list */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-[#00447f] rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Newspaper className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium text-gray-500">No news articles yet</p>
              <p className="text-sm mt-1">Check back soon for the latest updates.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {items.map((ann) => (
                <article key={ann.id} className="bg-[#f5f6f8] rounded-2xl overflow-hidden border border-gray-100">
                  {ann.image_url && (
                    <div className="w-full aspect-video bg-gray-100">
                      <img src={ann.image_url} alt={ann.title} className="w-full h-full object-contain" />
                    </div>
                  )}
                  <div className="p-6 text-left">
                    <h2 className="font-black text-[#00447f] text-xl mb-3">{ann.title}</h2>
                    {ann.body && (
                      <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{ann.body}</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <NewsletterSignup />

      {/* CTA */}
      <section className="py-20 bg-[#00447f] text-center px-4">
        <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-5">Let's Talk</p>
        <h2 className="text-4xl md:text-5xl font-black text-white mb-5">Ready to Buy or Sell?</h2>
        <p className="text-white/40 text-lg max-w-xl mx-auto mb-10">
          Our team is standing by to help you find your next aircraft or sell your current one — fast, professionally, and at the right price.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/contact" className="flex items-center gap-2 px-8 py-4 rounded font-bold text-sm transition-all hover:brightness-110" style={{ backgroundColor: '#C9A84C', color: '#00447f' }}>
            Get in Touch <ArrowRight className="w-4 h-4" />
          </Link>
          <a href="tel:+13862276840" className="flex items-center gap-2 px-8 py-4 rounded font-bold text-white text-sm border border-white/20 hover:bg-white/10 transition-all">
            <Phone className="w-4 h-4" /> (386) 227-6840
          </a>
        </div>
      </section>
    </div>
  );
}