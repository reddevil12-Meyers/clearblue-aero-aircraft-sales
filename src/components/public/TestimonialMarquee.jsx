const PHOTOS = [
  "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/208e54d45_IMG_2024-150x150.jpg",
  "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/c47353466_JackGPeppard.JPG",
  "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/4154dbd2f_RodneyPennebaker.JPG",
  "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/fa8c2462f_RobTollefson.JPG",
  "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/f209c001a_steve-tighe.jpg",
  "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/412e05056_WillSprang.JPG",
  "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/77b2b5522_JohnCordova.JPG",
  "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/84658903c_JimBrundage.JPG",
  "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/64f33bf6a_MichaelGavin.JPG",
  "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/f34fca98d_MattTemkin.JPG",
];

const ALT_TEXT = "Beechcraft Buyers, a ClearBlue Aero Brand";

function MarqueePhoto({ src }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-xl shadow-lg border border-gray-200 bg-white mx-3"
      style={{ width: "300px" }}
    >
      <img
        src={src}
        alt={ALT_TEXT}
        loading="lazy"
        className="w-full h-52 md:h-60 object-cover"
      />
      {/* Subtle navy duotone veil for cohesion with the site scheme */}
      <div
        className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-15"
        style={{ backgroundColor: "#00447f" }}
      />
      {/* Gold base accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: "#C9A84C" }} />
    </div>
  );
}

export default function TestimonialMarquee() {
  return (
    <section className="py-10 overflow-hidden" style={{ backgroundColor: "#f5f6f8" }}>
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 text-center px-4">
        More Happy Beechcraft Buyers
      </p>
      <div
        className="flex w-max"
        style={{ animation: "marquee-scroll 45s linear infinite" }}
      >
        {[...PHOTOS, ...PHOTOS].map((src, i) => (
          <MarqueePhoto key={i} src={src} />
        ))}
      </div>
    </section>
  );
}