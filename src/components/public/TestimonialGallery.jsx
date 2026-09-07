const PHOTOS = [
  "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/f355b7017_AlexisStobbe.JPG",
  "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/83bbfa098_bobwarren.JPG",
  "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/322816efe_DaveDermyer.JPG",
  "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/77d59a206_DaveWingert.JPG",
  "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/7e8558791_DrDavidShields.JPG",
];

const ALT_TEXT = "Beechcraft Buyers, a ClearBlue Aero Brand";

export default function TestimonialGallery() {
  return (
    <section className="py-16 px-4" style={{ backgroundColor: "#f5f6f8" }}>
      <div className="max-w-5xl mx-auto">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-10 text-center">
          Handshakes &amp; Happy Owners
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PHOTOS.map((src, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-xl shadow-lg border border-gray-200 bg-white"
            >
              <img
                src={src}
                alt={ALT_TEXT}
                loading="lazy"
                className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Subtle navy duotone veil for cohesion with the site scheme */}
              <div
                className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-15 transition-opacity duration-500 group-hover:opacity-0"
                style={{ backgroundColor: "#00447f" }}
              />
              {/* Gold base accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: "#C9A84C" }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}