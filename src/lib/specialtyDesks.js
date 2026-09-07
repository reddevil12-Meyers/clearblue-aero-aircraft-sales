// Specialty desk content — copy is authoritative from the specialty desks build kit.
// Do not invent founders, hours, testimonials, or "#1" claims. No commission grid,
// no buyer-fee percentages, no FSVC mentions.

export const DESK_LINE = "A specialty desk of ClearBlue Aero.";

export const HOW_WE_WORK_STEPS = [
  {
    heading: "Define Your Mission",
    text: "We start by understanding how you intend to use the aircraft, your experience, budget, and requirements.",
  },
  {
    heading: "Find the Right Aircraft",
    text: "We search the market and identify aircraft that deserve your attention.",
  },
  {
    heading: "Evaluate and Negotiate",
    text: "We investigate the aircraft, establish a realistic value, coordinate the pre-buy, and negotiate on your behalf.",
  },
  {
    heading: "Close With Confidence",
    text: "We help coordinate the transaction through closing and delivery.",
  },
];

export const DESK_FAQ = [
  {
    q: "Is this a separate company?",
    a: "No. It is a specialty desk of ClearBlue Aero. The domain is a front door. The engagement, the listing, and the file are ClearBlue Aero.",
  },
  {
    q: "Do I have to buy an airplane you already have listed?",
    a: "No. Buyer representation is a search, including off-market, under a written consulting agreement.",
  },
  {
    q: "What if the airplane is in an estate?",
    a: "Use the Estate Aircraft Concierge page or say so on this form. Different clock. Same firm.",
  },
];

export const SPECIALTY_DESKS = [
  {
    slug: "beechcraft",
    name: "Beechcraft Buyers",
    seoTitle: "Beechcraft Buyers | Bonanza, Baron, King Air | ClearBlue Aero",
    meta: "Buyer-side Beechcraft desk for Bonanza, Baron, and King Air. Written buyer representation. Listings stay a ClearBlue Aero engagement.",
    kicker: "Beechcraft Buyers",
    h1: "A Beechcraft Desk that works for you.",
    deck: "Beechcraft Buyers is a specialty desk of ClearBlue Aero for Bonanza, Baron, and King Air buyers and owners: same firm, same expertise, different attention.",
    what: [
      "Beechcraft Buyers exists so a pilot looking for a Bonanza or Baron does not land on a generic brokerage homepage. Buyers are represented under a written consulting agreement. Owners who want that same type knowledge on the sell side can list here. The transaction is a ClearBlue Aero engagement.",
    ],
    heritage:
      "Beechcraft Buyers was founded as a Beech-focused buyer practice and is now part of ClearBlue Aero. The desk keeps the name so Beechcraft searchers still find a specialist.",
    modelsHeading: "Models in scope",
    models: [
      "Bonanza 33 / 35 / 36 / G36",
      "Baron 55 / 58 / G58",
      "King Air 90 / 200 / 300 series when the file fits our shop",
      "Travel Air, Twin Bonanza, and other Beech piston twins by request",
    ],
    modelBlocks: [
      {
        heading: "Bonanzas",
        icon: "plane",
        text: "Bonanza 33, 35, 36, and G36. The cross-country single Beech built its name on.",
        photoKey: "bonanza",
      },
      {
        heading: "Barons",
        icon: "plane-takeoff",
        text: "Baron 55, 58, and G58. The light twin that set the standard.",
        photoKey: "baron",
        cellColor: "#000000",
      },
      {
        heading: "King Airs",
        icon: "gauge",
        text: "King Air 90, 200, and 300 series when the file fits our shop.",
        photoKey: "kingair",
      },
      {
        heading: "Other Beech Twins",
        icon: "wind",
        text: "Travel Air, Twin Bonanza, and other Beech piston twins by request.",
        photoKey: "twin",
        cellColor: "#000000",
      },
    ],
    outOfScope: "Out of scope unless we say otherwise: large-cabin jets.",
    buySide:
      "Define mission and budget, screen the market including off-market, read the logs before you travel, sit the pre-buy, negotiate, and manage title through closing.",
    sellSide:
      "Exclusive listing through ClearBlue Aero, typed to Beechcraft buyers, same inventory page the rest of the firm uses.",
    sellCtaLabel: "List a Beechcraft",
    flagship: {
      heroImage: "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/e573fcf7e_image.png",
      monogram: "BB",
      kicker: "Beechcraft Buyers",
      firmLine: "A practice of ClearBlue Aero.",
      h1: "The Beechcraft file starts here.",
      deck: "Bonanza, Baron, and King Air. Spar programs, IO-550 files, and the difference between a clean A36 and a project.",
      primaryCta: { label: "Start a Bonanza search", to: "/contact" },
      sellCta: { label: "List a Beechcraft", to: "/sell" },
      fileHeading: "The Aircraft",
      italicNote: "The Beechcraft Buyers name stays because that is how owners still search.",
      otherPractices: [
        { name: "Cessna Buyers", to: "/cessna" },
        { name: "Piper Buyers", to: "/piper" },
        { name: "Meyers Buyers", to: "/meyers" },
        { name: "Vintage Aircraft", to: "/vintage" },
        { name: "All desks", to: "/specialty-desks" },
      ],
    },
  },
  {
    slug: "cirrus",
    name: "Cirrus Buyers",
    seoTitle: "Cirrus Buyers | ClearBlue Aero",
    meta: "Buyer representation and brokerage for Cirrus SR20, SR22, SR22T, and Vision Jet. A specialty desk of ClearBlue Aero.",
    kicker: "Cirrus Buyers",
    h1: "Cirrus is its own market. Treat it that way.",
    deck: "Cirrus Buyers is a specialty desk of ClearBlue Aero for SR20, SR22, SR22T, and Vision Jet buyers and owners.",
    what: [
      "Factory-supported Cirrus airframes trade on CAPS remaining life, Perspective / Perspective+ configuration, chute and engine calendar, and a buyer pool that does not shop Bonanzas the same way. This desk is that filter. The engagement is with ClearBlue Aero.",
    ],
    modelsHeading: "Models in scope",
    models: [
      "SR20",
      "SR22 and SR22T",
      "Generation and GTS / Carbon / X differences as they affect value",
      "Vision Jet SF50 when the file fits",
    ],
    modelBlocks: [
      {
        heading: "SR20",
        icon: "plane",
        text: "The entry into the Cirrus line. Glass cockpit, CAPS, and fixed-gear simplicity.",
        photoKey: "sr20",
      },
      {
        heading: "SR22 / SR22T",
        icon: "plane-takeoff",
        text: "The best-selling Cirrus. Normally aspirated and turbocharged variants.",
        photoKey: "sr22",
      },
      {
        heading: "Generations & Trim",
        icon: "gauge",
        text: "Generation and GTS / Carbon / X differences as they affect value.",
        photoKey: "sr22t",
      },
      {
        heading: "Vision Jet",
        icon: "wind",
        text: "SF50 when the file fits our shop.",
        photoKey: "vision",
      },
    ],
    buySide:
      "Mission fit (useful load, icing, chute date, avionics generation), log and CAPS review before travel, pre-buy at a shop that actually knows the type, purchase agreement and closing through ClearBlue.",
    sellSide:
      "Exclusive listing aimed at the Cirrus buyer pool, on the ClearBlue inventory.",
    sellCtaLabel: "List a Cirrus",
  },
  {
    slug: "cessna",
    name: "Cessna Buyers",
    seoTitle: "Cessna Buyers | 172–210, Twins, Cabin Class | ClearBlue Aero",
    meta: "Buyer-side Cessna desk for 172 through 210, twins, and cabin class. SID programs, gear doors, and engine status before you write the check.",
    kicker: "Cessna Buyers",
    heroImage:
      "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/b2351df04_Cessna-1024x610.webp",
    h1: "The largest used market still has type-specific traps.",
    deck: "172 through 210, twins, and cabin class. SID programs, gear-door play, and engine status decide the price.",
    what: [
      "Cessna is the largest used market in general aviation. That is why a listing site fails buyers. Corrosion, gear doors, SID / inspection programs, and engine status are type-specific. This desk is the Cessna door into ClearBlue Aero.",
    ],
    modelsHeading: "Models in scope",
    models: [
      "172 / 172R / 172S and common variants",
      "182 / 182RG / T182",
      "206 / T206",
      "210 / T210, including gear and spar considerations as they affect a given serial",
      "310 / 340 and other piston twins by request",
      "400-series and cabin-class Cessna when the file fits",
    ],
    modelBlocks: [
      {
        heading: "172 & 182",
        icon: "plane",
        text: "172, 172R, and 172S; 182, 182RG, and T182. The training and personal staple, and the useful-load workhorse of the Cessna line.",
        photoKey: "c172",
      },
      {
        heading: "206 & 210",
        icon: "plane-takeoff",
        text: "206 and T206; 210 and T210, with gear and spar considerations by serial. Six seats, fixed gear, big cabin.",
        photoKey: "c206",
      },
      {
        heading: "Piston Twins",
        icon: "gauge",
        text: "310, 340, and other piston twins by request.",
        photoKey: "cessnatwin",
        cellColor: "#000000",
      },
      {
        heading: "Cabin Class",
        icon: "wind",
        text: "400-series and cabin-class Cessna when the file fits.",
        photoKey: "cabin",
        cellColor: "#000000",
      },
    ],
    buySide:
      "Define the mission (training, family, IFR platform, useful load), screen airframes against corrosion and inspection history, pre-buy, close through ClearBlue.",
    sellSide:
      "Exclusive listing on the ClearBlue inventory, written for Cessna buyers.",
    sellCtaLabel: "List a Cessna",
    hero: {
      layout: "photo-center",
      primaryCta: { label: "Start a Cessna search", to: "/contact" },
      fileHeading: "The Aircraft",
      otherPractices: [
        { name: "Beechcraft Buyers", to: "/beechcraft" },
        { name: "Piper Buyers", to: "/piper" },
        { name: "Meyers Buyers", to: "/meyers" },
        { name: "Vintage Aircraft", to: "/vintage" },
        { name: "All desks", to: "/specialty-desks" },
      ],
    },
  },
  {
    slug: "piper",
    name: "Piper Buyers",
    seoTitle: "Piper Buyers | PA-28 through PA-46 | ClearBlue Aero",
    meta: "Buyer-side Piper desk from Cherokee through M-Class and PA-46. Spar talk and engine programs are not the same file.",
    kicker: "Piper Buyers",
    h1: "Cherokee to M-Class is not one airplane.",
    deck: "PA-28 through PA-46 and the Piper twins we work. A wing-spar conversation on a Cherokee is not a Meridian engine program.",
    what: [
      "Piper covers a training 140 and a pressurized Meridian under the same badge. Buyers need someone who will not confuse those files. This desk is that distinction. The engagement is with ClearBlue Aero.",
    ],
    modelsHeading: "Models in scope",
    models: [
      "PA-28 series (Cherokee, Archer, Arrow, Dakota)",
      "PA-32 series (Cherokee Six, Saratoga, 6X)",
      "PA-44 Seminole",
      "PA-23 / PA-34 / PA-31 twins by request",
      "PA-46 Malibu / Mirage / Matrix / M350 / M500 / M600 / Meridian when the file fits",
      "Comanche and Twin Comanche by request",
    ],
    modelBlocks: [
      {
        heading: "PA-28 Line",
        icon: "plane",
        text: "Cherokee, Archer, Arrow, and Dakota. The Piper singles most pilots learn on.",
        photoKey: "pa28",
      },
      {
        heading: "PA-32 Line",
        icon: "plane-takeoff",
        text: "Cherokee Six, Saratoga, and 6X. The six-seat haulers.",
        photoKey: "pa32",
      },
      {
        heading: "Seminole",
        icon: "gauge",
        text: "PA-44. The light twin built for training and travel.",
        photoKey: "pa44",
      },
      {
        heading: "M-Class & Malibu",
        icon: "wind",
        text: "PA-46 Malibu, Mirage, Matrix, M350, M500, M600, and Meridian when the file fits.",
        photoKey: "pa46",
      },
    ],
    buySide:
      "Mission and useful load first, then spar / wing / corrosion / engine-program status that actually applies to that serial, pre-buy, close through ClearBlue.",
    sellSide:
      "Exclusive listing on the ClearBlue inventory, written for Piper buyers.",
    sellCtaLabel: "List a Piper",
    hero: {
      layout: "photo-left",
      heroImage:
        "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/6c16a9484_image.png",
      primaryCta: { label: "Start a Piper search", to: "/contact" },
      fileHeading: "The Aircraft",
      otherPractices: [
        { name: "Beechcraft Buyers", to: "/beechcraft" },
        { name: "Cessna Buyers", to: "/cessna" },
        { name: "Meyers Buyers", to: "/meyers" },
        { name: "Vintage Aircraft", to: "/vintage" },
        { name: "All desks", to: "/specialty-desks" },
      ],
    },
  },
  {
    slug: "meyers",
    name: "Meyers Buyers",
    seoTitle: "Meyers Buyers | 200 Series and MAC | ClearBlue Aero",
    meta: "Buyer-side Meyers desk for 200 series and scarce MAC airframes. Thin comps, tribal parts, serial-level files.",
    kicker: "Meyers Buyers",
    h1: "Scarce serials need a desk that already knows them.",
    deck: "Meyers 200 series and related MAC airframes. Thin comps. Parts are tribal. The file is not a 182 with different paint.",
    what: [
      "Meyers is not a high-volume market. That is the point. Buyers and estates cannot shop a 200 the way they shop a 182. Parts, logs, and comparable sales are thin. The principal of ClearBlue Aero owns a Meyers 200C, so these files are not treated like a common single. The engagement is with ClearBlue Aero.",
    ],
    modelsHeading: "Models in scope",
    models: [
      "Meyers 200 / 200A / 200B / 200C / 200D",
      "Related MAC airframes by serial, confirmed at intake",
      "Not a catch-all for every obscure experimental unless we accept the file in writing",
    ],
    modelBlocks: [
      {
        heading: "200 Series",
        icon: "plane",
        text: "Meyers 200, 200A, 200B, 200C, and 200D. Fast, slippery, and scarce.",
        photoKey: "meyers200",
      },
      {
        heading: "Related MAC Airframes",
        icon: "plane-takeoff",
        text: "Related MAC airframes by serial, confirmed at intake.",
        photoKey: "mac",
      },
    ],
    buySide:
      "Confirm the serial and documentation first, then value against a thin comp set, pre-buy with a shop that will actually touch the type, close through ClearBlue.",
    sellSide:
      "Exclusive listing aimed at the small Meyers buyer pool, on the ClearBlue inventory.",
    estateNote:
      "Estate files use the Estate Aircraft Concierge path when the owner is deceased.",
    sellCtaLabel: "List a Meyers",
    hero: {
      layout: "navy-center",
      heroImage:
        "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/f0ae29118_IMG_4926.jpeg",
      primaryCta: { label: "Start a Meyers search", to: "/contact" },
      fileHeading: "The Aircraft",
      otherPractices: [
        { name: "Beechcraft Buyers", to: "/beechcraft" },
        { name: "Cessna Buyers", to: "/cessna" },
        { name: "Piper Buyers", to: "/piper" },
        { name: "Vintage Aircraft", to: "/vintage" },
        { name: "All desks", to: "/specialty-desks" },
      ],
    },
  },
  {
    slug: "vintage",
    name: "Vintage Aircraft",
    seoTitle: "Vintage Aircraft Desk | ClearBlue Aero",
    meta: "Rag-and-tube, early metal, and orphan types. Provenance-first buyer representation and discreet listings.",
    kicker: "Vintage Aircraft",
    h1: "Old airplanes are not cheap 172s with patina.",
    deck: "Rag-and-tube, early metal, warbird-adjacent, and orphan types. Provenance is the product. A pretty restore can still be a bad story.",
    what: [
      "A 1946 Swift, a Stinson 108, a Waco, or a first-generation experimental is a different file from a late Archer. Logs are incomplete. Parts are tribal knowledge. Buyers will pay for provenance and walk away from a pretty restore with a bad story. This desk exists so those airframes are screened, valued, and closed by people who have actually moved them. The engagement is with ClearBlue Aero.",
    ],
    modelsHeading:
      "In scope (examples, not a closed list; confirm the type at intake)",
    models: [
      "Pre-1960 production singles and twins still in civil use",
      "Rag-and-tube and tube-and-fabric (Stinson, Waco, Taylorcraft, early Piper, similar)",
      "Early metal classics (Swift, early Mooney, Navion, similar)",
      "Warbird-adjacent civilian types we accept in writing",
      "Orphan and low-production types (including some experimentals) when we take the file",
      "Estate vintage airframes: start here or on /estate-aircraft; same firm, different clock",
    ],
    modelBlocks: [
      {
        heading: "Rag-and-Tube",
        icon: "plane",
        text: "Stinson, Waco, Taylorcraft, and early Piper fabric types.",
        photoKey: "rag",
      },
      {
        heading: "Early Metal",
        icon: "plane-takeoff",
        text: "Swift, early Mooney, Navion, and similar first-generation metal.",
        photoKey: "metal",
      },
      {
        heading: "Warbird-Adjacent",
        icon: "gauge",
        text: "Civilian types we accept in writing.",
        photoKey: "warbird",
      },
      {
        heading: "Orphan Types",
        icon: "wind",
        text: "Low-production and some experimental types when we take the file.",
        photoKey: "orphan",
      },
    ],
    outOfScopeHeading: "Out of scope unless accepted in writing:",
    outOfScopeItems: [
      "Museum deaccession programs we are not staffed for",
      "Unregistered wrecks with no data plate",
      "Jet warbirds and turbine restorations outside our shop",
    ],
    buySide:
      "Confirm identity (data plate, serial, registration history) before travel; read what logs exist and say what is missing; pre-buy at a shop that will touch fabric, wood, or the actual type; ferry and insurance are not assumed.",
    sellSide:
      "Exclusive listing aimed at the vintage buyer pool, on the ClearBlue inventory. Do not price it like a late 172.",
    estateNote: "If the owner is deceased, use Estate Aircraft Concierge.",
    sellCtaLabel: "List a vintage aircraft",
    hero: {
      layout: "photo-left",
      heroImage:
        "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/5a95d7b61_8b53a4f1b_IMG_4852.jpg",
      primaryCta: { label: "Start a vintage search", to: "/contact" },
      fileHeading: "The Aircraft",
      otherPractices: [
        { name: "Beechcraft Buyers", to: "/beechcraft" },
        { name: "Cessna Buyers", to: "/cessna" },
        { name: "Piper Buyers", to: "/piper" },
        { name: "Meyers Buyers", to: "/meyers" },
        { name: "All desks", to: "/specialty-desks" },
      ],
    },
  },
];

export const getDesk = (slug) => SPECIALTY_DESKS.find((d) => d.slug === slug);

export const HUB_CONTENT = {
  seoTitle: "Specialty Aircraft Desks | ClearBlue Aero",
  meta:
    "Dedicated buyer and seller desks for Beechcraft, Cessna, Piper, Meyers, and vintage aircraft, each a branded front door into ClearBlue Aero.",
  h1: "Specialty desks. One brokerage.",
  deck:
    "Come in by type. The engagement is still ClearBlue Aero.",
  cards: [
    { slug: "beechcraft", name: "Beechcraft Buyers", blurb: "Bonanza, Baron, King Air." },
    { slug: "cessna", name: "Cessna Buyers", blurb: "172 through 210, twins, and the cabin class." },
    { slug: "piper", name: "Piper Buyers", blurb: "Cherokee through M-class, twins, and the PA-46 line." },
    { slug: "meyers", name: "Meyers Buyers", blurb: "Meyers 200 series and scarce MAC airframes." },
    { slug: "vintage", name: "Vintage Aircraft", blurb: "Rag-and-tube, early metal, warbird-adjacent, and orphan types." },
  ],
  footnote:
    "The make domains (beechcraftbuyers.com, cessnabuyers.com, piperbuyers.com, meyersbuyers.com) are front doors. Vintage lives at /vintage unless a vintage domain is pointed there. The work, the listing, and the file live at ClearBlue Aero.",
};