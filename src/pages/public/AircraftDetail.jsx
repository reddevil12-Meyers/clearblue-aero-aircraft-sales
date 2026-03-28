import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Plane, ArrowLeft, Phone, Mail, CheckCircle } from 'lucide-react';

export default function PublicAircraftDetail() {
  const { id } = useParams();
  const [ac, setAc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    base44.entities.Aircraft.filter({ id }, '-created_date', 1)
      .then(data => { setAc(data[0] || null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center py-32"><div className="w-8 h-8 border-4 border-blue-200 border-t-[#1a3a5c] rounded-full animate-spin" /></div>;
  if (!ac) return <div className="text-center py-20 text-gray-500">Aircraft not found.</div>;

  const specs = [
    { label: 'Registration', value: ac.registration },
    { label: 'Year', value: ac.year },
    { label: 'Make', value: ac.make },
    { label: 'Model', value: ac.model },
    { label: 'Serial Number', value: ac.serial_number },
    { label: 'Total Time', value: ac.total_time ? `${ac.total_time.toLocaleString()} hrs` : null },
    { label: 'Engine Time SMOH', value: ac.engine_time_smoh ? `${ac.engine_time_smoh.toLocaleString()} hrs` : null },
    { label: 'Engine Type', value: ac.engine_type },
    { label: 'Propeller Time', value: ac.propeller_time ? `${ac.propeller_time.toLocaleString()} hrs` : null },
    { label: 'Avionics', value: ac.avionics_suite },
    { label: 'Interior Condition', value: ac.interior_condition },
    { label: 'Exterior Condition', value: ac.exterior_condition },
    { label: 'Location', value: ac.location },
    { label: 'ADS-B Compliant', value: ac.adsb_compliant ? 'Yes' : null },
  ].filter(s => s.value);

  return (
    <div>
      <div className="bg-[#1a3a5c] text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <Link to="/public/inventory" className="flex items-center gap-1 text-blue-200 hover:text-white text-sm mb-3">
            <ArrowLeft className="w-4 h-4" /> Back to Inventory
          </Link>
          <h1 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
            {ac.year} {ac.make} {ac.model}
          </h1>
          <p className="text-blue-200 mt-1">{ac.registration} {ac.location ? `• ${ac.location}` : ''}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Images + Specs */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl overflow-hidden bg-gradient-to-br from-[#1a3a5c] to-[#2a6aad] h-72 flex items-center justify-center">
              {ac.images?.length > 0 ? (
                <img src={ac.images[activeImg]} alt={ac.model} className="w-full h-full object-cover" />
              ) : (
                <Plane className="w-20 h-20 text-white/30" />
              )}
            </div>
            {ac.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {ac.images.map((img, i) => (
                  <img key={i} src={img} alt="" onClick={() => setActiveImg(i)} className={`w-20 h-14 object-cover rounded-md cursor-pointer border-2 ${i === activeImg ? 'border-[#2a6aad]' : 'border-transparent'}`} />
                ))}
              </div>
            )}

            <div>
              <h2 className="text-xl font-bold text-[#1a3a5c] mb-4">Aircraft Specifications</h2>
              <div className="grid grid-cols-2 gap-3">
                {specs.map(s => (
                  <div key={s.label} className="bg-[#f5f8fc] rounded-lg px-4 py-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">{s.label}</p>
                    <p className="font-semibold text-[#1a3a5c] mt-0.5">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {ac.avionics_details && (
              <div>
                <h3 className="font-semibold text-[#1a3a5c] mb-2">Avionics Details</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{ac.avionics_details}</p>
              </div>
            )}
            {ac.notes && (
              <div>
                <h3 className="font-semibold text-[#1a3a5c] mb-2">Additional Notes</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{ac.notes}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className={`text-sm px-3 py-1 rounded-full font-semibold ${ac.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{ac.status}</span>
              </div>
              {ac.asking_price && (
                <p className="text-3xl font-bold text-[#1a3a5c] mb-4">
                  ${new Intl.NumberFormat('en-US').format(ac.asking_price)}
                </p>
              )}
              <div className="space-y-3">
                <a href="tel:+18502703331" className="flex items-center gap-2 w-full bg-[#1a3a5c] text-white py-3 px-4 rounded-md font-semibold hover:bg-[#0f2a45] transition justify-center">
                  <Phone className="w-4 h-4" /> Call (850) 270-3331
                </a>
                <Link to="/public/contact" className="flex items-center gap-2 w-full bg-[#2a6aad] text-white py-3 px-4 rounded-md font-semibold hover:bg-[#1a5a9d] transition justify-center">
                  <Mail className="w-4 h-4" /> Contact Us
                </Link>
              </div>
            </div>

            <div className="bg-[#f5f8fc] rounded-xl p-5 border border-gray-200">
              <h3 className="font-semibold text-[#1a3a5c] mb-3">Why ClearBlue Aero?</h3>
              {['Experienced Aviators', 'Professional Service', '24/7 Availability', 'Trusted Network'].map(item => (
                <div key={item} className="flex items-center gap-2 py-1.5">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  <span className="text-sm text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}