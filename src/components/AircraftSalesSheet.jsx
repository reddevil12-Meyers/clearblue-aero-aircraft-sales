import { Plane, Phone, Mail, Globe, MapPin } from "lucide-react";

export default function AircraftSalesSheet({ aircraft }) {
  const images = aircraft.images || [];

  const airframeSpecs = [
    { label: "Year / Make / Model", value: `${aircraft.year} ${aircraft.make} ${aircraft.model}` },
    { label: "Registration", value: aircraft.registration },
    { label: "Serial Number", value: aircraft.serial_number },
    { label: "Location", value: aircraft.location },
    { label: "Airframe Total Time", value: aircraft.total_time ? `${aircraft.total_time.toLocaleString()} hrs` : null },
    { label: "Engine", value: [aircraft.engine_manufacturer, aircraft.engine_model].filter(Boolean).join(" ") || aircraft.engine_type },
    { label: "Engine Type", value: aircraft.engine_type },
    { label: "Engine 1 Time", value: aircraft.engine_time_smoh ? `${aircraft.engine_time_smoh.toLocaleString()} hrs ${aircraft.engine_time_type || 'SMOH'}` : null },
    { label: "Engine 1 Top Overhaul", value: aircraft.engine_top_overhaul ? `${aircraft.engine_top_overhaul.toLocaleString()} hrs` : null },
    { label: "Engine 1 Time Since New", value: aircraft.engine_time_since_new ? `${aircraft.engine_time_since_new.toLocaleString()} hrs` : null },
    ...(aircraft.num_engines === 'Multi-Engine' ? [
      { label: "Engine 2 Time", value: aircraft.engine2_time_smoh ? `${aircraft.engine2_time_smoh.toLocaleString()} hrs ${aircraft.engine2_time_type || 'SMOH'}` : null },
      { label: "Engine 2 Top Overhaul", value: aircraft.engine2_top_overhaul ? `${aircraft.engine2_top_overhaul.toLocaleString()} hrs` : null },
      { label: "Engine 2 Time Since New", value: aircraft.engine2_time_since_new ? `${aircraft.engine2_time_since_new.toLocaleString()} hrs` : null },
    ] : []),
    { label: "Propeller", value: [aircraft.propeller_manufacturer, aircraft.propeller_model].filter(Boolean).join(" ") || null },
    { label: "Propeller 1 Time", value: aircraft.propeller_time ? `${aircraft.propeller_time.toLocaleString()} hrs` : null },
    ...(aircraft.num_engines === 'Multi-Engine' ? [
      { label: "Propeller 2 Time", value: aircraft.propeller2_time ? `${aircraft.propeller2_time.toLocaleString()} hrs` : null },
    ] : []),
    { label: "Annual Due", value: aircraft.annual_due },
    { label: "Interior Condition", value: aircraft.interior_condition },
    { label: "Exterior Condition", value: aircraft.exterior_condition },
    { label: "Paint Year", value: aircraft.paint_year },
    { label: "Interior Year", value: aircraft.interior_year },
    { label: "ADS-B Compliant", value: aircraft.adsb_compliant === true ? "Yes" : aircraft.adsb_compliant === false ? "No" : null },
    { label: "Useful Load", value: aircraft.useful_load ? `${aircraft.useful_load.toLocaleString()} lbs` : null },
    { label: "Fuel Capacity", value: aircraft.fuel_capacity ? `${aircraft.fuel_capacity} gal` : null },
    { label: "Damage History", value: aircraft.damage_history && aircraft.damage_history !== "None" ? aircraft.damage_history : null },
  ].filter(s => s.value);

  const avionicsSpecs = [
    { label: "Avionics Suite", value: aircraft.avionics_suite },
    { label: "Avionics Details", value: aircraft.avionics_details },
  ].filter(s => s.value);

  // Split specs into two columns for compact layout
  const half = Math.ceil(airframeSpecs.length / 2);
  const col1 = airframeSpecs.slice(0, half);
  const col2 = airframeSpecs.slice(half);

  return (
    <div
      id="sales-sheet"
      style={{
        width: "8.5in",
        minHeight: "11in",
        margin: "0 auto",
        background: "#fff",
        fontFamily: "'Open Sans', sans-serif",
        fontSize: "9pt",
        color: "#222",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div style={{ background: "#00447f", color: "#fff", padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ background: "#C9A84C", borderRadius: "6px", padding: "6px 10px", fontWeight: 900, fontSize: "18pt", letterSpacing: "-0.5px", color: "#00447f" }}>
            ClearBlue<span style={{ color: "#fff" }}>Aero</span>
          </div>
          <div style={{ borderLeft: "1px solid rgba(255,255,255,0.2)", paddingLeft: "14px" }}>
            <div style={{ fontSize: "7pt", textTransform: "uppercase", letterSpacing: "2px", color: "rgba(255,255,255,0.5)", marginBottom: "2px" }}>Aircraft Sales Sheet</div>
            <div style={{ fontWeight: 700, fontSize: "11pt" }}>{aircraft.year} {aircraft.make} {aircraft.model}</div>
          </div>
        </div>
        <div style={{ textAlign: "right", fontSize: "8pt", color: "rgba(255,255,255,0.7)", lineHeight: "1.7" }}>
          <div style={{ fontWeight: 700, color: "#C9A84C" }}>386 227-6840</div>
          <div>sales@flyclearblue.com</div>
          <div>www.flyclearblue.com</div>
        </div>
      </div>

      {/* Gold accent bar */}
      <div style={{ height: "4px", background: "#C9A84C" }} />

      {/* Title + Price */}
      <div style={{ padding: "16px 32px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #eee" }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: "16pt", color: "#00447f" }}>
            {aircraft.year} {aircraft.make} {aircraft.model}
          </div>
          <div style={{ color: "#888", fontSize: "8pt", marginTop: "2px" }}>
            {aircraft.registration && <span style={{ marginRight: "12px" }}>N-Number: <b style={{ color: "#444" }}>{aircraft.registration}</b></span>}
            {aircraft.location && <span>Location: <b style={{ color: "#444" }}>{aircraft.location}</b></span>}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          {aircraft.asking_price && aircraft.status !== "Sold" && (
            <div style={{ fontWeight: 900, fontSize: "20pt", color: "#C9A84C" }}>
              ${aircraft.asking_price.toLocaleString()}
            </div>
          )}
          {aircraft.status && aircraft.status !== "Available" && (
            <div style={{ fontWeight: 700, fontSize: "8pt", color: aircraft.status === "Sold" ? "#888" : "#b45309", textTransform: "uppercase", letterSpacing: "1px" }}>
              {aircraft.status}
            </div>
          )}
        </div>
      </div>

      {/* Main image + specs side by side */}
      <div style={{ display: "flex", gap: "0", borderBottom: "1px solid #eee" }}>
        {/* Photo */}
        {images[0] && (
          <div style={{ width: "45%", flexShrink: 0, overflow: "hidden", maxHeight: "220px" }}>
            <img
              src={images[0]}
              alt="Aircraft"
              style={{ width: "100%", height: "220px", objectFit: "cover", display: "block" }}
            />
          </div>
        )}
        {/* Additional photos strip (up to 2 more) */}
        {images.length > 1 && (
          <div style={{ display: "flex", flexDirection: "column", width: images[0] ? "15%" : "0", flexShrink: 0, gap: "1px", overflow: "hidden" }}>
            {images.slice(1, 3).map((url, i) => (
              <img key={i} src={url} alt={`Photo ${i + 2}`}
                style={{ width: "100%", height: images.slice(1, 3).length > 1 ? "109px" : "220px", objectFit: "cover", display: "block" }} />
            ))}
          </div>
        )}

        {/* Quick specs on the right */}
        <div style={{ flex: 1, padding: "14px 18px", display: "flex", flexDirection: "column", justifyContent: "center", background: "#f8f9fb" }}>
          <div style={{ fontWeight: 800, fontSize: "8pt", textTransform: "uppercase", letterSpacing: "1.5px", color: "#00447f", marginBottom: "8px" }}>Key Specifications</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8pt" }}>
            <tbody>
              {[
                { label: "Total Time", value: aircraft.total_time ? `${aircraft.total_time.toLocaleString()} hrs` : null },
                { label: "Engine Time", value: aircraft.engine_time_smoh ? `${aircraft.engine_time_smoh.toLocaleString()} hrs ${aircraft.engine_time_type || 'SMOH'}` : null },
                { label: "Engine", value: [aircraft.engine_manufacturer, aircraft.engine_model].filter(Boolean).join(" ") || aircraft.engine_type },
                { label: "Avionics", value: aircraft.avionics_suite },
                { label: "Interior", value: aircraft.interior_condition },
                { label: "Exterior", value: aircraft.exterior_condition },
                { label: "ADS-B", value: aircraft.adsb_compliant === true ? "Compliant" : aircraft.adsb_compliant === false ? "Not Compliant" : null },
                { label: "Annual Due", value: aircraft.annual_due },
              ].filter(r => r.value).map(({ label, value }) => (
                <tr key={label}>
                  <td style={{ color: "#888", paddingBottom: "4px", paddingRight: "10px", whiteSpace: "nowrap", fontWeight: 600 }}>{label}</td>
                  <td style={{ color: "#222", paddingBottom: "4px", fontWeight: 700 }}>{String(value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Description */}
      {aircraft.notes && (
        <div style={{ padding: "12px 32px", borderBottom: "1px solid #eee" }}>
          <div style={{ fontWeight: 800, fontSize: "8pt", textTransform: "uppercase", letterSpacing: "1.5px", color: "#00447f", marginBottom: "5px" }}>Description</div>
          <p style={{ fontSize: "8.5pt", color: "#444", lineHeight: "1.55", whiteSpace: "pre-wrap", margin: 0 }}>{aircraft.notes}</p>
        </div>
      )}

      {/* Full specs — two columns */}
      <div style={{ padding: "12px 32px", borderBottom: "1px solid #eee" }}>
        <div style={{ fontWeight: 800, fontSize: "8pt", textTransform: "uppercase", letterSpacing: "1.5px", color: "#00447f", marginBottom: "8px" }}>Full Specifications</div>
        <div style={{ display: "flex", gap: "32px" }}>
          {[col1, col2].map((col, ci) => (
            <table key={ci} style={{ flex: 1, borderCollapse: "collapse", fontSize: "8pt" }}>
              <tbody>
                {col.map(({ label, value }) => (
                  <tr key={label} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ color: "#888", padding: "3px 10px 3px 0", whiteSpace: "nowrap" }}>{label}</td>
                    <td style={{ color: "#222", padding: "3px 0", fontWeight: 600, textAlign: "right" }}>{String(value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ))}
        </div>
      </div>

      {/* Avionics */}
      {avionicsSpecs.length > 0 && (
        <div style={{ padding: "10px 32px", borderBottom: "1px solid #eee" }}>
          <div style={{ fontWeight: 800, fontSize: "8pt", textTransform: "uppercase", letterSpacing: "1.5px", color: "#00447f", marginBottom: "6px" }}>Avionics &amp; Equipment</div>
          {avionicsSpecs.map(({ label, value }) => (
            <div key={label} style={{ display: "flex", gap: "10px", fontSize: "8.5pt", marginBottom: "3px" }}>
              <span style={{ color: "#888", minWidth: "100px" }}>{label}</span>
              <span style={{ color: "#222", fontWeight: 600, whiteSpace: "pre-wrap" }}>{String(value)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Instruments */}
      {aircraft.instruments?.length > 0 && (
        <div style={{ padding: "10px 32px", borderBottom: "1px solid #eee" }}>
          <div style={{ fontWeight: 800, fontSize: "8pt", textTransform: "uppercase", letterSpacing: "1.5px", color: "#00447f", marginBottom: "6px" }}>Instruments</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 24px" }}>
            {aircraft.instruments.map((inst, i) => (
              <div key={i} style={{ fontSize: "8pt", color: "#444" }}>
                <b style={{ color: "#222" }}>{inst.name}</b>
                {inst.make || inst.model ? ` — ${[inst.make, inst.model].filter(Boolean).join(" ")}` : ""}
                {inst.condition ? ` (${inst.condition})` : ""}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other notes */}
      {aircraft.other && (
        <div style={{ padding: "10px 32px", borderBottom: "1px solid #eee" }}>
          <div style={{ fontWeight: 800, fontSize: "8pt", textTransform: "uppercase", letterSpacing: "1.5px", color: "#00447f", marginBottom: "5px" }}>Additional Information</div>
          <p style={{ fontSize: "8.5pt", color: "#444", lineHeight: "1.55", whiteSpace: "pre-wrap", margin: 0 }}>{aircraft.other}</p>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: "auto", background: "#00447f", color: "rgba(255,255,255,0.7)", padding: "12px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "7.5pt" }}>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "7pt", maxWidth: "55%" }}>
          These specifications are presented as introductory information only. ClearBlue Aero makes no representations or warranties with respect to the aircraft. All interested parties should conduct an independent inspection. Subject to prior sale or lease.
        </div>
        <div style={{ textAlign: "right", lineHeight: "1.8" }}>
          <div style={{ color: "#C9A84C", fontWeight: 700, fontSize: "9pt" }}>ClearBlue Aero</div>
          <div>386 227-6840 · sales@flyclearblue.com</div>
          <div>www.flyclearblue.com</div>
        </div>
      </div>
    </div>
  );
}