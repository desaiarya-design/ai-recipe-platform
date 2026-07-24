import { Camera, BookOpen, ChefHat, Search } from "lucide-react";

export const SITE_STATS = [
  { label: "Free Scans", val: "10/mo" },
  { label: "Recipes Generated", val: "1M+" },
  { label: "Cost to Start", val: "$0" },
  { label: "App Store Rating", val: "4.9" },
];

export const FEATURES = [
  {
    title: "Scan Your Pantry",
    description:
      "Photo recognition that actually works. Know what you have instantly.",
    icon: Camera,
    limit: "10 scans/mo free",
  },
  {
    title: "AI Chef Suggestions",
    description:
      "Turn random ingredients into a gourmet meal. Zero food waste.",
    icon: ChefHat,
    limit: "5 meals/mo free",
  },
  {
    title: "Search Any Dish",
    description:
      "Find any recipe instantly. Filter by cuisine, time, or dietary needs.",
    icon: Search,
    limit: "Unlimited searches",
  },
  {
    title: "Digital Cookbook",
    description: "Save your favorites. Export as PDF. Share with family.",
    icon: BookOpen,
    limit: "3 saves/mo free",
  },
];

export const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Scan",
    desc: "Point camera at fridge. AI identifies ingredients.",
  },
  {
    step: "02",
    title: "Select",
    desc: "Choose a generated recipe based on your mood.",
  },
  {
    step: "03",
    title: "Savor",
    desc: "Follow simple steps. Eat delicious food.",
  },
];

// Helper function for category emojis
export function getCategoryEmoji(category) {
  const emojiMap = {
    Beef: "🥩",
    Chicken: "🍗",
    Dessert: "🍰",
    Lamb: "🍖",
    Miscellaneous: "🍴",
    Pasta: "🍝",
    Pork: "🥓",
    Seafood: "🦐",
    Side: "🥗",
    Starter: "🥟",
    Vegan: "🥬",
    Vegetarian: "🥕",
    Breakfast: "🍳",
    Goat: "🐐",
  };
  return emojiMap[category] || "🍽️";
}

export function getCountryFlag(country) {
  const emojiMap = {
  Afghan: "🏔️",                  // Hindu Kush Mountains
  Albanian: "🦅",                 // Double-headed eagle
  Algerian: "🏜️",                // Sahara Desert
  Andorran: "⛰️",                // Pyrenees Mountains
  Angolan: "🦒",                  // African wildlife
  "Antiguan, Barbudan": "🏖️",     // Caribbean beaches
  Argentine: "⚽",                // Football
  Armenian: "⛪",                 // Ancient churches
  Aruban: "🌴",                   // Tropical island
  Australian: "🦘",              // Kangaroo
  Austrian: "🎻",                 // Classical music (Mozart)
  Azerbaijani: "🔥",             // Land of Fire
  Bahamian: "🏝️",                // Islands
  Bahraini: "🦪",                // Pearl diving
  Bangladeshi: "🛶",             // Rivers & boats
  Barbadian: "🌺",               // Tropical flowers
  Belarusian: "🌲",              // Forests
  Belgian: "🍫",                 // Chocolate
  Belizean: "🐠",                // Barrier Reef
  Beninese: "🪘",                // African drums
  Bermudian: "🩳",               // Bermuda shorts
  Bhutanese: "🐉",               // Thunder Dragon
  Bolivian: "🦙",                // Llama
  "Bosnian, Herzegovinian": "🌉", // Mostar Bridge
  Motswana: "🦓",                // Zebra
  Brazilian: "🌴",               // Amazon rainforest
  Bruneian: "🕌",                // Omar Ali Saifuddien Mosque
  Bulgarian: "🌹",               // Rose Valley
  Burkinabe: "🥜",               // Peanuts
  Burundian: "🥁",               // Royal Drums
  Cambodian: "🛕",               // Angkor Wat
  Cameroonian: "🦁",             // Lions
  Canadian: "🍁",                // Maple Leaf
  "Cape Verdian": "🌊",          // Atlantic Ocean
  Caymanian: "🐢",               // Sea turtles
  "Central African": "🦍",       // Gorillas
  Chadian: "🐪",                 // Sahara Desert
  Chilean: "🗿",                 // Easter Island Moai
  Chinese: "🥢",                 // Chopsticks
  Colombian: "☕",               // Coffee
  "Costa Rican": "🦥",           // Sloths
  Croatian: "⛵",
  Cuban: "🥃",                    // Cuban rum
  Cypriot: "🏛️",                 // Ancient ruins
  Czech: "🍺",                    // Czech beer
  Danish: "🧱",                   // LEGO
  Djibouti: "🌋",                 // Lake Assal volcanoes
  Dominican: "🏝️",               // Caribbean beaches
  Congolese: "🦍",                // Gorillas
  Ecuadorean: "🌋",               // Andes volcanoes
  Egyptian: "🐪",                 // Desert & camels
  Salvadoran: "🫓",               // Pupusas
  "Equatorial Guinean": "🌴",     // Tropical rainforests
  Eritrean: "☕",                 // Coffee culture
  Estonian: "🌲",                 // Forests
  Ethiopian: "☕",                // Coffee origin
  Faroese: "🐑",                  // Sheep islands
  Fijian: "🌺",                   // Tropical flowers
  Finnish: "🦌",                  // Reindeer
  French: "🥐",                  // Croissant
  Gabonese: "🦍",                 // Gorillas
  Gambian: "🐊",                  // Crocodiles
  Georgian: "🍷",                 // Wine
  German: "🥨",                   // Pretzel
  Ghanaian: "🥁",                 // Drumming
  Gibraltar: "🪨",               // Rock of Gibraltar
  Greek: "🏛️",                   // Ancient temples
  Greenlandic: "🧊",             // Icebergs
  Grenadian: "🌰",               // Nutmeg
  Guadeloupian: "🌴",            // Caribbean island
  Guamanian: "🌺",               // Pacific island
  Guatemalan: "🌋",              // Volcanoes
  "Channel Islander": "⛵",       // English Channel
  Guinean: "🥁",                  // Traditional drums
  "Guinea-Bissauan": "🥜",        // Cashew nuts
  Guyanese: "🌿",                // Rainforest
  Haitian: "🥁",                  // Haitian music
  Honduran: "🦜",                 // Tropical parrots
  HongKong: "🥟",             // Dim sum
  Hungarian: "🌶️",              // Paprika
  Icelander: "🌋",               // Volcanoes
  Indian: "🇮🇳",   
   Indonesian: "🌋",             // Volcanoes
  Iranian: "🕌",                // Persian architecture
  Iraqi: "🌴",                  // Date palms
  Irish: "☘️",                  // Shamrock
  Israeli: "🕍",                // Historic temples
  Italian: "🍕",                // Pizza
  Ivorian: "🥥",                // Cocoa & coconuts
  Jamaican: "🥭",               // Tropical fruits
  Japanese: "🍣",               // Sushi
  "Channel Islander": "⛵",      // English Channel
  Jordanian: "🏜️",             // Petra desert
  Kazakhstani: "🦅",            // Golden eagle
  Kenyan: "🦁",                 // Safari
  Kosovar: "⛰️",               // Mountains
  Kuwaiti: "🛢️",               // Oil
  Kirghiz: "🐎",                // Horses
  Laotian: "🛕",                // Buddhist temples
  Latvian: "🌲",               // Forests
  Lebanese: "🌲",              // Cedar trees
  Mosotho: "🏔️",              // Highlands
  Liberian: "🌴",              // Palm trees
  Libyan: "🏜️",               // Sahara
  Liechtensteiner: "🏰",       // Castles
  Lithuanian: "🏀",            // Basketball
  Luxembourger: "🏰",          // Castles
  Malagasy: "🦎",              // Chameleons
  Malawian: "🐟",              // Lake Malawi
  Malaysian: "🥥",             // Coconut cuisine
  Maldivan: "🏝️",             // Islands
  Malian: "🐪",                // Desert
  Maltese: "⛪",               // Historic churches
  Mauritian: "🌺",             // Tropical flowers
  Mexican: "🌮",               // Tacos
  Moldovan: "🍇",              // Vineyards
  Mongolian: "🐎",             // Horses
  Montenegrin: "⛰️",          // Mountains
  Moroccan: "🕌",              // Mosques
  Mozambican: "🐘",            // Elephants
  Burmese: "🛕",               // Pagodas
  Namibian: "🦒",              // Wildlife
  Nepalese: "🏔️",             // Himalayas
  Dutch: "🌷",                 // Tulips
  "New Zealander": "🥝",       // Kiwi
  Nicaraguan: "🌋",            // Volcanoes
  Nigerien: "🐪",              // Sahara
  Nigerian: "🥁",              // African drums
  "North Korean": "⛰️",        // Mountains
  Macedonian: "☀️",           // Vergina Sun
  Norwegian: "🐟",             // Salmon
  Omani: "🇴",                 // Desert & forts
  Pakistani: "🥭",             // Mangoes
  Palestinian: "🫒",           // Olive trees
  Panamanian: "🚢",            // Panama Canal
  "Papua New Guinean": "🦜",   // Birds of Paradise
  Paraguayan: "🧉",            // Mate
  Peruvian: "🦙",              // Llama
  Filipino: "🥥",              // Coconut
  Polish: "🥟",                // Pierogi
  Portuguese: "🚢",            // Explorers
  "Puerto Rican": "🏝️",       // Caribbean
  Qatari: "🏙️",               // Doha skyline
  Congolese: "🦍",             // Gorillas
  Romanian: "🏰",              // Dracula's castle
  Russian: "🪆",               // Matryoshka dolls
  Rwandan: "🦍",               // Mountain gorillas
  "Saint Lucian": "🌴",        // Caribbean island
  Samoan: "🌺",                // Island flowers
  Sammarinese: "🏰",           // Medieval towers
  "Saudi Arabian": "🕋",       // Kaaba
  Senegalese: "🥁",            // Music
  Serbian: "🎾",               // Tennis
  Seychellois: "🏝️",          // Beaches
  "Sierra Leonean": "💎",      // Diamonds
  Singaporean: "🦁",           // Merlion
  Slovak: "🏔️",               // Tatras
  Slovene: "🏞️",              // Lake Bled
  "Solomon Islander": "🐠",    // Coral reefs
  Somali: "🐪",                // Camels
  "South African": "🦏",       // Rhino
  "South Korean": "🍜",        // Korean cuisine
  "South Sudanese": "🦒",      // Wildlife
  Spanish: "💃",               // Flamenco
  "Sri Lankan": "🍛",          // Curry
  Sudanese: "🐪",              // Desert
  Surinamer: "🌴",
    Swedish: "🫎",             // Moose
  Swiss: "🧀",               // Cheese
  Syrian: "🧆",              // Falafel
  Taiwanese: "🧋",           // Bubble tea
  Tadzhik: "🏔️",            // Pamir Mountains
  Tanzanian: "🦁",           // Safari
  Thai: "🥥",                // Coconut cuisine
  Togolese: "🌴",            // Palm trees
  Tongan: "🐋",              // Whales
  Trinidadian: "🎭",         // Carnival
  Tunisian: "🏺",            // Ancient Carthage
  Turkish: "🧿",             // Evil eye
  Turkmen: "🐎",             // Akhal-Teke horses
  Tuvaluan: "🌊",            // Pacific islands
  Ugandan: "🦍",             // Mountain gorillas
  Ukrainian: "🌻",           // Sunflowers
  Emirati: "🏙️",            // Burj Khalifa & skyline
  British: "🫖",             // Tea
  American: "🍔",            // Burger
  Uruguayan: "🧉",           // Mate
  Uzbekistani: "🥟",         // Manti
  "Ni-Vanuatu": "🌋",        // Volcanoes
  Venezuelan: "🫓",          // Arepas
  Vietnamese: "🍜",          // Pho
  Yemeni: "☕",              // Mocha coffee
  Zambian: "🦅",             // African fish eagle
  Zimbabwean: "🦓"              // Tropical rainforest                       // Adriatic Coast
};

  return emojiMap[country] ?? "🌍";
}

