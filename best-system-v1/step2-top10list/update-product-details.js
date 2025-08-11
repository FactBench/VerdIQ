const fs = require('fs');

// Read current products data
const products = JSON.parse(fs.readFileSync('products-data.json', 'utf8'));

// Correct product data from user
const correctData = [
  {
    position: 1,
    name: "BeatBot AquaSense 2 Pro",
    tagline: "Master Every Pool Zone! Surface Skimming, Wall Scaling & Water Clarifying from this 5-in-1 Intelligent Powerhouse.",
    userRatings: "1,000+",
    starRating: 5.0,
    whatWeLike: [
      "True 5-in-1 cleaning tackles every pool zone (even surface!).",
      "Exceptional wall climbing & waterline scrubbing power.",
      "Visibly clarifies water while reducing chemical needs.",
      "Intelligent navigation ensures efficient, full coverage.",
      "Smart features simplify retrieval & operation."
    ],
    keyFeatures: [
      "CleverNav™ Advanced Navigation (22 Sensors).",
      "13,400mAh Battery (11hr Surface / 5hr Floor/Wall).",
      "ClearWater™ Clarification System.",
      "Smart Surface Parking & SmartDrain™ Tech.",
      "Wi-Fi App Control & Wireless Charging."
    ]
  },
  {
    position: 2,
    name: "Dolphin Nautilus CC Plus Wi-Fi",
    tagline: "The Proven All-Rounder, Making Reliable Cleaning & Smart Scheduling Easy.",
    userRatings: "17,000+",
    starRating: 4.5,
    whatWeLike: [
      "Delivers consistently thorough floor and wall cleaning.",
      "CleverClean™ smart navigation ensures efficient pool coverage.",
      "Wi-Fi app allows easy weekly scheduling (\"set & forget\").",
      "Top-load filter basket makes cleanup incredibly simple.",
      "Energy-efficient design keeps running costs very low."
    ],
    keyFeatures: [
      "Dual Scrubbing Brushes for Floor & Wall Cleaning",
      "CleverClean™ Smart Navigation System",
      "Wi-Fi Enabled with MyDolphin™ Plus App (Weekly Scheduler)",
      "Top-Load Fine Filter Cartridge System",
      "60 ft. Anti-Tangle Swivel Cable (For Pools up to 50 ft)"
    ]
  },
  {
    position: 3,
    name: "AIPER Scuba S1 Cordless",
    tagline: "Cut the Cord, Not the Clean! True Pool Freedom Has Arrived.",
    userRatings: "1,500+",
    starRating: 4.5,
    whatWeLike: [
      "True cordless freedom eliminates tangled cables and setup hassles.",
      "Caterpillar treads provide impressive traction for climbing walls.",
      "Four distinct cleaning modes (Auto, Floor, Wall, Eco) offer flexibility.",
      "Handles common medium-sized debris like leaves effectively.",
      "Easy to deploy and retrieve using the included hook."
    ],
    keyFeatures: [
      "WavePath™ Navigation 2.0 Technology.",
      "Up to 150 Minutes Advertised Runtime (Cordless).",
      "180μm Fine Filter Basket (3.5L Capacity).",
      "Caterpillar Treads for Wall Climbing (Up to 105°).",
      "4 Cleaning Modes including Eco Mode for maintenance."
    ]
  },
  {
    position: 4,
    name: "Dolphin E10 (2025 Model)",
    tagline: "Simple, Effective Floor Cleaning That Won't Break the Bank.",
    userRatings: "6,500+",
    starRating: 4.5,
    whatWeLike: [
      "Top choice for keeping above-ground pool floors spotless.",
      "Incredibly easy to use – just plug it in and press start!",
      "Active scrubbing brush tackles stuck-on dirt and algae.",
      "Top-load filter makes post-cleaning rinses quick & simple.",
      "Excellent performance at a budget-friendly price point."
    ],
    keyFeatures: [
      "Designed for Above-Ground Pools up to 30 ft.",
      "CleverClean™ Smart Navigation for floor coverage.",
      "Active Scrubbing Brush technology.",
      "Top-Load Fine Filter Basket (Ultra-Fine Optional).",
      "Fixed 1.5 Hour Cleaning Cycle."
    ]
  },
  {
    position: 5,
    name: "Polaris PCX 868 iQ Smart Robotic",
    tagline: "Total Pool Control From Your Phone, Delivering Intelligent Cleaning Performance.",
    userRatings: "100+",
    starRating: 4.5,
    whatWeLike: [
      "Control everything remotely via the powerful iAquaLink app.",
      "Cyclonic Vacuum tech maintains consistently strong suction.",
      "Excellent wall climbing and pool coverage with track wheels.",
      "Easy Lift system brings cleaner to the surface via the app.",
      "Large (4L), top-access filter canister is simple to monitor & clean."
    ],
    keyFeatures: [
      "iAquaLink App Control (Wi-Fi Connectivity).",
      "Cyclonic Vacuum Technology.",
      "Double Helix Brushes & Track Wheel Drive.",
      "4L Easy Clean Filter Canister (Top Access, Transparent Lid)",
      "Easy Lift Remote Retrieval System."
    ]
  },
  {
    position: 6,
    name: "BeatBot AquaSense 2 Ultra",
    tagline: "Conquer Expansive Pools with Unrivaled AI Power & Endurance.",
    userRatings: "500+",
    starRating: 5.0,
    whatWeLike: [
      "Massive 10-hour battery (surface mode) cleans pools up to 3,444 sq ft.",
      "HybridSense™ AI maps & navigates complex large pools with precision.",
      "True 5-in-1 cleaning tackles every surface, including water clarification.",
      "Sector-based cleaning & auto-resume ensure full coverage for extra-large pools.",
      "Powerful 5,500 GPH suction handles significant debris loads effortlessly."
    ],
    keyFeatures: [
      "HybridSense™ AI Navigation (AI Camera, TOF, IR, Ultrasonic).",
      "13,400mAh Battery (10hr Surface / 5hr Floor/Wall).",
      "Rated for Pools up to 3,444 sq. ft.",
      "5-in-1 Cleaning: Floor, Walls, Waterline, Surface, ClearWater™ Clarification.",
      "SmartDrain™ & Surface Parking for Easy Retrieval."
    ]
  },
  {
    position: 7,
    name: "WYBOT C2 Vision AI Camera Cordless",
    tagline: "Smart Vision for a Spotless Pool, AI Takes Cordless Cleaning to the Next Level.",
    userRatings: "100+",
    starRating: 4.5,
    whatWeLike: [
      "AI Vision camera intelligently detects debris & optimizes cleaning paths.",
      "\"Dirt Hunting Mode\" targets high-debris zones for 20x faster results.",
      "True cordless design offers complete freedom from tangled cables.",
      "Dual-layer filtration (180μm + 10μm HEPA) captures even fine particles.",
      "App control allows mode selection & scheduling for tailored cleaning."
    ],
    keyFeatures: [
      "AI Vision Debris Detection & Smart Path Planning.",
      "Cordless Operation (Up to 180 Mins Runtime - Eco Mode).",
      "Dual-Layer Filtration (180μm & 10μm HEPA).",
      "8 Cleaning Modes including \"Dirt Hunting Mode\".",
      "Brushless Motors & Gyroscopic Sensors for precise movement."
    ]
  },
  {
    position: 8,
    name: "AIPER Scuba X1 Cordless",
    tagline: "Experience Superior Filtration & Waterline Scrubbing, All Unplugged.",
    userRatings: "100+",
    starRating: 4.5,
    whatWeLike: [
      "Exceptional MicroMesh™ filter captures ultra-fine debris (3μm).",
      "WaveLine™ technology effectively scrubs the tricky waterline.",
      "Powerful 6,600 GPH suction handles various debris types.",
      "Smart navigation (OmniSense+™) adapts to pool layouts.",
      "Impressive 180-minute runtime for thorough cordless cleaning."
    ],
    keyFeatures: [
      "Cordless Design with up to 180-Min Runtime.",
      "MicroMesh™ Ultra-Fine Filtration (3μm + 180μm Standard).",
      "WaveLine™ Technology for Waterline Cleaning.",
      "OmniSense+™ Navigation with FlexiPath™ Planning.",
      "6,600 GPH Suction Power."
    ]
  },
  {
    position: 9,
    name: "Dolphin Premier",
    tagline: "Tackle Any Debris, From Fine Silt to Large Leaves, with Ease!",
    userRatings: "200+",
    starRating: 4.5,
    whatWeLike: [
      "Multi-Media™ system offers four filter options for any debris type.",
      "Oversized leaf bag handles large volumes of leaves and twigs.",
      "Optional NanoFilters™ capture ultra-fine particles and algae.",
      "Powerful scrubbing and commercial-grade motors ensure a deep clean.",
      "Known for exceptional durability and a strong 3-year warranty."
    ],
    keyFeatures: [
      "Multi-Media™ Filtration: Standard, Ultra-Fine, Leaf Bag, Disposable Bag.",
      "Dual Commercial-Grade DC Motors.",
      "CleverClean™ SmartNav 2.0 Navigation.",
      "Anti-Tangle Swivel Cable (60 ft).",
      "Weekly Timer & Full Filter Indicator."
    ]
  },
  {
    position: 10,
    name: "Polaris 9550 Sport Robotic",
    tagline: "Relentless Cleaning Force, Built Tough for Demanding Pools.",
    userRatings: "1,500+",
    starRating: 4.5,
    whatWeLike: [
      "Vortex Vacuum technology delivers powerful, consistent suction.",
      "4-wheel drive system aggressively climbs walls and scrubs waterline.",
      "Effectively captures large debris with its oversized filter canister.",
      "7-day programmable timer offers convenient scheduling.",
      "Easy Lift System simplifies removal from the pool."
    ],
    keyFeatures: [
      "Vortex Vacuum Technology for Enhanced Suction.",
      "4-Wheel Drive (4WD) All-Terrain System.",
      "Solid-Blade Scrubbing Brush.",
      "7-Day Programmable Timer.",
      "Motion-Sensing Remote Control."
    ]
  },
  {
    position: 11,
    name: "Betta SE Solar Powered Pool Skimmer",
    tagline: "Effortless, Sun-Powered Cleaning for a Debris-Free Pool Surface.",
    userRatings: "5,000+",
    starRating: 5.0,
    whatWeLike: [
      "Solar-powered for continuous, eco-friendly surface cleaning.",
      "Effectively captures leaves, bugs, pollen, and other floating debris.",
      "Runs for an impressive 30+ hours on a full solar charge.",
      "Very easy to use – just place it in the pool and let it work.",
      "Large, top-access filter basket simplifies debris removal."
    ],
    keyFeatures: [
      "100% Solar-Powered Operation.",
      "Fine Mesh Filter Basket (Approx. 200-micron).",
      "Twin Salt Chlorine Tolerant (SCT) Motors.",
      "Ultrasonic Obstacle Avoidance Sensors.",
      "Wireless Remote Control for targeted cleaning."
    ]
  }
];

// Update products with correct data
products.products.forEach(product => {
  const correctInfo = correctData.find(c => c.position === product.position);
  if (correctInfo) {
    // Update all fields with correct data
    product.tagline = correctInfo.tagline;
    product.userRatings = correctInfo.userRatings;
    product.starRating = correctInfo.starRating;
    product.whatWeLike = correctInfo.whatWeLike;
    product.keyFeatures = correctInfo.keyFeatures;
    
    console.log(`✅ Updated ${product.name}:`);
    console.log(`   - Tagline: ${product.tagline.substring(0, 50)}...`);
    console.log(`   - User Ratings: ${product.userRatings}`);
    console.log(`   - Star Rating: ${product.starRating}`);
    console.log(`   - What We Like: ${product.whatWeLike.length} items`);
    console.log(`   - Key Features: ${product.keyFeatures.length} items`);
  }
});

// Save updated data
fs.writeFileSync('products-data.json', JSON.stringify(products, null, 2));

console.log('\n📊 All product details have been updated with correct data!');