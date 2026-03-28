import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Menu, X, Phone, Mail, Clock, Facebook, ChevronDown } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col bg-white font-sans">
      {/* Top Bar */}
      <div className="bg-[#1a3a5c] text-white text-sm py-2 px-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> +1.850.270.3331</span>
            <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> sales@flyclearblue.com</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Monday – Friday 8 AM – 6 PM</span>
          </div>
          <a href="https://www.facebook.com/clearblueaero/" target="_blank" rel="noopener noreferrer">
            <Facebook className="w-4 h-4 hover:text-blue-300" />
          </a>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/public" className="flex items-center gap-3">
            <div className="flex flex-col leading-tight">
              <span className="text-[#1a3a5c] font-bold text-2xl tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>ClearBlue Aero</span>
              <span className="text-[#4a7aac] text-xs tracking-widest uppercase">Aircraft Sales | Acquisitions | Leasing</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map(item => (
              <div key={item.label} className="relative group">
                <Link
                  to={item.path !== '#' ? item.path : location.pathname}
                  className={`px-3 py-2 text-sm font-medium flex items-center gap-1 rounded transition-colors ${location.pathname === item.path ? 'text-[#1a3a5c] font-semibold' : 'text-gray-600 hover:text-[#1a3a5c]'}`}
                >
                  {item.label}
                  {item.children && <ChevronDown className="w-3 h-3" />}
                </Link>
                {item.children && (
                  <div className="absolute top-full left-0 bg-white shadow-lg border border-gray-100 rounded-md py-1 min-w-[200px] hidden group-hover:block z-50">
                    {item.children.map(child => (
                      <Link key={child.label} to={child.path} className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#e8f0f8] hover:text-[#1a3a5c]">
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button className="lg:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6 text-[#1a3a5c]" /> : <Menu className="w-6 h-6 text-[#1a3a5c]" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="lg:hidden border-t bg-white px-4 py-3 space-y-1">
            {NAV.map(item => (
              <div key={item.label}>
                <Link
                  to={item.path !== '#' ? item.path : location.pathname}
                  className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#1a3a5c] hover:bg-[#e8f0f8] rounded"
                  onClick={() => !item.children && setMobileOpen(false)}
                >
                  {item.label}
                </Link>
                {item.children && item.children.map(child => (
                  <Link key={child.label} to={child.path} className="block pl-6 py-1.5 text-sm text-gray-500 hover:text-[#1a3a5c]" onClick={() => setMobileOpen(false)}>
                    {child.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        )}
      </header>

      {/* Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#1a3a5c] text-white py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-lg font-semibold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>ClearBlue Aero, Inc.</p>
          <p className="text-sm text-blue-200 mb-3">Aircraft Sales | Acquisitions | Leasing | A Veteran Owned Business</p>
          <div className="flex justify-center gap-6 text-sm text-blue-200 mb-4">
            <span>(850) 270-3331</span>
            <span>sales@flyclearblue.com</span>
          </div>
          <p className="text-xs text-blue-300">© {new Date().getFullYear()} ClearBlue Aero, Inc. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}