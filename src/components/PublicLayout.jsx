import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Menu, X, Phone, Mail, Facebook } from 'lucide-react';

const NAV = [
  { label: 'Home', path: '/public' },
  {
    label: 'Aircraft for Sale', path: '/public/inventory',
    children: [
      { label: 'Single Engine Inventory', path: '/public/inventory?type=single' },
      { label: 'Twin Engine Inventory', path: '/public/inventory?type=twin' },
    ]
  },
  { label: 'Sell Your Plane', path: '/public/sell' },
  {
    label: 'Resources', path: '#',
    children: [
      { label: 'Insurance & Financing', path: '/public/insurance' },
    ]
  },
  { label: 'About', path: '/public/about' },
  { label: 'Contact', path: '/public/contact' },
];

export default function PublicLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Top Bar */}
      <div style={{ backgroundColor: '#0a1628' }} className="text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-5">
            <a href="tel:+13862276840" className="flex items-center gap-1.5 hover:text-amber-300 transition-colors">
              <Phone className="w-3 h-3" /> (386) 227-6840
            </a>
            <a href="mailto:sales@flyclearblue.com" className="flex items-center gap-1.5 hover:text-amber-300 transition-colors">
              <Mail className="w-3 h-3" /> sales@flyclearblue.com
            </a>
            <span className="text-white/50">Monday – Friday 8 AM – 6 PM</span>
          </div>
          <a href="https://www.facebook.com/clearblueaero/" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition-colors">
            <Facebook className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/public" className="flex items-center">
            <img src="https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/9dc8b6aa8_logo-01.png" alt="ClearBlue Aero" className="h-[60px] w-auto" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map(item => (
              <div key={item.label} className="relative group">
                <Link
                  to={item.path !== '#' ? item.path : location.pathname}
                  className={`px-4 py-2 text-sm font-medium tracking-wide transition-colors rounded ${
                    location.pathname === item.path
                      ? 'text-amber-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="absolute top-full left-0 bg-white shadow-xl border border-gray-100 rounded-lg py-2 min-w-[220px] hidden group-hover:block z-50 mt-1">
                    {item.children.map(child => (
                      <Link
                        key={child.label}
                        to={child.path}
                        className="block px-5 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link
              to="/public/contact"
              className="ml-3 px-5 py-2 text-sm font-semibold text-white rounded-lg transition-colors"
              style={{ backgroundColor: '#0a1628' }}
            >
              Get in Touch
            </Link>
          </nav>

          <button className="lg:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6 text-gray-800" /> : <Menu className="w-6 h-6 text-gray-800" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t bg-white px-6 py-4 space-y-1">
            {NAV.map(item => (
              <div key={item.label}>
                <Link
                  to={item.path !== '#' ? item.path : location.pathname}
                  className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
                  onClick={() => !item.children && setMobileOpen(false)}
                >
                  {item.label}
                </Link>
                {item.children && item.children.map(child => (
                  <Link
                    key={child.label}
                    to={child.path}
                    className="block pl-7 py-2 text-sm text-gray-500 hover:text-gray-700"
                    onClick={() => setMobileOpen(false)}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: '#0a1628' }} className="text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-10">
          <div>
            <img src="https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/9dc8b6aa8_logo-01.png" alt="ClearBlue Aero" className="h-14 w-auto mb-4 brightness-0 invert" />
            <p className="text-sm text-white/50 leading-relaxed">Aircraft Sales · Acquisitions · Leasing<br />A Veteran Owned Business</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">Navigation</p>
            <div className="space-y-2">
              {NAV.filter(n => n.path !== '#').map(item => (
                <Link key={item.label} to={item.path} className="block text-sm text-white/60 hover:text-white transition-colors">{item.label}</Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">Contact</p>
            <div className="space-y-2 text-sm text-white/60">
              <p><a href="tel:+13862276840" className="hover:text-white transition-colors">(386) 227-6840</a></p>
              <p><a href="mailto:sales@flyclearblue.com" className="hover:text-white transition-colors">sales@flyclearblue.com</a></p>
              <p className="text-white/40">Mon – Fri, 8 AM – 6 PM</p>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-5 flex flex-wrap items-center justify-between gap-2 text-xs text-white/30">
            <span>© {new Date().getFullYear()} ClearBlue Aero, Inc. All Rights Reserved.</span>
            <a href="https://www.facebook.com/clearblueaero/" target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition-colors">Facebook</a>
          </div>
        </div>
      </footer>
    </div>
  );
}