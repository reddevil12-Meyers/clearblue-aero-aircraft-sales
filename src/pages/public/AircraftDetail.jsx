import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Plane, MapPin, Clock, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PublicAircraftDetail() {
  const { id } = useParams();
  const [aircraft, setAircraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    base44.entities.Aircraft.filter({ id })
      .then((data) => setAircraft(data?.[0] || null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex justify-center py-32">
      <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!aircraft) return (
    <div className="text-center py-32 text-muted-foreground">
      <p className="text-lg">Aircraft not found.</p>
      <Button asChild className="mt-4"><Link to="/public/inventory">Back to Inventory</Link></Button>
    </div>
  );

  const images = aircraft.images || [];

  const specs = [
    { label: "Year", value: aircraft.year },
    { label: "Registration", value: aircraft.registration },
    { label: "Serial Number", value: aircraft.serial_number },
    { label: "Total Time", value: aircraft.total_time ? `${aircraft.total_time.toLocaleString()} hrs` : null },
    { label: "Engine Time SMOH", value: aircraft.engine_time_smoh ? `${aircraft.engine_time_smoh.toLocaleString()} hrs` : null },
    { label: "Engine Type", value: aircraft.engine_type },
    { label: "Avionics", value: aircraft.avionics_suite },
    { label: "Interior", value: aircraft.interior_condition },
    { label: "Exterior", value: aircraft.exterior_condition },
    { label: "ADS-B", value: aircraft.adsb_compliant != null ? (aircraft.adsb_compliant ? "Compliant" : "Non-Compliant") : null },
    { label: "Damage History", value: aircraft.damage_history },
    { label: "Location", value: aircraft.location },
  ].filter((s) => s.value);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <Link to="/public/inventory" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Inventory
        </Link>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Images */}
          <div>
            {images.length > 0 ? (
              <div className="relative rounded-xl overflow-hidden bg-muted h-72">
                <img src={images[imgIndex]} alt="Aircraft" className="w-full h-full object-cover" />
                {images.length > 1 && (
                  <>
                    <button onClick={() => setImgIndex((i) => (i - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70">
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button onClick={() => setImgIndex((i) => (i + 1) % images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70">
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {images.map((_, i) => (
                        <button key={i} onClick={() => setImgIndex(i)} className={`w-2 h-2 rounded-full ${i === imgIndex ? "bg-white" : "bg-white/50"}`} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="rounded-xl bg-muted h-72 flex items-center justify-center">
                <Plane className="h-16 w-16 text-muted-foreground/30" />
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-1">{aircraft.year} {aircraft.make} {aircraft.model}</h1>
            {aircraft.location && (
              <p className="flex items-center gap-1 text-muted-foreground text-sm mb-4">
                <MapPin className="h-4 w-4" /> {aircraft.location}
              </p>
            )}
            {aircraft.asking_price ? (
              <p className="text-3xl font-bold text-accent mb-6">${aircraft.asking_price.toLocaleString()}</p>
            ) : (
              <p className="text-lg text-muted-foreground mb-6">Price on request</p>
            )}
            {aircraft.notes && <p className="text-muted-foreground text-sm mb-6 leading-relaxed">{aircraft.notes}</p>}
            <Button asChild size="lg" className="w-full">
              <Link to="/public/contact">Inquire About This Aircraft</Link>
            </Button>
          </div>
        </div>

        {/* Specs */}
        <div className="mt-10">
          <h2 className="font-display text-xl font-bold text-foreground mb-4">Aircraft Specifications</h2>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="grid sm:grid-cols-2">
              {specs.map((s, i) => (
                <div key={s.label} className={`flex justify-between px-5 py-3 text-sm ${i % 2 === 0 ? "bg-muted/30" : ""} border-b border-border last:border-0`}>
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="font-medium text-foreground">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {aircraft.avionics_details && (
          <div className="mt-8">
            <h2 className="font-display text-xl font-bold text-foreground mb-3">Avionics Details</h2>
            <p className="text-muted-foreground text-sm leading-relaxed bg-card border border-border rounded-xl p-5">{aircraft.avionics_details}</p>
          </div>
        )}
      </div>
    </div>
  );
}