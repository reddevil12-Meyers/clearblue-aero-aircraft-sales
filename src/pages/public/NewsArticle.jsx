import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowRight, Phone, ArrowLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";
import NewsletterSignup from "@/components/public/NewsletterSignup";

export default function NewsArticle() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Announcement.get(id)
      .then(data => {
        setArticle(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-[#00447f] rounded-full animate-spin" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-40 px-4">
        <p className="text-lg font-bold text-[#00447f]">Article not found</p>
        <Link to="/news" className="inline-flex items-center gap-1 mt-4 text-[#00447f] font-bold text-sm hover:text-[#2a6faa]">
          <ArrowLeft className="w-4 h-4" /> Back to News
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white w-full">
      {/* Hero */}
      <div className="bg-[#00447f] py-20 px-4 text-center border-b-4 border-[#C9A84C]">
        <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">News</p>
        <h1 className="text-3xl md:text-5xl font-black text-white mb-5 max-w-3xl mx-auto">{article.title}</h1>
        <Link to="/news" className="inline-flex items-center gap-1 text-white/60 font-bold text-sm hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to News
        </Link>
      </div>

      {/* Article body */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          {article.image_url && (
            <div className="w-full aspect-video bg-gray-100 mb-8 rounded-xl overflow-hidden">
              <img src={article.image_url} alt={article.title} className="w-full h-full object-contain" />
            </div>
          )}
          {article.body && (
            <div className="text-gray-600 text-base leading-relaxed whitespace-pre-wrap">{article.body}</div>
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