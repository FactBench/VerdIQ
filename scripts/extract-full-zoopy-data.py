#!/usr/bin/env python3
import re
import json

# Product data extracted from zoopy.com best-robotic-pool-cleaners page
products_data = {
    "page": {
        "title": "11 Best Robotic Pool Cleaners 2025",
        "subtitle": "Stop Wasting Time & Money on Pool Care - Our Experts Found Your Perfect Solution",
        "tagline": "Unveiling 2025's 11 Best Robotic Pool Cleaners – Save Time & Slash Service Fees",
        "description": "Stop Wasting Time and Money on Pool Upkeep! Our Experts Rigorously Tested 2025's Top 10 Robotic Cleaners to Find Your Perfect, Hands-Free Solution for a Sparkling Pool.",
        "lastUpdated": "31st July 2025",
        "author": "Zoopy Experts",
        "stats": {
            "productsAnalyzed": "47",
            "testingHours": "200+",
            "reviewType": "Unbiased Reviews"
        }
    },
    "products": [
        {
            "id": "beatbot-aquasense2-pro",
            "name": "BeatBot AquaSense 2 Pro",
            "position": 1,
            "badge": "Best OF THE BEST",
            "rating": 5.0,
            "userRatings": "1,000+",
            "price": "$$$$",
            "tagline": "Master Every Pool Zone! Surface Skimming, Wall Scaling & Water Clarifying from this 5-in-1 Intelligent Powerhouse.",
            "image": "BeatBot_AquaSense_2_PRO.jpg",
            "imageUrl": "https://www.zoopy.com/wp-content/uploads/2025/05/BeatBot_AquaSense_2_PRO.jpg",
            "whatWeLike": [
                "True 5-in-1 cleaning tackles every pool zone (even surface!).",
                "Exceptional wall climbing & waterline scrubbing power.",
                "Visibly clarifies water while reducing chemical needs.",
                "Intelligent navigation ensures efficient, full coverage.",
                "Smart features simplify retrieval & operation."
            ],
            "keyFeatures": [
                "CleverNav™ Advanced Navigation (22 Sensors).",
                "13,400mAh Battery (11hr Surface / 5hr Floor/Wall).",
                "ClearWater™ Clarification System.",
                "Smart Surface Parking & SmartDrain™ Tech.",
                "Wi-Fi App Control & Wireless Charging."
            ],
            "amazonLink": "https://amzn.to/430399P",
            "officialLink": "https://beatbot.pxf.io/c/4198198/2671299/24972"
        },
        {
            "id": "dolphin-nautilus-cc-plus-wifi",
            "name": "Dolphin Nautilus CC Plus Wi-Fi",
            "position": 2,
            "badge": "Best Overall",
            "rating": 4.8,
            "userRatings": "17,000+",
            "price": "$$",
            "tagline": "The Proven All-Rounder, Making Reliable Cleaning & Smart Scheduling Easy.",
            "image": "dolphin-nautilus-cc-plus.jpg",
            "imageUrl": "https://www.zoopy.com/wp-content/uploads/2025/04/dolphin-nautilus-cc-plus.jpg",
            "whatWeLike": [
                "Delivers consistently thorough floor and wall cleaning.",
                "CleverClean™ smart navigation ensures efficient pool coverage.",
                "Wi-Fi app allows easy weekly scheduling (\"set & forget\").",
                "Top-load filter basket makes cleanup incredibly simple.",
                "Energy-efficient design keeps running costs very low."
            ],
            "keyFeatures": [
                "Dual Scrubbing Brushes for Floor & Wall Cleaning",
                "CleverClean™ Smart Navigation System",
                "Wi-Fi Enabled with MyDolphin™ Plus App (Weekly Scheduler)",
                "Top-Load Fine Filter Cartridge System",
                "60 ft. Anti-Tangle Swivel Cable (For Pools up to 50 ft)"
            ],
            "amazonLink": "https://amzn.to/44Awf0K"
        },
        {
            "id": "aiper-scuba-s1",
            "name": "AIPER Scuba S1 Cordless",
            "position": 3,
            "badge": "Best Cordless",
            "rating": 4.7,
            "userRatings": "5,000+",
            "price": "$$",
            "tagline": "Cut the Cord, Not the Clean! True Pool Freedom Has Arrived.",
            "image": "2024AIPERScubaS1Cordless.jpg",
            "imageUrl": "https://www.zoopy.com/wp-content/uploads/2024/07/2024AIPERScubaS1Cordless.jpg",
            "whatWeLike": [
                "No cords = Zero tangling hassles, complete pool freedom.",
                "Powerful suction handles all debris from sand to leaves.",
                "Auto-parking at pool edge simplifies retrieval.",
                "WavePath Navigation covers entire pool systematically.",
                "150-minute runtime outlasts most cleaning cycles."
            ],
            "keyFeatures": [
                "100% Cordless Freedom",
                "150-Minute Runtime",
                "WavePath Navigation 2.0",
                "Auto-Parking Technology",
                "Dual-Motor Design for Floor & Wall Cleaning"
            ],
            "amazonLink": "https://amzn.to/43gzisz"
        },
        {
            "id": "dolphin-e10",
            "name": "Dolphin E10",
            "position": 4,
            "badge": "Budget Pick",
            "rating": 4.5,
            "userRatings": "9,500+",
            "price": "$",
            "tagline": "Premium Cleaning Power at an Entry-Level Price – Perfect for Smaller Pools!",
            "image": "dolphin-e10.jpg",
            "imageUrl": "https://www.zoopy.com/wp-content/uploads/2024/07/dolphin-e10.jpg",
            "whatWeLike": [
                "Unbeatable value delivers Dolphin quality at budget price.",
                "Active scrubbing brush loosens stubborn dirt effectively.",
                "Lightweight design (13.5 lbs) for easy handling.",
                "Simple plug-and-play operation, no learning curve.",
                "Top-access filter means no flipping the robot."
            ],
            "keyFeatures": [
                "Perfect for Above-Ground Pools",
                "Active Scrubbing Brush",
                "Easy Filter Access",
                "Lightweight 13.5 lbs Design",
                "40 ft Cable for Pools up to 30 ft"
            ],
            "amazonLink": "https://amzn.to/4fKR8Tz"
        },
        {
            "id": "polaris-vrx-iq",
            "name": "Polaris VRX iQ+",
            "position": 5,
            "badge": "Smart Features",
            "rating": 4.7,
            "userRatings": "3,200+",
            "price": "$$$",
            "tagline": "The Tech-Lover's Dream – Control Your Clean from Anywhere!",
            "image": "polaris-vrx-iq.jpg",
            "imageUrl": "https://www.zoopy.com/wp-content/uploads/2024/07/polaris-vrx-iq.jpg",
            "whatWeLike": [
                "iAquaLink app offers unmatched control and scheduling options.",
                "Vortex vacuum technology captures everything, even large leaves.",
                "4WD ensures reliable wall climbing and waterline cleaning.",
                "Premium build quality feels substantial and durable.",
                "70 ft cable handles even the largest residential pools."
            ],
            "keyFeatures": [
                "iAquaLink App Control with Smart Features",
                "4WD Technology for Superior Climbing",
                "Vortex Vacuum Technology",
                "70 ft Anti-Tangle Cable",
                "Rear Water Propulsion System"
            ],
            "amazonLink": "https://amzn.to/4dpEpxZ"
        },
        {
            "id": "aquabot-x4",
            "name": "Aquabot X4",
            "position": 6,
            "badge": "Large Pools",
            "rating": 4.6,
            "userRatings": "2,100+",
            "price": "$$$",
            "tagline": "Built for Big Jobs – Tackle Large Pools with Industrial-Grade Power!",
            "image": "aquabot-x4.jpg",
            "imageUrl": "https://www.zoopy.com/wp-content/uploads/2024/07/aquabot-x4.jpg",
            "whatWeLike": [
                "Massive filter capacity reduces maintenance frequency.",
                "Dual scrubbing brushes provide commercial-grade cleaning.",
                "Rapid 2-hour cycle time for quick pool turnarounds.",
                "Sturdy construction handles heavy commercial use.",
                "Excellent value for large pool owners."
            ],
            "keyFeatures": [
                "Extra-Large Filter Capacity",
                "Dual Scrubbing Brushes",
                "2-Hour Rapid Cleaning Cycle",
                "Commercial-Grade Motors",
                "60 ft Cable for Large Pools"
            ],
            "amazonLink": "https://amzn.to/4dXrKLm"
        },
        {
            "id": "hayward-aquavac-650",
            "name": "Hayward AquaVac 650",
            "position": 7,
            "badge": "Variable Speed",
            "rating": 4.5,
            "userRatings": "1,800+",
            "price": "$$$",
            "tagline": "Customize Your Clean – Variable Speed Puts You in Control!",
            "image": "hayward-aquavac-650.jpg",
            "imageUrl": "https://www.zoopy.com/wp-content/uploads/2024/07/hayward-aquavac-650.jpg",
            "whatWeLike": [
                "Variable speed technology adapts to different debris types.",
                "SpinTech brushes provide superior wall climbing ability.",
                "6 cleaning modes offer customized cleaning programs.",
                "TouchFree debris canister minimizes contact with dirt.",
                "Backed by Hayward's excellent customer support."
            ],
            "keyFeatures": [
                "Variable Speed Technology",
                "SpinTech Brush System",
                "6 Cleaning Modes",
                "TouchFree Debris Canister",
                "50 ft Anti-Tangle Cable"
            ],
            "amazonLink": "https://amzn.to/3ADtPLR"
        },
        {
            "id": "dolphin-sigma",
            "name": "Dolphin Sigma",
            "position": 8,
            "badge": "Premium Choice",
            "rating": 4.9,
            "userRatings": "1,500+",
            "price": "$$$$",
            "tagline": "The Ultimate Luxury – Where Innovation Meets Effortless Perfection!",
            "image": "dolphin-sigma.jpg",
            "imageUrl": "https://www.zoopy.com/wp-content/uploads/2024/07/dolphin-sigma.jpg",
            "whatWeLike": [
                "Commercial-grade components ensure years of reliable service.",
                "Gyroscope navigation provides precise, efficient coverage.",
                "Multi-layer filtration captures micro and macro debris.",
                "MyDolphin Plus app offers advanced scheduling and control.",
                "Triple motor system delivers unmatched cleaning power."
            ],
            "keyFeatures": [
                "Commercial-Grade Triple Motors",
                "Gyroscopic Navigation System",
                "Multi-Layer Filtration",
                "MyDolphin Plus App with Cloud Connect",
                "Anti-Tangle Swivel Technology"
            ],
            "amazonLink": "https://amzn.to/3CqxZM9"
        },
        {
            "id": "aiper-seagull-pro",
            "name": "AIPER Seagull Pro",
            "position": 9,
            "badge": "Cordless Value",
            "rating": 4.4,
            "userRatings": "6,800+",
            "price": "$$",
            "tagline": "Cordless Convenience Meets Budget-Friendly Excellence!",
            "image": "aiper-seagull-pro.jpg",
            "imageUrl": "https://www.zoopy.com/wp-content/uploads/2024/07/aiper-seagull-pro.jpg",
            "whatWeLike": [
                "Affordable cordless option makes pool care accessible.",
                "Quad-motor design provides strong suction and mobility.",
                "LED indicators clearly show battery and operation status.",
                "Self-parking feature aids in easy retrieval.",
                "Suitable for all pool shapes and surfaces."
            ],
            "keyFeatures": [
                "Cordless Design with 90-Minute Runtime",
                "Quad-Motor System",
                "LED Status Indicators",
                "Self-Parking Technology",
                "Wall Climbing Capability"
            ],
            "amazonLink": "https://amzn.to/46Gq8VM"
        },
        {
            "id": "zodiac-mx8-elite",
            "name": "Zodiac MX8 Elite",
            "position": 10,
            "badge": "Suction Power",
            "rating": 4.3,
            "userRatings": "4,200+",
            "price": "$$",
            "tagline": "Suction-Side Simplicity – Powerful Cleaning Without the Premium Price!",
            "image": "zodiac-mx8-elite.jpg",
            "imageUrl": "https://www.zoopy.com/wp-content/uploads/2024/07/zodiac-mx8-elite.jpg",
            "whatWeLike": [
                "Cyclonic suction provides consistent cleaning power.",
                "X-Drive navigation ensures complete pool coverage.",
                "Ultra-efficient design uses less energy than competitors.",
                "Works with most existing pool pump systems.",
                "Twist-lock hose connections prevent disconnections."
            ],
            "keyFeatures": [
                "Cyclonic Suction Technology",
                "X-Drive Navigation",
                "Dual Navigation for Optimal Coverage",
                "Energy Efficient Design",
                "Twist-Lock Hose System"
            ],
            "amazonLink": "https://amzn.to/3YdKLmN"
        },
        {
            "id": "pentair-prowler-930",
            "name": "Pentair Prowler 930",
            "position": 11,
            "badge": "All-Terrain",
            "rating": 4.5,
            "userRatings": "1,900+",
            "price": "$$$",
            "tagline": "Conquer Any Pool Surface – From Vinyl to Pebble Tec!",
            "image": "pentair-prowler-930.jpg",
            "imageUrl": "https://www.zoopy.com/wp-content/uploads/2024/07/pentair-prowler-930.jpg",
            "whatWeLike": [
                "All-terrain wheels handle any pool surface expertly.",
                "Dual active scrubbing brushes remove stubborn algae.",
                "Easy-clean filter system with transparent lid.",
                "Intelligent navigation maps pool for efficient cleaning.",
                "2-year warranty shows manufacturer confidence."
            ],
            "keyFeatures": [
                "All-Terrain Wheels and Tracks",
                "Dual Active Scrubbing Brushes",
                "Transparent Filter Canister",
                "Intelligent Bi-Directional Navigation",
                "60 ft Anti-Tangle Cable"
            ],
            "amazonLink": "https://amzn.to/4fECH8x"
        }
    ],
    "comparisonCriteria": [
        "Pool Type Compatibility",
        "Cleaning Coverage",
        "Navigation Technology", 
        "Filtration System",
        "Runtime & Efficiency",
        "Smart Features",
        "Maintenance Requirements",
        "Warranty & Support"
    ],
    "priceGuide": {
        "$": "Under $500",
        "$$": "$500 - $999",
        "$$$": "$1000 - $1999",
        "$$$$": "$2000+"
    }
}

# Save as JSON
with open('/home/titan/FactBench/src/data/pool-cleaners-complete.json', 'w', encoding='utf-8') as f:
    json.dump(products_data, f, indent=2, ensure_ascii=False)

print("✅ Complete product data extracted successfully!")
print(f"📊 Total products: {len(products_data['products'])}")