import { Link } from "react-router-dom";

const PARTNERS = [
  { name: "Lima Bravo Aviation", url: "https://limabravoaviation.com/", img: "https://www.flyclearblue.com/wp-content/uploads/2016/06/LB-logo-2024-300x94.png" },
  { name: "Columbus Aero Service", url: "http://www.columbusaeroservice.com/", img: "https://www.flyclearblue.com/wp-content/uploads/2016/06/Columbus-Aero_144x144.png" },
  { name: "Gann Aviation", url: "http://www.gannaviation.com/", img: "https://www.flyclearblue.com/wp-content/uploads/2017/12/Gann-Logo.png" },
  { name: "Beechcraft Buyers", url: "http://www.beechcraftbuyersandsellers.com/", img: "https://www.flyclearblue.com/wp-content/uploads/2017/12/large-color-logo.jpg" },
  { name: "Maule Aircraft", url: "http://mauleairinc.com/", img: "https://www.flyclearblue.com/wp-content/uploads/2017/08/MAULE-STOL-AIRCRAFT-e1755096940708.png" },
  { name: "Banterra Aircraft Financing", url: "http://www.banterraaircraft.com/loans/overview", img: "https://www.flyclearblue.com/wp-content/uploads/2017/08/logo-aircraft.png" },
  { name: "Global Corporate Services", url: "http://www.global-inter.net/", img: "https://www.flyclearblue.com/wp-content/uploads/2016/06/Global.png" },
  { name: "Falcon Insurance", url: "http://www.falconinsurance.com/", img: "https://www.flyclearblue.com/wp-content/uploads/2016/06/falcon-lrg.jpg" },
];

export default function PublicSellYourPlane() {
  return (
    <div>
      {/* Hero Banner */}
      <div className="bg-[#1a3a5c] py-12 text-center">
        <h1 className="text-4xl font-bold text-white">Tell Us a Little About Your Plane</h1>
      </div>

      {/* Main Content */}
      <section className="py-14 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-[#5b99cc] leading-snug">
              Looking to upgrade or downgrade? Selling because its time?<br />
              Or, tried selling alone with poor results?<br />
              <span className="font-extrabold">Search no more, ClearBlue Aero is here to assist.</span>
            </h2>
          </div>

          {/* Entry Form Buttons */}
          <div className="grid sm:grid-cols-2 gap-4 mb-12">
            <Link
              to="/public/sell/single-engine"
              className="flex items-center justify-center gap-3 bg-[#1a3a5c] text-white py-5 px-6 rounded text-base font-semibold hover:bg-[#14304d] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              SINGLE ENGINE ENTRY FORM
            </Link>
            <Link
              to="/public/sell/twin-engine"
              className="flex items-center justify-center gap-3 bg-[#1a3a5c] text-white py-5 px-6 rounded text-base font-semibold hover:bg-[#14304d] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              TWIN ENGINE ENTRY FORM
            </Link>
          </div>

          <div className="space-y-5 text-gray-700 leading-relaxed">
            <p>
              Most experienced airplane owners who have bought and sold aircraft will tell you the process is no easy task. Let ClearBlue Aero's experienced and professional staff who are not only pilots and aircraft owners just like you, but are also well versed in both factory and experimental type aircraft save you time and money.
            </p>
            <p>
              From appraisals, marketing, and ultimate sales, our team has you covered. Using well developed and maintained communication connections and a nose for sniffing out the right buyer, we will bring the best possible sales opportunity to your door for maximum closure rates.
            </p>
            <p className="text-[#5b99cc] font-semibold">Superior Customer Service. Experienced Aviators. And pricing that will put you at ease.</p>
            <p className="text-[#5b99cc] font-semibold">
              Get started with ClearBlue Aero today! Call{" "}
              <a href="tel:+13862276840" className="hover:underline">(386) 227-6840</a>{" "}
              or complete the short questionnaire to get started immediately.
            </p>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-12 px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-lg font-bold text-[#1a3a5c] text-center mb-8 uppercase tracking-widest">Please Take a Moment to Visit Our Trusted Partners</h3>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {PARTNERS.map(p => (
              <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" title={p.name}>
                <img src={p.img} alt={p.name} className="h-14 object-contain grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100" />
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}