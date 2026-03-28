import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Plane, Search, Filter } from 'lucide-react';

export default function PublicInventory() {
  const [aircraft, setAircraft] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    base44.entities.Aircraft.list('-created_date', 100)
      .then(data => { setAircraft(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = aircraft.filter(ac => {
    const matchesSearch = !search || `${ac.year} ${ac.make} ${ac.model} ${ac.registration}`.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || 
      (filter === 'available' && ac.status === 'Available') ||
      (filter === 'single' && ac.num_engines === 1) ||
      (filter === 'twin' && ac.num_engines >= 2) ||
      (filter === 'sold' && ac.status === 'Sold');
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      {/* Page Header */}
      <div className="bg-[#1a3a5c] text-white py-12 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Aircraft for Sale</h1>
        <p className="text-blue-200">Browse our current inventory of quality aircraft</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input placeholder="Search aircraft..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#2a6aad]" />
          </div>
          <select value={filter} onChange={e => setFilter(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#2a6aad]">
            <option value="all">All Aircraft</option>
            <option value="available">Available Only</option>
            <option value="single">Single Engine</option>
            <option value="twin">Twin Engine</option>
            <option value="sold">Sold</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-16"><div className="w-8 h-8 border-4 border-blue-200 border-t-[#1a3a5c] rounded-full animate-spin mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Plane className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No aircraft found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(ac => (
              <Link key={ac.id} to={`/public/inventory/${ac.id}`} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-[#1a3a5c] to-[#2a6aad] overflow-hidden flex items-center justify-center relative">
                  {ac.images?.[0] ? (
                    <img src={ac.images[0]} alt={ac.model} className="w-full h-full object-cover" />
                  ) : (
                    <Plane className="w-16 h-16 text-white/30" />
                  )}
                  <span className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full font-semibold ${ac.status === 'Available' ? 'bg-green-500 text-white' : ac.status === 'Under Contract' ? 'bg-amber-500 text-white' : ac.status === 'Sold' ? 'bg-gray-500 text-white' : 'bg-blue-500 text-white'}`}>
                    {ac.status}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-[#1a3a5c] text-lg">{ac.year} {ac.make} {ac.model}</h3>
                  <p className="text-sm text-gray-500 mt-1">{ac.registration} {ac.location ? `• ${ac.location}` : ''}</p>
                  <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-600">
                    {ac.total_time && <span>TT: {ac.total_time.toLocaleString()} hrs</span>}
                    {ac.engine_type && <span>{ac.engine_type}</span>}
                    {ac.avionics_suite && <span>{ac.avionics_suite}</span>}
                  </div>
                  {ac.asking_price && (
                    <p className="text-xl font-bold text-[#2a6aad] mt-3">
                      ${new Intl.NumberFormat('en-US').format(ac.asking_price)}
                    </p>
                  )}
                  <div className="mt-3 text-[#2a6aad] text-sm font-medium hover:underline">View Details →</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}