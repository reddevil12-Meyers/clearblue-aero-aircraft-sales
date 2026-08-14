import { Link } from "react-router-dom";
import { Plane, Phone, Mail, ArrowRight, Star, Users, Handshake, Award } from "lucide-react";
import useSeo from "@/hooks/useSeo";

export default function GardnerTransition() {
  useSeo({ title: "Gardner Aircraft Sales + ClearBlue Aero — A New Chapter", description: "After 60+ years, Phil Gardner has chosen ClearBlue Aero to carry forward Gardner Aircraft Sales' legacy of aviation excellence. Learn about the transition and what it means for clients.", path: "/gardner" });
  return (
    <div className="bg-white min-h-screen">

      {/* Hero */}
      <div className="bg-[#00447f] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logos */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-10">
            <div className="text-center">
              <div className="text-white/60 text-xs uppercase tracking-widest mb-2">A Legacy of Excellence</div>
              <img
                src="https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/61ada3ca1_Gardnerlogo.png"
                alt="Gardner Aircraft Sales"
                className="h-14 object-contain mx-auto"
                style={{ filter: "brightness(8)", mixBlendMode: "lighten" }} />
              
              <div className="text-white/50 text-sm mt-1">Est. 1964</div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-px bg-[#C9A84C] sm:w-px sm:h-12" />
              <span className="text-[#C9A84C] font-black text-lg">+</span>
              <div className="w-12 h-px bg-[#C9A84C] sm:w-px sm:h-12" />
            </div>

            <div className="text-center">
              <img
                src="https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/30c9316a8_CB-Logo-320x79-white.png"
                alt="ClearBlue Aero"
                className="h-14 object-contain" />
              
              <div className="text-white/50 text-sm mt-1">Your New Aviation Partner</div>
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-black mb-6 leading-tight">
            Two Trusted Names in Aviation,<br />
            <span className="text-[#C9A84C]">Now Working as One.</span>
          </h1>
          <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">After more than 60 years of unparalleled service, Phil Gardner is retiring - and he's chosen ClearBlue Aero to carry forward the same professionalism, quality, and trust that has defined Gardner Aircraft Sales since 1964.

          </p>
        </div>
      </div>

      {/* Gold bar */}
      <div className="h-1.5 bg-[#C9A84C]" />

      {/* Phil's Message */}
      <div className="relative py-20 px-4 overflow-hidden"
      style={{
        backgroundImage: "linear-gradient(rgba(0,20,40,0.72), rgba(0,20,40,0.72)), url('https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/7c8669ad1_generated_image.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }}>
        
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-12 bg-[#C9A84C] rounded-full" />
              <div>
                <div className="font-black text-[#00447f] text-lg">A Message to Our Clients</div>
                <div className="text-gray-400 text-sm">Phil Gardner, Founder — Gardner Aircraft Sales</div>
              </div>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">"After more than six decades in aviation, the time has come for me to step back and enjoy retirement. It has been my privilege to serve so many wonderful clients over the years - finding the right aircraft, building lasting relationships, and upholding the highest standards in the industry.

            </p>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              I did not make this decision lightly. I chose ClearBlue Aero because I believe they share the same values and commitment to excellence that have always been the foundation of Gardner Aircraft Sales. You are in great hands."
            </p>
            <p className="text-[#00447f] font-bold">— Phil Gardner</p>
          </div>
        </div>
      </div>

      {/* What This Means For You */}
      <div className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-[#00447f] text-center mb-3">What This Means For You</h2>
          <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">Whether you're a longtime Gardner Aircraft Sales client or were referred by Phil, rest assured -  the service you expect continues uninterrupted.

          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
            { icon: Handshake, title: "Same Trust", desc: "The integrity and transparency you experienced with Gardner Aircraft Sales carries forward with every transaction." },
            { icon: Star, title: "Same Quality", desc: "Meticulous attention to aircraft detail, documentation, and honest representation - no shortcuts, ever." },
            { icon: Users, title: "Same Relationships", desc: "We honor the relationships Phil built. Your history and preferences matter to us." },
            { icon: Award, title: "90+ Years Combined", desc: "ClearBlue Aero brings its own proven track record to complement Gardner's legendary legacy." }].
            map(({ icon: Icon, title, desc }) =>
            <div key={title} className="bg-[#f5f6f8] rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-[#00447f] rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-black text-[#00447f] mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* About ClearBlue Aero */}
      <div className="bg-[#00447f] py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <img
            src="https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/30c9316a8_CB-Logo-320x79-white.png"
            alt="ClearBlue Aero"
            className="h-14 object-contain mx-auto mb-6" />
          
          <p className="text-white/80 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
            ClearBlue Aero is a full-service aircraft brokerage and appraisal firm based in Florida, providing buyers and sellers with expert guidance, honest valuations, and a seamless transaction experience. We specialize in piston singles, piston twins, turboprops, and light jets.
          </p>
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            {[
            { value: "Florida-Based", label: "Serving clients nationwide" },
            { value: "Full-Service", label: "Sales, appraisals & more" },
            { value: "Trusted", label: "Honest, transparent dealings" }].
            map(({ value, label }) =>
            <div key={value} className="bg-white/10 rounded-xl p-5">
                <div className="text-[#C9A84C] font-black text-xl mb-1">{value}</div>
                <div className="text-white/60 text-sm">{label}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CTA — Inventory + Contact */}
      <div className="py-16 px-4 overflow-hidden"
      style={{
        backgroundImage: "linear-gradient(rgba(0,20,40,0.75), rgba(0,20,40,0.75)), url('https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/7c8669ad1_generated_image.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }}>
        
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-black text-white mb-4">Ready to Get Started?</h2>
          <p className="text-white/80 text-lg mb-10">
            Browse our current aircraft inventory or reach out to our team directly — we'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/inventory"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-bold text-sm transition-all hover:brightness-110"
              style={{ backgroundColor: '#00447f', color: '#fff' }}>
              
              <Plane className="w-4 h-4" /> View Aircraft Inventory <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-bold text-sm border-2 border-white text-white hover:bg-white hover:text-[#00447f] transition-all">
              
              <Mail className="w-4 h-4" /> Contact Us
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-white/20 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-white/70">
            <a href="tel:+13862276840" className="flex items-center gap-2 hover:text-white transition-colors font-semibold">
              <Phone className="w-4 h-4" /> (386) 227-6840
            </a>
            <a href="mailto:sales@flyclearblue.com" className="flex items-center gap-2 hover:text-white transition-colors font-semibold">
              <Mail className="w-4 h-4" /> sales@flyclearblue.com
            </a>
          </div>
        </div>
      </div>

    </div>);

}