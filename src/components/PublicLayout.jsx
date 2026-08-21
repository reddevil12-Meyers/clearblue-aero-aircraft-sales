import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Menu, X, Phone, ChevronDown, LogIn } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import AffiliateBanner from '@/components/public/AffiliateBanner';

const NAV = [
  { label: 'Buy', children: [
    { label: 'Inventory', path: '/inventory' },
    { label: 'Insurance & Financing', path: '/insurance' },
  ]},
  { label: 'Sell', path: '/sell' },
  { label: 'Maintain', path: '/maintenance' },
  { label: 'About', path: '/about' },
  { label: 'News', path: '/news' },
  { label: 'Affiliates', path: '/affiliate-program' },
  { label: 'Contact', path: '/contact' },
];

export default function PublicLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [buyOpen, setBuyOpen] = useState(false);
  const [mobileBuyOpen, setMobileBuyOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const isHome = location.pathname === '/public';

  useEffect(() => {
    if (isAuthenticated && user?.role === 'employee') {
      navigate('/aircraft-assistant', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      localStorage.setItem('affiliate_ref', ref);
    }
    const rep = params.get('rep');
    if (rep) {
      localStorage.setItem('employee_ref', rep);
    }
  }, [location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const headerBg = 'bg-[#00447f]';

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${headerBg}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img
                src="https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/30c9316a8_CB-Logo-320x79-white.png"
                alt="ClearBlue Aero"
                className="h-[63px] w-auto"
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-0.5 flex-nowrap whitespace-nowrap">
              {NAV.map((item) => {
                if (item.children) {
                  const isBuyActive = item.children.some(c => location.pathname === c.path);
                  return (
                    <div
                      key={item.label}
                      className="relative"
                      onMouseEnter={() => setBuyOpen(true)}
                      onMouseLeave={() => setBuyOpen(false)}
                    >
                      <button
                        onClick={() => setBuyOpen(o => !o)}
                        className={`flex items-center gap-1 px-3 py-2 text-sm font-medium tracking-tight transition-all duration-200 rounded whitespace-nowrap ${
                          isBuyActive ? 'text-[#C9A84C]' : 'text-white/70 hover:text-white'
                        }`}
                      >
                        {item.label}
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${buyOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {buyOpen && (
                        <div className="absolute top-full left-0 pt-1 min-w-[200px]">
                          <div className="bg-white rounded-lg shadow-xl border border-gray-100 py-1">
                            {item.children.map(child => (
                              <Link
                                key={child.label}
                                to={child.path}
                                className={`block px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                                  location.pathname === child.path
                                    ? 'text-[#00447f] bg-gray-50'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-[#00447f]'
                                }`}
                              >
                                {child.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
                return (
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
                );
              })}
              <Link
                to="/login"
                className="ml-4 flex items-center gap-1.5 px-4 py-2.5 rounded text-sm font-semibold text-white border border-white/30 transition-all hover:bg-white/10"
              >
                <LogIn className="w-3.5 h-3.5" />
                Affiliate Login
              </Link>
              <a
                href="tel:+13862276840"
                className="ml-2 flex items-center gap-2 px-5 py-2.5 rounded text-sm font-semibold text-[#050d1a] transition-all hover:brightness-110"
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
            {NAV.map((item) => {
              if (item.children) {
                const isBuyActive = item.children.some(c => location.pathname === c.path);
                return (
                  <div key={item.label} className="border-b border-white/5">
                    <button
                      className="flex items-center justify-between w-full py-3 text-sm font-medium text-white/70 hover:text-white"
                      onClick={() => setMobileBuyOpen(o => !o)}
                    >
                      <span className={isBuyActive ? 'text-[#C9A84C]' : ''}>{item.label}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${mobileBuyOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {mobileBuyOpen && (
                      <div className="pl-4 pb-2 space-y-0">
                        {item.children.map(child => (
                          <Link
                            key={child.label}
                            to={child.path}
                            className="block py-2.5 text-sm text-white/60 hover:text-white"
                            onClick={() => { setMobileOpen(false); setMobileBuyOpen(false); }}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className="block py-3 text-sm font-medium text-white/70 hover:text-white border-b border-white/5"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              to="/login"
              className="flex items-center gap-1.5 py-3 text-sm font-semibold text-white border-b border-white/5"
              onClick={() => setMobileOpen(false)}
            >
              <LogIn className="w-4 h-4" /> Affiliate Login
            </Link>
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
        <AffiliateBanner />
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#00447f] text-white border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
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
              {NAV.flatMap((item) =>
                item.children
                  ? item.children.map(child => (
                      <Link key={child.label} to={child.path} className="block text-sm text-white/50 hover:text-white transition-colors">
                        {child.label}
                      </Link>
                    ))
                  : (
                    <Link key={item.label} to={item.path} className="block text-sm text-white/50 hover:text-white transition-colors">
                      {item.label}
                    </Link>
                  )
              )}
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
            <span style={{ marginTop: '75px' }}>Veteran Owned · Pilot Operated</span>
          </div>
        </div>
      </footer>
    </div>
  );
}