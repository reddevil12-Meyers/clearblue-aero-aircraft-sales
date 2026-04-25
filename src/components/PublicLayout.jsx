import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Menu, X, Phone, ChevronDown } from 'lucide-react';

const NAV = [
  { label: 'Aircraft for Sale', path: '/public/inventory' },
  { label: 'Maintenance', path: '/public/maintenance' },
  { label: 'Sell Your Aircraft', path: '/public/sell' },
  { label: 'Insurance & Financing', path: '/public/insurance' },
  { label: 'About', path: '/public/about' },
  { label: 'Contact', path: '/public/contact' },
];

export default function PublicLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/public';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const headerBg = 'bg-[#00447f]';

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${headerBg}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/public" className="flex items-center">
              <img
                src="https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/30c9316a8_CB-Logo-320x79-white.png"
                alt="ClearBlue Aero"
                className="h-[63px] w-auto"
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-0.5 flex-nowrap whitespace-nowrap">
              {NAV.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`px-3 py-2 text-sm font-medium tracking-tight transition-all duration-200 rounded whitespace-nowrap ${
                    location.pathname === item.path
                      ? 'text-[#C9A84C]'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <a
                href="tel:+13862276840"
                className="ml-4 flex items-center gap-2 px-5 py-2.5 rounded text-sm font-semibold text-[#050d1a] transition-all hover:brightness-110"
                style={{ backgroundColor: '#C9A84C' }}
              >
                <Phone className="w-3.5 h-3.5" />
                (386) 227-6840
              </a>
            </nav>

            {/* Mobile toggle */}
            <button
              className="lg:hidden p-2 text-white"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-[#00447f] border-t border-white/10 px-6 py-5 space-y-1">
            {NAV.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className="block py-3 text-sm font-medium text-white/70 hover:text-white border-b border-white/5"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <a
              href="tel:+13862276840"
              className="mt-3 flex items-center gap-2 py-3 text-sm font-semibold text-[#C9A84C]"
            >
              <Phone className="w-4 h-4" /> (386) 227-6840
            </a>
          </div>
        )}
      </header>

      <main className="flex-1 pt-20">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#00447f] text-white border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 grid md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <img
              src="https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/30c9316a8_CB-Logo-320x79-white.png"
              alt="ClearBlue Aero"
              className="h-10 w-auto mb-5"
            />
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              A Veteran Owned Business. Florida, USA.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-5">Navigation</p>
            <div className="space-y-3">
              {NAV.map((item) => (
                <Link key={item.label} to={item.path} className="block text-sm text-white/50 hover:text-white transition-colors">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-5">Contact</p>
            <div className="space-y-3 text-sm text-white/50">
              <p><a href="tel:+13862276840" className="hover:text-white transition-colors">(386) 227-6840</a></p>
              <p><a href="mailto:sales@flyclearblue.com" className="hover:text-white transition-colors">sales@flyclearblue.com</a></p>
              <p>Mon – Fri, 8 AM – 6 PM EST</p>
              <a href="https://www.facebook.com/clearblueaero/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors inline-block mt-2">Facebook →</a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6 flex flex-wrap items-center justify-between gap-3 text-xs text-white/20">
            <span>© {new Date().getFullYear()} ClearBlue Aero, Inc. All Rights Reserved.</span>
            <span>Veteran Owned · Pilot Operated</span>
          </div>
        </div>
      </footer>
    </div>
  );
}