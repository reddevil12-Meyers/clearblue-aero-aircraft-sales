import { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { CheckCircle, Loader2, ArrowLeft } from 'lucide-react';

const US_STATES = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
    {children}
  </div>
);

const Input = ({ ...props }) => (
  <input {...props} className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#2a6aad] focus:ring-1 focus:ring-[#2a6aad]" />
);

const Select = ({ children, ...props }) => (
  <select {...props} className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#2a6aad] bg-white">
    {children}
  </select>
);

export default function AircraftEntryForm({ engineType = 'single' }) {
  const isTwin = engineType === 'twin';
  const title = isTwin ? 'Twin Engine Aircraft Listing Form' : 'Single Engine Aircraft Listing Form';

  const [form, setForm] = useState({
    // General Info
    asking_price: '', year_make_model: '', registration: '', serial_number: '',
    ifr_equipped: '', ifr_current: '', annual_current: '', expire_date: '',
    log_books: '', hangared: '', location: '',
    // Airframe & Engine
    total_time: '', year_painted: '', exterior_condition: '', interior_condition: '',
    engine: '', engine_time: '', propeller: '', propeller_time: '',
    damage_history: '', damage_details: '',
    // Avionics
    avionics: '', standard_equipment: '',
    // Listing
    currently_listed: '', listed_where: '',
    // Owner
    first_name: '', last_name: '', company: '', address: '', city: '', state: '', zip: '',
    email: '', phone: '', remarks: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    // Parse year/make/model
    const parts = form.year_make_model.trim().split(/\s+/);
    const year = parts[0] ? parseInt(parts[0]) : null;
    const make = parts[1] || 'Other';
    const model = parts.slice(2).join(' ') || form.year_make_model;

    const payload = {
      owner: {
        full_name: `${form.first_name} ${form.last_name}`.trim(),
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        state: form.state,
        zip: form.zip,
        company: form.company,
        remarks: form.remarks,
      },
      aircraft: {
        asking_price: form.asking_price,
        registration: form.registration,
        serial_number: form.serial_number,
        year, make, model,
        total_time: form.total_time,
        year_painted: form.year_painted,
        exterior_condition: form.exterior_condition,
        interior_condition: form.interior_condition,
        engine: form.engine,
        engine_time: form.engine_time,
        engine_type: 'Piston',
        num_engines: isTwin ? 2 : 1,
        propeller: form.propeller,
        propeller_time: form.propeller_time,
        damage_history: form.damage_history === 'Yes',
        damage_details: form.damage_details,
        avionics: form.avionics,
        standard_equipment: form.standard_equipment,
        location: form.location,
        ifr_equipped: form.ifr_equipped,
        ifr_current: form.ifr_current,
        annual_current: form.annual_current,
        expire_date: form.expire_date,
        log_books: form.log_books,
        hangared: form.hangared,
      },
    };

    const res = await base44.functions.invoke('submitListing', payload);
    if (res.data?.success) {
      setSuccess(true);
    } else {
      setError('There was an issue submitting the form. Please call us at (850) 270-3331.');
    }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-[#1a3a5c] mb-3">Thank You!</h2>
        <p className="text-gray-600 mb-6">Your aircraft listing request has been received. A member of the ClearBlue Aero team will be in touch with you shortly.</p>
        <Link to="/public/sell" className="bg-[#1a3a5c] text-white px-6 py-3 rounded-md font-semibold hover:bg-[#0f2a45] transition inline-block">
          Back to Sell Your Plane
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-[#1a3a5c] text-white py-12 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <Link to="/public/sell" className="flex items-center gap-1 text-blue-200 hover:text-white text-sm mb-4 justify-center">
            <ArrowLeft className="w-4 h-4" /> Back to Sell Your Plane
          </Link>
          <h1 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>{title}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <form onSubmit={handleSubmit} className="space-y-10">

          {/* General Information */}
          <section>
            <h2 className="text-lg font-bold text-[#2a6aad] uppercase tracking-wide border-b border-[#2a6aad]/30 pb-2 mb-6">General Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Suggested Sale Price">
                <Input placeholder="Leave blank if unknown" value={form.asking_price} onChange={set('asking_price')} />
                <p className="text-xs text-gray-400 mt-1">If you have a price in mind let us know. If not, that's what we're here for.</p>
              </Field>
              <Field label="Aircraft Year / Make / Model" required>
                <Input required placeholder="e.g. 1978 Cessna 172N" value={form.year_make_model} onChange={set('year_make_model')} />
              </Field>
              <Field label="Registration Number" required>
                <Input required placeholder="e.g. N12345" value={form.registration} onChange={set('registration')} />
              </Field>
              <Field label="Serial Number">
                <Input value={form.serial_number} onChange={set('serial_number')} />
              </Field>
              <Field label="IFR Equipped">
                <Select value={form.ifr_equipped} onChange={set('ifr_equipped')}>
                  <option value="">Select</option>
                  <option>Yes</option><option>No</option>
                </Select>
              </Field>
              <Field label="IFR Current">
                <Select value={form.ifr_current} onChange={set('ifr_current')}>
                  <option value="">Select</option>
                  <option>Yes</option><option>No</option>
                </Select>
              </Field>
              <Field label="Is Annual Current?" required>
                <Select required value={form.annual_current} onChange={set('annual_current')}>
                  <option value="">Select</option>
                  <option>Yes</option><option>No</option>
                </Select>
              </Field>
              <Field label="Expire Date">
                <Input type="date" value={form.expire_date} onChange={set('expire_date')} />
              </Field>
              <Field label="Log Books?" required>
                <Select required value={form.log_books} onChange={set('log_books')}>
                  <option value="">Select</option>
                  <option>Yes</option><option>No</option>
                </Select>
              </Field>
              <Field label="Hangared?" required>
                <Select required value={form.hangared} onChange={set('hangared')}>
                  <option value="">Select</option>
                  <option>Yes</option><option>No</option>
                </Select>
              </Field>
              <div className="md:col-span-2">
                <Field label="Aircraft Location (Airport)" required>
                  <Input required placeholder="e.g. KVPS - Destin-Fort Walton Beach Airport" value={form.location} onChange={set('location')} />
                </Field>
              </div>
            </div>
          </section>

          {/* Airframe & Engine */}
          <section>
            <h2 className="text-lg font-bold text-[#2a6aad] uppercase tracking-wide border-b border-[#2a6aad]/30 pb-2 mb-6">Airframe & Engine</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Airframe Total Time">
                <Input placeholder="Hours" type="number" value={form.total_time} onChange={set('total_time')} />
              </Field>
              <Field label="Year Painted">
                <Input placeholder="e.g. 2020" type="number" value={form.year_painted} onChange={set('year_painted')} />
              </Field>
              <Field label="Exterior Condition" required>
                <Select required value={form.exterior_condition} onChange={set('exterior_condition')}>
                  <option value="">Select</option>
                  {['New/Refurbished','Excellent','Good','Fair','Poor'].map(v => <option key={v}>{v}</option>)}
                </Select>
              </Field>
              <Field label="Interior Condition" required>
                <Select required value={form.interior_condition} onChange={set('interior_condition')}>
                  <option value="">Select</option>
                  {['New/Refurbished','Excellent','Good','Fair','Poor'].map(v => <option key={v}>{v}</option>)}
                </Select>
              </Field>
              <Field label="Engine (Make/Model)">
                <Input placeholder="Engine Type / Model" value={form.engine} onChange={set('engine')} />
              </Field>
              <Field label="Engine Time">
                <Input placeholder="SNEW or SMOH" value={form.engine_time} onChange={set('engine_time')} />
              </Field>
              <Field label="Propeller">
                <Input placeholder="Propeller Manufacturer" value={form.propeller} onChange={set('propeller')} />
              </Field>
              <Field label="Propeller Time">
                <Input placeholder="SNEW or SMOH" value={form.propeller_time} onChange={set('propeller_time')} />
              </Field>
              <Field label="Damage History?">
                <Select value={form.damage_history} onChange={set('damage_history')}>
                  <option value="">Select</option>
                  <option>No</option><option>Yes</option>
                </Select>
              </Field>
              {form.damage_history === 'Yes' && (
                <div className="md:col-span-2">
                  <Field label="Damage Description">
                    <textarea rows={3} className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#2a6aad] resize-none" value={form.damage_details} onChange={set('damage_details')} />
                  </Field>
                </div>
              )}
            </div>
          </section>

          {/* Avionics */}
          <section>
            <h2 className="text-lg font-bold text-[#2a6aad] uppercase tracking-wide border-b border-[#2a6aad]/30 pb-2 mb-6">Avionics & Equipment</h2>
            <div className="space-y-4">
              <Field label="List Avionics">
                <textarea rows={3} className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#2a6aad] resize-none" value={form.avionics} onChange={set('avionics')} />
              </Field>
              <Field label="Standard Equipment">
                <textarea rows={3} className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#2a6aad] resize-none" value={form.standard_equipment} onChange={set('standard_equipment')} />
              </Field>
            </div>
          </section>

          {/* Listing Data */}
          <section>
            <h2 className="text-lg font-bold text-[#2a6aad] uppercase tracking-wide border-b border-[#2a6aad]/30 pb-2 mb-6">Listing Data</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Is Your Aircraft Currently Listed?" required>
                <Select required value={form.currently_listed} onChange={set('currently_listed')}>
                  <option value="">Select</option>
                  <option>Yes</option><option>No</option>
                </Select>
              </Field>
              {form.currently_listed === 'Yes' && (
                <Field label="If so, where and/or with who?">
                  <Input value={form.listed_where} onChange={set('listed_where')} />
                </Field>
              )}
            </div>
          </section>

          {/* Owner Information */}
          <section>
            <h2 className="text-lg font-bold text-[#2a6aad] uppercase tracking-wide border-b border-[#2a6aad]/30 pb-2 mb-6">Owner Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="First Name"><Input value={form.first_name} onChange={set('first_name')} /></Field>
              <Field label="Last Name"><Input value={form.last_name} onChange={set('last_name')} /></Field>
              <div className="md:col-span-2">
                <Field label="Company Name"><Input value={form.company} onChange={set('company')} /></Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Street Address" required><Input required placeholder="e.g. 123 Main St" value={form.address} onChange={set('address')} /></Field>
              </div>
              <Field label="City" required><Input required value={form.city} onChange={set('city')} /></Field>
              <Field label="State" required>
                <Select required value={form.state} onChange={set('state')}>
                  <option value="">Select State</option>
                  {US_STATES.map(s => <option key={s}>{s}</option>)}
                </Select>
              </Field>
              <Field label="Zip Code" required><Input required value={form.zip} onChange={set('zip')} /></Field>
              <Field label="Email Address" required><Input required type="email" value={form.email} onChange={set('email')} /></Field>
              <Field label="Phone Number" required><Input required value={form.phone} onChange={set('phone')} /></Field>
              <div className="md:col-span-2">
                <Field label="Remarks">
                  <textarea rows={4} className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#2a6aad] resize-none" value={form.remarks} onChange={set('remarks')} />
                </Field>
              </div>
            </div>
          </section>

          {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3">{error}</p>}

          <button type="submit" disabled={submitting} className="w-full bg-[#1a3a5c] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#0f2a45] transition flex items-center justify-center gap-2 disabled:opacity-60">
            {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</> : 'Submit Listing Request'}
          </button>
        </form>
      </div>
    </div>
  );
}