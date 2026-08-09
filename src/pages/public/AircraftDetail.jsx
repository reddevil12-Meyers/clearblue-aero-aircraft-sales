import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { appParams } from "@/lib/app-params";
import { Plane, ArrowLeft, Phone, Mail, MapPin, ChevronLeft, ChevronRight, Printer, Share2, Copy, Check, ArrowRight } from "lucide-react";
import NewsletterSignup from "@/components/public/NewsletterSignup";
import JsonLd from "@/components/JsonLd";

export default function PublicAircraftDetail() {
  const { id } = useParams();
  const [aircraft, setAircraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/api/apps/${appParams.appId}/functions/aircraftSharePage?id=${id}`;

  const handleCopyLink = async () => {
    let success = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
        success = true;
      }
    } catch (_) { /* fall through to legacy method */ }

    if (!success) {
      // Fallback for non-secure contexts or iframe restrictions
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      textarea.style.pointerEvents = 'none';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        success = document.execCommand('copy');
      } catch (_) { success = false; }
      document.body.removeChild(textarea);
    }

    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };


  const handlePrint = () => {
    if (!aircraft) return;
    const printWindow = window.open('', '_blank');
    // Build the sales sheet HTML inline for the new window
    const images = aircraft.images || [];
    const avionicsSpecs = [
      { label: "Avionics Suite", value: aircraft.avionics_suite },
      { label: "Avionics Details", value: aircraft.avionics_details },
    ].filter(s => s.value);

    const airframeLeft = [
      { label: "Airframe Total Time", value: aircraft.total_time ? `${aircraft.total_time.toLocaleString()} hrs` : null },
      { label: "Exterior Condition", value: aircraft.exterior_condition },
      { label: "Interior Condition", value: aircraft.interior_condition },
      { label: "Annual Due", value: aircraft.annual_due },
      { label: "ADS-B Compliant", value: aircraft.adsb_compliant === true ? "Yes" : aircraft.adsb_compliant === false ? "No" : null },
      { label: "Factory A/C", value: aircraft.factory_air_conditioning === true ? "Yes" : null },
      ].filter(s => s.value);

    const airframeRight = [
      { label: "Engine", value: [aircraft.engine_manufacturer, aircraft.engine_model].filter(Boolean).join(" ") || aircraft.engine_type },
      { label: "Engine Type", value: aircraft.engine_type },
      { label: "Engine Time", value: aircraft.engine_time_smoh ? `${aircraft.engine_time_smoh.toLocaleString()} hrs ${aircraft.engine_time_type || 'SMOH'}` : null },
      { label: "Propeller", value: [aircraft.propeller_manufacturer, aircraft.propeller_model].filter(Boolean).join(" ") || null },
      { label: "Propeller Time", value: aircraft.propeller_time ? `${aircraft.propeller_time.toLocaleString()} hrs` : null },
      ...(aircraft.num_engines === 'Multi-Engine' ? [
        { label: "Engine 2", value: [aircraft.engine2_manufacturer, aircraft.engine2_model].filter(Boolean).join(" ") || null },
        { label: "Engine 2 Time", value: aircraft.engine2_time_smoh ? `${aircraft.engine2_time_smoh.toLocaleString()} hrs ${aircraft.engine2_time_type || 'SMOH'}` : null },
        { label: "Propeller 2", value: [aircraft.propeller2_manufacturer, aircraft.propeller2_model].filter(Boolean).join(" ") || null },
        { label: "Propeller 2 Time", value: aircraft.propeller2_time ? `${aircraft.propeller2_time.toLocaleString()} hrs` : null },
      ] : []),
    ].filter(s => s.value);

    const rowHtml = (rows) => rows.map(({ label, value }) =>
      `<tr><td style="color:#888;padding:3px 10px 3px 0;white-space:nowrap">${label}</td><td style="color:#222;padding:3px 0;font-weight:600;text-align:right">${value}</td></tr>`
    ).join('');

    const html = `<!DOCTYPE html><html><head><title>${aircraft.year} ${aircraft.make} ${aircraft.model} — ClearBlue Aero</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      body { font-family: 'Arial', sans-serif; font-size: 9pt; color: #222; background: #fff; }
      @media print { @page { margin: 0; size: letter; } body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }
    </style></head><body>
    <div style="width:8.5in;min-height:11in;margin:0 auto;background:#fff">
      <!-- Header -->
      <div style="background:#00447f;color:#fff;padding:16px 28px;display:flex;align-items:center;justify-content:space-between">
        <div style="display:flex;align-items:center;gap:12px">
          <img src="https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/30c9316a8_CB-Logo-320x79-white.png" alt="ClearBlue Aero" style="height:52px;width:auto;display:block"/>
          <div style="border-left:1px solid rgba(255,255,255,0.2);padding-left:16px;display:flex;align-items:center;height:52px">
            <div style="font-size:14pt;font-weight:700;text-transform:uppercase;letter-spacing:3px;color:#fff">Aircraft Sales Sheet</div>
          </div>
        </div>
        <div style="text-align:right;font-size:8pt;color:rgba(255,255,255,0.7);line-height:1.7">
          <div style="font-weight:700;color:#C9A84C">(386) 227-6840</div>
          <div>sales@flyclearblue.com</div>
          <div>www.flyclearblue.com</div>
        </div>
      </div>
      <div style="height:4px;background:#C9A84C"></div>
      <!-- Title -->
      <div style="padding:14px 28px 10px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #eee">
        <div>
          <div style="font-weight:900;font-size:15pt;color:#00447f">${aircraft.year} ${aircraft.make} ${aircraft.model}</div>
          <div style="color:#888;font-size:8pt;margin-top:2px">
            ${aircraft.registration ? `<span style="margin-right:12px">N-Number: <b style="color:#444">${aircraft.registration}</b></span>` : ''}
            ${aircraft.location ? `<span>Location: <b style="color:#444">${aircraft.location}</b></span>` : ''}
          </div>
        </div>
        <div style="text-align:right">
          ${aircraft.price_drop && aircraft.status !== 'Sold' ? `<div style="font-weight:900;font-size:18pt;color:#C9A84C">$${aircraft.price_drop.toLocaleString()}</div><div style="font-size:10pt;color:#999;text-decoration:line-through">$${aircraft.asking_price.toLocaleString()}</div>` : aircraft.asking_price && aircraft.status !== 'Sold' ? `<div style="font-weight:900;font-size:18pt;color:#C9A84C">$${aircraft.asking_price.toLocaleString()}</div>` : ''}
          ${aircraft.status && aircraft.status !== 'Available' ? `<div style="font-weight:700;font-size:8pt;color:${aircraft.status === 'Sold' ? '#888' : '#b45309'};text-transform:uppercase">${aircraft.status}</div>` : ''}
        </div>
      </div>
      <!-- Photo + Key Specs -->
      <div style="display:flex;border-bottom:1px solid #eee">
        ${images[0] ? `<div style="width:45%;flex-shrink:0;overflow:hidden;max-height:200px"><img src="${images[0]}" style="width:100%;height:200px;object-fit:cover;display:block"/></div>` : ''}
        ${images[1] ? `<div style="display:flex;flex-direction:column;width:15%;flex-shrink:0;gap:1px;overflow:hidden">${images.slice(1,3).map(u => `<img src="${u}" style="width:100%;height:${images.slice(1,3).length>1?'99px':'200px'};object-fit:cover;display:block"/>`).join('')}</div>` : ''}
        <div style="flex:1;padding:12px 16px;background:#f8f9fb">
          <div style="font-weight:800;font-size:8pt;text-transform:uppercase;letter-spacing:1.5px;color:#00447f;margin-bottom:7px">Key Specifications</div>
          <table style="width:100%;border-collapse:collapse;font-size:8pt"><tbody>
            ${rowHtml([
              { label: "Total Time", value: aircraft.total_time ? `${aircraft.total_time.toLocaleString()} hrs` : null },
              { label: "Engine Time", value: aircraft.engine_time_smoh ? `${aircraft.engine_time_smoh.toLocaleString()} hrs ${aircraft.engine_time_type || 'SMOH'}` : null },
              { label: "Engine", value: [aircraft.engine_manufacturer, aircraft.engine_model].filter(Boolean).join(" ") || aircraft.engine_type },
              { label: "Avionics", value: aircraft.avionics_suite },
              { label: "Interior", value: aircraft.interior_condition },
              { label: "Exterior", value: aircraft.exterior_condition },
              { label: "ADS-B", value: aircraft.adsb_compliant === true ? "Compliant" : aircraft.adsb_compliant === false ? "Not Compliant" : null },
              { label: "Factory A/C", value: aircraft.factory_air_conditioning === true ? "Yes" : null },
              { label: "Annual Due", value: aircraft.annual_due },
              { label: "Prior Damage History", value: aircraft.damage_history && aircraft.damage_history !== "None" ? "Yes (Call for details)" : null },
            ].filter(r => r.value))}
          </tbody></table>
        </div>
      </div>
      ${aircraft.notes ? `<div style="padding:10px 28px;border-bottom:1px solid #eee"><div style="font-weight:800;font-size:8pt;text-transform:uppercase;letter-spacing:1.5px;color:#00447f;margin-bottom:5px">Description</div><p style="font-size:8.5pt;color:#444;line-height:1.55;white-space:pre-wrap">${aircraft.notes}</p></div>` : ''}
      <!-- Full Specs two columns -->
      <div style="padding:10px 28px;border-bottom:1px solid #eee">
        <div style="font-weight:800;font-size:8pt;text-transform:uppercase;letter-spacing:1.5px;color:#00447f;margin-bottom:7px">Airframe &amp; Engine Data</div>
        <div style="display:flex;gap:28px">
          <table style="flex:1;border-collapse:collapse;font-size:8pt"><tbody>${rowHtml(airframeLeft)}</tbody></table>
          <table style="flex:1;border-collapse:collapse;font-size:8pt"><tbody>${rowHtml(airframeRight)}</tbody></table>
        </div>
      </div>
      ${avionicsSpecs.length > 0 ? `<div style="padding:10px 28px;border-bottom:1px solid #eee"><div style="font-weight:800;font-size:8pt;text-transform:uppercase;letter-spacing:1.5px;color:#00447f;margin-bottom:5px">Avionics &amp; Equipment</div>${avionicsSpecs.map(({ label, value }) => `<div style="display:flex;gap:10px;font-size:8.5pt;margin-bottom:3px"><span style="color:#888;min-width:100px">${label}</span><span style="color:#222;font-weight:600;white-space:pre-wrap">${value}</span></div>`).join('')}</div>` : ''}
      ${(aircraft.instruments || []).length > 0 ? `<div style="padding:10px 28px;border-bottom:1px solid #eee"><div style="font-weight:800;font-size:8pt;text-transform:uppercase;letter-spacing:1.5px;color:#00447f;margin-bottom:5px">Instruments</div><div style="display:flex;flex-wrap:wrap;gap:4px 24px">${aircraft.instruments.map(inst => `<div style="font-size:8pt;color:#444"><b style="color:#222">${inst.name}</b>${inst.make || inst.model ? ` — ${[inst.make, inst.model].filter(Boolean).join(" ")}` : ''}${inst.condition ? ` (${inst.condition})` : ''}</div>`).join('')}</div></div>` : ''}
      ${aircraft.other ? `<div style="padding:10px 28px;border-bottom:1px solid #eee"><div style="font-weight:800;font-size:8pt;text-transform:uppercase;letter-spacing:1.5px;color:#00447f;margin-bottom:5px">Additional Information</div><p style="font-size:8.5pt;color:#444;line-height:1.55;white-space:pre-wrap">${aircraft.other}</p></div>` : ''}
      <!-- Footer -->
      <div style="background:#00447f;color:rgba(255,255,255,0.7);padding:12px 28px;display:flex;justify-content:space-between;align-items:center;font-size:7.5pt;margin-top:auto">
        <div style="color:rgba(255,255,255,0.4);font-size:7pt;max-width:55%">These specifications are presented as introductory information only. ClearBlue Aero makes no representations or warranties with respect to the aircraft. All interested parties should conduct an independent inspection. Subject to prior sale or lease.</div>
        <div style="text-align:right;line-height:1.8"><div style="color:#C9A84C;font-weight:700;font-size:9pt">ClearBlue Aero</div><div>(386) 227-6840 · sales@flyclearblue.com</div><div>www.flyclearblue.com</div></div>
      </div>
    </div>
    <script>window.onload = function() { window.print(); };<\/script>
    </body></html>`;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    base44.functions.invoke('getPublicAircraftDetail', { id })
      .then(res => {
        const ac = res.data.aircraft || null;
        setAircraft(ac);
        setLoading(false);
        if (ac) {
          const title = `${ac.year} ${ac.make} ${ac.model} — ClearBlue Aero`;
          const desc = `${ac.year} ${ac.make} ${ac.model}${ac.asking_price ? ` — $${ac.asking_price.toLocaleString()}` : ''}${ac.location ? ` | ${ac.location}` : ''}`;
          const img = ac.images?.[0] || 'https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/30c9316a8_CB-Logo-320x79-white.png';
          document.title = title;
          const setMeta = (attr, key, content) => {
            let el = document.querySelector(`meta[${attr}="${key}"]`);
            if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
            el.setAttribute('content', content);
          };
          setMeta('property', 'og:title', title);
          setMeta('property', 'og:description', desc);
          setMeta('property', 'og:image', img);
          setMeta('property', 'og:url', window.location.href);
          setMeta('name', 'twitter:title', title);
          setMeta('name', 'twitter:description', desc);
          setMeta('name', 'twitter:image', img);
          setMeta('name', 'twitter:card', img !== img ? 'summary' : 'summary_large_image');
        }
      })
      .catch(() => setLoading(false));
    return () => { document.title = 'ClearBlue Aero'; };
  }, [id]);

  if (loading) return (
    <div className="flex justify-center py-40">
      <div className="w-8 h-8 border-4 border-[#00447f]/20 border-t-[#00447f] rounded-full animate-spin" />
    </div>
  );

  if (!aircraft) return (
    <div className="text-center py-40 text-gray-400">
      <Plane className="w-16 h-16 mx-auto mb-4 opacity-30" />
      <p className="text-xl font-semibold">Aircraft not found</p>
      <Link to="/inventory" className="text-[#00447f] text-sm mt-4 inline-block hover:underline">← Back to Inventory</Link>
    </div>
  );

  const images = aircraft.images || [];

  const avionicsSpecs = [
    { label: "Avionics Suite", value: aircraft.avionics_suite },
    { label: "Avionics Details", value: aircraft.avionics_details },
  ].filter(s => s.value);

  const statusLabel = aircraft.status === "Sold" ? "SOLD"
    : aircraft.status === "Under Contract" ? "UNDER CONTRACT"
    : aircraft.status === "Coming Soon" ? "COMING SOON"
    : null;

  const comingSoonTagline = aircraft.status === "Coming Soon" && !aircraft.asking_price;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `${aircraft.year} ${aircraft.make} ${aircraft.model}`,
    "category": "Aircraft",
    "brand": { "@type": "Brand", "name": aircraft.make },
    "model": aircraft.model,
    "vehicleModelDate": aircraft.year ? String(aircraft.year) : undefined,
    "sku": aircraft.serial_number || aircraft.registration || undefined,
    "description": aircraft.notes || `${aircraft.year} ${aircraft.make} ${aircraft.model} for sale${aircraft.location ? ` located in ${aircraft.location}` : ''}.`,
    "image": aircraft.images?.length ? aircraft.images : undefined,
    "offers": aircraft.status !== "Sold" && (aircraft.price_drop || aircraft.asking_price) ? {
      "@type": "Offer",
      "price": (aircraft.price_drop || aircraft.asking_price),
      "priceCurrency": "USD",
      "availability": aircraft.status === "Under Contract"
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      "url": window.location.href,
      "seller": { "@type": "Organization", "name": "ClearBlue Aero", "telephone": "+13862276840" }
    } : undefined,
    "additionalProperty": [
      aircraft.registration && { "@type": "PropertyValue", "name": "Registration", "value": aircraft.registration },
      aircraft.total_time != null && { "@type": "PropertyValue", "name": "Total Time", "value": `${aircraft.total_time} hrs` },
      aircraft.engine_time_smoh != null && { "@type": "PropertyValue", "name": "Engine Time SMOH", "value": `${aircraft.engine_time_smoh} hrs` },
      aircraft.engine_type && { "@type": "PropertyValue", "name": "Engine Type", "value": aircraft.engine_type },
      aircraft.avionics_suite && { "@type": "PropertyValue", "name": "Avionics Suite", "value": aircraft.avionics_suite },
      aircraft.location && { "@type": "PropertyValue", "name": "Location", "value": aircraft.location },
    ].filter(Boolean)
  };

  return (
    <div className="bg-[#f5f6f8] min-h-screen">
      <JsonLd data={productSchema} />
      {/* Back nav */}
      <div className="bg-[#00447f] px-4 py-4">
        <div className="max-w-6xl mx-auto">
          <Link to="/inventory" className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Inventory
          </Link>
        </div>
      </div>

      {/* Image Gallery — full screen width */}
      <div className="w-full">
        <div className="bg-white overflow-hidden border-y border-gray-100 shadow-sm">
          <div className="bg-gray-100">
            <div className="relative w-full" style={{ aspectRatio: "4/3" }}>
            {images.length > 0 ? (
              <>
                <img src={images[imgIndex]} alt={`Photo ${imgIndex + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                {images.length > 1 && (
                  <>
                    <button onClick={() => setImgIndex(i => (i - 1 + images.length) % images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={() => setImgIndex(i => (i + 1) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                      {imgIndex + 1} / {images.length}
                    </div>
                  </>
                )}
                {/* Price Drop tag */}
                {aircraft.price_drop && aircraft.status !== "Sold" && (
                  <span className="absolute bottom-3 left-3 text-sm font-bold px-3 py-1.5 rounded shadow-md bg-red-500 text-white">
                    Price Drop
                  </span>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Plane className="w-20 h-20 text-gray-200" />
              </div>
            )}
            </div>
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto bg-gray-50">
              {images.map((url, i) => (
                <button key={i} onClick={() => setImgIndex(i)}
                  className={`shrink-0 w-28 h-20 rounded-lg overflow-hidden border-2 transition-all ${i === imgIndex ? 'border-[#00447f]' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                  <img src={url} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-8">

        {/* Title */}
        <div className="mb-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="text-3xl md:text-4xl font-black text-[#00447f]">
              {aircraft.year} {aircraft.make} {aircraft.model}
            </h1>
            <div className="text-right flex flex-col items-end gap-2">
              {comingSoonTagline ? (
                <p className="text-2xl md:text-3xl font-black text-[#C9A84C]">Call for early access</p>
              ) : aircraft.status !== "Sold" && aircraft.price_drop ? (
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-black text-[#C9A84C]">${aircraft.price_drop.toLocaleString()}</p>
                  <span className="text-lg font-medium text-gray-400 line-through">${aircraft.asking_price.toLocaleString()}</span>
                  <span className="text-xs font-bold px-2 py-1 rounded bg-red-500 text-white">Price Drop</span>
                </div>
              ) : aircraft.asking_price && aircraft.status !== "Sold" ? (
                <p className="text-3xl font-black text-[#C9A84C]">${aircraft.asking_price.toLocaleString()}</p>
              ) : aircraft.status !== "Sold" ? (
                <p className="text-2xl md:text-3xl font-black text-[#C9A84C]">Call for Pricing</p>
              ) : null}
              {statusLabel && (
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${aircraft.status === "Sold" ? "bg-gray-200 text-gray-600" : "bg-amber-50 text-amber-700"}`}>
                  {statusLabel}
                </span>
              )}
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border border-[#00447f] text-[#00447f] hover:bg-[#00447f] hover:text-white transition-all"
                >
                  <Printer className="w-4 h-4" /> Print / Save PDF
                </button>
                <button
                  onClick={handleCopyLink}
                  title="Copy link"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border border-gray-300 text-gray-600 hover:bg-gray-100 transition-all"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy Link"}
                </button>
                <a
                  href={`mailto:?subject=${encodeURIComponent(`${aircraft.year} ${aircraft.make} ${aircraft.model} for Sale`)}&body=${encodeURIComponent(`Check out this aircraft for sale on ClearBlue Aero:\n\n${aircraft.year} ${aircraft.make} ${aircraft.model}\n${aircraft.asking_price ? `$${aircraft.asking_price.toLocaleString()}` : ''}\n\n${shareUrl}`)}`}
                  title="Share via Email"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border border-gray-300 text-gray-600 hover:bg-gray-100 transition-all"
                >
                  <Mail className="w-4 h-4" /> Email
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Share on Facebook"
                  className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${aircraft.year} ${aircraft.make} ${aircraft.model} for Sale${aircraft.asking_price ? ` — $${aircraft.asking_price.toLocaleString()}` : ''}`)}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Share on X"
                  className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-all"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              </div>
            </div>
          </div>
          {aircraft.location && (
            <p className="text-gray-400 mt-1 flex items-center gap-1 text-sm"><MapPin className="w-4 h-4" />{aircraft.location}</p>
          )}
          {aircraft.listing_partner && (
            <p className="text-[#00447f] mt-1 text-sm font-bold">Listed in partnership with {aircraft.listing_partner}</p>
          )}
        </div>

      </div>

      <div className="max-w-6xl mx-auto px-4 pb-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left — Description + Specs */}
          <div className="lg:col-span-2 space-y-8">

            {/* Description */}
            {aircraft.notes && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-black text-[#00447f] mb-3 uppercase tracking-wide">Description</h2>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{aircraft.notes}</p>
              </div>
            )}

            {/* Specifications */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-2xl font-black text-[#00447f] mb-5 pb-3 border-b border-gray-100 uppercase tracking-wide">Specifications</h2>

              {/* Top two-column: Asking Price + Location | Registration + Yr/Make/Model + Serial */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 mb-4">
                {/* Left */}
                <div className="divide-y divide-gray-50">
                  {aircraft.status !== "Sold" && aircraft.price_drop ? (
                    <>
                      <div className="flex items-baseline justify-between py-2.5">
                        <span className="text-gray-500 text-sm font-bold">Sale Price</span>
                        <span className="text-[#C9A84C] font-black text-lg">${aircraft.price_drop.toLocaleString()}</span>
                      </div>
                      <div className="flex items-baseline justify-between py-2.5">
                        <span className="text-gray-500 text-sm font-bold">Initial List Price</span>
                        <span className="text-gray-400 font-medium text-sm line-through">${aircraft.asking_price.toLocaleString()}</span>
                      </div>
                    </>
                  ) : aircraft.asking_price && aircraft.status !== "Sold" ? (
                    <div className="flex items-baseline justify-between py-2.5">
                      <span className="text-gray-500 text-sm font-bold">Asking Price</span>
                      <span className="text-[#C9A84C] font-black text-lg">${aircraft.asking_price.toLocaleString()}</span>
                    </div>
                  ) : null}
                  {aircraft.location && (
                    <div className="flex items-start justify-between gap-4 py-2.5">
                      <span className="text-gray-500 text-sm font-bold shrink-0">Aircraft Location</span>
                      <span className="text-gray-800 text-sm font-semibold text-right">{aircraft.location}</span>
                    </div>
                  )}
                </div>
                {/* Right */}
                <div className="divide-y divide-gray-50">
                  {aircraft.registration && (
                    <div className="flex items-start justify-between gap-4 py-2.5">
                      <span className="text-gray-500 text-sm font-bold shrink-0">Registration</span>
                      <span className="text-gray-800 text-sm font-semibold text-right">{aircraft.registration}</span>
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-4 py-2.5">
                    <span className="text-gray-500 text-sm font-bold shrink-0">Yr/Make/Model</span>
                    <span className="text-gray-800 text-sm font-semibold text-right">{aircraft.year} {aircraft.make} {aircraft.model}</span>
                  </div>
                  {aircraft.serial_number && (
                    <div className="flex items-start justify-between gap-4 py-2.5">
                      <span className="text-gray-500 text-sm font-bold shrink-0">Serial Number</span>
                      <span className="text-gray-800 text-sm font-semibold text-right">{aircraft.serial_number}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Airframe Data */}
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#00447f] mt-5 mb-2">Airframe Data</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                {/* Left column */}
                <div className="divide-y divide-gray-50">
                  {[
                    { label: "Airframe Total Time", value: aircraft.total_time ? `${aircraft.total_time.toLocaleString()} hrs` : null },
                    { label: "Annual Due", value: aircraft.annual_due },
                    { label: "ADS-B Compliant", value: aircraft.adsb_compliant === true ? "Yes" : aircraft.adsb_compliant === false ? "No" : null },
                    { label: "Known Damage History", value: aircraft.damage_history && aircraft.damage_history !== "None" ? "Yes" : null },
                  ].filter(s => s.value).map(({ label, value }) => (
                    <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                      <span className="text-gray-500 text-sm font-bold shrink-0">{label}</span>
                      <span className="text-gray-800 text-sm font-semibold text-right">{String(value)}</span>
                    </div>
                  ))}
                </div>
                {/* Right column */}
                <div className="divide-y divide-gray-50">
                  {[
                    { label: "Exterior Condition", value: aircraft.exterior_condition },
                    { label: "Interior Condition", value: aircraft.interior_condition },
                    { label: "Year Painted", value: aircraft.paint_year ? String(aircraft.paint_year) : null },
                  ].filter(s => s.value).map(({ label, value }) => (
                    <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                      <span className="text-gray-500 text-sm font-bold shrink-0">{label}</span>
                      <span className="text-gray-800 text-sm font-semibold text-right">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Engine Data */}
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#00447f] mt-6 mb-2">Engine Data</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                {/* Engine 1 — Left */}
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 pb-1 border-b border-gray-100">Engine 1</p>
                  <div className="divide-y divide-gray-50">
                    {[
                      { label: "Engine 1 Manufacturer", value: [aircraft.engine_manufacturer, aircraft.engine_model].filter(Boolean).join(" ") || null },
                      { label: "Engine 1 Time", value: aircraft.engine_time_smoh ? `${aircraft.engine_time_smoh.toLocaleString()} hrs ${aircraft.engine_time_type || 'SMOH'}` : null },
                      { label: "Propeller 1 Manufacturer", value: [aircraft.propeller_manufacturer, aircraft.propeller_model].filter(Boolean).join(" ") || null },
                      { label: "Propeller 1 Time", value: aircraft.propeller_time ? `${aircraft.propeller_time.toLocaleString()} hrs` : null },
                    ].filter(s => s.value).map(({ label, value }) => (
                      <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                        <span className="text-gray-500 text-sm font-bold shrink-0">{label}</span>
                        <span className="text-gray-800 text-sm font-semibold text-right">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Engine 2 — Right */}
                {aircraft.num_engines === 'Multi-Engine' && (
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 pb-1 border-b border-gray-100">Engine 2</p>
                  <div className="divide-y divide-gray-50">
                    {[
                      { label: "Engine 2 Manufacturer", value: [aircraft.engine2_manufacturer, aircraft.engine2_model].filter(Boolean).join(" ") || null },
                      { label: "Engine 2 Time", value: aircraft.engine2_time_smoh ? `${aircraft.engine2_time_smoh.toLocaleString()} hrs ${aircraft.engine2_time_type || 'SMOH'}` : null },
                      { label: "Propeller 2 Manufacturer", value: [aircraft.propeller2_manufacturer, aircraft.propeller2_model].filter(Boolean).join(" ") || null },
                      { label: "Propeller 2 Time", value: aircraft.propeller2_time ? `${aircraft.propeller2_time.toLocaleString()} hrs` : null },
                    ].filter(s => s.value).map(({ label, value }) => (
                      <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                        <span className="text-gray-500 text-sm font-bold shrink-0">{label}</span>
                        <span className="text-gray-800 text-sm font-semibold text-right">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                )}
              </div>

              {/* Avionics & Equipment */}
              {avionicsSpecs.length > 0 && (
                <>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#00447f] mt-6 mb-2">Avionics &amp; Equipment</h3>
                  <div className="divide-y divide-gray-50">
                    {avionicsSpecs.map(({ label, value }) => (
                      <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                        <span className="text-gray-500 text-sm font-bold shrink-0">{label}</span>
                        <span className="text-gray-800 text-sm font-semibold text-right whitespace-pre-wrap">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Instruments */}
              {aircraft.instruments?.length > 0 && (
                <>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#00447f] mt-6 mb-2">Instruments</h3>
                  <div className="divide-y divide-gray-50">
                    {aircraft.instruments.map((inst, i) => (
                      <div key={i} className="flex items-start justify-between gap-4 py-2.5">
                        <span className="text-gray-500 text-sm font-bold">{inst.name}</span>
                        <span className="text-gray-800 text-sm font-semibold text-right">
                          {[inst.make, inst.model].filter(Boolean).join(" ")}{inst.condition ? ` · ${inst.condition}` : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Digital Logbooks */}
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#00447f] mt-6 mb-2">Digital Logbooks</h3>
              {aircraft.logbook_urls?.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {aircraft.logbook_urls.map((url, i) => (
                    <div key={i} className="py-2.5">
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-[#00447f] text-sm font-semibold hover:underline break-all">
                        {url}
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm italic py-1">Coming Soon</p>
              )}

              {/* Disclaimer */}
              <p className="text-xs text-gray-400 mt-6 pt-4 border-t border-gray-100 leading-relaxed">
                These specifications are presented as introductory information only. ClearBlue Aero makes no representations or warranties with respect to the aircraft. All interested parties should conduct an independent inspection. The aircraft is subject to prior sale or lease.
              </p>
            </div>

            {/* Other */}
            {aircraft.other && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-black text-[#00447f] mb-3 uppercase tracking-wide">Other</h2>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{aircraft.other}</p>
              </div>
            )}
          </div>

          {/* Right — Contact */}
          <div>
            <div className="bg-[#00447f] text-white rounded-2xl p-6 sticky top-28">
              <h3 className="text-xl font-black mb-1">Have Questions?</h3>
              <p className="text-white/50 text-sm mb-1">Interested in Purchasing?</p>
              <p className="text-white/70 text-sm font-semibold mb-5">{aircraft.year} {aircraft.make} {aircraft.model}</p>

              <a
                href="tel:+13862276840"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-lg font-bold text-sm mb-3 transition-all hover:brightness-110"
                style={{ backgroundColor: '#C9A84C', color: '#00447f' }}
              >
                <Phone className="w-4 h-4" /> Call (386) 227-6840
              </a>
              <a
                href={`mailto:sales@flyclearblue.com?subject=Inquiry: ${aircraft.year} ${aircraft.make} ${aircraft.model} (${aircraft.registration || ''})`}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-lg font-bold text-sm border border-white/20 hover:bg-white/10 transition-all"
              >
                <Mail className="w-4 h-4" /> Email Us
              </a>

              <div className="mt-5 pt-5 border-t border-white/10 text-xs text-white/30 space-y-1">
                <p>Monday – Friday, 8 AM – 6 PM EST</p>
                <p>sales@flyclearblue.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Aircraft Alerts */}
      <NewsletterSignup />


    </div>
  );
}